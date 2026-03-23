"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginForm from "@/components/admin/LoginForm";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    if (getSession()) {
      router.push("/admin/dashboard");
    }
  }, [router]);

  return <LoginForm />;
}
