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
  const waitingListFilter = searchParams.get("waitingListFilter");
  const confirmed = searchParams.get("confirmed");
  const role = searchParams.get("role");
  const search = searchParams.get("search");
  const searchType = searchParams.get("searchType") || "all";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

    let query = supabase
      .from("registrations")
      .select("*", { count: "exact" })
      .eq("is_deleted", false); // Always filter out deleted users

    // Handle waiting list filter
    if (waitingListFilter === "waiting-unconfirmed") {
      // Waiting list AND NOT confirmed
      query = query.not("waiting_list_turn", "is", null).eq("is_confirmed", false);
    } else if (waitingListFilter === "waiting-confirmed") {
      // Waiting list AND confirmed
      query = query.not("waiting_list_turn", "is", null).eq("is_confirmed", true);
    }
    
    if (confirmed === "true") {
      query = query.eq("is_confirmed", true);
    } else if (confirmed === "false") {
      query = query.eq("is_confirmed", false);
    }
    if (role && role !== "all") {
      if (role === "undefined") {
        // Search for both NULL values and the string 'UNDEFINED'
        query = query.or("role.is.null,role.eq.UNDEFINED");
      } else {
        query = query.eq("role", role);
      }
    }
    if (search) {
      if (searchType === "name") {
        query = query.ilike("full_name", `%${search}%`);
      } else if (searchType === "email") {
        query = query.ilike("email", `%${search}%`);
      } else if (searchType === "phone") {
        query = query.ilike("phone", `%${search}%`);
      } else {
        // Default to confirmation code
        query = query.ilike("confirmation_code", `%${search}%`);
      }
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
