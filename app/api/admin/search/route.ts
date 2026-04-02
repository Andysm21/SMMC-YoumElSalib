import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

/**
 * GET /api/admin/search
 * Search registrations by confirmation code, email, phone, or name
 * Query params:
 * - q: search string (required)
 * - partial: if true, use partial matching for codes (last 3-4 chars)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const usePartial = searchParams.get("partial") === "true";

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const searchTerm = `%${query.trim()}%`;

    // If partial matching requested (e.g., last 3-4 digits of code)
    if (usePartial && query.length >= 3) {
      const partialTerm = `%${query.slice(-4)}%`;
      const { data, error } = await supabase
        .from("registrations")
        .select(
          "id, full_name, email, phone, confirmation_code, is_confirmed, attended, attended_at, waiting_list_turn"
        )
        .eq("is_deleted", false)
        .ilike("confirmation_code", partialTerm)
        .limit(limit);

      if (error) {
        console.error("Partial search error:", error);
        return NextResponse.json(
          { error: "Failed to search registrations" },
          { status: 500 }
        );
      }

      return NextResponse.json({ results: data || [] });
    }

    // Search across multiple fields - limit to 10 results for door check-in
    const { data, error } = await supabase
      .from("registrations")
      .select("id, full_name, email, phone, confirmation_code, is_confirmed, attended, attended_at, waiting_list_turn")
      .eq("is_deleted", false) // Filter out deleted users
      .or(
        `confirmation_code.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm},full_name.ilike.${searchTerm}`
      )
      .limit(limit);

    if (error) {
      console.error("Search error:", error);
      return NextResponse.json(
        { error: "Failed to search registrations" },
        { status: 500 }
      );
    }

    return NextResponse.json({ results: data || [] });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
