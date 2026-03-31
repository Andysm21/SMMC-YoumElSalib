import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db";
import { sendCancellationEmail } from "@/lib/email";

/**
 * POST /api/admin/cancel
 * Cancel a user's registration and move them to waiting list
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
      .single();

    if (fetchError || !user) {
      console.error("Fetch error:", fetchError);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Send cancellation email
    const emailResult = await sendCancellationEmail(user.email, user.full_name);

    if (!emailResult.success) {
      console.error("Email failed but continuing with cancellation");
    }

    // Log the email
    if (emailResult.success) {
      const { error: logError } = await supabaseAdmin
        .from("email_logs")
        .insert({
          sent_to: user.email,
          type: "cancel",
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

    // Update user status to "cancelled"
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("registrations")
      .update({
        status: "cancelled",
      })
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to cancel registration" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${user.full_name}'s registration has been cancelled`,
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
