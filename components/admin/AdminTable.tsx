"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Send, Loader, Edit3, Trash2 } from "lucide-react";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

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
  role?: string | null;
  attended?: boolean;
  attended_at?: string | null;
}

interface AdminTableProps {
  registrations: Registration[];
  isLoading: boolean;
  error: string | null;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  adminKey?: string;
  onRefresh?: () => void;
}


export default function AdminTable({ registrations, isLoading, error, adminKey: initialAdminKey = "", onRefresh }: AdminTableProps) {
  // All hooks at the top, always called in the same order
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [adminKey, setAdminKey] = useState<string>(initialAdminKey);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [notifyingId, setNotifyingId] = useState<string | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editingRoleReg, setEditingRoleReg] = useState<Registration | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ show: boolean; name: string; id: string }>({
    show: false,
    name: "",
    id: "",
  });

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
      
      // Call onRefresh if provided instead of reloading
      if (onRefresh) {
        onRefresh();
      }
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
      
      // Call onRefresh if provided instead of reloading
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      alert(`❌ Failed to notify: ${String(error)}`);
    } finally {
      setNotifyingId(null);
    }
  };

  const handleUpdateRole = async (registration: Registration) => {
    if (!newRole) {
      alert("Please select a role");
      return;
    }
    if (!adminKey) {
      setShowKeyInput(true);
      return;
    }

    setUpdatingRoleId(registration.id);
    try {
      const response = await fetch(`/api/admin/update-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({
          registrationId: registration.id,
          role: newRole,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update role: ${response.statusText}`);
      }

      alert(`✅ Role updated for ${registration.full_name}`);
      setEditingRoleId(null);
      setEditingRoleReg(null);
      setNewRole("");
      
      // Call onRefresh if provided instead of reloading
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      alert(`❌ Failed to update role: ${String(error)}`);
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const handleDeleteUser = async (registrationId: string) => {
    setDeletingId(registrationId);
    try {
      const response = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: registrationId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.statusText}`);
      }

      setDeleteDialog({ show: false, name: "", id: "" });
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      throw error;
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {/* Delete Confirmation Dialog */}
      {deleteDialog.show && (
        <DeleteConfirmDialog
          userName={deleteDialog.name}
          onConfirm={() => handleDeleteUser(deleteDialog.id)}
          onCancel={() => setDeleteDialog({ show: false, name: "", id: "" })}
        />
      )}

      {/* Role Edit Modal */}
      {editingRoleId && editingRoleReg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-white to-[#f8f6f2] border-2 border-[#D4622A] rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-[#D4622A] mb-2">Edit Role</h3>
            <p className="text-[#7a5c3e] mb-6">Set role for <strong>{editingRoleReg.full_name}</strong></p>
            
            <div className="space-y-4">
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-base font-semibold bg-white border-2 border-[#e2c9b0] text-[#7a5c3e] focus:outline-none focus:border-[#D4622A] transition-all"
              >
                <option value="">-- Select Role --</option>
                <option value="family-member">👨‍👩‍👧 Family Member</option>
                <option value="khadem">✝️ Khadem</option>
                <option value="makhdoum">📖 Makhdoum</option>
              </select>
              
              <div className="flex gap-3">
                <button
                  onClick={() => handleUpdateRole(editingRoleReg)}
                  disabled={updatingRoleId === editingRoleReg.id || !newRole}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {updatingRoleId === editingRoleReg.id ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <>✓ Save</>
                  )}
                </button>
                <button
                  onClick={() => {
                    setEditingRoleId(null);
                    setEditingRoleReg(null);
                    setNewRole("");
                  }}
                  className="flex-1 px-4 py-3 bg-gray-400 text-white rounded-lg font-bold hover:bg-gray-500 transition-all"
                >
                  ✕ Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Admin Key Modal */}
      {showKeyInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white border border-[#e2c9b0] rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-[#7a5c3e] font-semibold mb-4">Enter Admin Secret Key</h3>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Admin secret key..."
              className="w-full px-4 py-2 rounded-lg bg-[#f8f6f2] border border-[#e2c9b0] text-[#7a5c3e] placeholder-[#bfa98c] mb-4 focus:outline-none focus:border-[#D4622A]"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowKeyInput(false)}
                className="flex-1 px-4 py-2 bg-[#f8f6f2] text-[#7a5c3e] rounded-lg hover:bg-[#e2c9b0] transition"
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
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e2c9b0] bg-[#f8f6f2]">
                  <th className="px-3 py-2 text-left text-[#7a5c3e] font-bold text-xs uppercase">Name</th>
                  <th className="px-3 py-2 text-left text-[#7a5c3e] font-bold text-xs uppercase" style={{ minWidth: '120px', maxWidth: '150px' }}>Email</th>
                  <th className="px-3 py-2 text-left text-[#7a5c3e] font-bold text-xs uppercase">Phone</th>
                  <th className="px-3 py-2 text-left text-[#7a5c3e] font-bold text-xs uppercase" style={{ minWidth: '100px', maxWidth: '120px' }}>Church</th>
                  <th className="px-3 py-2 text-left text-[#7a5c3e] font-bold text-xs uppercase">Code</th>
                  <th className="px-3 py-2 text-left text-[#7a5c3e] font-bold text-xs uppercase">Role</th>
                  <th className="px-3 py-2 text-center text-[#7a5c3e] font-bold text-xs uppercase">Sent</th>
                  <th className="px-3 py-2 text-center text-[#7a5c3e] font-bold text-xs uppercase">Confirmed</th>
                  <th className="px-3 py-2 text-center text-[#7a5c3e] font-bold text-xs uppercase">Attended</th>
                  <th className="px-3 py-2 text-center text-[#7a5c3e] font-bold text-xs uppercase">Wait</th>
                  <th className="px-3 py-2 text-center text-[#7a5c3e] font-bold text-xs uppercase">Actions</th>
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
                    <td className="px-3 py-3 text-[#3d2a13] font-medium text-sm truncate">{registration.full_name}</td>
                    <td className="px-3 py-3 text-[#7a5c3e] text-xs break-words" style={{ minWidth: '120px', maxWidth: '150px', wordWrap: 'break-word', overflowWrap: 'break-word' }}>{registration.email}</td>
                    <td className="px-3 py-3 text-[#7a5c3e] text-xs">{registration.phone}</td>
                    <td className="px-3 py-3 text-[#7a5c3e] text-xs break-words" style={{ minWidth: '100px', maxWidth: '120px', wordWrap: 'break-word', overflowWrap: 'break-word' }}>{registration.church_name}</td>
                    <td className="px-3 py-3 text-[#D4622A] font-mono text-xs font-bold">{registration.confirmation_code}</td>
                    <td className="px-3 py-3 text-left">
                      {!registration.role ? (
                        <span className="inline-block px-2 py-1 rounded text-[#D4622A] text-xs font-bold bg-yellow-100 border border-yellow-300 whitespace-nowrap">
                          No Role
                        </span>
                      ) : (
                        <span className={`inline-block px-2 py-1 rounded text-white text-xs font-bold whitespace-nowrap ${
                          registration.role === 'family-member' ? 'bg-blue-500' :
                          registration.role === 'khadem' ? 'bg-green-500' :
                          registration.role === 'makhdoum' ? 'bg-purple-500' :
                          'bg-gray-500'
                        }`}>
                          {registration.role === 'family-member' ? 'FAM' :
                           registration.role === 'khadem' ? 'KH' :
                           registration.role === 'makhdoum' ? 'MKH' :
                           'Other'}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {registration.email_sent ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-200 text-green-700 text-xs font-bold">✓</span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-200 text-red-700 text-xs font-bold">✗</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {registration.is_confirmed ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-200 text-green-700 text-xs font-bold">✓</span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-200 text-red-700 text-xs font-bold">✗</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {registration.attended ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 text-blue-700 text-xs font-bold">✓</span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs font-bold">✗</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {registration.waiting_list_turn != null ? (
                        <span className="text-yellow-600 font-bold text-sm">#{registration.waiting_list_turn}</span>
                      ) : (
                        <span className="text-[#bfa98c]">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex flex-wrap gap-1 items-center justify-center">
                        <button
                          onClick={() => handleSendEmail(registration)}
                          disabled={sendingEmail === registration.id || registration.email_sent}
                          className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 transition whitespace-nowrap ${
                            sendingEmail === registration.id
                              ? "bg-[#D4622A]/50 text-white/50 cursor-not-allowed"
                              : registration.email_sent
                              ? "bg-green-500/30 text-green-700 cursor-default"
                              : "bg-[#D4622A] text-white hover:bg-[#B84F1E]"
                          }`}
                          title="Send email"
                        >
                          {sendingEmail === registration.id ? (
                            <Loader className="w-3 h-3 animate-spin" />
                          ) : registration.email_sent ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          <span className="hidden sm:inline">{sendingEmail === registration.id ? "Sending..." : registration.email_sent ? "Sent" : "Send"}</span>
                        </button>
                        {registration.waiting_list_turn != null && !registration.is_confirmed && (
                          <button
                            onClick={() => handleNotifyAndConfirm(registration)}
                            disabled={notifyingId === registration.id}
                            className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 transition whitespace-nowrap ${
                              notifyingId === registration.id
                                ? "bg-yellow-500/50 text-white/50 cursor-not-allowed"
                                : "bg-yellow-500 text-white hover:bg-yellow-600"}
                          `}
                            title="Notify and confirm from waiting list"
                          >
                            {notifyingId === registration.id ? <Loader className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                            <span className="hidden sm:inline">{notifyingId === registration.id ? "..." : "Notify"}</span>
                          </button>
                        )}
                        <button
                          onClick={() => { setEditingRoleId(registration.id); setEditingRoleReg(registration); setNewRole(""); }}
                          className="px-2 py-1 rounded text-xs font-bold flex items-center gap-1 bg-yellow-400 text-white hover:bg-yellow-500 transition whitespace-nowrap"
                          title="Edit role"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span className="hidden sm:inline">Role</span>
                        </button>
                        <button
                          onClick={() =>
                            setDeleteDialog({
                              show: true,
                              name: registration.full_name,
                              id: registration.id,
                            })
                          }
                          disabled={deletingId === registration.id}
                          className="px-2 py-1 rounded text-xs font-bold flex items-center gap-1 bg-red-500 text-white hover:bg-red-600 transition whitespace-nowrap disabled:opacity-50"
                          title="Delete user"
                        >
                          {deletingId === registration.id ? (
                            <Loader className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
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
