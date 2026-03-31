import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Missing Supabase configuration" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get total registrations
    const { count: totalRegistrations } = await supabase
      .from("registrations")
      .select("*", { count: "exact", head: true });

    // Get total emails sent
    const { count: totalEmailsSent } = await supabase
      .from("registrations")
      .select("*", { count: "exact", head: true })
      .eq("email_sent", true);

    // Get total confirmed
    const { count: totalConfirmed } = await supabase
      .from("registrations")
      .select("*", { count: "exact", head: true })
      .eq("is_confirmed", true);

    // Get total waiting list (TRUE waiting: waiting_list_turn != null AND is_confirmed = false)
    const { count: totalWaitingList } = await supabase
      .from("registrations")
      .select("*", { count: "exact", head: true })
      .not("waiting_list_turn", "is", null)
      .eq("is_confirmed", false);

    // Get total attended
    const { count: totalAttended } = await supabase
      .from("registrations")
      .select("*", { count: "exact", head: true })
      .eq("attended", true);

    // Get family member count
    const { count: familyMemberCount } = await supabase
      .from("registrations")
      .select("*", { count: "exact", head: true })
      .eq("role", "family-member");

    // Get khadem count
    const { count: khademCount } = await supabase
      .from("registrations")
      .select("*", { count: "exact", head: true })
      .eq("role", "khadem");

    // Get makhdoum count
    const { count: makhdoumCount } = await supabase
      .from("registrations")
      .select("*", { count: "exact", head: true })
      .eq("role", "makhdoum");

    // Get undefined count (both NULL and 'UNDEFINED' string)
    const { data: undefinedData } = await supabase
      .from("registrations")
      .select("id");
    
    const undefinedCount = undefinedData?.filter(
      (reg: any) => reg.role === null || reg.role === "UNDEFINED"
    ).length || 0;

    return NextResponse.json({
      totalRegistrations: totalRegistrations || 0,
      totalEmailsSent: totalEmailsSent || 0,
      totalConfirmed: totalConfirmed || 0,
      totalWaitingList: totalWaitingList || 0,
      totalAttended: totalAttended || 0,
      familyMemberCount: familyMemberCount || 0,
      khademCount: khademCount || 0,
      makhdoumCount: makhdoumCount || 0,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
