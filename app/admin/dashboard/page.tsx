"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getSession, clearSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AdminTable from "@/components/admin/AdminTable";
import RegistrationStatusModal from "@/components/admin/RegistrationStatusModal";
import { LogOut, Users, Pause, Play } from "lucide-react";

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
  const [searchType, setSearchType] = useState<"all" | "name" | "email" | "phone" | "regNumber">("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalStats, setTotalStats] = useState({
    totalRegistrations: 0,
    totalEmailsSent: 0,
    totalConfirmed: 0,
    totalWaitingList: 0,
  });
  const [roleStats, setRoleStats] = useState({
    familyMember: 0,
    khadem: 0,
    makhdoum: 0,
  });
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState({
    is_open: true,
    message: "",
  });
  const [adminKey, setAdminKey] = useState<string>("");

  useEffect(() => {
    if (!getSession()) {
      router.push("/admin");
      return;
    }
    fetchRegistrations();
    fetchTotalStats();
    fetchRoleStats();
    fetchRegistrationStatus();
    // eslint-disable-next-line
  }, [router, waitingListOnly, confirmedFilter, roleFilter, search, searchType, page]);

  const fetchRegistrationStatus = async () => {
    try {
      const response = await fetch("/api/admin/registration-status");
      if (response.ok) {
        const data = await response.json();
        setRegistrationStatus(data);
      }
    } catch (err) {
      console.error("Failed to fetch registration status:", err);
    }
  };

  const handleUpdateRegistrationStatus = async (is_open: boolean, message: string) => {
    if (!adminKey) {
      throw new Error("Admin key is required. Please enter it and try again.");
    }

    try {
      const response = await fetch("/api/admin/registration-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ is_open, message }),
      });

      if (!response.ok) {
        throw new Error("Failed to update registration status");
      }

      const data = await response.json();
      setRegistrationStatus(data);
    } catch (error) {
      throw error;
    }
  };

  const fetchTotalStats = async () => {
    try {
      // Fetch all stats without filters to get totals
      const response = await fetch(`/api/admin/registrations?page=1&pageSize=1`);
      const data = await response.json();
      
      if (response.ok) {
        // Get total counts by fetching stats
        const statsResponse = await fetch(`/api/admin/stats`);
        const statsData = await statsResponse.json();
        
        if (statsResponse.ok) {
          setTotalStats(statsData);
        }
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const fetchRoleStats = async () => {
    try {
      const response = await fetch(`/api/admin/stats`);
      if (response.ok) {
        const data = await response.json();
        setRoleStats({
          familyMember: data.familyMemberCount || 0,
          khadem: data.khademCount || 0,
          makhdoum: data.makhdoumCount || 0,
        });
      }
    } catch (err) {
      console.error("Failed to fetch role stats:", err);
    }
  };

  const fetchRegistrations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (waitingListOnly) params.set("waitingList", "true");
      if (confirmedFilter !== "all") params.set("confirmed", confirmedFilter);
      if (roleFilter !== "all") params.set("role", roleFilter);
      if (search) {
        params.set("search", search);
        params.set("searchType", searchType);
      }
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

  const handleExportExcel = async () => {
    try {
      // Dynamic import of xlsx
      const XLSX = await import("xlsx");

      // Fetch all registrations (waiting list and confirmed)
      const waitingListResponse = await fetch(
        `/api/admin/registrations?waitingList=true&pageSize=10000`
      );
      const waitingListData = await waitingListResponse.json();
      let waitingList = waitingListData.registrations || [];

      const confirmedResponse = await fetch(
        `/api/admin/registrations?confirmed=true&pageSize=10000`
      );
      const confirmedData = await confirmedResponse.json();
      let confirmed = confirmedData.registrations || [];

      // Ensure proper sorting with explicit date parsing
      waitingList = waitingList.sort(
        (a: any, b: any) =>
          (a.waiting_list_turn || 0) - (b.waiting_list_turn || 0)
      );

      confirmed = confirmed.sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Waiting List Sheet
      const waitingListSheet = XLSX.utils.json_to_sheet(
        waitingList.map((reg: any) => ({
          "Turn #": reg.waiting_list_turn || "-",
          "Full Name": reg.full_name,
          Email: reg.email,
          Phone: reg.phone,
          "Church Name": reg.church_name,
          Role: reg.role || "Not Specified",
          "Confirmation Code": reg.confirmation_code,
          "Registration Date": new Date(reg.created_at).toLocaleString(
            "en-US"
          ),
        }))
      );

      // Confirmed Sheet - Sort by date descending (newest first)
      const confirmedSheet = XLSX.utils.json_to_sheet(
        confirmed.map((reg: any) => ({
          "Full Name": reg.full_name,
          Email: reg.email,
          Phone: reg.phone,
          "Church Name": reg.church_name,
          Role: reg.role || "Not Specified",
          Status: reg.is_confirmed ? "Confirmed" : "Unconfirmed",
          "Email Sent": reg.email_sent ? "Yes" : "No",
          "Confirmation Code": reg.confirmation_code,
          "Registration Date": new Date(reg.created_at).toLocaleString(
            "en-US"
          ),
        }))
      );

      // Style the sheets
      const headerStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" }, size: 12 },
        fill: { fgColor: { rgb: "D4622A" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        },
      };

      // Apply header style to waiting list sheet
      const waitingListRange = XLSX.utils.decode_range(
        waitingListSheet["!ref"] || "A1"
      );
      for (let C = waitingListRange.s.c; C <= waitingListRange.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + "1";
        if (!waitingListSheet[address]) continue;
        waitingListSheet[address].s = headerStyle;
      }

      // Apply header style to confirmed sheet
      const confirmedRange = XLSX.utils.decode_range(
        confirmedSheet["!ref"] || "A1"
      );
      for (let C = confirmedRange.s.c; C <= confirmedRange.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + "1";
        if (!confirmedSheet[address]) continue;
        confirmedSheet[address].s = headerStyle;
      }

      // Set column widths
      const columnWidths = [
        { wch: 12 },
        { wch: 20 },
        { wch: 25 },
        { wch: 15 },
        { wch: 25 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
        { wch: 25 },
      ];
      waitingListSheet["!cols"] = columnWidths;
      confirmedSheet["!cols"] = columnWidths;

      // Add sheets to workbook
      XLSX.utils.book_append_sheet(wb, waitingListSheet, "Waiting List");
      XLSX.utils.book_append_sheet(wb, confirmedSheet, "Confirmed");

      // Generate filename with date
      const date = new Date().toISOString().split("T")[0];
      const filename = `Event_Registrations_${date}.xlsx`;

      // Write file
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      alert("Failed to export Excel file");
    }
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!adminKey) {
                  const key = prompt("Enter Admin Secret Key:");
                  if (key) {
                    setAdminKey(key);
                    setShowStatusModal(true);
                  }
                } else {
                  setShowStatusModal(true);
                }
              }}
              className={`flex items-center gap-2 py-3 px-6 rounded-xl font-bold shadow-md transition-all duration-300 ${
                registrationStatus.is_open
                  ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                  : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
              }`}
            >
              {registrationStatus.is_open ? (
                <>
                  <Play className="w-5 h-5" />
                  Registrations Open
                </>
              ) : (
                <>
                  <Pause className="w-5 h-5" />
                  Registrations Paused
                </>
              )}
            </button>
            <Button
              onClick={handleLogout}
              className="bg-gradient-to-r from-[#D4622A] to-[#bfa98c] hover:from-[#B84F1E] hover:to-[#d4af37] text-white py-3 px-8 rounded-xl font-bold shadow-md transition-all duration-300"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
        >
          <Card className="bg-gradient-to-br from-[#fff7ef] to-[#f3e9e0] border-0 shadow-lg">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-[#D4622A]/10 rounded-xl p-4">
                <Users className="w-8 h-8 text-[#D4622A]" />
              </div>
              <div>
                <p className="text-[#7a5c3e] text-sm font-semibold">Total Registrations</p>
                <p className="text-4xl font-extrabold text-[#D4622A]">{totalStats.totalRegistrations}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe] border-0 shadow-lg">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-blue-500/10 rounded-xl p-4">
                <Users className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <p className="text-[#7a5c3e] text-sm font-semibold">Emails Sent</p>
                <p className="text-4xl font-extrabold text-blue-600">
                  {totalStats.totalEmailsSent}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] border-0 shadow-lg">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-green-500/10 rounded-xl p-4">
                <Users className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <p className="text-[#7a5c3e] text-sm font-semibold">Confirmed</p>
                <p className="text-4xl font-extrabold text-green-600">
                  {totalStats.totalConfirmed}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#fef3c7] to-[#fde68a] border-0 shadow-lg">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-yellow-500/10 rounded-xl p-4">
                <Users className="w-8 h-8 text-yellow-600" />
              </div>
              <div>
                <p className="text-[#7a5c3e] text-sm font-semibold">Waiting List</p>
                <p className="text-4xl font-extrabold text-yellow-600">
                  {totalStats.totalWaitingList}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Role Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid md:grid-cols-3 gap-6 mb-10"
        >
          <Card className="bg-gradient-to-br from-[#fce7f3] to-[#fbcfe8] border-0 shadow-lg">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-pink-500/10 rounded-xl p-4">
                <Users className="w-8 h-8 text-pink-600" />
              </div>
              <div>
                <p className="text-[#7a5c3e] text-sm font-semibold">Family Members</p>
                <p className="text-4xl font-extrabold text-pink-600">
                  {roleStats.familyMember}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#dbeafe] to-[#bfdbfe] border-0 shadow-lg">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-cyan-500/10 rounded-xl p-4">
                <Users className="w-8 h-8 text-cyan-600" />
              </div>
              <div>
                <p className="text-[#7a5c3e] text-sm font-semibold">Khadem</p>
                <p className="text-4xl font-extrabold text-cyan-600">
                  {roleStats.khadem}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#e9d5ff] to-[#d8b4fe] border-0 shadow-lg">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-purple-500/10 rounded-xl p-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <p className="text-[#7a5c3e] text-sm font-semibold">Makhdoum</p>
                <p className="text-4xl font-extrabold text-purple-600">
                  {roleStats.makhdoum}
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
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#D4622A] mb-2">All Registrations</h2>
              <p className="text-[#7a5c3e]">View and manage all event registrations</p>
            </div>
            <button
              onClick={handleExportExcel}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-bold shadow-md transition-all duration-300"
            >
              📊 Export to Excel
            </button>
          </div>

          {/* Search and Filters Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-[#D4AF37]/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search Input */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-[#7a5c3e] mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Enter search term..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 rounded-lg border-2 border-[#e2c9b0] bg-[#f8f6f2] text-[#7a5c3e] placeholder-[#bfa98c] focus:outline-none focus:border-[#D4622A] transition-colors"
                />
              </div>

              {/* Search Type */}
              <div>
                <label className="block text-sm font-semibold text-[#7a5c3e] mb-2">
                  Search By
                </label>
                <select
                  value={searchType}
                  onChange={(e) => {
                    setSearchType(
                      e.target.value as
                        | "all"
                        | "name"
                        | "email"
                        | "phone"
                        | "regNumber"
                    );
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 rounded-lg border-2 border-[#e2c9b0] bg-[#f8f6f2] text-[#7a5c3e] focus:outline-none focus:border-[#D4622A] transition-colors"
                >
                  <option value="all">Reg Number</option>
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-[#7a5c3e] mb-2">
                  Status
                </label>
                <select
                  value={confirmedFilter}
                  onChange={(e) => {
                    setConfirmedFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 rounded-lg border-2 border-[#e2c9b0] bg-[#f8f6f2] text-[#7a5c3e] focus:outline-none focus:border-[#D4622A] transition-colors"
                >
                  <option value="all">All</option>
                  <option value="true">Confirmed</option>
                  <option value="false">Unconfirmed</option>
                </select>
              </div>

              {/* Role Filter */}
              <div>
                <label className="block text-sm font-semibold text-[#7a5c3e] mb-2">
                  Role
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 rounded-lg border-2 border-[#e2c9b0] bg-[#f8f6f2] text-[#7a5c3e] focus:outline-none focus:border-[#D4622A] transition-colors"
                >
                  <option value="all">All Roles</option>
                  <option value="family-member">Family Member</option>
                  <option value="khadem">Khadem</option>
                  <option value="makhdoum">Makhdoum</option>
                  <option value="undefined">Undefined</option>
                </select>
              </div>
            </div>

            {/* Waiting List Checkbox */}
            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="waitingListOnly"
                checked={waitingListOnly}
                onChange={(e) => {
                  setWaitingListOnly(e.target.checked);
                  setPage(1);
                }}
                className="w-4 h-4 accent-[#D4622A] cursor-pointer rounded"
              />
              <label
                htmlFor="waitingListOnly"
                className="text-sm font-semibold text-[#7a5c3e] cursor-pointer"
              >
                Show Waiting List Only
              </label>
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
            <span className="px-5 py-3 bg-[#f8f6f2] text-[#7a5c3e] border-t border-b border-[#e2c9b0]">
              Page {page} of {Math.ceil(total / pageSize) || 1}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={registrations.length < pageSize}
              className="px-5 py-3 bg-gradient-to-r from-[#D4622A] to-[#bfa98c] text-white rounded-r-xl font-bold disabled:bg-gray-300 disabled:text-gray-500"
            >Next</button>
          </div>
        </motion.div>

        {/* Registration Status Modal */}
        <RegistrationStatusModal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          currentStatus={registrationStatus}
          onStatusChange={handleUpdateRegistrationStatus}
        />
      </div>
    </div>
  );
}
