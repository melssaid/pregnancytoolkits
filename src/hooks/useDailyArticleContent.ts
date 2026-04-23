import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DailyArticleContentRecord {
  slug: string;
  language: string;
  title_override: string | null;
  excerpt_override: string | null;
  intro_override: string | null;
  markdown_body: string;
  seo_description: string | null;
  reading_minutes: number | null;
  effective_date: string;
}

export const splitMarkdownIntoSections = (markdown: string) => {
  const normalized = markdown.replace(/\r/g, "").trim();
  if (!normalized) return [] as { heading: string; body: string }[];

  const blocks = normalized.split(/^##\s+/m);
  const sections: { heading: string; body: string }[] = [];

  const intro = blocks.shift()?.trim();
  if (intro) sections.push({ heading: "", body: intro });

  blocks.forEach((block) => {
    const [headingLine, ...rest] = block.split("\n");
    const heading = headingLine?.trim() ?? "";
    const body = rest.join("\n").trim();
    if (heading || body) sections.push({ heading, body });
  });

  return sections;
};

export function useDailyArticleContent(slug: string, language: string) {
  const normalizedLanguage = language?.split("-")[0] || "en";

  const query = useQuery({
    queryKey: ["daily-article-content", slug, normalizedLanguage],
    enabled: !!slug,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 6,
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("article_daily_content")
        .select("slug, language, title_override, excerpt_override, intro_override, markdown_body, seo_description, reading_minutes, effective_date")
        .eq("slug", slug)
        .eq("language", normalizedLanguage)
        .lte("effective_date", today)
        .eq("is_published", true)
        .order("effective_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return (data as DailyArticleContentRecord | null) ?? null;
    },
  });

  const sections = useMemo(() => splitMarkdownIntoSections(query.data?.markdown_body ?? ""), [query.data?.markdown_body]);

  return {
    ...query,
    sections,
  };
}