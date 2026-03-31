"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { validateCredentials, setSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      setIsLoading(false);
      return;
    }

    const user = validateCredentials(username, password);
    if (user) {
      setSession(username, user.role);
      // Redirect based on role
      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else if (user.role === "door") {
        router.push("/admin/door");
      }
    } else {
      setError("Invalid username or password");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#f8f6f2] via-[#f3e9e0] to-[#f8f6f2]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white/90 shadow-2xl border-0 rounded-2xl">
          <CardContent className="p-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center mb-8"
            >
              <img src="/poster.jpg" alt="Event Logo" className="mx-auto mb-4 w-20 h-20 rounded-full shadow-lg border-4 border-[#D4622A]/30 object-cover bg-white" />
              <h1 className="text-4xl font-black text-[#D4622A] mb-2 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                Admin Login
              </h1>
              <p className="text-[#7a5c3e] text-base">Access the event management dashboard</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-100 border border-red-300 rounded-lg p-4"
                >
                  <p className="text-red-700 text-sm">{error}</p>
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-[#7a5c3e] font-semibold">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="bg-[#f8f6f2] border-[#e2c9b0] text-[#7a5c3e] placeholder:text-[#bfa98c] focus:border-[#D4622A] disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#7a5c3e] font-semibold">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-[#f8f6f2] border-[#e2c9b0] text-[#7a5c3e] placeholder:text-[#bfa98c] focus:border-[#D4622A] disabled:opacity-50"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#D4622A] to-[#bfa98c] hover:from-[#B84F1E] hover:to-[#d4af37] text-white py-4 text-lg rounded-xl font-bold shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
