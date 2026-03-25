"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Send, Loader } from "lucide-react";

interface Registration {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  church_name: string;
  confirmation_code: string;
  email_sent: boolean;
  created_at: string;
  waiting_list_turn?: number | null;
  is_confirmed?: boolean;
}

interface AdminTableProps {
  registrations: Registration[];
  isLoading: boolean;
  error: string | null;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
}


export default function AdminTable({ registrations, isLoading, error }: AdminTableProps) {
  // All hooks at the top, always called in the same order
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [adminKey, setAdminKey] = useState<string>("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [notifyingId, setNotifyingId] = useState<string | null>(null);

  // Handlers must be defined before return
  const handleSendEmail = async (registration: Registration) => {
    if (!adminKey) {
      setShowKeyInput(true);
      return;
    }

    setSendingEmail(registration.id);
    try {
      const response = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({
          registrationId: registration.id,
          email: registration.email,
          name: registration.full_name,
          confirmationCode: registration.confirmation_code,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send email: ${response.statusText}`);
      }

      const data = await response.json();
      alert(`✅ Email sent successfully to ${registration.email}`);
      window.location.reload();
    } catch (error) {
      console.error("Error sending email:", error);
      alert(`❌ Failed to send email: ${String(error)}`);
    } finally {
      setSendingEmail(null);
    }
  };


  // Early returns after all hooks
  if (isLoading) {
    return (
      <Card className="bg-white/10 backdrop-blur-lg border-[#D4622A]/30">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#D4622A] mx-auto mb-4"></div>
              <p className="text-white">Loading registrations...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white/10 backdrop-blur-lg border-red-500/30">
        <CardContent className="p-8">
          <div className="text-center">
            <p className="text-red-300">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (registrations.length === 0) {
    return (
      <Card className="bg-white/10 backdrop-blur-lg border-[#D4622A]/30">
        <CardContent className="p-12">
          <div className="text-center">
            <p className="text-white/70 text-lg">No registrations yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleNotifyAndConfirm = async (registration: Registration) => {
    if (!adminKey) {
      setShowKeyInput(true);
      return;
    }
    setNotifyingId(registration.id);
    try {
      // Call a new API endpoint to send waiting list email and confirm
      const response = await fetch("/api/admin/waiting-list-notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ registrationId: registration.id }),
      });
      if (!response.ok) {
        throw new Error(`Failed to notify: ${response.statusText}`);
      }
      alert(`✅ Notified and confirmed ${registration.full_name}`);
      window.location.reload();
    } catch (error) {
      alert(`❌ Failed to notify: ${String(error)}`);
    } finally {
      setNotifyingId(null);
    }
  };

  return (
    <>
      {/* Admin Key Modal */}
      {showKeyInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1a0f08] border border-[#D4622A]/30 rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-white font-semibold mb-4">Enter Admin Secret Key</h3>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Admin secret key..."
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-[#D4622A]/30 text-white placeholder-white/50 mb-4 focus:outline-none focus:border-[#D4622A]"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowKeyInput(false)}
                className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowKeyInput(false);
                }}
                className="flex-1 px-4 py-2 bg-[#D4622A] text-white rounded-lg hover:bg-[#B84F1E] transition"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <Card className="bg-white/90 shadow-lg border-0 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e2c9b0] bg-[#f8f6f2]">
                  <th className="px-6 py-4 text-left text-[#7a5c3e] font-bold">Name</th>
                  <th className="px-6 py-4 text-left text-[#7a5c3e] font-bold">Email</th>
                  <th className="px-6 py-4 text-left text-[#7a5c3e] font-bold">Phone</th>
                  <th className="px-6 py-4 text-left text-[#7a5c3e] font-bold">Church</th>
                  <th className="px-6 py-4 text-left text-[#7a5c3e] font-bold">Code</th>
                  <th className="px-6 py-4 text-center text-[#7a5c3e] font-bold">Email Sent</th>
                  <th className="px-6 py-4 text-center text-[#7a5c3e] font-bold">Confirmed</th>
                  <th className="px-6 py-4 text-center text-[#7a5c3e] font-bold">Waiting List</th>
                  <th className="px-6 py-4 text-left text-[#7a5c3e] font-bold">Date</th>
                  <th className="px-6 py-4 text-center text-[#7a5c3e] font-bold">Action</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((registration, index) => (
                  <motion.tr
                    key={registration.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-[#e2c9b0] hover:bg-[#f3e9e0]/60 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 text-[#3d2a13] font-medium">{registration.full_name}</td>
                    <td className="px-6 py-4 text-[#7a5c3e] text-sm">{registration.email}</td>
                    <td className="px-6 py-4 text-[#7a5c3e] text-sm">{registration.phone}</td>
                    <td className="px-6 py-4 text-[#7a5c3e] text-sm">{registration.church_name}</td>
                    <td className="px-6 py-4 text-[#D4622A] font-mono text-sm font-semibold">{registration.confirmation_code}</td>
                    <td className="px-6 py-4 text-center">
                      {registration.email_sent ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {registration.is_confirmed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {registration.waiting_list_turn != null ? (
                        <span className="text-yellow-600 font-bold">#{registration.waiting_list_turn}</span>
                      ) : (
                        <span className="text-[#bfa98c]">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[#7a5c3e] text-sm">
                      {(() => {
                        const d = new Date(registration.created_at);
                        const pad = (n: number) => n.toString().padStart(2, '0');
                        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
                      })()}
                    </td>
                    <td className="px-6 py-4 text-center flex flex-col gap-2 items-center">
                      <button
                        onClick={() => handleSendEmail(registration)}
                        disabled={sendingEmail === registration.id || registration.email_sent}
                        className={`px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition ${
                          sendingEmail === registration.id
                            ? "bg-[#D4622A]/50 text-white/50 cursor-not-allowed"
                            : registration.email_sent
                            ? "bg-green-500/30 text-green-700 cursor-default"
                            : "bg-[#D4622A] text-white hover:bg-[#B84F1E]"
                        }`}
                      >
                        {sendingEmail === registration.id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : registration.email_sent ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        {sendingEmail === registration.id ? "Sending..." : registration.email_sent ? "Sent" : "Send"}
                      </button>
                      {registration.waiting_list_turn != null && !registration.is_confirmed && (
                        <button
                          onClick={() => handleNotifyAndConfirm(registration)}
                          disabled={notifyingId === registration.id}
                          className={`px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition ${
                            notifyingId === registration.id
                              ? "bg-yellow-500/50 text-white/50 cursor-not-allowed"
                              : "bg-yellow-500 text-white hover:bg-yellow-600"}
                        `}
                        >
                          {notifyingId === registration.id ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          {notifyingId === registration.id ? "Notifying..." : "Notify & Confirm"}
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
