import type { Metadata } from "next";
import { i18n, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { PartnerPortal } from "@/components/partner-portal";

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
  return { title: t.partnerPage.title };
}

export default async function PartnerPage(
  props: {
    params: Promise<{ lang: string }>;
  }
) {
  const params = await props.params;
  const t = await getDictionary(params.lang);

  return (
    <main className="mx-auto max-w-3xl px-5 py-14">
      <PartnerPortal lang={params.lang} dict={t.partnerPage as Record<string, string>} />
    </main>
  );
}
