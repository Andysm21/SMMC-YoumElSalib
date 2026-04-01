"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Copy, Loader } from "lucide-react";

interface AddRegistrationModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface AddRegistrationForm {
  name: string;
  email: string;
  phone: string;
  church: string;
  status: "confirmed" | "waiting";
  notes: string;
}

export default function AddRegistrationModal({ onClose, onSuccess }: AddRegistrationModalProps) {
  const [form, setForm] = useState<AddRegistrationForm>({
    name: "",
    email: "",
    phone: "",
    church: "",
    status: "confirmed",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.church || !form.status) {
      setError("Please fill in all required fields (Name, Church, Status)");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/add-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email || null,
          phone: form.phone || null,
          church: form.church,
          status: form.status,
          notes: form.notes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to add registration");
        return;
      }

      setSuccess(true);
      setConfirmationCode(data.confirmationCode);
      setForm({
        name: "",
        email: "",
        phone: "",
        church: "",
        status: "confirmed",
        notes: "",
      });

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 3000);
    } catch (err) {
      setError("Failed to add registration");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCode = () => {
    if (confirmationCode) {
      navigator.clipboard.writeText(confirmationCode);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="bg-gradient-to-r from-[#D4622A] to-[#bfa98c] p-6 text-white sticky top-0">
          <h2 className="text-2xl font-bold">Add Person</h2>
          <p className="text-sm text-white/80">Add a VIP or test user</p>
        </div>

        <CardContent className="p-6">
          {success && confirmationCode ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 text-center"
            >
              <div className="flex justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-[#7a5c3e] mb-2">User Added Successfully!</h3>
                <p className="text-sm text-[#bfa98c] mb-4">Confirmation code:</p>
                <div className="flex gap-2 items-center justify-center bg-[#f8f6f2] p-3 rounded-lg">
                  <code className="font-mono font-bold text-lg text-[#D4622A]">{confirmationCode}</code>
                  <button
                    onClick={copyCode}
                    className="p-2 hover:bg-white rounded transition-colors"
                    title="Copy code"
                  >
                    <Copy className="w-4 h-4 text-[#D4622A]" />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-100 border border-red-300 rounded-lg p-3 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-semibold text-[#7a5c3e] mb-2">
                  Full Name *
                </label>
                <Input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. John Smith"
                  className="bg-[#f8f6f2] border-[#e2c9b0] text-[#7a5c3e]"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#7a5c3e] mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="(Optional)"
                  className="bg-[#f8f6f2] border-[#e2c9b0] text-[#7a5c3e]"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#7a5c3e] mb-2">
                  Phone
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="(Optional)"
                  className="bg-[#f8f6f2] border-[#e2c9b0] text-[#7a5c3e]"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#7a5c3e] mb-2">
                  Church *
                </label>
                <Input
                  type="text"
                  name="church"
                  value={form.church}
                  onChange={handleChange}
                  placeholder="Church name"
                  className="bg-[#f8f6f2] border-[#e2c9b0] text-[#7a5c3e]"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#7a5c3e] mb-2">
                  Status *
                </label>
                <select
                  value={form.status}
                  onChange={handleChange}
                  name="status"
                  disabled={isSubmitting}
                  className="w-full bg-[#f8f6f2] border border-[#e2c9b0] text-[#7a5c3e] placeholder:text-[#bfa98c] focus:border-[#D4622A] rounded-lg p-3"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="waiting">Waiting List</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#7a5c3e] mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Internal notes (optional)"
                  className="w-full bg-[#f8f6f2] border border-[#e2c9b0] text-[#7a5c3e] placeholder:text-[#bfa98c] focus:border-[#D4622A] rounded-lg p-3 resize-none"
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-xl transition-all"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#D4622A] to-[#bfa98c] hover:from-[#B84F1E] hover:to-[#d4af37] text-white font-bold py-2 px-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Person"
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </motion.div>
    </motion.div>
  );
}
