import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { name, email, phone, church } = body;

    // Validate required fields
    if (!name || !email || !phone || !church) {
      return NextResponse.json(
        { error: "Name, email, phone, and church are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate phone number format: 01#########  (11 digits starting with 01)
    const phoneRegex = /^01\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: "Phone number must be in format 01#########" },
        { status: 400 }
      );
    }

    // Dynamically import to avoid build-time errors
    const { supabaseAdmin } = await import("@/lib/db");
    const { sendConfirmationEmail, sendWaitingListEmail } = await import("@/lib/email");

    // Generate confirmation code
    let confirmationCode = '';
    let waitingListTurn: number | null = null;
    let isConfirmed = false;
    if (church === 'st-mary-maraashly') {
      // Normal registration code
      const randomNumbers = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
      confirmationCode = `YMSLB${randomNumbers}`;
      isConfirmed = true; // Default confirmed for St Mary Maraashly
    } else {
      // Waiting list code: YLS_W#####
      const { data: waitingList, error: waitingListError } = await supabaseAdmin
        .from('registrations')
        .select('id')
        .eq('church_name', church)
        .order('created_at', { ascending: true });
      waitingListTurn = (waitingList?.length || 0) + 1;
      const randomNumbers = waitingListTurn.toString().padStart(5, '0');
      confirmationCode = `YSLB_W${randomNumbers}`;
    }

    // Insert registration into database (using admin client to bypass RLS)
    const { data: insertedData, error: insertError } = await supabaseAdmin
      .from("registrations")
      .insert([
        {
          full_name: name,
          email: email,
          phone: phone,
          church_name: church,
          confirmation_code: confirmationCode,
          is_confirmed: isConfirmed,
          email_sent: false,
          waiting_list_turn: waitingListTurn,
        },
      ])
      .select();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to save registration to database" },
        { status: 500 }
      );
    }

  // Send confirmation email if church matches "St Mary Maraashly Church", otherwise send waiting list email
  if (church === "st-mary-maraashly") {
      try {
        // Send email using the premium email service
        const emailResult = await sendConfirmationEmail(email, name, confirmationCode);

        // If email sent successfully, update the database
        if (emailResult.success) {
          await supabaseAdmin
            .from("registrations")
            .update({ email_sent: true })
            .eq("email", email)
            .eq("confirmation_code", confirmationCode);

          console.log(`✅ Confirmation email sent and tracked for ${email}`);
        } else {
          console.warn(`⚠️ Confirmation email failed to send for ${email}, but registration saved`);
          // Continue - don't fail registration if email fails
        }
      } catch (emailError) {
        console.error("Confirmation email sending error:", emailError);
        // Continue without failing the registration if email fails
      }
    } else {
      // Send waiting list email for other churches
      try {
  const emailResult = await sendWaitingListEmail(email, name, confirmationCode);

        // If email sent successfully, update the database
        if (emailResult.success) {
          await supabaseAdmin
            .from("registrations")
            .update({ email_sent: true })
            .eq("email", email)
            .eq("confirmation_code", confirmationCode);

          console.log(`✅ Waiting list email sent and tracked for ${email}`);
        } else {
          console.warn(`⚠️ Waiting list email failed to send for ${email}, but registration saved`);
          // Continue - don't fail registration if email fails
        }
      } catch (emailError) {
        console.error("Waiting list email sending error:", emailError);
        // Continue without failing the registration if email fails
      }
    }

    return NextResponse.json(
      { success: true, message: "Registration saved successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
