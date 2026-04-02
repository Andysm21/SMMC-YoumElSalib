"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, LogOut, CheckCircle2, Clock, AlertCircle, Loader, Camera, X, User, Mail, Phone, Building2, ZoomIn, ZoomOut } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import Tesseract from "tesseract.js";

interface Registration {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  church_name: string;
  confirmation_code: string;
  attended?: boolean;
  attended_at?: string | null;
  is_confirmed?: boolean;
  waiting_list_turn?: number | null;
}

interface DoorCheckInProps {
  onLogout: () => void;
}

export default function DoorCheckIn({ onLogout }: DoorCheckInProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Registration[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Registration | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkedInUsers, setCheckedInUsers] = useState<Set<string>>(new Set());
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  // OCR Camera State
  const [showCamera, setShowCamera] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [cameraZoom, setCameraZoom] = useState(1);
  const cameraRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Supabase Realtime
  const supabaseRef = useRef<any>(null);
  const subscriptionRef = useRef<any>(null);

  // Initialize Supabase Realtime
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseAnonKey) {
      supabaseRef.current = createClient(supabaseUrl, supabaseAnonKey);
      
      // Subscribe to real-time updates on the registrations table
      subscriptionRef.current = supabaseRef.current
        .channel("registrations-updates")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "registrations",
            filter: "attended=eq.true",
          },
          (payload: any) => {
            // Update the locally checked-in users
            const updatedRegistration = payload.new;
            setCheckedInUsers((prev) => new Set([...prev, updatedRegistration.id]));
            
            // Update search results if visible
            setSearchResults((prev) =>
              prev.map((r) =>
                r.id === updatedRegistration.id
                  ? { ...r, attended: true, attended_at: updatedRegistration.attended_at }
                  : r
              )
            );
          }
        )
        .subscribe();
    }
    
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  // Debounced search - 300ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setErrorMessage("");
    try {
      const response = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (response.ok) {
        // Sort results: Confirmed first, then Waiting
        const results = data.results || [];
        const sortedResults = results.sort((a: Registration, b: Registration) => {
          // Confirmed users first
          if (a.is_confirmed && !b.is_confirmed) return -1;
          if (!a.is_confirmed && b.is_confirmed) return 1;
          // Then by name
          return a.full_name.localeCompare(b.full_name);
        });
        
        setSearchResults(sortedResults);
        if (sortedResults.length === 0) {
          setErrorMessage("No users found matching your search.");
        }
      } else {
        setErrorMessage(data.error || "Search failed");
        setSearchResults([]);
      }
    } catch (error) {
      setErrorMessage("Failed to search. Please try again.");
      setSearchResults([]);
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCheckIn = async (registration: Registration) => {
    // Check if user is confirmed
    if (!registration.is_confirmed) {
      setErrorMessage("❌ This person is on the waiting list and cannot check in yet. They must be confirmed first.");
      return;
    }

    if (checkedInUsers.has(registration.id)) {
      return; // Already checked in
    }

    setIsCheckingIn(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/admin/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: registration.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCheckedInUsers(new Set([...checkedInUsers, registration.id]));
        setSuccessMessage(`✅ ${registration.full_name} checked in successfully!`);
        setSelectedUser({
          ...registration,
          attended: true,
          attended_at: new Date().toISOString(),
        });

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage("");
          setSelectedUser(null);
        }, 3000);

        // Update search results
        const updatedResults = searchResults.map((r) =>
          r.id === registration.id ? { ...r, attended: true, attended_at: new Date().toISOString() } : r
        );
        setSearchResults(updatedResults);
      } else {
        // Handle backend validation errors (e.g., 403 for unconfirmed)
        if (response.status === 403) {
          setErrorMessage("❌ This person is on the waiting list and cannot check in yet. They must be confirmed first.");
        } else if (response.status === 409) {
          setErrorMessage("⚠️ This person has already checked in.");
          setCheckedInUsers(new Set([...checkedInUsers, registration.id]));
        } else {
          setErrorMessage(data.error || "Failed to check in user");
        }
      }
    } catch (error) {
      setErrorMessage("Failed to check in user. Please try again.");
      console.error("Check-in error:", error);
    } finally {
      setIsCheckingIn(false);
    }
  };

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      
      if (cameraRef.current) {
        cameraRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      setErrorMessage("Failed to access camera. Please check permissions.");
      setIsCameraActive(false);
      console.error("Camera error:", error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureAndScanCode = async () => {
    if (!cameraRef.current || !canvasRef.current) return;

    setIsOCRProcessing(true);
    setErrorMessage("");

    try {
      const context = canvasRef.current.getContext("2d");
      if (!context) throw new Error("Canvas context failed");

      // Capture frame from video
      canvasRef.current.width = cameraRef.current.videoWidth;
      canvasRef.current.height = cameraRef.current.videoHeight;
      context.drawImage(cameraRef.current, 0, 0);

      // Perform OCR on the captured image
      const result = await Tesseract.recognize(canvasRef.current, "eng", {
        logger: (m) => {
          // Optional: Log progress
        },
      });

      // Extract text and normalize it
      let extractedText = result.data.text.toUpperCase();
      console.log("Raw OCR text:", result.data.text);
      console.log("Uppercase text:", extractedText);
      
      // Try multiple pattern variations to catch different formats
      // Pattern 1: YMSLB with underscores (YMSLB_00124, YMSLB_W00001, etc)
      const pattern1 = /YMSLB[_]?[A-Z0-9]{2,10}/g;
      // Pattern 2: YMSLB without strict underscore requirements (catches YMSLB00124, YMSBL00124, etc)
      const pattern2 = /YM[A-Z]*LB[A-Z0-9_]{2,10}/g;
      // Pattern 3: Just YMSLB followed by numbers/letters (most permissive)
      const pattern3 = /YMSLB\s*[A-Z0-9_\s-]{2,15}/g;
      
      let codes: string[] = [];
      const match1 = extractedText.match(pattern1);
      if (match1 && match1.length > 0) {
        codes = match1;
      } else {
        const match2 = extractedText.match(pattern2);
        if (match2 && match2.length > 0) {
          codes = match2;
        } else {
          const match3 = extractedText.match(pattern3);
          if (match3 && match3.length > 0) {
            codes = match3.map(code => code.replace(/[\s-]/g, '')).filter(code => code.length >= 8);
          }
        }
      }
      
      console.log("Detected codes:", codes);

      if (codes.length > 0) {
        // Use the first detected code, clean it up
        let detectedCode = codes[0];
        // Remove extra spaces and dashes
        detectedCode = detectedCode.replace(/[\s-]/g, '');
        // Ensure it starts with YMSLB
        if (detectedCode.startsWith('YMSLB')) {
          setSearchQuery(detectedCode);
          setErrorMessage("");
          setShowCamera(false);
          stopCamera();
          console.log("✅ Code detected and set:", detectedCode);
        } else {
          setErrorMessage("No valid confirmation code detected. Please try again or search manually.");
          console.log("❌ Code found but invalid format:", detectedCode);
        }
      } else {
        setErrorMessage("No valid confirmation code detected. Please try again or search manually.");
        console.log("❌ No codes matched any pattern");
      }
    } catch (error) {
      setErrorMessage("OCR scan failed. Please try again or search manually.");
      console.error("OCR error:", error);
    } finally {
      setIsOCRProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f6f2] via-[#f3e9e0] to-[#f8f6f2]">
      <div className="container mx-auto px-4 py-6 md:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4"
        >
          <div className="flex items-center gap-3">
            <img src="/poster.jpg" alt="Event Logo" className="w-14 h-14 md:w-16 md:h-16 rounded-full shadow-lg border-4 border-[#D4622A]/30 object-cover bg-white" />
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-[#D4622A] mb-1 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                Check-In
              </h1>
              <p className="text-[#7a5c3e] text-sm md:text-base">Door Check-In System</p>
            </div>
          </div>
          <Button
            onClick={onLogout}
            className="bg-gradient-to-r from-[#D4622A] to-[#bfa98c] hover:from-[#B84F1E] hover:to-[#d4af37] text-white py-2 px-6 rounded-xl font-bold shadow-md transition-all duration-300 w-full sm:w-auto"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Search Section */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-xl border-0 rounded-2xl">
              <CardContent className="p-6">
                {/* Search Input */}
                <div className="mb-6">
                  <label className="block text-[#7a5c3e] font-semibold mb-3">
                    Search Attendee
                  </label>
                  <div className="flex gap-3 items-stretch">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#D4622A]" />
                      <Input
                        type="text"
                        placeholder="Enter code, email, phone, or name"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 py-3 text-lg bg-[#f8f6f2] border-[#e2c9b0] text-[#7a5c3e] placeholder:text-[#bfa98c] focus:border-[#D4622A] rounded-xl"
                      />
                    </div>
                    <Button
                      onClick={() => {
                        if (showCamera) {
                          setShowCamera(false);
                          stopCamera();
                        } else {
                          setShowCamera(true);
                          startCamera();
                        }
                      }}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-xl font-semibold shadow-md transition-all duration-300 flex items-center gap-2"
                    >
                      <Camera className="w-5 h-5" />
                      <span className="hidden sm:inline">Scan</span>
                    </Button>
                  </div>
                  
                  {/* Camera Modal */}
                  {showCamera && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 bg-black rounded-xl overflow-hidden shadow-lg border-2 border-blue-500"
                    >
                      <div className="relative">
                        <video
                          ref={cameraRef}
                          autoPlay
                          playsInline
                          className="w-full aspect-video object-cover"
                          style={{ transform: `scale(${cameraZoom})` }}
                        />
                        <canvas ref={canvasRef} className="hidden" />
                        
                        {/* Camera Controls */}
                        <div className="absolute inset-0 flex flex-col items-center justify-between p-4 pointer-events-none">
                          <div className="self-end pointer-events-auto flex gap-2">
                            <button
                              onClick={() => setCameraZoom(Math.max(1, cameraZoom - 0.2))}
                              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors"
                              title="Zoom Out"
                            >
                              <ZoomOut className="w-5 h-5" />
                            </button>
                            <span className="bg-blue-500 text-white px-3 py-2 rounded-full text-sm font-bold shadow-lg">
                              {(cameraZoom * 100).toFixed(0)}%
                            </span>
                            <button
                              onClick={() => setCameraZoom(Math.min(3, cameraZoom + 0.2))}
                              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors"
                              title="Zoom In"
                            >
                              <ZoomIn className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                setShowCamera(false);
                                stopCamera();
                              }}
                              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          
                          <div className="flex flex-col gap-3 pointer-events-auto">
                            <Button
                              onClick={captureAndScanCode}
                              disabled={isOCRProcessing}
                              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 flex items-center gap-2"
                            >
                              {isOCRProcessing ? (
                                <>
                                  <Loader className="w-5 h-5 animate-spin" />
                                  Scanning...
                                </>
                              ) : (
                                <>
                                  <Camera className="w-5 h-5" />
                                  Capture & Scan
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        {/* Crosshair Overlay */}
                        <div className="absolute inset-0 border-4 border-green-500 pointer-events-none" style={{ 
                          boxShadow: 'inset 0 0 0 9999px rgba(0, 0, 0, 0.3)'
                        }} />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm">{errorMessage}</p>
                  </motion.div>
                )}

                {/* Success Message */}
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6 flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-green-700 text-sm font-semibold">{successMessage}</p>
                  </motion.div>
                )}

                {/* Search Results */}
                {isSearching && (
                  <div className="flex items-center justify-center py-8">
                    <Loader className="w-6 h-6 text-[#D4622A] animate-spin" />
                  </div>
                )}

                {!isSearching && searchResults.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[#7a5c3e] font-semibold text-sm mb-4">
                      Found {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
                    </p>
                    {searchResults.map((result) => (
                      <motion.div
                        key={result.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                          result.is_confirmed && !result.attended
                            ? "bg-white border-[#D4622A] hover:bg-[#D4622A]/5"
                            : result.attended
                            ? "bg-green-50 border-green-300"
                            : "bg-gray-50 border-gray-300 opacity-75 cursor-not-allowed"
                        }`}
                        onClick={() => result.is_confirmed && !result.attended && setSelectedUser(result)}
                      >
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[#7a5c3e] truncate">{result.full_name}</p>
                            <p className="text-sm text-[#bfa98c] truncate">{result.email}</p>
                            <p className="text-sm text-[#bfa98c]">{result.phone}</p>
                            <p className="text-xs text-[#7a5c3e] mt-2 font-mono break-all">Code: {result.confirmation_code}</p>
                            
                            {/* Status Badges */}
                            <div className="mt-3 flex flex-wrap gap-1 sm:gap-2">
                              {result.waiting_list_turn !== null && result.waiting_list_turn !== undefined && (
                                <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold whitespace-nowrap">
                                  🔔 WL #{result.waiting_list_turn}
                                </span>
                              )}
                              {result.is_confirmed && (
                                <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold whitespace-nowrap">
                                  ✓ Confirmed
                                </span>
                              )}
                            </div>
                          </div>
                          {result.attended ? (
                            <div className="flex items-center gap-1 sm:gap-2 bg-green-100 px-2 sm:px-3 py-1 rounded-full flex-shrink-0">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span className="text-xs font-bold text-green-600 whitespace-nowrap">Checked In</span>
                            </div>
                          ) : result.is_confirmed ? (
                            <div className="flex items-center gap-1 sm:gap-2 bg-blue-100 px-2 sm:px-3 py-1 rounded-full flex-shrink-0">
                              <CheckCircle2 className="w-4 h-4 text-blue-600" />
                              <span className="text-xs font-bold text-blue-600 whitespace-nowrap">✅ Ready</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 sm:gap-2 bg-orange-100 px-2 sm:px-3 py-1 rounded-full flex-shrink-0">
                              <Clock className="w-4 h-4 text-orange-600" />
                              <span className="text-xs font-bold text-orange-600 whitespace-nowrap">⏳ Waiting</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {!isSearching && searchQuery.trim() && searchResults.length === 0 && !errorMessage && (
                  <div className="text-center py-8">
                    <AlertCircle className="w-8 h-8 text-[#bfa98c] mx-auto mb-2" />
                    <p className="text-[#7a5c3e]">No results found</p>
                  </div>
                )}

                {!searchQuery.trim() && searchResults.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-[#D4622A]/20 mx-auto mb-3" />
                    <p className="text-[#7a5c3e] font-semibold">Start searching to find attendees</p>
                    <p className="text-sm text-[#bfa98c] mt-1">Use code, email, phone, or name</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Selected User Details (Desktop Only) */}
          <div className="hidden lg:block">
            {selectedUser ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="sticky top-6"
              >
                <Card className="bg-white shadow-xl border-0 rounded-2xl">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-[#7a5c3e] mb-4 text-lg flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Check In Details
                    </h3>

                    <div className="space-y-4 mb-6">
                      <div>
                        <p className="text-xs font-semibold text-[#bfa98c] uppercase mb-1">Name</p>
                        <p className="text-lg font-bold text-[#7a5c3e]">{selectedUser.full_name}</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="w-4 h-4 text-[#D4622A]" />
                          <p className="text-xs font-semibold text-[#bfa98c] uppercase">Email</p>
                        </div>
                        <p className="text-sm text-[#7a5c3e] break-all">{selectedUser.email}</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Phone className="w-4 h-4 text-[#D4622A]" />
                          <p className="text-xs font-semibold text-[#bfa98c] uppercase">Phone</p>
                        </div>
                        <p className="text-sm text-[#7a5c3e]">{selectedUser.phone}</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="w-4 h-4 text-[#D4622A]" />
                          <p className="text-xs font-semibold text-[#bfa98c] uppercase">Church</p>
                        </div>
                        <p className="text-sm text-[#7a5c3e]">{selectedUser.church_name}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-[#bfa98c] uppercase mb-1">Code</p>
                        <p className="text-sm font-mono text-[#D4622A] font-bold bg-[#f8f6f2] p-2 rounded-lg">{selectedUser.confirmation_code}</p>
                      </div>

                      {/* Status Section */}
                      <div className="pt-2 border-t border-[#e2c9b0]">
                        {selectedUser.waiting_list_turn !== null && selectedUser.waiting_list_turn !== undefined && (
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-[#bfa98c] uppercase mb-1">Status</p>
                            <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
                              <span className="text-lg">⏳</span>
                              <div>
                                <p className="font-bold text-yellow-700 text-sm">On Waiting List</p>
                                <p className="text-xs text-yellow-600">Position: #{selectedUser.waiting_list_turn}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <p className="text-xs font-semibold text-[#bfa98c] uppercase mb-1">Confirmation Status</p>
                        {selectedUser.is_confirmed ? (
                          <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <div>
                              <p className="font-bold text-green-700 text-sm">✅ Confirmed</p>
                              <p className="text-xs text-green-600">Ready to attend event</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <div>
                              <p className="font-bold text-red-700 text-sm">❌ Not Confirmed</p>
                              <p className="text-xs text-red-600">Must be confirmed to attend</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="mb-6">
                      {selectedUser.attended ? (
                        <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 text-center">
                          <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <p className="font-bold text-green-700">Already Checked In</p>
                          {selectedUser.attended_at && (
                            <p className="text-xs text-green-600 mt-2">
                              {new Date(selectedUser.attended_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      ) : !selectedUser.is_confirmed ? (
                        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-red-700 mb-1">Cannot Check In</p>
                              <p className="text-sm text-red-600">This person is on the waiting list.</p>
                              <p className="text-xs text-red-500 mt-2">They must be confirmed first before they can attend.</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleCheckIn(selectedUser)}
                          disabled={isCheckingIn || checkedInUsers.has(selectedUser.id)}
                          className="w-full bg-gradient-to-r from-[#D4622A] to-[#bfa98c] hover:from-[#B84F1E] hover:to-[#d4af37] text-white py-4 rounded-xl font-bold shadow-md transition-all duration-300 disabled:opacity-50 text-lg"
                        >
                          {isCheckingIn ? (
                            <>
                              <Loader className="w-5 h-5 animate-spin mr-2" />
                              Checking In...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-5 h-5 mr-2" />
                              Confirm Attendance
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedUser(null)}
                      className="w-full text-[#D4622A] font-semibold py-2 hover:bg-[#D4622A]/10 rounded-lg transition-colors duration-300"
                    >
                      Clear Selection
                    </button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card className="bg-white shadow-xl border-0 rounded-2xl h-full">
                <CardContent className="p-6 flex items-center justify-center h-full min-h-96">
                  <div className="text-center">
                    <Clock className="w-12 h-12 text-[#D4622A]/20 mx-auto mb-3" />
                    <p className="text-[#7a5c3e] font-semibold">Select an attendee to check in</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>
      </div>

      {/* Mobile Modal - Selected User Details */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedUser(null)}
            className="fixed inset-0 bg-black/50 z-50 flex items-end lg:hidden"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-[#D4622A] to-[#bfa98c] text-white p-4 rounded-t-3xl flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Check In Details
                </h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* User Info Card */}
                <div className="bg-gradient-to-br from-[#f8f6f2] to-[#f3e9e0] rounded-2xl p-4 border-2 border-[#D4622A]/20">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#D4622A]/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-7 h-7 text-[#D4622A]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-2xl font-bold text-[#7a5c3e]">{selectedUser.full_name}</p>
                      <p className="text-sm text-[#bfa98c] font-mono mt-1">{selectedUser.confirmation_code}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-[#f8f6f2] rounded-xl">
                    <Mail className="w-5 h-5 text-[#D4622A] flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#bfa98c] uppercase">Email</p>
                      <p className="text-sm text-[#7a5c3e] break-all">{selectedUser.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-[#f8f6f2] rounded-xl">
                    <Phone className="w-5 h-5 text-[#D4622A] flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#bfa98c] uppercase">Phone</p>
                      <p className="text-sm text-[#7a5c3e]">{selectedUser.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-[#f8f6f2] rounded-xl">
                    <Building2 className="w-5 h-5 text-[#D4622A] flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#bfa98c] uppercase">Church</p>
                      <p className="text-sm text-[#7a5c3e]">{selectedUser.church_name}</p>
                    </div>
                  </div>
                </div>

                {/* Status Section */}
                <div className="border-t border-[#e2c9b0] pt-4 space-y-3">
                  {selectedUser.waiting_list_turn !== null && selectedUser.waiting_list_turn !== undefined && (
                    <div className="flex items-center gap-2 bg-yellow-50 px-4 py-3 rounded-xl border-2 border-yellow-200">
                      <span className="text-2xl">⏳</span>
                      <div>
                        <p className="font-bold text-yellow-700">On Waiting List</p>
                        <p className="text-sm text-yellow-600">Position: #{selectedUser.waiting_list_turn}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedUser.is_confirmed ? (
                    <div className="flex items-center gap-2 bg-green-50 px-4 py-3 rounded-xl border-2 border-green-200">
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-green-700">✅ Confirmed</p>
                        <p className="text-sm text-green-600">Ready to attend event</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-red-50 px-4 py-3 rounded-xl border-2 border-red-200">
                      <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-red-700">❌ Not Confirmed</p>
                        <p className="text-sm text-red-600">Must be confirmed to attend</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Check In Status */}
                <div className="border-t border-[#e2c9b0] pt-4">
                  {selectedUser.attended ? (
                    <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 text-center">
                      <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-2" />
                      <p className="font-bold text-green-700 text-lg">Already Checked In</p>
                      {selectedUser.attended_at && (
                        <p className="text-sm text-green-600 mt-2">
                          {new Date(selectedUser.attended_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ) : !selectedUser.is_confirmed ? (
                    <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-bold text-red-700 mb-1">Cannot Check In</p>
                          <p className="text-sm text-red-600">This person is on the waiting list.</p>
                          <p className="text-sm text-red-500 mt-2 font-semibold">They must be confirmed first before they can attend.</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleCheckIn(selectedUser)}
                      disabled={isCheckingIn || checkedInUsers.has(selectedUser.id)}
                      className="w-full bg-gradient-to-r from-[#D4622A] to-[#bfa98c] hover:from-[#B84F1E] hover:to-[#d4af37] text-white py-4 rounded-xl font-bold shadow-md transition-all duration-300 disabled:opacity-50 text-lg"
                    >
                      {isCheckingIn ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin mr-2" />
                          Checking In...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-6 h-6 mr-2" />
                          Confirm Attendance
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-full text-[#D4622A] font-semibold py-3 hover:bg-[#D4622A]/10 rounded-lg transition-colors duration-300 mt-2"
                >
                  Close
                </button>

                {/* Safe bottom padding for mobile */}
                <div className="h-4" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
