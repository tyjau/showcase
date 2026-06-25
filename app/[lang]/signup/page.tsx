import type { Metadata } from "next";
import Link from "next/link";
import { i18n, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { fetchCatalog, fetchCountries } from "@/lib/catalog";
import { ParallaxTriangles } from "@/components/parallax-triangles";
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
  const [catalog, countries] = await Promise.all([fetchCatalog(), fetchCountries()]);

  const s = t.signupPage;
  return (
    <main>
      {/* HERO band */}
      <section className="relative overflow-hidden bg-hero-bg text-hero-fg">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(820px_360px_at_80%_-12%,rgba(15,158,213,0.20),transparent_70%)]" />
        <ParallaxTriangles />
        <div className="relative mx-auto max-w-3xl px-5 py-14 text-center">
          <span className="text-sm font-bold uppercase tracking-wide text-sky-soft">{s.heroEyebrow}</span>
          <h1 className="mx-auto mt-3 max-w-xl text-[38px] font-extrabold leading-[1.1] tracking-tight text-balance text-white">
            {s.heroTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[17px] leading-relaxed text-hero-fg-muted">{s.heroLead}</p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-5 py-12">
        <SignupWizard
          catalog={catalog}
          countries={countries}
          lang={params.lang}
          dict={t.signupPage}
          legal={t.legalPage.docs}
        />
        {/* Login toggle — the onboarding screen offers a path back to sign-in. */}
        <p className="mt-8 text-center text-sm text-muted">
          {s.haveAccount}{" "}
          <Link href={`/${params.lang}/login`} className="font-semibold text-sky-text hover:underline">
            {s.signin}
          </Link>
        </p>
      </div>
    </main>
  );
}
