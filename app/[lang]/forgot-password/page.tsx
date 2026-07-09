import type { Metadata } from "next";
import { i18n } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { NOINDEX } from "@/lib/seo";
import { ForgotPassword } from "@/components/forgot-password";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export async function generateMetadata(props: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  return { title: t.forgotPasswordPage.title, robots: NOINDEX };
}

export default async function ForgotPasswordPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const params = await props.params;
  const t = await getDictionary(params.lang);

  return (
    <main className="mx-auto max-w-md px-5 py-14">
      <ForgotPassword lang={params.lang} dict={t.forgotPasswordPage as Record<string, string>} />
    </main>
  );
}
