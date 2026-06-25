import type { Metadata } from "next";
import { i18n, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { SignupConfirm } from "@/components/signup-confirm";

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
  return { title: t.signupPage.confirm.title };
}

export default async function SignupConfirmPage(
  props: {
    params: Promise<{ lang: string }>;
  }
) {
  const params = await props.params;
  const t = await getDictionary(params.lang);

  return (
    <main className="mx-auto max-w-md px-5 py-14">
      <SignupConfirm
        lang={params.lang}
        dict={t.signupPage.confirm as Record<string, string>}
      />
    </main>
  );
}
