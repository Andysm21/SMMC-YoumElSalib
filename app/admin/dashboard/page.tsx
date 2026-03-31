"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getSession, clearSession, hasRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AdminTable from "@/components/admin/AdminTable";
import RegistrationStatusModal from "@/components/admin/RegistrationStatusModal";
import { EmailQuotaCard } from "@/components/admin/EmailQuotaCard";
import { WaitingListManagement } from "@/components/admin/WaitingListManagement";
import { LogOut, Users, Pause, Play, CheckCircle2, Menu, X } from "lucide-react";

interface Registration {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  church_name: string;
  confirmation_code: string;
  email_sent: boolean;
  created_at: string;
  attended?: boolean;
  attended_at?: string | null;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "search" | "waiting" | "attendance">("dashboard");
  const [waitingListFilter, setWaitingListFilter] = useState<string>("all"); // "all", "waiting-unconfirmed", "waiting-confirmed"
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
    totalAttended: 0,
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session || !hasRole("admin")) {
      router.push("/admin");
      return;
    }
    // Load admin key from session storage if available
    const savedAdminKey = sessionStorage.getItem("adminKey");
    if (savedAdminKey) {
      setAdminKey(savedAdminKey);
    }
    fetchRegistrations();
    fetchTotalStats();
    fetchRoleStats();
    fetchRegistrationStatus();
    // eslint-disable-next-line
  }, [router, waitingListFilter, confirmedFilter, roleFilter, search, searchType, page]);

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
    // Get session to verify current user
    const session = getSession();
    if (!session || session.username !== "andrew") {
      throw new Error("Only andrew can pause/resume registrations.");
    }

    let key = adminKey;
    if (!key) {
      // Prompt for admin key
      const promptedKey = prompt("Enter admin key:");
      if (!promptedKey) {
        throw new Error("Admin key is required.");
      }
      key = promptedKey;
      // Save for current session
      setAdminKey(key);
      sessionStorage.setItem("adminKey", key);
    }

    try {
      const response = await fetch("/api/admin/registration-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": key,
        },
        body: JSON.stringify({ is_open, message }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update registration status");
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
      if (waitingListFilter !== "all") params.set("waitingListFilter", waitingListFilter);
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
    <div className="min-h-screen bg-gradient-to-br from-[#f8f6f2] via-[#f3e9e0] to-[#f8f6f2] flex flex-col md:flex-row">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <div className={`fixed md:static left-0 top-0 h-screen w-full md:w-auto bg-white shadow-xl border-r-2 border-[#e2c9b0] flex flex-col z-50 transition-all duration-300 ${
        sidebarCollapsed ? 'md:w-20' : 'md:w-48'
      } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Header in Sidebar */}
        <div className="p-4 border-b border-[#e2c9b0] flex items-center justify-between">
          {!sidebarCollapsed && (
            <>
              <div>
                <img src="/poster.jpg" alt="Event Logo" className="w-12 h-12 rounded-full shadow-lg border-2 border-[#D4622A]/30 object-cover bg-white mb-2" />
                <h2 className="text-lg font-bold text-[#D4622A]" style={{ fontFamily: 'Georgia, serif' }}>Admin</h2>
                <p className="text-xs text-[#bfa98c]">Event Management</p>
              </div>
            </>
          )}
          <button
            onClick={() => {
              setSidebarCollapsed(!sidebarCollapsed);
            }}
            className="p-2 hover:bg-[#f8f6f2] rounded-lg transition-colors ml-auto hidden md:block"
            title={sidebarCollapsed ? "Expand" : "Collapse"}
          >
            {sidebarCollapsed ? <Menu className="w-5 h-5 text-[#D4622A]" /> : <X className="w-5 h-5 text-[#D4622A]" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 hover:bg-[#f8f6f2] rounded-lg transition-colors ml-auto md:hidden"
          >
            <X className="w-5 h-5 text-[#D4622A]" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full px-4 py-3 rounded-lg font-bold text-sm transition-all ${
              activeTab === "dashboard"
                ? "bg-[#D4622A] text-white shadow-lg"
                : "bg-[#f8f6f2] text-[#7a5c3e] hover:bg-[#e2c9b0]"
            } flex items-center justify-center`}
            title="Dashboard"
          >
            {sidebarCollapsed ? "📊" : "📊 Dashboard"}
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`w-full px-4 py-3 rounded-lg font-bold text-sm transition-all ${
              activeTab === "search"
                ? "bg-[#D4622A] text-white shadow-lg"
                : "bg-[#f8f6f2] text-[#7a5c3e] hover:bg-[#e2c9b0]"
            } flex items-center justify-center`}
            title="Search"
          >
            {sidebarCollapsed ? "🔍" : "🔍 Search"}
          </button>
          <button
            onClick={() => setActiveTab("waiting")}
            className={`w-full px-4 py-3 rounded-lg font-bold text-sm transition-all ${
              activeTab === "waiting"
                ? "bg-[#D4622A] text-white shadow-lg"
                : "bg-[#f8f6f2] text-[#7a5c3e] hover:bg-[#e2c9b0]"
            } flex items-center justify-center`}
            title="Waiting List"
          >
            {sidebarCollapsed ? "📬" : "📬 Waiting List"}
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`w-full px-4 py-3 rounded-lg font-bold text-sm transition-all ${
              activeTab === "attendance"
                ? "bg-[#D4622A] text-white shadow-lg"
                : "bg-[#f8f6f2] text-[#7a5c3e] hover:bg-[#e2c9b0]"
            } flex items-center justify-center`}
            title="Attendance"
          >
            {sidebarCollapsed ? "✅" : "✅ Attendance"}
          </button>
        </nav>

        {/* Footer in Sidebar */}
        <div className="p-4 border-t border-[#e2c9b0] space-y-2">
          <button
            onClick={() => setShowStatusModal(true)}
            className="w-full px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg font-bold text-xs transition-all flex items-center justify-center"
            title={registrationStatus.is_open ? "Registrations Open" : "Registrations Paused"}
          >
            {registrationStatus.is_open ? (
              <>
                {!sidebarCollapsed && <Play className="w-4 h-4 inline mr-2" />}
                {sidebarCollapsed ? "▶" : "Registrations Open"}
              </>
            ) : (
              <>
                {!sidebarCollapsed && <Pause className="w-4 h-4 inline mr-2" />}
                {sidebarCollapsed ? "⏸" : "Registrations Paused"}
              </>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-gradient-to-r from-[#D4622A] to-[#bfa98c] hover:from-[#B84F1E] hover:to-[#d4af37] text-white rounded-lg font-bold text-xs transition-all flex items-center justify-center"
            title="Logout"
          >
            {sidebarCollapsed ? <LogOut className="w-4 h-4" /> : (
              <>
                <LogOut className="w-4 h-4 inline mr-2" />
                Logout
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className={`flex-1 w-full transition-all duration-300`}>
        {/* Mobile Header with Menu Button */}
        <div className="md:hidden bg-white border-b-2 border-[#e2c9b0] p-4 flex items-center justify-between sticky top-0 z-30">
          <h1 className="text-lg font-bold text-[#D4622A]">Admin Dashboard</h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-[#f8f6f2] rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-[#D4622A]" />
          </button>
        </div>

        <div className="container mx-auto px-4 md:px-8 py-6 md:py-10">
        
        {/* Stats Cards - Dashboard Tab */}
        {activeTab === "dashboard" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-[#D4622A] mb-6 md:mb-8" style={{ fontFamily: 'Georgia, serif' }}>Dashboard Statistics</h1>
            
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

          <Card className="bg-gradient-to-br from-[#dbeafe] to-[#bfdbfe] border-0 shadow-lg">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-blue-600/10 rounded-xl p-4">
                <CheckCircle2 className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-[#7a5c3e] text-sm font-semibold">Attended</p>
                <p className="text-4xl font-extrabold text-blue-600">
                  {totalStats.totalAttended || 0}
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
            </motion.div>
          )}

          {/* Search Tab */}
          {activeTab === "search" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-4xl font-bold text-[#D4622A] mb-8" style={{ fontFamily: 'Georgia, serif' }}>Search Registrations</h1>
              
              {/* Stats Summary */}
              <motion.div
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
              >
                <Card className="bg-gradient-to-br from-[#fff7ef] to-[#f3e9e0] border-0 shadow-lg">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="bg-[#D4622A]/10 rounded-xl p-4">
                      <Users className="w-8 h-8 text-[#D4622A]" />
                    </div>
                    <div>
                      <p className="text-[#7a5c3e] text-sm font-semibold">Total Registrations</p>
                      <p className="text-3xl font-extrabold text-[#D4622A]">{totalStats.totalRegistrations}</p>
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
                      <p className="text-3xl font-extrabold text-green-600">{totalStats.totalConfirmed}</p>
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
                      <p className="text-3xl font-extrabold text-yellow-600">{totalStats.totalWaitingList}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#dbeafe] to-[#bfdbfe] border-0 shadow-lg">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="bg-blue-600/10 rounded-xl p-4">
                      <CheckCircle2 className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[#7a5c3e] text-sm font-semibold">Attended</p>
                      <p className="text-3xl font-extrabold text-blue-600">{totalStats.totalAttended || 0}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Search and Filters Section */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-[#D4AF37]/20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Search Input */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-[#7a5c3e] mb-2">Search</label>
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
                    <label className="block text-sm font-semibold text-[#7a5c3e] mb-2">Search By</label>
                    <select
                      value={searchType}
                      onChange={(e) => {
                        setSearchType(e.target.value as "all" | "name" | "email" | "phone" | "regNumber");
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
                    <label className="block text-sm font-semibold text-[#7a5c3e] mb-2">Status</label>
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
                    <label className="block text-sm font-semibold text-[#7a5c3e] mb-2">Role</label>
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

                {/* Waiting List Filter */}
                <div>
                  <label className="block text-sm font-semibold text-[#7a5c3e] mb-2">Waiting List Filter</label>
                  <select
                    value={waitingListFilter}
                    onChange={(e) => {
                      setWaitingListFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-4 py-2 rounded-lg border-2 border-[#e2c9b0] bg-[#f8f6f2] text-[#7a5c3e] focus:outline-none focus:border-[#D4622A] transition-colors"
                  >
                    <option value="all">All Registrations</option>
                    <option value="waiting-unconfirmed">Waiting List - Unconfirmed</option>
                    <option value="waiting-confirmed">Waiting List - Confirmed</option>
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
                adminKey={adminKey}
                onRefresh={fetchRegistrations}
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
          )}

          {/* Waiting List Tab */}
          {activeTab === "waiting" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-4xl font-bold text-[#D4622A] mb-8" style={{ fontFamily: 'Georgia, serif' }}>Waiting List Management</h1>
              
              {/* Email Quota */}
              <div className="mb-8">
                <EmailQuotaCard />
              </div>

              {/* Waiting List Management */}
              <div>
                <WaitingListManagement />
              </div>
            </motion.div>
          )}

          {/* Attendance Tab */}
          {activeTab === "attendance" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-4xl font-bold text-[#D4622A] mb-8" style={{ fontFamily: 'Georgia, serif' }}>Event Attendance</h1>
              <Card className="bg-white shadow-lg border-2 border-[#e2c9b0] p-8 text-center">
                <CardContent>
                  <p className="text-[#7a5c3e] mb-4">Redirecting to Attendance Check-in...</p>
                  <button 
                    onClick={() => router.push('/admin/door')}
                    className="px-6 py-3 bg-gradient-to-r from-[#D4622A] to-[#bfa98c] text-white rounded-lg font-bold"
                  >
                    Go to Attendance Page
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Registration Status Modal */}
      <RegistrationStatusModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        currentStatus={registrationStatus}
        onStatusChange={handleUpdateRegistrationStatus}
      />
    </div>
  );
}
