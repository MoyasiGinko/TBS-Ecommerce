import { createSupabaseBrowserClient } from "./client";
import { UserProfile } from "@/types/user";

export const setRoleCookie = (role: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `app_role=${role}; Path=/; Max-Age=2592000; SameSite=Lax`;
};

export const clearRoleCookie = () => {
  if (typeof document === "undefined") return;
  document.cookie = "app_role=; Path=/; Max-Age=0; SameSite=Lax";
};

export const signUpWithEmail = async (input: {
  fullName: string;
  email: string;
  password: string;
}) => {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) {
    return {
      error: new Error(
        "Supabase is not configured. Add environment variables.",
      ),
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName,
      },
    },
  });

  if (error) {
    return { error };
  }

  // Best-effort insert; in production prefer DB trigger for guaranteed profile creation.
  if (data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      email: input.email,
      full_name: input.fullName,
      role: "customer",
    });
  }

  return { data };
};

export const signInWithEmail = async (email: string, password: string) => {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) {
    return {
      error: new Error(
        "Supabase is not configured. Add environment variables.",
      ),
    };
  }

  return supabase.auth.signInWithPassword({ email, password });
};

export const signOutUser = async () => {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;
  await supabase.auth.signOut();
  clearRoleCookie();
};

export const getCurrentProfile = async (): Promise<UserProfile | null> => {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,role,created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error(
      "[getCurrentProfile] profiles query error:",
      error.message,
      "| code:",
      error.code,
    );
  }

  if (!data) {
    return {
      id: user.id,
      email: user.email || "",
      fullName: (user.user_metadata?.full_name as string) || "",
      role: "customer",
    };
  }

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    role: data.role,
    createdAt: data.created_at,
  };
};
