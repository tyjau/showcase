import type { Metadata } from "next";
import { i18n, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { RedirectTo } from "@/components/redirect-to";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const t = await getDictionary(params.lang);
  // Folded into the help center; keep the canonical on /help.
  return { title: t.helpPage.eyebrow, alternates: { canonical: `/${params.lang}/help` } };
}

// /resources is folded into /help (the knowledge base). Redirect for any old
// links/bookmarks; the nav + footer now point straight to /help.
export default async function ResourcesPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const t = await getDictionary(params.lang);
  return <RedirectTo href={`/${params.lang}/help`} label={t.helpPage.eyebrow} />;
}
