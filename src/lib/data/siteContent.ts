import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export type SiteContentEntry = {
  id: number;
  key: string;
  title: string;
  content: Record<string, any>;
};

export const getSiteContentsClient = async (): Promise<SiteContentEntry[]> => {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("site_content")
    .select("id,key,title,content")
    .order("key", { ascending: true });

  if (error || !data) return [];
  return data as SiteContentEntry[];
};

export const getSiteContentMapClient = async (): Promise<
  Record<string, Record<string, any>>
> => {
  const rows = await getSiteContentsClient();
  return rows.reduce(
    (acc, row) => {
      acc[row.key] = row.content || {};
      return acc;
    },
    {} as Record<string, Record<string, any>>,
  );
};
