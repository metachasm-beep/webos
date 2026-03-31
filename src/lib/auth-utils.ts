import { supabase } from "./supabase";

export async function getUserTier(email: string | null | undefined): Promise<"free" | "pro"> {
  if (!email) return "free";
  
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("tier")
      .eq("email", email)
      .single();

    if (error || !data) return "free";
    return data.tier as "free" | "pro";
  } catch (err) {
    console.error("Registry Tier Fetch Failure:", err);
    return "free";
  }
}
