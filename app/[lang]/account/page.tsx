import type { Metadata } from "next";
import { i18n, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { fetchCatalog, moduleText } from "@/lib/catalog";
import { AccountPortal } from "@/components/account-portal";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const t = await getDictionary(params.lang);
  return { title: t.accountPage.title };
}

export default async function AccountPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const t = await getDictionary(params.lang);

  // Add-on modules (staged in the "Offre & abonnement" tab). Fetched server-side (the
  // catalogue key isn't exposed to the browser); resilient to a catalogue outage.
  let addons: { code: string; label: string; prices: { currency: string; cycle: string; amount: number }[] }[] = [];
  try {
    const catalog = await fetchCatalog();
    addons = catalog.modules
      .filter((m) => m.isAddon)
      .map((m) => ({ code: m.code, label: moduleText(m, params.lang).headline, prices: m.prices }));
  } catch {
    /* catalogue unreachable → no add-ons offered */
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-14">
      <AccountPortal
        lang={params.lang}
        dict={t.accountPage as Record<string, string>}
        addons={addons}
      />
    </main>
  );
}
