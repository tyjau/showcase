import type { Metadata } from "next";
import { i18n, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { LoginWorkspace } from "@/components/login-workspace";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const t = await getDictionary(params.lang);
  return { title: t.loginPage.title };
}

export default async function LoginPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const t = await getDictionary(params.lang);

  return (
    <main className="mx-auto max-w-md px-5 py-14">
      <LoginWorkspace
        lang={params.lang}
        dict={t.loginPage as Record<string, string>}
      />
    </main>
  );
}
