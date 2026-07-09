import Link from "next/link";
import { Check } from "lucide-react";

// Full-bleed closing CTA band. The gradient spans the whole row (edge to edge);
// only the text content is width-constrained. Shared by the home, module and
// enterprise pages so the end-of-page CTA is consistent everywhere.
export function CtaBand({
  href,
  title,
  sub,
  button,
  reassurances = [],
  location = "cta_band",
}: {
  href: string;
  title: string;
  sub?: string;
  button: string;
  reassurances?: string[];
  location?: string;
}) {
  return (
    <section className="bg-gradient-to-r from-sky to-accent px-5 py-16 text-center text-white">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
        {sub && <p className="mx-auto mt-3 max-w-lg text-[#eaf6fd]">{sub}</p>}
        <Link
          href={href}
          data-cta="start_trial"
          data-cta-location={location}
          className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-[#156082] transition-transform hover:scale-[1.02]"
        >
          {button}
        </Link>
        {reassurances.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#eaf6fd]">
            {reassurances.map((r) => (
              <span key={r} className="inline-flex items-center gap-1.5">
                <Check size={15} /> {r}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
