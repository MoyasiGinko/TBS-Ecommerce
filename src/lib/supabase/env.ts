const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseEnv = {
  supabaseUrl,
  supabasePublishableKey,
  supabaseServiceRoleKey,
};

export const hasSupabaseClientEnv =
  Boolean(supabaseEnv.supabaseUrl) &&
  Boolean(supabaseEnv.supabasePublishableKey);

export const hasSupabaseServiceRoleEnv =
  hasSupabaseClientEnv && Boolean(supabaseEnv.supabaseServiceRoleKey);
