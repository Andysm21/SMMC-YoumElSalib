import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db";
import { sendWaitingListNotificationEmail, generateWaitingListHTML } from "@/lib/email";

/**
 * GET /api/admin/send-waiting-email
 * Preview: Show how many emails will be sent and preview content
 */
export async function GET(request: NextRequest) {
  try {
    // Get all TRUE waiting list users: waiting_list_turn is NOT null AND NOT is_confirmed
    const { data: waitingUsers, error: fetchError } = await supabaseAdmin
      .from("registrations")
      .select("id, full_name, email, confirmation_code, phone, church_name")
      .not("waiting_list_turn", "is", null)
      .eq("is_confirmed", false);

    if (fetchError) {
      console.error("Error fetching waiting list:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch waiting list users" },
        { status: 500 }
      );
    }

    if (!waitingUsers || waitingUsers.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        users: [],
        message: "No waiting list users to notify",
        emailPreview: null,
      });
    }

    // Generate a sample email using the first user as template
    const firstUser = waitingUsers[0];
    const sampleEmailHtml = generateWaitingListHTML(firstUser.full_name, firstUser.confirmation_code);

    // Return preview info
    return NextResponse.json({
      success: true,
      count: waitingUsers.length,
      users: waitingUsers.map((user) => ({
        id: user.id,
        name: user.full_name,
        email: user.email,
        church: user.church_name,
        confirmationCode: user.confirmation_code,
      })),
      message: `Will send ${waitingUsers.length} waiting list notification email${waitingUsers.length !== 1 ? "s" : ""}`,
      emailSubject: "Youm El Salib - Waiting List Update | تحديث قائمة الانتظار",
      emailPreview: sampleEmailHtml,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/send-waiting-email
 * Send notification emails to all TRUE waiting list users (waiting_list_turn is NOT null AND NOT is_confirmed)
 * Returns: { success: boolean, sentCount: number, failed: number, message: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Get all TRUE waiting list users: waiting_list_turn is NOT null AND NOT is_confirmed
    const { data: waitingUsers, error: fetchError } = await supabaseAdmin
      .from("registrations")
      .select("id, full_name, email, confirmation_code, email_sent_count")
      .not("waiting_list_turn", "is", null)
      .eq("is_confirmed", false);

    if (fetchError) {
      console.error("Error fetching waiting list:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch waiting list users" },
        { status: 500 }
      );
    }

    if (!waitingUsers || waitingUsers.length === 0) {
      return NextResponse.json({
        success: true,
        sentCount: 0,
        failedCount: 0,
        message: "No waiting list users to notify",
      });
    }

    let sentCount = 0;
    let failedCount = 0;
    const failedEmails: string[] = [];

    // Send email to each waiting list user
    for (const user of waitingUsers) {
      try {
        // Send the email
        const emailResult = await sendWaitingListNotificationEmail(
          user.email,
          user.full_name,
          user.confirmation_code
        );

        if (!emailResult.success) {
          failedCount++;
          failedEmails.push(user.email);
          continue;
        }

        // Log the email
        const { error: logError } = await supabaseAdmin.from("email_logs").insert({
          sent_to: user.email,
          type: "waiting",
          registration_id: user.id,
        });

        if (logError) {
          console.error("Error logging email:", logError);
        }

        // Increment email_sent_count
        const { error: updateError } = await supabaseAdmin
          .from("registrations")
          .update({
            email_sent_count: (user.email_sent_count || 0) + 1,
          })
          .eq("id", user.id);

        if (updateError) {
          console.error("Error updating email_sent_count:", updateError);
        }

        sentCount++;
      } catch (error) {
        console.error(`Error sending email to ${user.email}:`, error);
        failedCount++;
        failedEmails.push(user.email);
      }
    }

    return NextResponse.json({
      success: true,
      sentCount,
      failedCount,
      failedEmails: failedCount > 0 ? failedEmails : [],
      totalUsers: waitingUsers.length,
      message:
        failedCount === 0
          ? `Successfully sent ${sentCount} notification emails`
          : `Sent ${sentCount} emails, ${failedCount} failed`,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
