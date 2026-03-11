import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "./env";

export const createSupabaseBrowserClient = () => {
  if (!supabaseEnv.supabaseUrl || !supabaseEnv.supabasePublishableKey) {
    return null;
  }

  return createClient(
    supabaseEnv.supabaseUrl,
    supabaseEnv.supabasePublishableKey,
  );
};
