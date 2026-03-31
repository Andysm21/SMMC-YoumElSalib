import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db";

/**
 * GET /api/admin/email-stats
 * Get email quota statistics for today
 * Returns: { sentToday, estimatedLimit, remaining, resetMessage }
 */
export async function GET() {
  try {
    // Get email logs sent today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const { data: emailLogs, error: fetchError } = await supabaseAdmin
      .from("email_logs")
      .select("id")
      .gte("created_at", startOfToday.toISOString());

    if (fetchError) {
      console.error("Error fetching email logs:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch email stats" },
        { status: 500 }
      );
    }

    const sentToday = emailLogs?.length || 0;
    const estimatedLimit = 500; // Gmail's free tier limit
    const remaining = Math.max(0, estimatedLimit - sentToday);

    return NextResponse.json({
      sentToday,
      estimatedLimit,
      remaining,
      resetMessage: "Resets every 24 hours (approx Gmail limit)",
      percentageUsed: Math.round((sentToday / estimatedLimit) * 100),
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
