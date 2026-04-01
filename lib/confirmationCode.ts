import { supabaseAdmin } from "@/lib/db";

/**
 * Generate a confirmation code in the format: YMSLB##### or YSLB_W#####
 * For confirmed: YMSLB + 5 random digits
 * For waiting: YSLB_W + incremental number
 */
export async function generateConfirmationCode(isConfirmed: boolean): Promise<string> {
  if (isConfirmed) {
    // Confirmed users: YMSLB##### (random)
    const randomNumbers = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
    return `YMSLB${randomNumbers}`;
  } else {
    // Waiting list users: YSLB_W##### (incremental)
    try {
      const { data: waitingList, error: waitingListError } = await supabaseAdmin
        .from("registrations")
        .select("id")
        .not("waiting_list_turn", "is", null);

      if (waitingListError) {
        console.error("Error fetching waiting list:", waitingListError);
        throw waitingListError;
      }

      const waitingListTurn = (waitingList?.length || 0) + 1;
      const regNum = waitingListTurn.toString().padStart(5, "0");
      return `YSLB_W${regNum}`;
    } catch (error) {
      console.error("Error generating waiting list code:", error);
      // Fallback to random code
      const randomNumbers = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
      return `YSLB_W${randomNumbers}`;
    }
  }
}
