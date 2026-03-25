import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Missing Supabase configuration" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Parse query params for filtering, searching, pagination
    const { searchParams } = new URL(req.url);
  const waitingList = searchParams.get("waitingList");
  const confirmed = searchParams.get("confirmed");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

    let query = supabase
      .from("registrations")
      .select("*", { count: "exact" });

    if (waitingList === "true") {
      // Only show registrations where waiting_list_turn is NOT null
      query = query.not("waiting_list_turn", "is", null);
    }
    if (confirmed === "true") {
      query = query.eq("is_confirmed", true);
    } else if (confirmed === "false") {
      query = query.eq("is_confirmed", false);
    }
    if (search) {
      query = query.ilike("confirmation_code", `%${search}%`);
    }

    query = query.order("created_at", { ascending: false });
    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

  const { data, error, count } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch registrations" },
        { status: 500 }
      );
    }

  return NextResponse.json({ registrations: data || [], page, pageSize, total: count ?? 0 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
