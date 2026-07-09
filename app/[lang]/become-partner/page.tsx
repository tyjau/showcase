import type { Metadata } from "next";
import { i18n, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { BecomePartner } from "@/components/become-partner";
import { buildAlternates } from "@/lib/seo";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export async function generateMetadata(
  props: {
    params: Promise<{ lang: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  return {
    title: t.becomePartnerPage.title,
    description: t.becomePartnerPage.lead,
    alternates: buildAlternates(params.lang, "/become-partner"),
  };
}

export default async function BecomePartnerPage(
  props: {
    params: Promise<{ lang: string }>;
  }
) {
  const params = await props.params;
  const t = await getDictionary(params.lang);

  return (
    <main className="mx-auto max-w-3xl px-5 py-14">
      <BecomePartner
        lang={params.lang}
        dict={t.becomePartnerPage as Record<string, string>}
      />
    </main>
  );
}
