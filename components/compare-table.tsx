import { Check } from "lucide-react";

type Feature = { label: string; skyrh: string };

/**
 * Tableau comparatif SkyRH vs concurrent. La colonne SkyRH porte des valeurs factuelles (dictionnaire) ;
 * la colonne concurrente affiche « à vérifier » — aucune donnée concurrente n'est fabriquée (cf. la
 * bannière dev-only de la page). Server Component ; scroll horizontal isolé au conteneur sur mobile.
 */
export function CompareTable({
  features,
  featureCol,
  skyrhCol,
  competitorName,
  verify,
}: {
  features: Feature[];
  featureCol: string;
  skyrhCol: string;
  competitorName: string;
  verify: string;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line bg-mist text-left">
            <th scope="col" className="px-4 py-3 font-semibold text-heading">{featureCol}</th>
            <th scope="col" className="px-4 py-3 font-semibold text-sky-text">{skyrhCol}</th>
            <th scope="col" className="px-4 py-3 font-semibold text-muted">{competitorName}</th>
          </tr>
        </thead>
        <tbody>
          {features.map((f) => (
            <tr key={f.label} className="border-b border-line last:border-0">
              <th scope="row" className="px-4 py-3 text-left font-medium text-ink">{f.label}</th>
              <td className="px-4 py-3 text-ink">
                <span className="inline-flex items-center gap-1.5">
                  <Check size={15} className="flex-none text-ok-fg" /> {f.skyrh}
                </span>
              </td>
              <td className="px-4 py-3 text-muted">{verify}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
