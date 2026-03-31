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

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const searchTerm = `%${query.trim()}%`;

    // Search across multiple fields
    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .or(
        `confirmation_code.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm},full_name.ilike.${searchTerm}`
      )
      .limit(20);

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
