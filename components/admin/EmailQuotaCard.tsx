"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Loader,
  X,
  Eye,
} from "lucide-react";

interface EmailStats {
  sentToday: number;
  estimatedLimit: number;
  remaining: number;
  resetMessage: string;
  percentageUsed: number;
}

interface WaitingListPreview {
  success: boolean;
  count: number;
  users: Array<{
    id: string;
    name: string;
    email: string;
    church: string;
    confirmationCode: string;
  }>;
  message: string;
  emailSubject: string;
  emailPreview: string | null;
}

export function EmailQuotaCard() {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<WaitingListPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmailStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchEmailStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchEmailStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/email-stats");
      if (!response.ok) throw new Error("Failed to fetch email stats");
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowPreview = async () => {
    try {
      setPreviewLoading(true);
      setPreviewError(null);
      const response = await fetch("/api/admin/send-waiting-email", {
        method: "GET",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch preview");
      }

      setPreviewData(data);
      setShowPreview(true);
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSendWaitingListEmails = async () => {
    if (!previewData || previewData.count === 0) {
      alert("No users to notify");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to send emails to ${previewData.count} user${previewData.count !== 1 ? "s" : ""}?`
      )
    ) {
      return;
    }

    try {
      setIsSending(true);
      setSendResult(null);
      const response = await fetch("/api/admin/send-waiting-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send emails");
      }

      setSendResult({
        success: true,
        message: `${data.sentCount} emails sent successfully${data.failedCount > 0 ? `, ${data.failedCount} failed` : ""}`,
      });
      setShowPreview(false);
      setPreviewData(null);
      // Refresh stats after sending
      fetchEmailStats();
    } catch (err) {
      setSendResult({
        success: false,
        message: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading && !stats) {
    return (
      <Card className="bg-gradient-to-br from-[#fff7ef] to-[#f3e9e0] border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <Loader className="w-6 h-6 animate-spin mx-auto text-[#D4622A]" />
          <p className="text-[#7a5c3e] mt-2">Loading email quota...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
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

  const percentageColor =
    stats.percentageUsed < 50
      ? "text-green-600"
      : stats.percentageUsed < 80
        ? "text-yellow-600"
        : "text-red-600";

  const barColor =
    stats.percentageUsed < 50
      ? "bg-green-500"
      : stats.percentageUsed < 80
        ? "bg-yellow-500"
        : "bg-red-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Email Quota Card */}
      <Card className="bg-gradient-to-br from-[#fff7ef] to-[#f3e9e0] border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-[#D4622A]/10 rounded-xl p-4">
                <Mail className="w-8 h-8 text-[#D4622A]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#7a5c3e]">
                  Email Quota
                </h3>
                <p className="text-sm text-[#bfa98c]">
                  {stats.resetMessage}
                </p>
              </div>
            </div>
            <button
              onClick={fetchEmailStats}
              className="p-2 hover:bg-[#D4622A]/10 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-[#D4622A]" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-sm font-semibold text-[#7a5c3e]">
                  Emails Sent Today
                </p>
                <p className={`text-2xl font-bold ${percentageColor}`}>
                  {stats.sentToday} / {stats.estimatedLimit}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-3xl font-bold ${percentageColor}`}>
                  {stats.percentageUsed}%
                </p>
                <p className="text-xs text-[#bfa98c]">
                  {stats.remaining} remaining
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.percentageUsed}%` }}
                transition={{ duration: 0.5 }}
                className={`h-full ${barColor} transition-all duration-300`}
              />
            </div>
          </div>

          {/* Status Message */}
          {stats.percentageUsed > 80 && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900 text-sm">
                  Quota Running Low
                </p>
                <p className="text-red-700 text-xs mt-1">
                  You're using {stats.percentageUsed}% of your daily quota. Be
                  careful with bulk sends.
                </p>
              </div>
            </div>
          )}

          {stats.percentageUsed <= 50 && (
            <div className="bg-green-50 border border-green-300 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900 text-sm">
                  Quota Available
                </p>
                <p className="text-green-700 text-xs mt-1">
                  You have {stats.remaining} emails remaining for today.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Email Section */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-blue-900">
                Notify Waiting List
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                Send notification emails to all users on the waiting list
              </p>
            </div>
            <Send className="w-6 h-6 text-blue-600" />
          </div>

          <p className="text-sm text-blue-800 mb-6 bg-blue-50 rounded-lg p-3">
            This will send a notification email to every user on the waiting list. Click "Preview" to see how many emails will be sent and the email content.
          </p>

          <div className="flex gap-3">
            <Button
              onClick={handleShowPreview}
              disabled={previewLoading || isLoading}
              className="flex-1 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white py-3 rounded-xl font-bold shadow-md transition-all duration-300 disabled:opacity-50"
            >
              {previewLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                <>
                  <Eye className="w-5 h-5 mr-2" />
                  Preview
                </>
              )}
            </Button>
            <Button
              onClick={handleSendWaitingListEmails}
              disabled={isSending || !previewData || previewData.count === 0}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-xl font-bold shadow-md transition-all duration-300 disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader className="w-5 h-5 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send Now
                </>
              )}
            </Button>
          </div>

          {sendResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
                sendResult.success
                  ? "bg-green-50 border border-green-300"
                  : "bg-red-50 border border-red-300"
              }`}
            >
              {sendResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p
                  className={`font-semibold ${
                    sendResult.success
                      ? "text-green-900"
                      : "text-red-900"
                  }`}
                >
                  {sendResult.success ? "Success" : "Error"}
                </p>
                <p
                  className={`text-sm mt-1 ${
                    sendResult.success
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {sendResult.message}
                </p>
              </div>
            </motion.div>
          )}

          {previewError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-lg flex items-start gap-3 bg-red-50 border border-red-300"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-sm mt-1 text-red-700">{previewError}</p>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {showPreview && previewData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowPreview(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <h2 className="text-2xl font-bold text-blue-900">
                Waiting List Email Preview
              </h2>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-white/30 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-blue-900" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Summary Section */}
              <div className="bg-blue-50 border border-blue-300 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-bold text-blue-900">Summary</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-blue-900">
                    <span className="font-semibold">Total Emails to Send:</span>{" "}
                    <span className="text-2xl font-bold text-blue-600">
                      {previewData.count}
                    </span>
                  </p>
                  <p className="text-sm text-blue-700">{previewData.message}</p>
                </div>
              </div>

              {/* Users List */}
              {previewData.users.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">
                    Recipients ({previewData.users.length})
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50">
                    {previewData.users.map((user, idx) => (
                      <div key={user.id} className="text-sm py-2 border-b border-gray-200 last:border-0">
                        <p className="font-semibold text-gray-900">
                          {idx + 1}. {user.name}
                        </p>
                        <p className="text-gray-600 text-xs">{user.email}</p>
                        <p className="text-gray-500 text-xs">{user.church}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Email Preview */}
              {previewData.emailPreview && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Email Preview</h4>
                  <div className="bg-gray-50 border border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
                      <p className="text-xs text-gray-600 font-mono">
                        <span className="font-semibold">Subject:</span> {previewData.emailSubject}
                      </p>
                    </div>
                    <iframe
                      srcDoc={previewData.emailPreview}
                      className="w-full h-96 border-0"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </div>
              )}

              {/* Warning */}
              {stats && stats.remaining < previewData.count && (
                <div className="bg-red-50 border border-red-300 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">Not Enough Quota</p>
                    <p className="text-red-700 text-sm mt-1">
                      You have {stats.remaining} emails remaining, but {previewData.count} will be sent. 
                      Your quota will be exceeded!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <Button
                onClick={() => setShowPreview(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 py-2 rounded-lg font-semibold transition-all"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendWaitingListEmails}
                disabled={isSending || (stats && stats.remaining < previewData.count)}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 rounded-lg font-semibold shadow-md transition-all disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2 inline" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2 inline" />
                    Send {previewData.count} Email{previewData.count !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
