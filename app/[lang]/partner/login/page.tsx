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
  return { title: t.partnerLoginPage.title, robots: NOINDEX };
}

// Deprecated: partners now sign in via the regular account login and manage their referral
// program from the account (Parrainage tab). Redirect to the standard login.
export default async function PartnerLoginPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  return (
    <main className="mx-auto max-w-md px-5 py-14">
      <ClientRedirect to={`/${params.lang}/login`} label={t.loginPage.title as string} />
    </main>
  );
}
