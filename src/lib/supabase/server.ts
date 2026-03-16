import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "./env";

export const createSupabaseServerClient = () => {
  if (typeof window !== "undefined") {
    return null;
  }

  if (!supabaseEnv.supabaseUrl || !supabaseEnv.supabasePublishableKey) {
    return null;
  }

  const key =
    supabaseEnv.supabaseServiceRoleKey || supabaseEnv.supabasePublishableKey;

  return createClient(supabaseEnv.supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      storageKey: "tbs-server-auth",
    },
  });
};
