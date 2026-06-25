import type { Metadata } from "next";
import { i18n, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { PortalLogin } from "@/components/portal-login";

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
  return { title: t.loginPage.title };
}

export default async function LoginPage(
  props: {
    params: Promise<{ lang: string }>;
  }
) {
  const params = await props.params;
  const t = await getDictionary(params.lang);

  return (
    <main className="mx-auto max-w-md px-5 py-14">
      <PortalLogin
        lang={params.lang}
        dict={t.loginPage as Record<string, string>}
      />
    </main>
  );
}
