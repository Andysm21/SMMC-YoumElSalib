import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface RegistrationStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: {
    is_open: boolean;
    message: string;
  };
  onStatusChange: (is_open: boolean, message: string) => Promise<void>;
}

export default function RegistrationStatusModal({
  isOpen,
  onClose,
  currentStatus,
  onStatusChange,
}: RegistrationStatusModalProps) {
  const [isOpen_state, setIsOpen_state] = useState(currentStatus.is_open);
  const [message, setMessage] = useState(currentStatus.message);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      await onStatusChange(isOpen_state, message);
      setFeedback({ type: "success", text: "Registration status updated!" });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update status",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#7a5c3e]">
            Registration Status
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Toggle */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-[#7a5c3e]">
              Registration Status
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsOpen_state(true);
                  setFeedback(null);
                }}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                  isOpen_state
                    ? "bg-green-100 text-green-700 border-2 border-green-300"
                    : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle size={18} />
                  Open
                </div>
              </button>
              <button
                onClick={() => {
                  setIsOpen_state(false);
                  setFeedback(null);
                }}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                  !isOpen_state
                    ? "bg-red-100 text-red-700 border-2 border-red-300"
                    : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <AlertCircle size={18} />
                  Paused
                </div>
              </button>
            </div>
          </div>

          {/* Custom Message */}
          <div className="space-y-3">
            <label htmlFor="message" className="text-sm font-semibold text-[#7a5c3e]">
              Custom Message {!isOpen_state && "(shown when paused)"}
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                !isOpen_state
                  ? "e.g., Registration is temporarily closed for maintenance..."
                  : "Optional: Leave empty or add a notice for when registrations are open"
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4622A] focus:border-transparent resize-none"
              rows={4}
              maxLength={500}
            />
            <div className="text-xs text-gray-500">
              {message.length}/500 characters
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 ${
                feedback.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              <span className="text-sm font-medium">{feedback.text}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-[#D4622A] to-[#bfa98c] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
