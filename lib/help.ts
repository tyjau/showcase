// Help center (knowledge base) articles. MVP self-service support content,
// FR/EN, grouped by category. The "modules" category is served by the deepened
// /features/[module] pages, not by articles here. Replace/extend freely.

export type HelpArticleText = { title: string; sections: { h: string; p: string }[] };
export type HelpArticle = {
  slug: string;
  category: HelpCategory;
  fr: HelpArticleText;
  en: HelpArticleText;
};

export const HELP_CATEGORIES = ["getting-started", "billing", "security"] as const;
export type HelpCategory = (typeof HELP_CATEGORIES)[number];

const ARTICLES: HelpArticle[] = [
  {
    slug: "premiers-pas",
    category: "getting-started",
    fr: {
      title: "Premiers pas avec SkyRH",
      sections: [
        { h: "Créer votre espace", p: "Inscrivez-vous depuis la page d'inscription : choisissez vos modules et votre plan, confirmez votre e-mail, puis accédez à votre espace RH." },
        { h: "Inviter votre équipe", p: "Depuis l'administration, créez les comptes de vos gestionnaires et attribuez-leur des droits par module. Chaque accès est nominatif." },
        { h: "Importer vos employés", p: "Utilisez l'import de données pour charger vos employés en masse, ou créez-les un par un dans le dossier du personnel." },
        { h: "Lancer votre première paie", p: "Configurez les éléments de paie et la convention applicable, puis lancez une session de paie : bulletins, écriture comptable et ordre de virement en découlent." },
      ],
    },
    en: {
      title: "Getting started with SkyRH",
      sections: [
        { h: "Create your workspace", p: "Sign up from the signup page: pick your modules and plan, confirm your email, then open your HR workspace." },
        { h: "Invite your team", p: "From administration, create accounts for your HR managers and assign per-module rights. Every access is per-user." },
        { h: "Import your employees", p: "Use data import to load employees in bulk, or create them one by one in the personnel records." },
        { h: "Run your first payroll", p: "Set up payroll elements and the applicable agreement, then run a payroll session: payslips, the accounting entry and the bank-transfer order follow." },
      ],
    },
  },
  {
    slug: "factures-paiement",
    category: "billing",
    fr: {
      title: "Factures et paiement",
      sections: [
        { h: "Consulter et télécharger vos factures", p: "Dans votre espace client, l'onglet Factures liste toutes vos factures ; vous pouvez télécharger chacune au format PDF." },
        { h: "Régler une facture", p: "Une facture en souffrance affiche un bouton « Régler » : payez-la par carte en quelques secondes. Le règlement réactive immédiatement les modules suspendus." },
        { h: "Moyen de paiement", p: "Enregistrez une carte dans l'onglet Moyen de paiement pour automatiser les règlements ; aucune donnée de carte n'est stockée chez nous (via notre prestataire de paiement)." },
        { h: "Plan et devise", p: "La facturation est par employé actif, au prorata, dans la devise choisie. Contactez-nous pour faire évoluer votre plan." },
      ],
    },
    en: {
      title: "Invoices and payment",
      sections: [
        { h: "View and download your invoices", p: "In your client area, the Invoices tab lists all your invoices; you can download each one as a PDF." },
        { h: "Pay an invoice", p: "An outstanding invoice shows a “Pay” button: settle it by card in seconds. Payment immediately reactivates any suspended modules." },
        { h: "Payment method", p: "Save a card in the Payment method tab to automate payments; no card data is stored on our side (handled by our payment provider)." },
        { h: "Plan and currency", p: "Billing is per active employee, prorated, in your chosen currency. Contact us to change your plan." },
      ],
    },
  },
  {
    slug: "fermeture-compte",
    category: "billing",
    fr: {
      title: "Fermer ou suspendre votre compte",
      sections: [
        { h: "Demander la fermeture", p: "Depuis l'onglet Paramètres de votre espace, demandez la fermeture : elle prend effet en fin de mois et reste réversible jusque-là." },
        { h: "Vos données après la fermeture", p: "Vos données sont conservées pendant une période de rétention, puis effacées ou anonymisées conformément à notre politique de confidentialité." },
        { h: "Annuler la fermeture", p: "Tant que la fermeture n'a pas pris effet, vous pouvez l'annuler depuis le même écran." },
      ],
    },
    en: {
      title: "Close or suspend your account",
      sections: [
        { h: "Request closure", p: "From the Settings tab of your workspace, request closure: it takes effect at the end of the month and stays reversible until then." },
        { h: "Your data after closure", p: "Your data is kept for a retention period, then erased or anonymized in line with our privacy policy." },
        { h: "Cancel the closure", p: "As long as the closure has not taken effect, you can cancel it from the same screen." },
      ],
    },
  },
  {
    slug: "securite-acces",
    category: "security",
    fr: {
      title: "Sécurité & accès",
      sections: [
        { h: "Rôles et droits", p: "Les accès sont gouvernés par des rôles : chaque utilisateur ne voit que les modules et les actions qui lui sont attribués." },
        { h: "Protection des données", p: "Les flux sont chiffrés en transit, les données cloisonnées par société, et les actions sensibles tracées dans un journal d'audit." },
        { h: "Bonnes pratiques", p: "Utilisez des identifiants forts et propres à chaque personne ; révoquez les accès dès qu'un collaborateur quitte l'organisation." },
      ],
    },
    en: {
      title: "Security & access",
      sections: [
        { h: "Roles and rights", p: "Access is governed by roles: each user only sees the modules and actions assigned to them." },
        { h: "Data protection", p: "Traffic is encrypted in transit, data is isolated per company, and sensitive actions are recorded in an audit log." },
        { h: "Best practices", p: "Use strong, per-person credentials; revoke access as soon as someone leaves the organization." },
      ],
    },
  },
];

export function helpArticles(): HelpArticle[] {
  return ARTICLES;
}

export function helpArticle(slug: string): HelpArticle | null {
  return ARTICLES.find((a) => a.slug === slug) ?? null;
}

export function helpText(a: HelpArticle, lang: string): HelpArticleText {
  return (a as unknown as Record<string, HelpArticleText>)[lang] ?? a.en;
}

export function helpArticlesByCategory(): Record<HelpCategory, HelpArticle[]> {
  const out = { "getting-started": [], billing: [], security: [] } as Record<
    HelpCategory,
    HelpArticle[]
  >;
  for (const a of ARTICLES) out[a.category].push(a);
  return out;
}
