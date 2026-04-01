import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { generateConfirmationCode } from "@/lib/confirmationCode";

/**
 * POST /api/admin/generate-test-data
 * Generate test registrations for admin testing
 */

const CHURCHES = [
  "St. Mary's Church",
  "Grace Community Church",
  "Holy Spirit Church",
  "Christ The King",
  "All Saints",
  "The Cathedral",
  "Shepherd's Fold",
];

const NAMES = [
  "John Smith",
  "Sarah Johnson",
  "Michael Williams",
  "Emily Brown",
  "David Lee",
  "Jessica Davis",
  "Robert Martinez",
  "Amanda Taylor",
  "Christopher Anderson",
  "Michelle Thomas",
];

function generateEmail(): string {
  return `test${Math.random().toString().substring(2, 8)}@test.com`;
}

function generatePhone(): string {
  return `555-${Math.random().toString().substring(2, 5)}-${Math.random().toString().substring(2, 6)}`;
}

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Missing Supabase configuration" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { count = 10 } = body;

    if (count < 1 || count > 50) {
      return NextResponse.json(
        { error: "Count must be between 1 and 50" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const testUsers = [];
    for (let i = 0; i < count; i++) {
      const isConfirmed = Math.random() > 0.4; // 60% confirmed, 40% waiting
      const confirmationCode = await generateConfirmationCode(isConfirmed);
      testUsers.push({
        full_name: NAMES[i % NAMES.length] + ` (Test ${i + 1})`,
        email: generateEmail(),
        phone: generatePhone(),
        church_name: CHURCHES[Math.floor(Math.random() * CHURCHES.length)],
        confirmation_code: confirmationCode,
        is_confirmed: isConfirmed,
        status: isConfirmed ? "confirmed" : "waiting",
        source: "admin",
        notes: "Auto-generated test data",
        attended: false,
        is_deleted: false,
        created_at: new Date().toISOString(),
      });
    }

    const { data, error } = await supabase
      .from("registrations")
      .insert(testUsers)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to generate test data" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Generated ${data.length} test users`,
        count: data.length,
        users: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
