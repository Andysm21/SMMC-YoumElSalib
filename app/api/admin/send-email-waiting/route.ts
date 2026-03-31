import { NextRequest, NextResponse } from "next/server";
import { sendWaitingListNotificationEmail } from "@/lib/email";
import { supabaseAdmin } from "@/lib/db";

/**
 * POST /api/admin/send-email-waiting
 * Send waiting list notification email to a single user
 * Used for batch sending waiting list emails one at a time
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    const adminKey = request.headers.get("x-admin-key");
    const expectedKey = process.env.ADMIN_SECRET_KEY;

    if (!adminKey || !expectedKey || adminKey !== expectedKey) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { registrationId, email, name, confirmationCode } = body;

    if (!email || !name || !confirmationCode) {
      return NextResponse.json(
        { error: "Missing required fields: email, name, confirmationCode" },
        { status: 400 }
      );
    }

    // Send waiting list notification email
    const emailResult = await sendWaitingListNotificationEmail(
      email,
      name,
      confirmationCode
    );

    if (!emailResult.success) {
      console.error("Email send error:", emailResult.error);
      return NextResponse.json(
        { error: "Failed to send email", details: emailResult.error },
        { status: 500 }
      );
    }

    // Log the email
    const { error: logError } = await supabaseAdmin.from("email_logs").insert({
      sent_to: email,
      type: "waiting",
      registration_id: registrationId,
    });

    if (logError) {
      console.error("Error logging email:", logError);
    }

    // Increment email_sent_count - fetch current value first
    const { data: userData, error: fetchError } = await supabaseAdmin
      .from("registrations")
      .select("email_sent_count")
      .eq("id", registrationId)
      .single();

    if (fetchError) {
      console.error("Error fetching user email count:", fetchError);
    } else {
      const currentCount = userData?.email_sent_count || 0;
      const { error: updateError } = await supabaseAdmin
        .from("registrations")
        .update({ email_sent_count: currentCount + 1 })
        .eq("id", registrationId);

      if (updateError) {
        console.error("Error updating email_sent_count:", updateError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Waiting list email sent successfully",
        messageId: emailResult.messageId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send waiting email error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
