// Per-module marketing content (capabilities + use cases) that deepens the
// /features/[module] pages beyond the catalog's headline/tagline/description.
// Sourced from the real skyrh-front HR app (in-app guides, navigation tree,
// feature areas, statuses and workflows), keyed by the catalog module code.
// Missing codes simply render no extra sections. FR/EN; falls back to EN.

type ModuleContentText = { capabilities: string[]; useCases: string[] };
type ModuleContent = { fr: ModuleContentText; en: ModuleContentText };

const CONTENT: Record<string, ModuleContent> = {
  MGMT00: {
    fr: {
      capabilities: [
        "Fiche employé à 16+ onglets : état civil, origine, contacts, position (catégorie/classe/échelon), diplômes, personnes à charge",
        "Matricule unique et statut de cycle de vie (Actif, Inactif, Retraité, Renvoyé, Décédé, En attente)",
        "Onglet « Contrats de paie » embarqué : contrat actif, avenant (clôt l'ancien à J-1), historique",
        "7 types de contrat : CDI, CDD, stage professionnel, stage pré-emploi, base fixe + avantages, prestation, à la tâche",
        "Situation sociale (N° CNPS, DIPE) et bancaire (virement, chèque, espèce, carte)",
        "Recherche avancée : genre, groupe, région d'origine, handicap, curseurs âge & ancienneté",
        "Modules rattachés : ordres de mission, parc véhicules & logements, discipline (plaintes, sanctions)",
      ],
      useCases: [
        "Créer une fiche à l'embauche — matricule, état civil, contrat de paie et affiliation CNPS — en une seule transaction.",
        "Mettre à jour les coordonnées bancaires avant le cycle de paie, avec un historique traçable.",
        "Mener l'audit annuel du personnel avec un export filtré par direction et statut.",
      ],
    },
    en: {
      capabilities: [
        "16+ tab employee record: civil status, origin, contacts, position (category/class/step), diplomas, dependents",
        "Unique payroll ID and lifecycle status (Active, Inactive, Retired, Dismissed, Deceased, Pending)",
        "Embedded \"payroll contracts\" tab: active contract, amendment (closes the prior at D-1), full history",
        "7 contract types: permanent, fixed-term, internship, pre-employment, fixed + benefits, service, task-based",
        "Social data (CNPS / DIPE numbers) and banking (transfer, cheque, cash, card)",
        "Advanced search: gender, group, region of origin, disability, age & seniority sliders",
        "Linked modules: mission orders, vehicle & housing fleet, discipline (complaints, sanctions)",
      ],
      useCases: [
        "Create a record at hire — ID, civil status, payroll contract and CNPS enrollment — in one transaction.",
        "Update bank details before the payroll run, with a fully auditable history.",
        "Run the annual headcount audit with an export filtered by department and status.",
      ],
    },
  },

  ATT00: {
    fr: {
      capabilities: [
        "Demandes d'absence avec pièces jointes et workflow multi-niveaux (En attente → Acceptée → Approuvée → Validée)",
        "Congés annuels à 3 onglets : planification, demandes, suivi effectif (ancienneté, enfants, lieu de jouissance)",
        "Calendrier d'équipe « qui est où », filtré par direction, service ou employé",
        "Plannings de travail : horaires et pauses méridiennes par période de validité",
        "Pointages : à l'heure, en retard, absence justifiée ou non justifiée",
        "Campagnes de congés (brouillon, ouverte, clôturée) et soldes de tout compte",
        "Dashboard d'absentéisme par direction, genre et statut",
      ],
      useCases: [
        "Un manager valide les demandes en attente, avec notification automatique au salarié.",
        "La RH ouvre une campagne de congés annuelle et suit l'acquisition des soldes.",
        "Le gestionnaire calcule l'indemnité compensatrice de congés payés au départ.",
      ],
    },
    en: {
      capabilities: [
        "Absence requests with attachments and a multi-level workflow (Pending → Accepted → Approved → Validated)",
        "Annual leave across 3 tabs: planning, requests, actual tracking (seniority, children, place of leave)",
        "Team \"who's where\" calendar, filtered by department, service or employee",
        "Work schedules: hours and midday breaks per validity period",
        "Attendance: on time, late, justified or unjustified absence",
        "Leave campaigns (draft, open, closed) and final settlements",
        "Absenteeism dashboard by department, gender and status",
      ],
      useCases: [
        "A manager approves pending requests, with an automatic notification to the employee.",
        "HR opens an annual leave campaign and tracks balance accrual.",
        "Payroll computes the compensatory paid-leave indemnity on departure.",
      ],
    },
  },

  "EMPL-SELF00": {
    fr: {
      capabilities: [
        "Dashboard d'accueil avec actions rapides : congé, avance, note de frais, mission, incident SST",
        "Mes congés : solde global et par type, contrôle automatique du solde, vue calendrier, export",
        "Mes bulletins : consultation, PDF, et vérification d'intégrité (régénération + comparaison de hash)",
        "Mes avances : acompte sur salaire avec échéances, modifiable tant que la demande est en attente",
        "Notes de frais avec justificatifs : transport, restauration, hébergement, matériel",
        "Mes missions : soumettre un ordre, suivre 10 statuts, télécharger l'ordre de mission PDF",
        "Mon intégration : check-list d'onboarding, dépôt CNI/RIB ; portail à 16 onglets selon le plan",
      ],
      useCases: [
        "Un collaborateur pose un congé avec contrôle de solde automatique, sans passer par la RH.",
        "Télécharger un bulletin PDF et prouver son authenticité par la vérification d'intégrité.",
        "Soumettre une mission avec ses frais et son avance liés en quelques clics.",
      ],
    },
    en: {
      capabilities: [
        "Home dashboard with quick actions: leave, advance, expense claim, mission, HSE incident",
        "My leave: global and per-type balance, automatic balance check, calendar view, export",
        "My payslips: view, PDF, and integrity check (regeneration + hash comparison)",
        "My advances: salary advance with installments, editable while the request is pending",
        "Expense claims with receipts: transport, meals, lodging, equipment",
        "My missions: submit an order, track 10 statuses, download the mission order PDF",
        "My onboarding: checklist, ID/bank-details upload; 16-tab portal depending on the plan",
      ],
      useCases: [
        "An employee books leave with an automatic balance check, without going through HR.",
        "Download a payslip PDF and prove its authenticity via the integrity check.",
        "Submit a mission with its linked expenses and advance in a few clicks.",
      ],
    },
  },

  "MGMT-ONB00": {
    fr: {
      capabilities: [
        "Modèles d'intégration & de départ : étapes en glisser-déposer (responsable, délai en jours, obligatoire)",
        "Processus en cours : lancement par modèle + employé, statuts Non démarré / En cours / Terminé",
        "Indicateurs de tâche « En retard » / « Dans X jours » et barre de progression",
        "Périodes d'essai : durée, compteur de renouvellements, actions Renouveler / Valider / Mettre fin",
        "Entretiens de départ : démission, licenciement, retraite, fin de CDD, rupture conventionnelle",
        "Fins de contrat : 8 types, workflow En attente → Approuvé → Préavis → Solde de tout compte → Clôturé",
        "Calcul du solde de tout compte : indemnités de licenciement, préavis, congés ; bulletins par lot",
      ],
      useCases: [
        "Lancer un processus « Onboarding cadre » depuis un modèle, suivi par barre de progression.",
        "Suivre une période d'essai CDD avec alerte automatique avant l'échéance.",
        "Traiter une démission avec calcul automatique du solde de tout compte.",
      ],
    },
    en: {
      capabilities: [
        "Onboarding & offboarding templates: drag-and-drop steps (owner, delay in days, mandatory)",
        "Running processes: launch by template + employee, statuses Not started / In progress / Done",
        "Task indicators \"Overdue\" / \"In X days\" and a progress bar",
        "Trial periods: duration, renewal counter, Renew / Confirm / Terminate actions",
        "Exit interviews: resignation, dismissal, retirement, end of fixed-term, mutual termination",
        "Contract endings: 8 types, workflow Pending → Approved → Notice → Final settlement → Closed",
        "Final-settlement calculation: severance, notice and leave indemnities; batch payslips",
      ],
      useCases: [
        "Launch a \"manager onboarding\" process from a template, tracked by a progress bar.",
        "Track a fixed-term trial period with an automatic alert before the deadline.",
        "Process a resignation with an automatic final-settlement calculation.",
      ],
    },
  },

  "WAGE-GEN00": {
    fr: {
      capabilities: [
        "Sessions de paie à 8 statuts (Brouillon, Calcul, Calculée, Validée, Clôturée, Annulée, Erreur, Archivée)",
        "Moteur à graphe de dépendances : gains puis retenues, plafonds de conformité (CNPS, IRPP par tranches)",
        "Éléments variables (primes, heures sup, retenues) et éléments fixes calculés automatiquement",
        "Bulletins PDF par employé (brut, imposable, cotisable, part salarié/employeur, net), publiés en self-service",
        "Rapports de conformité : bordereau CNPS, DIPE, état IPM, via tags de conformité",
        "Exports comptables (CSV, FEC, DSN, Odoo, Sage/Ciel) mappés au plan OHADA ; virement bancaire SFTP",
        "Sessions complémentaires (rappels sur mois scellé) et journal d'audit post-paie ; archivage légal 10 ans",
      ],
      useCases: [
        "Clôturer la paie mensuelle (1 500 employés ≈ 2 min) → bulletins, bordereau CNPS et virement SFTP.",
        "Régulariser après clôture via une session complémentaire, sans rouvrir le mois.",
        "Produire les exports DSN/FEC et la DIPE annuelle directement depuis la session.",
      ],
    },
    en: {
      capabilities: [
        "Payroll runs with 8 statuses (Draft, Calculating, Calculated, Validated, Closed, Cancelled, Error, Archived)",
        "Dependency-graph engine: earnings then deductions, compliance caps (CNPS, banded income tax)",
        "Variable elements (bonuses, overtime, deductions) and auto-computed fixed elements",
        "Per-employee PDF payslips (gross, taxable, contributory, employee/employer share, net), self-service",
        "Compliance reports: CNPS schedule, DIPE, IPM statement, via compliance tags",
        "Accounting exports (CSV, FEC, DSN, Odoo, Sage) mapped to the OHADA chart; SFTP bank transfer",
        "Complementary runs (catch-ups on a sealed month) and post-payroll audit log; 10-year legal archival",
      ],
      useCases: [
        "Close the monthly run (1,500 employees ≈ 2 min) → payslips, CNPS schedule and SFTP transfer.",
        "Reconcile after closing via a complementary run, without reopening the month.",
        "Produce DSN/FEC exports and the annual DIPE straight from the run.",
      ],
    },
  },

  RECR00: {
    fr: {
      capabilities: [
        "Demandes de recrutement : workflow En attente → Approuvée / Rejetée, motif de rejet obligatoire",
        "CVthèque : vivier interne (employé) et externe (chercheur d'emploi), recherche multi-critères",
        "Offres d'emploi liées à un besoin approuvé : statuts En cours / Publiée / Expirée / Annulée",
        "Entretiens multi-jury : plusieurs notes indépendantes par membre (note + appréciation)",
        "Calendrier des entretiens : sur site, visioconférence, audio + envoi automatique des convocations",
        "Décision « Finaliser l'évaluation » puis « Convertir en employé » (fiche + contrat de paie)",
        "Stages : sessions et suivi des stagiaires ; dashboard analytique sur 10 ans glissants",
      ],
      useCases: [
        "Dérouler le flux besoin → approbation DRH → publication → jury, tracé d'un seul flux.",
        "Faire noter un candidat par trois évaluateurs indépendamment, puis décider.",
        "Convertir le candidat retenu en employé immédiatement exploitable en paie.",
      ],
    },
    en: {
      capabilities: [
        "Hiring requests: workflow Pending → Approved / Rejected, with a mandatory rejection reason",
        "CV bank: internal pool (employee) and external (job seeker), multi-criteria search",
        "Job offers tied to an approved need: statuses Open / Published / Expired / Cancelled",
        "Multi-panel interviews: several independent scores per member (score + comment)",
        "Interview calendar: on-site, video, audio + automatic invitation sending",
        "\"Finalize evaluation\" decision then \"Convert to employee\" (record + payroll contract)",
        "Internships: sessions and intern tracking; analytics dashboard over a rolling 10 years",
      ],
      useCases: [
        "Run the flow need → HR approval → publication → panel, traced end to end.",
        "Have three evaluators score a candidate independently, then decide.",
        "Convert the chosen candidate into an employee immediately usable in payroll.",
      ],
    },
  },

  CARE00: {
    fr: {
      capabilities: [
        "Objectifs annuels : qualitatif/quantitatif, pondération 0–100 %, statuts En cours / Clôturé / Suspendu",
        "Campagnes d'évaluation (annuelles, 360°, fin d'essai) pilotées par questionnaires pondérés",
        "Évaluations de performance avec rang, note N-1/N-2, onglets parcours / compétences / qualités",
        "Évaluations administratives adossées au ministère de tutelle (secteur public)",
        "Avancements : éligibilité sur la moyenne des 3 dernières évaluations (Éligible / Non éligible)",
        "Organigramme des positions en vue tabulaire ou diagramme navigable",
        "Départs en retraite avec notifications anticipées (2 ans / 1 an / 6 mois) ; palmarès des 10 meilleurs",
      ],
      useCases: [
        "Lancer la campagne annuelle avec objectifs pondérés et calcul automatique du rang.",
        "Détecter automatiquement les collaborateurs éligibles à l'avancement.",
        "Anticiper les départs en retraite via des notifications échelonnées.",
      ],
    },
    en: {
      capabilities: [
        "Annual goals: qualitative/quantitative, 0–100% weighting, statuses In progress / Closed / Suspended",
        "Evaluation campaigns (annual, 360°, end-of-trial) driven by weighted questionnaires",
        "Performance reviews with rank, N-1/N-2 score, tabs path / competencies / soft skills",
        "Administrative appraisals tied to the supervising ministry (public sector)",
        "Advancements: eligibility on the average of the last 3 reviews (Eligible / Not eligible)",
        "Position org chart in table or navigable diagram view",
        "Retirements with early notifications (2 yrs / 1 yr / 6 mo); top-10 leaderboard",
      ],
      useCases: [
        "Launch the annual cycle with weighted goals and automatic rank calculation.",
        "Automatically detect employees eligible for advancement.",
        "Anticipate retirements via staggered notifications.",
      ],
    },
  },

  TRAIN00: {
    fr: {
      capabilities: [
        "Recueil des besoins : 6 statuts Émis → En étude → Validé / Rejeté, arbitrage coût primitif vs définitif",
        "Consolidation : besoins → formations primitives → plan primitif → plan validé par la Direction",
        "Sessions : émargements électroniques par demi-journée, comptage présents/absents/excusés en live",
        "Calendrier avec détection des conflits (participants en double, formateur/salle chevauchant)",
        "Catalogue de modules réutilisables, mappés à la GPEC (présentiel, e-learning, mixte)",
        "Évaluations à chaud (NPS) et à froid (J+90/J+180) avec calcul du taux de transfert",
        "Remontée automatique au dossier RH ; espace « Mes formations » avec certificats",
      ],
      useCases: [
        "Mener la campagne annuelle de recueil des besoins puis la valider en Direction.",
        "Synchroniser les formations sécurité obligatoires avec le module SST.",
        "Mesurer le ROI d'une formation via le taux de transfert.",
      ],
    },
    en: {
      capabilities: [
        "Needs collection: 6 statuses Submitted → Under review → Validated / Rejected, initial vs final cost",
        "Consolidation: needs → initial trainings → initial plan → plan validated by management",
        "Sessions: electronic sign-in per half-day, live present/absent/excused counting",
        "Calendar with conflict detection (duplicate attendees, overlapping trainer/room)",
        "Reusable module catalog, mapped to skills planning (classroom, e-learning, blended)",
        "Hot (NPS) and cold (D+90/D+180) evaluations with transfer-rate calculation",
        "Automatic feed to the HR record; \"My trainings\" space with certificates",
      ],
      useCases: [
        "Run the annual needs-collection campaign then validate it with management.",
        "Sync mandatory safety trainings with the HSE module.",
        "Measure a training's ROI via the transfer rate.",
      ],
    },
  },

  "CARE-COMP-FW00": {
    fr: {
      capabilities: [
        "Référentiels thématiques et catalogue de compétences à échelle 1–5 avec définition par niveau",
        "Compétences par poste : grille postes × compétences (niveau attendu) — base du calcul d'écarts",
        "Compétences employés : niveau requis vs observé, écart signalé (rouge si négatif)",
        "Évaluations 360° à 4 sources (auto, manager, pairs, subordonnés) avec graphe radar",
        "Plans de développement : compétences cibles, budget, mentor — convertibles en demandes de formation",
        "Plans de succession : postes critiques, scores de prêt, niveau de risque, confidentiels par défaut",
        "Certifications externes (AWS, PMP, Scrum) et internes, avec renouvellement automatique",
      ],
      useCases: [
        "Cartographier les écarts de compétences par poste pour cibler la formation.",
        "Préparer une mobilité interne à partir de l'écart de compétences observé.",
        "Sécuriser un départ en retraite via un plan de succession confidentiel.",
      ],
    },
    en: {
      capabilities: [
        "Thematic frameworks and a 1–5 competency catalog with a definition per level",
        "Per-position competencies: roles × competencies grid (expected level) — basis for gap analysis",
        "Employee competencies: required vs observed level, flagged gap (red if negative)",
        "360° evaluations from 4 sources (self, manager, peers, reports) with a radar chart",
        "Development plans: target competencies, budget, mentor — convertible into training requests",
        "Succession plans: critical roles, readiness scores, risk level, confidential by default",
        "External (AWS, PMP, Scrum) and internal certifications, with automatic renewal",
      ],
      useCases: [
        "Map competency gaps by role to target training.",
        "Prepare an internal move from the observed competency gap.",
        "Secure a retirement via a confidential succession plan.",
      ],
    },
  },

  SOC00: {
    fr: {
      capabilities: [
        "Dossier d'assuré : N° CNPS, catégorie d'assurance auto-renseignant plafond/taux/prime, ayants droit",
        "Catégories d'assurés : référentiel de couverture (prestataire, âge max, plafond, prime)",
        "Demandes d'immatriculation CNPS/DIPE : En attente → Acceptée / Rejetée",
        "Bons de prise en charge : Émis → Dossier transmis → Validé → Remboursé (montant approuvé assureur)",
        "Bordereaux : regroupement périodique des bons pour envoi à l'assureur",
        "Prestations sociales : allocations familiales, indemnités de maternité, frais d'obsèques",
        "Suivi des consommations : cumul vs plafond (En règle / Attention / Plafond atteint / Dépassé)",
      ],
      useCases: [
        "Affilier un nouvel agent à la CNPS avec ses ayants droit.",
        "Émettre un bon → bordereau → suivi du remboursement auprès de l'assureur.",
        "Instruire une prestation sociale avec ses justificatifs.",
      ],
    },
    en: {
      capabilities: [
        "Insured file: CNPS number, insurance category auto-filling cap/rate/premium, beneficiaries",
        "Insured categories: coverage reference (provider, max age, cap, premium)",
        "CNPS/DIPE registration requests: Pending → Accepted / Rejected",
        "Care vouchers: Issued → File sent → Validated → Reimbursed (insurer-approved amount)",
        "Schedules: periodic grouping of vouchers for submission to the insurer",
        "Social benefits: family allowances, maternity indemnities, funeral costs",
        "Consumption tracking: cumulative vs cap (OK / Caution / Cap reached / Exceeded)",
      ],
      useCases: [
        "Enroll a new employee with the social-security body and their beneficiaries.",
        "Issue a voucher → schedule → track reimbursement with the insurer.",
        "Process a social benefit with its supporting documents.",
      ],
    },
  },

  "SOC-SST-INC00": {
    fr: {
      capabilities: [
        "Incidents : accident du travail/trajet, maladie pro, presqu'accident ; alerte si déclaration CNPS > 48 h",
        "Analyse 5 Pourquoi / Ishikawa et calcul des taux de fréquence et de gravité (TF/TG)",
        "Évaluation des risques (DUERP) : heatmap risques × unités de travail, score brut/résiduel",
        "Actions préventives : responsable, échéance, avancement 0–100 %, alertes de retard",
        "EPI : catalogue (norme EN, durée de vie), attribution signée, renouvellement à 90 jours",
        "Habilitations (électrique, CACES, hauteur, secouriste) avec pré-alertes et retrait auto à expiration",
        "Visites médicales (avis apte / apte avec restrictions / inapte) et comité CSSCT",
      ],
      useCases: [
        "Déclarer un accident du travail dans le délai légal CNPS de 48 h et lancer les actions correctives.",
        "Piloter le DUERP par heatmap et suivre l'avancement des actions de prévention.",
        "Suivre les habilitations avec retrait automatique dès expiration.",
      ],
    },
    en: {
      capabilities: [
        "Incidents: workplace/commute accident, occupational illness, near-miss; alert if CNPS report > 48 h",
        "5-Whys / Ishikawa analysis and frequency & severity rate calculation",
        "Risk assessment (occupational risk register): risk × work-unit heatmap, gross/residual score",
        "Preventive actions: owner, deadline, 0–100% progress, overdue alerts",
        "PPE: catalog (EN standard, lifespan), signed assignment, 90-day renewal",
        "Certifications (electrical, machinery, height, first-aid) with pre-alerts and auto-removal on expiry",
        "Medical visits (fit / fit with restrictions / unfit) and health-and-safety committee",
      ],
      useCases: [
        "Report a workplace accident within the 48-hour legal window and launch corrective actions.",
        "Drive the risk register by heatmap and track prevention-action progress.",
        "Track certifications with automatic removal on expiry.",
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
