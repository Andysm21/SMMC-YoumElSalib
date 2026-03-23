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
}

interface AdminTableProps {
  registrations: Registration[];
  isLoading: boolean;
  error: string | null;
}

export default function AdminTable({ registrations, isLoading, error }: AdminTableProps) {
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [adminKey, setAdminKey] = useState<string>("");
  const [showKeyInput, setShowKeyInput] = useState(false);

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
      
      // Optionally refresh the page or update the UI
      window.location.reload();
    } catch (error) {
      console.error("Error sending email:", error);
      alert(`❌ Failed to send email: ${String(error)}`);
    } finally {
      setSendingEmail(null);
    }
  };
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

      <Card className="bg-white/10 backdrop-blur-lg border-[#D4622A]/30 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#D4622A]/20 bg-white/5">
                  <th className="px-6 py-4 text-left text-white font-semibold">Name</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Phone</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Church</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Code</th>
                  <th className="px-6 py-4 text-center text-white font-semibold">Email Sent</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Date</th>
                  <th className="px-6 py-4 text-center text-white font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((registration, index) => (
                  <motion.tr
                    key={registration.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-[#D4622A]/10 hover:bg-white/5 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 text-white">{registration.full_name}</td>
                    <td className="px-6 py-4 text-white/80 text-sm">{registration.email}</td>
                    <td className="px-6 py-4 text-white/80 text-sm">{registration.phone}</td>
                    <td className="px-6 py-4 text-white/80 text-sm">{registration.church_name}</td>
                    <td className="px-6 py-4 text-[#E8B4A0] font-mono text-sm font-semibold">
                      {registration.confirmation_code}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {registration.email_sent ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-white/70 text-sm">
                      {new Date(registration.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleSendEmail(registration)}
                        disabled={sendingEmail === registration.id || registration.email_sent}
                        className={`px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition ${
                          sendingEmail === registration.id
                            ? "bg-[#D4622A]/50 text-white/50 cursor-not-allowed"
                            : registration.email_sent
                            ? "bg-green-500/30 text-green-300 cursor-default"
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
