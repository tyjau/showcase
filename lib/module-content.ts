// Per-module marketing content (capabilities + use cases) that deepens the
// /features/[module] pages beyond the catalog's headline/tagline/description.
// Sourced from the real skyrh-front HR app (navigation tree + feature areas),
// keyed by the catalog module code. Missing codes simply render no extra
// sections. FR/EN; falls back to EN.

type ModuleContentText = { capabilities: string[]; useCases: string[] };
type ModuleContent = { fr: ModuleContentText; en: ModuleContentText };

const CONTENT: Record<string, ModuleContent> = {
  MGMT00: {
    fr: {
      capabilities: [
        "Annuaire et fiches individuelles des employés",
        "Documents et pièces du dossier",
        "Organisation par groupes et classifications",
        "Contrats et avenants",
        "Discipline : plaintes, conseils, sanctions",
        "Ordres de mission et patrimoine affecté (logements, véhicules)",
      ],
      useCases: [
        "Centraliser toutes les données d'un salarié dans un dossier unique et traçable.",
        "Gérer disciplines, missions et affectations d'actifs avec un historique complet.",
      ],
    },
    en: {
      capabilities: [
        "Employee directory and individual records",
        "Documents and personnel files",
        "Grouping by department and classification",
        "Contracts and amendments",
        "Discipline: complaints, councils, sanctions",
        "Mission orders and assigned assets (housing, vehicles)",
      ],
      useCases: [
        "Centralize every employee's data in one auditable file.",
        "Run discipline, missions and asset assignments with full history.",
      ],
    },
  },

  ATT00: {
    fr: {
      capabilities: [
        "Fiches de présence et saisie du temps",
        "Suivi des absences",
        "Calendrier de congés personnel et d'équipe",
        "Campagnes de congés annuelles",
        "Plannings de travail",
        "Jours fériés et règles d'absence paramétrables",
      ],
      useCases: [
        "Les employés posent leurs congés, les managers valident et voient la disponibilité de l'équipe.",
        "Lancer une campagne de congés et suivre l'acquisition et la consommation des soldes.",
      ],
    },
    en: {
      capabilities: [
        "Time cards and time entry",
        "Absence tracking",
        "Personal and team leave calendars",
        "Annual leave campaigns",
        "Work schedules",
        "Configurable public holidays and absence rules",
      ],
      useCases: [
        "Employees request leave; managers approve and see team availability at a glance.",
        "Launch a leave campaign and track accrual and balance consumption.",
      ],
    },
  },

  "EMPL-SELF00": {
    fr: {
      capabilities: [
        "Profil et informations personnelles",
        "Bulletins de paie en ligne",
        "Demandes de congés et avis d'absence",
        "Demandes d'avances et de remboursements",
        "Notes de frais",
        "Formations, carrière et documents personnels",
      ],
      useCases: [
        "Chaque employé gère ses congés, accède à ses bulletins et soumet ses demandes en autonomie.",
        "Réduire les sollicitations RH en déportant les démarches courantes vers le salarié.",
      ],
    },
    en: {
      capabilities: [
        "Profile and personal information",
        "Online payslips",
        "Leave requests and absence notices",
        "Advance and reimbursement requests",
        "Expense claims",
        "Training, career and personal documents",
      ],
      useCases: [
        "Every employee manages leave, gets payslips and submits requests on their own.",
        "Cut HR back-and-forth by moving routine tasks to employees.",
      ],
    },
  },

  "MGMT-ONB00": {
    fr: {
      capabilities: [
        "Pré-boarding self-service par lien magique (sans compte)",
        "Campagnes et cohortes d'intégration",
        "Modèles et check-lists réutilisables",
        "Processus d'intégration multi-étapes",
        "Périodes d'essai",
        "Entretiens de départ et fins de contrat",
      ],
      useCases: [
        "Faire compléter le dossier d'un nouvel arrivant avant son arrivée, puis provisionner son compte.",
        "Suivre la complétude d'intégration de chaque cohorte et relancer automatiquement.",
      ],
    },
    en: {
      capabilities: [
        "Account-less self-service pre-boarding via magic link",
        "Onboarding campaigns and cohorts",
        "Reusable templates and checklists",
        "Multi-step integration workflows",
        "Trial periods",
        "Exit interviews and contract endings",
      ],
      useCases: [
        "Have a new hire complete their file before day one, then provision their account.",
        "Track each cohort's onboarding completeness and send automatic reminders.",
      ],
    },
  },

  "WAGE-GEN00": {
    fr: {
      capabilities: [
        "Sessions de paie mensuelles et bulletins",
        "Éléments, variables et formules de paie",
        "Conventions collectives et grilles salariales",
        "Retenues, avances et notes de frais",
        "Export comptable (SYSCOHADA) et virements bancaires locaux",
        "Conformité multi-pays paramétrable",
      ],
      useCases: [
        "Lancer la paie du mois avec tous ses éléments variables et éditer les bulletins.",
        "Produire l'écriture comptable et l'ordre de virement à partir de la session de paie.",
      ],
    },
    en: {
      capabilities: [
        "Monthly payroll runs and payslips",
        "Payroll elements, variables and formulas",
        "Collective agreements and salary scales",
        "Deductions, advances and expense notes",
        "Accounting export (SYSCOHADA) and local bank transfers",
        "Configurable multi-country compliance",
      ],
      useCases: [
        "Run the month's payroll with all variable inputs and issue payslips.",
        "Generate the accounting entry and bank-transfer order straight from the run.",
      ],
    },
  },

  RECR00: {
    fr: {
      capabilities: [
        "Tableau de bord du recrutement",
        "Besoins et demandes de recrutement",
        "Offres d'emploi",
        "Entretiens et évaluations des candidats",
        "Calendrier de recrutement",
        "CVthèque et gestion des stagiaires",
      ],
      useCases: [
        "Ouvrir un poste, publier l'offre et suivre les candidats jusqu'à l'embauche.",
        "Organiser et suivre les sessions de stage et la banque de CV.",
      ],
    },
    en: {
      capabilities: [
        "Recruitment dashboard",
        "Hiring needs and requests",
        "Job offers",
        "Interviews and candidate evaluations",
        "Recruitment calendar",
        "CV bank and intern management",
      ],
      useCases: [
        "Open a position, publish the offer and track candidates through to hire.",
        "Organize and track internship sessions and the CV bank.",
      ],
    },
  },

  CARE00: {
    fr: {
      capabilities: [
        "Campagnes d'évaluation et questionnaires",
        "Évaluations de performance et administratives",
        "Objectifs et plans de développement",
        "Tableau d'avancement et ancienneté",
        "Organigramme et plans de succession",
        "Suivi des départs en retraite",
      ],
      useCases: [
        "Lancer une campagne annuelle d'évaluation et suivre les objectifs de chacun.",
        "Visualiser l'organigramme et préparer la succession des postes clés.",
      ],
    },
    en: {
      capabilities: [
        "Evaluation campaigns and questionnaires",
        "Performance and administrative appraisals",
        "Goals and development plans",
        "Advancement and seniority table",
        "Org chart and succession plans",
        "Retirement tracking",
      ],
      useCases: [
        "Launch an annual review cycle and track everyone's goals.",
        "Visualize the org chart and plan succession for key roles.",
      ],
    },
  },

  TRAIN00: {
    fr: {
      capabilities: [
        "Recueil des besoins de formation",
        "Demandes et plan de formation annuel",
        "Catalogue de modules de formation",
        "Sessions : planification, inscriptions, présence",
        "Suivi de réalisation et calendrier",
        "Questionnaires d'évaluation",
      ],
      useCases: [
        "Recueillir les besoins, bâtir le plan annuel et publier le catalogue.",
        "Gérer les inscriptions, la présence et l'évaluation des sessions.",
      ],
    },
    en: {
      capabilities: [
        "Training-needs collection",
        "Requests and annual training plan",
        "Training-module catalog",
        "Sessions: scheduling, enrollment, attendance",
        "Completion tracking and calendar",
        "Evaluation questionnaires",
      ],
      useCases: [
        "Collect needs, build the annual plan and publish the catalog.",
        "Manage enrollment, attendance and session evaluations.",
      ],
    },
  },

  "CARE-COMP-FW00": {
    fr: {
      capabilities: [
        "Référentiels et catalogue de compétences",
        "Compétences requises par poste",
        "Évaluation des compétences des employés",
        "Évaluations 360° et auto-évaluations",
        "Plans de développement et de succession",
        "Certifications et historique des compétences",
      ],
      useCases: [
        "Cartographier les compétences requises et mesurer les écarts par poste.",
        "Bâtir des plans de développement et sécuriser les successions.",
      ],
    },
    en: {
      capabilities: [
        "Competency frameworks and catalog",
        "Required competencies per position",
        "Employee competency assessment",
        "360° and self-evaluations",
        "Development and succession plans",
        "Certifications and competency history",
      ],
      useCases: [
        "Map required competencies and measure gaps by role.",
        "Build development plans and secure successions.",
      ],
    },
  },

  SOC00: {
    fr: {
      capabilities: [
        "Immatriculations et prestations sociales",
        "Adhésions et catégories d'assurance santé",
        "Bons de prise en charge et couverture",
        "Transmission des décomptes aux assureurs",
        "Suivi de la consommation santé",
        "Suivi médical : dossiers, campagnes, vaccinations",
      ],
      useCases: [
        "Gérer les immatriculations sociales et les prestations des employés.",
        "Piloter les adhésions santé, les remboursements et la consommation.",
      ],
    },
    en: {
      capabilities: [
        "Social-security registrations and benefits",
        "Health-insurance enrollment and categories",
        "Care vouchers and coverage",
        "Claims submission to insurers",
        "Healthcare consumption tracking",
        "Medical follow-up: records, campaigns, vaccinations",
      ],
      useCases: [
        "Manage social registrations and employee benefits.",
        "Drive health enrollment, reimbursements and consumption.",
      ],
    },
  },

  "SOC-SST-INC00": {
    fr: {
      capabilities: [
        "Incidents et accidents du travail",
        "Évaluation des risques et actions préventives",
        "Équipements de protection (EPI)",
        "Visites médicales professionnelles",
        "Audits SST et comité de sécurité",
        "Formations sécurité et suivi des expositions",
      ],
      useCases: [
        "Déclarer les incidents et piloter les actions correctives.",
        "Évaluer les risques, suivre les EPI et les visites médicales obligatoires.",
      ],
    },
    en: {
      capabilities: [
        "Workplace incidents and accidents",
        "Risk assessments and preventive actions",
        "Personal protective equipment (PPE)",
        "Occupational medical visits",
        "HSE audits and safety committee",
        "Safety training and exposure tracking",
      ],
      useCases: [
        "Report incidents and drive corrective actions.",
        "Assess risks, track PPE and mandatory medical visits.",
      ],
    },
  },
};

export function moduleContent(
  code: string,
  lang: string,
): ModuleContentText | null {
  const c = CONTENT[code];
  if (!c) return null;
  return (c as Record<string, ModuleContentText>)[lang] ?? c.en;
}
