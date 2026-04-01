import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { generateConfirmationCode } from "@/lib/confirmationCode";

/**
 * POST /api/admin/add-registration
 * Add an internal (admin/VIP) registration manually
 * 
 * Body:
 * - name: string (required)
 * - email: string (optional)
 * - phone: string (optional)
 * - church: string (required)
 * - status: "confirmed" | "waiting" (required)
 * - notes: string (optional)
 */

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
    const { name, email, phone, church, status, notes } = body;

    // Validation
    if (!name || !church || !status) {
      return NextResponse.json(
        { error: "Missing required fields: name, church, status" },
        { status: 400 }
      );
    }

    if (!["confirmed", "waiting"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'confirmed' or 'waiting'" },
        { status: 400 }
      );
    }

    // Generate confirmation code in the standard format
    const confirmationCode = await generateConfirmationCode(status === "confirmed");

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Insert the registration
    const { data, error } = await supabase
      .from("registrations")
      .insert({
        full_name: name,
        email: email || null,
        phone: phone || null,
        church_name: church,
        confirmation_code: confirmationCode,
        is_confirmed: status === "confirmed",
        status: status,
        source: "admin",
        notes: notes || null,
        attended: false,
        is_deleted: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to add registration" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User added successfully",
        registration: data,
        confirmationCode: confirmationCode,
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
