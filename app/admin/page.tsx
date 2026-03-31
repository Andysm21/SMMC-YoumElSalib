"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession, hasRole } from "@/lib/auth";
import LoginForm from "@/components/admin/LoginForm";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (session && session.loggedIn) {
      if (session.role === "admin") {
        router.push("/admin/dashboard");
      } else if (session.role === "door") {
        router.push("/admin/door");
      }
    }
  }, [router]);

  return <LoginForm />;
}
