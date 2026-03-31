import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db";

/**
 * GET /api/admin/waiting-list
 * Get all waiting list users (NOT confirmed)
 * Supports pagination for batch operations
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const batchSize = parseInt(searchParams.get("batchSize") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Get all unconfirmed waiting list users with pagination
    const { data: waitingUsers, error: fetchError, count } = await supabaseAdmin
      .from("registrations")
      .select("*", { count: "exact" })
      .not("waiting_list_turn", "is", null)
      .eq("is_confirmed", false)
      .order("waiting_list_turn", { ascending: true })
      .range(offset, offset + batchSize - 1);

    if (fetchError) {
      console.error("Error fetching waiting list:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch waiting list users" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: waitingUsers?.length || 0,
      total: count || 0,
      offset,
      batchSize,
      users: waitingUsers || [],
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
