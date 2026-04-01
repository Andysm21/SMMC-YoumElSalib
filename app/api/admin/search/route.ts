import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

/**
 * GET /api/admin/search
 * Search registrations by confirmation code, email, phone, or name
 * Query params:
 * - q: search string (required)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const searchTerm = `%${query.trim()}%`;

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
