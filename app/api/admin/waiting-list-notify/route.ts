import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const adminKey = request.headers.get("x-admin-key");
    const expectedKey = process.env.ADMIN_SECRET_KEY;
    if (!adminKey || !expectedKey || adminKey !== expectedKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { registrationId } = body;
    if (!registrationId) {
      return NextResponse.json({ error: "Missing registrationId" }, { status: 400 });
    }
    const { supabaseAdmin } = await import("@/lib/db");
    // Fetch registration
    const { data, error } = await supabaseAdmin
      .from("registrations")
      .select("*")
      .eq("id", registrationId)
      .single();
    if (error || !data) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }
    if (!data.waiting_list_turn) {
      return NextResponse.json({ error: "Not on waiting list" }, { status: 400 });
    }
    // Send email
    const { sendConfirmationEmail } = await import("@/lib/email");
    const emailResult = await sendConfirmationEmail(data.email, data.full_name, data.confirmation_code);
    if (!emailResult.success) {
      return NextResponse.json({ error: "Failed to send email", details: emailResult.error }, { status: 500 });
    }
    // Update DB: set is_confirmed true, email_sent true
    await supabaseAdmin
      .from("registrations")
      .update({ is_confirmed: true, email_sent: true })
      .eq("id", registrationId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 });
  }
}
