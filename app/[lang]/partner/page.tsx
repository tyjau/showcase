import type { Metadata } from "next";
import { i18n } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { NOINDEX } from "@/lib/seo";
import { ClientRedirect } from "@/components/client-redirect";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  return { title: t.partnerPage.title, robots: NOINDEX };
}

// Deprecated: the partner experience now lives inside the account (Parrainage tab) — partner
// is a capability of an account, not a separate portal/session. Redirect there.
export default async function PartnerPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  return (
    <main className="mx-auto max-w-3xl px-5 py-14">
      <ClientRedirect to={`/${params.lang}/account#referrals`} label={t.accountPage.tabReferrals as string} />
    </main>
  );
}
