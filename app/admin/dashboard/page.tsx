"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getSession, clearSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AdminTable from "@/components/admin/AdminTable";
import { LogOut, Users } from "lucide-react";

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

export default function AdminDashboard() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getSession()) {
      router.push("/admin");
      return;
    }

    fetchRegistrations();
  }, [router]);

  const fetchRegistrations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/registrations");
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to fetch registrations");
      } else {
        setRegistrations(data.registrations || []);
      }
    } catch (err) {
      setError("Failed to fetch registrations");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A0F08] via-[#2A1810] to-[#1A0F08]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <h1 className="text-5xl font-black text-[#1A0F08] mb-2" style={{ fontFamily: "Georgia, serif", textShadow: "0 4px 6px rgba(232, 180, 160, 0.3)" }}>
              Admin Dashboard
            </h1>
            <p className="text-white/70">Event Registration Management</p>
          </div>
          <Button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg flex items-center gap-2 transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          <Card className="bg-white/10 backdrop-blur-lg border-[#D4622A]/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-[#D4622A]/20 rounded-lg p-4">
                  <Users className="w-8 h-8 text-[#D4622A]" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Total Registrations</p>
                  <p className="text-4xl font-bold text-white">{registrations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-[#D4622A]/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-500/20 rounded-lg p-4">
                  <Users className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Emails Sent</p>
                  <p className="text-4xl font-bold text-white">
                    {registrations.filter((r) => r.email_sent).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Registrations Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">All Registrations</h2>
            <p className="text-white/70">View and manage all event registrations</p>
          </div>
          <AdminTable
            registrations={registrations}
            isLoading={isLoading}
            error={error}
          />
        </motion.div>
      </div>
    </div>
  );
}
