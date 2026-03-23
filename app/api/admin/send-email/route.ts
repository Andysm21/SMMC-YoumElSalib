import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Check admin authorization (you should add proper authentication here)
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

    // Dynamically import to avoid build-time errors
    const { sendConfirmationEmail } = await import("@/lib/email");
    const { supabaseAdmin } = await import("@/lib/db");

    // Send email using Gmail SMTP
    const emailResult = await sendConfirmationEmail(email, name, confirmationCode);

    if (!emailResult.success) {
      console.error("Email send error:", emailResult.error);
      return NextResponse.json(
        { error: "Failed to send email", details: emailResult.error },
        { status: 500 }
      );
    }

    // Update email_sent status in database
    if (registrationId) {
      await supabaseAdmin
        .from("registrations")
        .update({ email_sent: true })
        .eq("id", registrationId);
    }

    return NextResponse.json(
      { success: true, message: "Email sent successfully", messageId: emailResult.messageId },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send email error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
