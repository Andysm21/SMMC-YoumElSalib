import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db";

/**
 * POST /api/admin/checkin
 * Mark a registration as attended
 * Body:
 * - confirmation_code OR id: identifier to find the registration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { confirmation_code, id } = body;

    if (!confirmation_code && !id) {
      return NextResponse.json(
        { error: "Either confirmation_code or id is required" },
        { status: 400 }
      );
    }

    // Find the registration
    let query = supabaseAdmin.from("registrations").select("*").eq("is_deleted", false);

    if (id) {
      query = query.eq("id", id);
    } else if (confirmation_code) {
      query = query.eq("confirmation_code", confirmation_code);
    }

    const { data: registrations, error: fetchError } = await query.single();

    if (fetchError || !registrations) {
      console.error("Fetch error:", fetchError);
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    // Validate that the person is confirmed before allowing check-in
    if (!registrations.is_confirmed) {
      return NextResponse.json(
        { error: "This person is on the waiting list and cannot check in. They must be confirmed first." },
        { status: 403 }
      );
    }

    // Check if already attended
    if (registrations.attended) {
      return NextResponse.json(
        { 
          error: "Already checked in",
          message: `${registrations.full_name} was already checked in at ${new Date(registrations.attended_at).toLocaleTimeString()}`,
          data: registrations,
        },
        { status: 409 }
      );
    }

    // Update the registration to mark as attended - ONLY if attended is false
    const now = new Date().toISOString();
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("registrations")
      .update({
        attended: true,
        attended_at: now,
      })
      .eq("id", registrations.id)
      .eq("attended", false)  // CRITICAL: Only update if not already attended
      .select()
      .single();

    if (updateError) {
      // Check if no rows were updated (already attended)
      if (updateError.code === "PGRST116") {
        return NextResponse.json(
          { 
            error: "Already checked in",
            message: `${registrations.full_name} was already checked in`,
            data: registrations,
          },
          { status: 409 }
        );
      }
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update attendance" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${updated.full_name} checked in successfully`,
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
