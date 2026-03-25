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
  const [waitingListOnly, setWaitingListOnly] = useState(false);
  const [confirmedFilter, setConfirmedFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!getSession()) {
      router.push("/admin");
      return;
    }
    fetchRegistrations();
    // eslint-disable-next-line
  }, [router, waitingListOnly, confirmedFilter, search, page]);

  const fetchRegistrations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (waitingListOnly) params.set("waitingList", "true");
      if (confirmedFilter !== "all") params.set("confirmed", confirmedFilter);
      if (search) params.set("search", search);
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      const response = await fetch(`/api/admin/registrations?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to fetch registrations");
      } else {
        setRegistrations(data.registrations || []);
        setTotal(data.total || 0);
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
    <div className="min-h-screen bg-gradient-to-br from-[#f8f6f2] via-[#f3e9e0] to-[#f8f6f2]">
      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6"
        >
          <div className="flex items-center gap-4">
            <img src="/poster.jpg" alt="Event Logo" className="w-16 h-16 rounded-full shadow-lg border-4 border-[#D4622A]/30 object-cover bg-white" />
            <div>
              <h1 className="text-5xl font-black text-[#D4622A] mb-1 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                Admin Dashboard
              </h1>
              <p className="text-[#7a5c3e] text-base">Event Registration Management</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            className="bg-gradient-to-r from-[#D4622A] to-[#bfa98c] hover:from-[#B84F1E] hover:to-[#d4af37] text-white py-3 px-8 rounded-xl font-bold shadow-md transition-all duration-300"
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
          className="grid md:grid-cols-2 gap-8 mb-10"
        >
          <Card className="bg-gradient-to-br from-[#fff7ef] to-[#f3e9e0] border-0 shadow-lg">
            <CardContent className="p-8 flex items-center gap-6">
              <div className="bg-[#D4622A]/10 rounded-xl p-5">
                <Users className="w-10 h-10 text-[#D4622A]" />
              </div>
              <div>
                <p className="text-[#7a5c3e] text-lg font-semibold">Total Registrations</p>
                <p className="text-5xl font-extrabold text-[#D4622A]">{registrations.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#f3e9e0] to-[#fff7ef] border-0 shadow-lg">
            <CardContent className="p-8 flex items-center gap-6">
              <div className="bg-green-500/10 rounded-xl p-5">
                <Users className="w-10 h-10 text-green-500" />
              </div>
              <div>
                <p className="text-[#7a5c3e] text-lg font-semibold">Emails Sent</p>
                <p className="text-5xl font-extrabold text-green-600">
                  {registrations.filter((r) => r.email_sent).length}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Registrations Table + Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#D4622A] mb-2">All Registrations</h2>
              <p className="text-[#7a5c3e]">View and manage all event registrations</p>
            </div>
            <div className="flex flex-col md:flex-row gap-2 items-end">
              <input
                type="text"
                placeholder="Search by Reg Number..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="px-3 py-2 rounded-lg border border-[#e2c9b0] bg-[#f8f6f2] text-[#7a5c3e] placeholder-[#bfa98c] focus:outline-none focus:border-[#D4622A]"
              />
              <label className="flex items-center gap-2 text-[#7a5c3e] text-sm">
                <input
                  type="checkbox"
                  checked={waitingListOnly}
                  onChange={e => { setWaitingListOnly(e.target.checked); setPage(1); }}
                  className="accent-[#D4622A]"
                />
                Waiting List Only
              </label>
              <select
                value={confirmedFilter}
                onChange={e => { setConfirmedFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 rounded-lg border border-[#e2c9b0] bg-[#f8f6f2] text-[#7a5c3e] focus:outline-none focus:border-[#D4622A]"
                style={{ minWidth: 140 }}
              >
                <option value="all">All</option>
                <option value="true">Confirmed Only</option>
                <option value="false">Unconfirmed Only</option>
              </select>
            </div>
          </div>
          <AdminTable
            registrations={registrations}
            isLoading={isLoading}
            error={error}
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
          />
          {/* Pagination Controls */}
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-5 py-3 bg-gradient-to-r from-[#D4622A] to-[#bfa98c] text-white rounded-l-xl font-bold disabled:bg-gray-300 disabled:text-gray-500"
            >Prev</button>
            <span className="px-5 py-3 bg-[#f8f6f2] text-[#7a5c3e] border-t border-b border-[#e2c9b0]">Page {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={registrations.length < pageSize}
              className="px-5 py-3 bg-gradient-to-r from-[#D4622A] to-[#bfa98c] text-white rounded-r-xl font-bold disabled:bg-gray-300 disabled:text-gray-500"
            >Next</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
