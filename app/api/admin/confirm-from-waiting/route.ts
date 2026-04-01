import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db";
import { sendPromotionEmail } from "@/lib/email";

/**
 * POST /api/admin/confirm-from-waiting
 * Promote a user from waiting list to confirmed
 * Body: { id: string }
 * Returns: { success: boolean, message: string, data: Registration }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get the user
    const { data: user, error: fetchError } = await supabaseAdmin
      .from("registrations")
      .select("*")
      .eq("id", id)
      .eq("is_deleted", false) // Ensure not deleted
      .single();

    if (fetchError || !user) {
      console.error("Fetch error:", fetchError);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Only allow promotion if user is on waiting list (waiting_list_turn is NOT NULL and is_confirmed = false)
    // OR if status is "waiting"
    const isOnWaitingList = user.waiting_list_turn !== null && user.waiting_list_turn !== undefined && !user.is_confirmed;
    const hasWaitingStatus = user.status === "waiting";
    
    if (!isOnWaitingList && !hasWaitingStatus) {
      return NextResponse.json(
        {
          error: "Cannot promote user",
          reason: "User is not on waiting list",
        },
        { status: 400 }
      );
    }

    // Send promotion email
    const emailResult = await sendPromotionEmail(
      user.email,
      user.full_name,
      user.confirmation_code
    );

    if (!emailResult.success) {
      console.error("Email failed but continuing with promotion");
    }

    // Log the email
    if (emailResult.success) {
      const { error: logError } = await supabaseAdmin
        .from("email_logs")
        .insert({
          sent_to: user.email,
          type: "promotion",
          registration_id: user.id,
        });

      if (logError) {
        console.error("Error logging email:", logError);
      }

      // Increment email_sent_count
      await supabaseAdmin
        .from("registrations")
        .update({
          email_sent_count: (user.email_sent_count || 0) + 1,
        })
        .eq("id", user.id);
    }

    // Update user status to "confirmed"
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("registrations")
      .update({
        status: "confirmed",
        is_confirmed: true,
      })
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to confirm registration" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${user.full_name} has been promoted to confirmed and notified`,
      data: updated,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
