"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession, hasRole, clearSession } from "@/lib/auth";
import DoorCheckIn from "@/components/admin/DoorCheckIn";

export default function DoorPage() {
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session || !session.loggedIn) {
      router.push("/admin");
      return;
    }
    // Door users have access to door page, but not admins
    if (session.role !== "door") {
      router.push("/admin/dashboard");
    }
  }, [router]);

  const handleLogout = () => {
    clearSession();
    router.push("/admin");
  };

  return <DoorCheckIn onLogout={handleLogout} />;
}
