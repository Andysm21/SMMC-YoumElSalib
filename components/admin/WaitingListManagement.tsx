"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader,
  AlertCircle,
  Mail,
  Send,
} from "lucide-react";
import { Registration } from "@/lib/types";

interface WaitingListStats {
  total: number;
}

const BATCH_SIZE = 10;

export function WaitingListManagement() {
  const [waitingUsers, setWaitingUsers] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [stats, setStats] = useState<WaitingListStats>({
    total: 0,
  });
  const [currentOffset, setCurrentOffset] = useState(0);
  const [emailsSent, setEmailsSent] = useState<Set<string>>(new Set());
  const [sendingBatch, setSendingBatch] = useState(false);

  useEffect(() => {
    fetchWaitingList(0);
  }, []);

  const fetchWaitingList = async (offset: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/admin/waiting-list?offset=${offset}&batchSize=${BATCH_SIZE}`
      );
      if (!response.ok) throw new Error("Failed to fetch waiting list");
      const data = await response.json();

      setWaitingUsers(data.users);
      setStats({
        total: data.total,
      });
      setCurrentOffset(offset);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmFromWaiting = async (userId: string) => {
    try {
      setActionLoading(userId);
      const response = await fetch("/api/admin/confirm-from-waiting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to confirm user");
      }

      setActionResult({
        success: true,
        message: `${data.data.full_name} has been promoted to confirmed`,
      });

      // Refresh the list
      await fetchWaitingList(currentOffset);
    } catch (err) {
      setActionResult({
        success: false,
        message: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (userId: string) => {
    if (!confirm("Are you sure you want to cancel this registration?")) {
      return;
    }

    try {
      setActionLoading(userId);
      const response = await fetch("/api/admin/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel registration");
      }

      setActionResult({
        success: true,
        message: `${data.data.full_name}'s registration has been cancelled`,
      });

      // Refresh the list
      await fetchWaitingList(currentOffset);
    } catch (err) {
      setActionResult({
        success: false,
        message: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendBatchEmails = async () => {
    if (waitingUsers.length === 0) {
      alert("No users in this batch to send emails to");
      return;
    }

    const unsent = waitingUsers.filter((u) => !emailsSent.has(u.id));
    if (unsent.length === 0) {
      alert("All users in this batch have already received emails");
      return;
    }

    if (!confirm(`Send waiting list emails to ${unsent.length} users?`)) {
      return;
    }

    try {
      setSendingBatch(true);
      setActionResult(null);

      // Get admin key from session
      let adminKey = sessionStorage.getItem("adminKey");
      if (!adminKey) {
        // Ask user for admin key
        adminKey = prompt("Admin key not found. Please enter your admin key:");
        if (!adminKey) {
          setActionResult({
            success: false,
            message: "Admin key is required to send emails.",
          });
          setSendingBatch(false);
          return;
        }
        // Save for current session
        sessionStorage.setItem("adminKey", adminKey);
      }

      // Send waiting list emails (one email per user with waiting list template)
      const emailPromises = unsent.map((user) =>
        fetch("/api/admin/send-email-waiting", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": adminKey,
          },
          body: JSON.stringify({
            registrationId: user.id,
            email: user.email,
            name: user.full_name,
            confirmationCode: user.confirmation_code,
          }),
        })
      );

      const results = await Promise.all(emailPromises);
      const successful = results.filter((r) => r.ok).length;

      // Mark sent users
      const newSentEmails = new Set(emailsSent);
      unsent.forEach((u) => newSentEmails.add(u.id));
      setEmailsSent(newSentEmails);

      setActionResult({
        success: true,
        message: `Sent ${successful}/${unsent.length} waiting list emails successfully`,
      });

      // Refresh the waiting list to get updated email_sent_count from DB
      setTimeout(() => {
        fetchWaitingList(currentOffset);
      }, 500);
    } catch (err) {
      setActionResult({
        success: false,
        message: err instanceof Error ? err.message : "Failed to send emails",
      });
    } finally {
      setSendingBatch(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <Loader className="w-6 h-6 animate-spin mx-auto text-yellow-600" />
          <p className="text-yellow-900 mt-2">Loading waiting list...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalPages = Math.ceil(stats.total / BATCH_SIZE);
  const currentPage = Math.floor(currentOffset / BATCH_SIZE) + 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Stats */}
      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-0 shadow-lg">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="bg-yellow-500/10 rounded-xl p-4">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <div>
            <p className="text-yellow-900 text-sm font-semibold">
              Total Waiting List Users
            </p>
            <p className="text-4xl font-extrabold text-yellow-600">
              {stats.total}
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Viewing batch {currentPage} of {totalPages} ({BATCH_SIZE} per batch)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Waiting List Table */}
      <Card className="bg-white border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#7a5c3e]">
              Waiting List Batch Management
            </h3>
            <Button
              onClick={handleSendBatchEmails}
              disabled={waitingUsers.length === 0 || sendingBatch}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 px-4 rounded-lg font-semibold flex items-center gap-2"
            >
              {sendingBatch ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Batch Emails
                </>
              )}
            </Button>
          </div>

          {waitingUsers.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3 opacity-50" />
              <p className="text-[#7a5c3e] font-semibold">No more waiting list users</p>
              <p className="text-[#bfa98c] text-sm mt-1">All batches have been processed!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-yellow-200 bg-yellow-50">
                    <th className="text-left p-3 text-xs font-bold text-[#7a5c3e] uppercase w-8">#</th>
                    <th className="text-left p-3 text-xs font-bold text-[#7a5c3e] uppercase">Name</th>
                    <th className="text-left p-3 text-xs font-bold text-[#7a5c3e] uppercase">Email</th>
                    <th className="text-left p-3 text-xs font-bold text-[#7a5c3e] uppercase">Phone</th>
                    <th className="text-left p-3 text-xs font-bold text-[#7a5c3e] uppercase">Church</th>
                    <th className="text-left p-3 text-xs font-bold text-[#7a5c3e] uppercase">Code</th>
                    <th className="text-center p-3 text-xs font-bold text-[#7a5c3e] uppercase">Emails Sent</th>
                    <th className="text-center p-3 text-xs font-bold text-[#7a5c3e] uppercase">Status</th>
                    <th className="text-center p-3 text-xs font-bold text-[#7a5c3e] uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {waitingUsers.map((user, index) => {
                    const hasEmailSent = emailsSent.has(user.id);
                    return (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`border-b border-yellow-100 hover:bg-opacity-50 transition-colors ${
                          hasEmailSent
                            ? "bg-green-50 hover:bg-green-100"
                            : "bg-yellow-50 hover:bg-yellow-100"
                        }`}
                      >
                        <td className="p-3">
                          <div className={`text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold ${
                            hasEmailSent ? "bg-green-500" : "bg-yellow-500"
                          }`}>
                            {hasEmailSent ? "✓" : index + 1}
                          </div>
                        </td>
                        <td className="p-3">
                          <p className="font-semibold text-[#7a5c3e] text-sm">{user.full_name}</p>
                        </td>
                        <td className="p-3">
                          <p className="text-[#7a5c3e] text-sm font-mono text-xs">{user.email}</p>
                        </td>
                        <td className="p-3">
                          <p className="text-[#7a5c3e] text-sm">{user.phone}</p>
                        </td>
                        <td className="p-3">
                          <p className="text-[#7a5c3e] text-sm truncate">{user.church_name}</p>
                        </td>
                        <td className="p-3">
                          <p className="text-[#D4622A] font-mono font-bold text-sm">{user.confirmation_code}</p>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center">
                            {user.email_sent_count && user.email_sent_count > 0 ? (
                              <div className="flex flex-col items-center gap-1" title={`${user.email_sent_count} email(s) sent to this user`}>
                                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-white text-xs cursor-help ${
                                  user.email_sent_count > 2 ? 'bg-red-500' : user.email_sent_count > 1 ? 'bg-orange-500' : 'bg-green-500'
                                }`}>
                                  {user.email_sent_count}
                                </span>
                                {user.email_sent_count > 2 && (
                                  <span className="text-xs text-red-600 font-bold whitespace-nowrap">⚠️ Possible Dup</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[#bfa98c] text-sm" title="No emails sent">—</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          {hasEmailSent ? (
                            <span className="inline-flex items-center gap-1 bg-green-200 text-green-700 px-2 py-1 rounded text-xs font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              Sent
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-yellow-200 text-yellow-700 px-2 py-1 rounded text-xs font-bold">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              onClick={() => handleConfirmFromWaiting(user.id)}
                              disabled={
                                actionLoading === user.id || actionLoading !== null
                              }
                              className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-bold transition-all duration-300 disabled:opacity-50"
                              title="Confirm from waiting list"
                            >
                              {actionLoading === user.id ? (
                                <Loader className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3" />
                              )}
                            </Button>
                            <Button
                              onClick={() => handleCancel(user.id)}
                              disabled={
                                actionLoading === user.id || actionLoading !== null
                              }
                              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-bold transition-all duration-300 disabled:opacity-50"
                              title="Cancel registration"
                            >
                              {actionLoading === user.id ? (
                                <Loader className="w-3 h-3 animate-spin" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Batch Navigation */}
          {stats.total > 0 && (
            <div className="flex justify-center gap-3 mt-6 pt-6 border-t border-gray-200">
              <Button
                onClick={() => fetchWaitingList(Math.max(0, currentOffset - BATCH_SIZE))}
                disabled={currentOffset === 0}
                className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
              >
                ← Previous Batch
              </Button>
              <span className="px-4 py-2 bg-gray-100 rounded-lg text-[#7a5c3e] font-semibold">
                Batch {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() => fetchWaitingList(currentOffset + BATCH_SIZE)}
                disabled={currentOffset + BATCH_SIZE >= stats.total}
                className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
              >
                Next Batch →
              </Button>
            </div>
          )}

          {actionResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
                actionResult.success
                  ? "bg-green-50 border border-green-300"
                  : "bg-red-50 border border-red-300"
              }`}
            >
              {actionResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p
                  className={`font-semibold ${
                    actionResult.success
                      ? "text-green-900"
                      : "text-red-900"
                  }`}
                >
                  {actionResult.success ? "Success" : "Error"}
                </p>
                <p
                  className={`text-sm mt-1 ${
                    actionResult.success
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {actionResult.message}
                </p>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
