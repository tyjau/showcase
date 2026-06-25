import type { Metadata } from "next";
import Link from "next/link";
import { i18n, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { fetchCatalog } from "@/lib/catalog";
import { SignupWizard } from "@/components/signup-wizard";

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
  return { title: t.seo.pages.signup };
}

export default async function SignupPage(
  props: {
    params: Promise<{ lang: string }>;
  }
) {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  const catalog = await fetchCatalog();

  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="sr-only">{t.signupPage.title}</h1>
      <SignupWizard
        catalog={catalog}
        lang={params.lang}
        dict={t.signupPage}
        legal={t.legalPage.docs}
      />
      {/* Login toggle — the onboarding screen offers a path back to sign-in. */}
      <p className="mt-8 text-center text-sm text-muted">
        {t.signupPage.haveAccount}{" "}
        <Link href={`/${params.lang}/login`} className="font-semibold text-sky-text hover:underline">
          {t.signupPage.signin}
        </Link>
      </p>
    </main>
  );
}
