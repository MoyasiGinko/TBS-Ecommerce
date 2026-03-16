import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "./env";

type SupabaseBrowserClient = ReturnType<typeof createClient>;

declare global {
  var __tbsSupabaseBrowserClient: SupabaseBrowserClient | null | undefined;
}

export const createSupabaseBrowserClient = () => {
  if (!supabaseEnv.supabaseUrl || !supabaseEnv.supabasePublishableKey) {
    return null;
  }

  if (typeof window === "undefined") {
    return createClient(
      supabaseEnv.supabaseUrl,
      supabaseEnv.supabasePublishableKey,
    );
  }

  if (!globalThis.__tbsSupabaseBrowserClient) {
    globalThis.__tbsSupabaseBrowserClient = createClient(
      supabaseEnv.supabaseUrl,
      supabaseEnv.supabasePublishableKey,
    );
  }

  return globalThis.__tbsSupabaseBrowserClient;
};
