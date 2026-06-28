import { safeParseProjects } from "./data-safety";
import type { Project, Question, TerritoryTopic } from "./types";

export const QUESTIONS: Question[] = [
  {
    id: "location",
    dimension: "Votre territoire",
    prompt: "Où étudiez-vous ou habitez-vous ?",
    subtitle: "Cela nous aide à situer vos opportunités dans le bon contexte.",
    multi: false,
    variant: "location",
  },
  {
    id: "workStyle",
    dimension: "Votre façon de travailler",
    prompt: "Quand vous sentez-vous le plus engagé(e) ?",
    subtitle: "Choisissez ce qui vous ressemble — plusieurs réponses possibles.",
    multi: true,
    options: [
      {
        id: "problems",
        label: "Résoudre des problèmes difficiles",
        projectWeights: { hydrogen: 3, maintenance: 2, chemistry: 2 },
        reflectionPhrase: "résoudre des problèmes complexes",
      },
      {
        id: "building",
        label: "Construire des choses concrètes",
        projectWeights: { maintenance: 3, infrastructure: 3, chemistry: 1 },
        reflectionPhrase: "voir le résultat concret de votre travail",
      },
      {
        id: "helping",
        label: "Aider les autres",
        projectWeights: { logistics: 2, maintenance: 1 },
        reflectionPhrase: "être utile aux équipes et aux personnes",
      },
      {
        id: "organizing",
        label: "Organiser des projets",
        projectWeights: { logistics: 3, infrastructure: 1 },
        reflectionPhrase: "structurer et coordonner des projets",
      },
      {
        id: "outdoors",
        label: "Travailler en extérieur",
        projectWeights: { infrastructure: 3, maintenance: 2 },
        reflectionPhrase: "évoluer sur le terrain plutôt que derrière un écran",
      },
      {
        id: "creating",
        label: "Créer de nouvelles idées",
        projectWeights: { hydrogen: 2, chemistry: 3 },
        reflectionPhrase: "imaginer des solutions nouvelles",
      },
    ],
  },
  {
    id: "curiosity",
    dimension: "Votre curiosité",
    prompt: "Quels sujets retiennent naturellement votre attention ?",
    subtitle: "Pas besoin d'être expert — parlez-nous de ce qui vous intrigue.",
    multi: true,
    options: [
      {
        id: "science",
        label: "Sciences",
        projectWeights: { hydrogen: 3, chemistry: 3 },
        reflectionPhrase: "comprendre comment les choses fonctionnent",
      },
      {
        id: "technology",
        label: "Technologie",
        projectWeights: { hydrogen: 3, maintenance: 2, infrastructure: 2 },
        reflectionPhrase: "les innovations techniques",
      },
      {
        id: "environment",
        label: "Environnement",
        projectWeights: { hydrogen: 3, chemistry: 3, infrastructure: 2 },
        reflectionPhrase: "la transition écologique",
      },
      {
        id: "logistics",
        label: "Logistique",
        projectWeights: { logistics: 4 },
        reflectionPhrase: "comment les flux et les ressources circulent",
      },
      {
        id: "business",
        label: "Commerce",
        projectWeights: { logistics: 2, infrastructure: 1 },
        reflectionPhrase: "l'organisation et le sens des affaires",
      },
      {
        id: "digital",
        label: "Numérique",
        projectWeights: { hydrogen: 2, logistics: 2, maintenance: 1 },
        reflectionPhrase: "les outils numériques et les données",
      },
      {
        id: "chemistry",
        label: "Sciences",
        projectWeights: { chemistry: 4, hydrogen: 1 },
        reflectionPhrase: "la chimie et les matériaux",
      },
      {
        id: "mechanics",
        label: "Travail manuel",
        projectWeights: { maintenance: 4, infrastructure: 2 },
        reflectionPhrase: "les machines et les systèmes mécaniques",
      },
    ],
  },
  {
    id: "environment",
    dimension: "Votre environnement idéal",
    prompt: "Quel type de lieu de travail vous semble le plus juste ?",
    subtitle: "Imaginez un quotidien qui vous conviendrait vraiment.",
    multi: true,
    options: [
      {
        id: "smallTeams",
        label: "Petites équipes soudées",
        projectWeights: { maintenance: 2, logistics: 1 },
        reflectionPhrase: "travailler en proximité avec une équipe",
      },
      {
        id: "industrial",
        label: "Grands sites industriels",
        projectWeights: { hydrogen: 3, chemistry: 3, maintenance: 2 },
        reflectionPhrase: "l'ampleur et l'énergie des sites industriels",
      },
      {
        id: "office",
        label: "Bureaux & espaces calmes",
        projectWeights: { logistics: 2, hydrogen: 1 },
        reflectionPhrase: "des environnements où réfléchir et planifier",
      },
      {
        id: "outdoors",
        label: "Extérieur & chantiers",
        projectWeights: { infrastructure: 4, maintenance: 2 },
        reflectionPhrase: "le terrain et les chantiers",
      },
      {
        id: "lab",
        label: "Laboratoires",
        projectWeights: { chemistry: 4, hydrogen: 2 },
        reflectionPhrase: "l'analyse et la rigueur en laboratoire",
      },
      {
        id: "workshop",
        label: "Ateliers & workshops",
        projectWeights: { maintenance: 4, infrastructure: 1 },
        reflectionPhrase: "manier les outils et intervenir concrètement",
      },
    ],
  },
  {
    id: "motivation",
    dimension: "Ce qui compte pour vous",
    prompt: "Qu'est-ce qui compte le plus pour vous aujourd'hui ?",
    subtitle: "Il n'y a pas de mauvaise réponse — seulement la vôtre.",
    multi: true,
    options: [
      {
        id: "stability",
        label: "La stabilité",
        projectWeights: { maintenance: 2, logistics: 2, infrastructure: 2 },
        reflectionPhrase: "construire sur des bases solides",
      },
      {
        id: "impact",
        label: "Avoir un impact",
        projectWeights: { hydrogen: 3, chemistry: 3, infrastructure: 2 },
        reflectionPhrase: "contribuer à quelque chose de plus grand",
      },
      {
        id: "learning",
        label: "Apprendre en continu",
        projectWeights: { hydrogen: 2, chemistry: 2, maintenance: 2 },
        reflectionPhrase: "progresser et acquérir de nouvelles compétences",
      },
      {
        id: "creativity",
        label: "La créativité",
        projectWeights: { chemistry: 2, hydrogen: 2 },
        reflectionPhrase: "trouver des approches originales",
      },
      {
        id: "salary",
        label: "Un bon salaire",
        projectWeights: { maintenance: 2, logistics: 2, infrastructure: 2 },
        reflectionPhrase: "la sécurité financière",
      },
      {
        id: "teamwork",
        label: "Le travail d'équipe",
        projectWeights: { logistics: 2, maintenance: 2, chemistry: 1 },
        reflectionPhrase: "avancer ensemble",
      },
    ],
  },
  {
    id: "optional",
    dimension: "Enfin",
    prompt: "Y a-t-il autre chose que vous aimeriez nous dire ?",
    subtitle: "Optionnel — une contrainte, une envie, une hésitation… Tout ce qui vous semble utile.",
    multi: false,
    optional: true,
  },
];

export const ANALYSIS_STEPS = [
  "Comprendre vos intérêts",
  "Explorer les projets industriels",
  "Repérer les compétences partagées",
  "Trouver des connexions significatives",
  "Préparer vos pistes à explorer",
];

const rawProjects = [
  {
    id: "hydrogen",
    name: "Hydrogène Carling",
    city: "Saint-Avold",
    sector: "Technologies de l'hydrogène",
    description:
      "Un projet énergétique autour de la production et des usages de l'hydrogène bas carbone pour accompagner la transition industrielle du bassin.",
    careers: [
      "Technicien de procédés",
      "Opérateur énergétique",
      "Ingénieur en énergies renouvelables",
    ],
    skills: [
      "Rigueur scientifique et sécurité industrielle",
      "Compréhension des systèmes et de l'automatisation",
      "Sensibilité aux enjeux environnementaux",
    ],
    timeline:
      "Les premières formations, visites et découvertes de terrain se multiplient dès les prochaines années, avec une montée en charge progressive du site.",
    matchTemplates: [
      "Votre attrait pour {traits} peut rendre cette transition énergétique particulièrement intéressante à explorer.",
      "Ce hub énergétique ouvre des questions concrètes autour de {traits}, qui correspondent aux intérêts que vous avez partagés.",
    ],
    preparationSteps: [
      "Participer activement aux projets de groupe à l'E2C ou en Mission Locale.",
      "Suivre des contenus sur l'énergie et la transition écologique (vidéos, articles, podcasts).",
      "Demander à effectuer une visite d'entreprise ou de site industriel dans ce secteur.",
    ],
    status: "Confirmé",
    learnMore: "https://www.saint-avold.fr/",
  },
  {
    id: "chemistry",
    name: "Chimie circulaire",
    city: "Saint-Avold",
    sector: "Chimie circulaire & économie circulaire",
    description:
      "Une transformation des activités chimiques vers le recyclage, la valorisation des matières et la réduction de l'impact environnemental.",
    careers: [
      "Technicien de laboratoire",
      "Opérateur de production",
      "Chargé de qualité environnementale",
    ],
    skills: [
      "Précision en milieu industriel",
      "Compréhension des flux et du recyclage",
      "Esprit d'équipe sur des procédés exigeants",
    ],
    timeline:
      "La reconversion des sites chimiques s'étale sur la décennie — le moment idéal pour se former en amont.",
    matchTemplates: [
      "Votre intérêt pour {traits} peut vous aider à comprendre une filière qui repense la production sans gaspiller.",
      "La chimie circulaire est une transformation à découvrir si vous souhaitez explorer {traits}.",
    ],
    preparationSteps: [
      "Renforcer les bases en sciences (chimie, environnement) via les ressources proposées par votre établissement.",
      "Participer à des ateliers ou projets liés au recyclage et à la durabilité.",
      "Échanger avec un conseiller E2C ou Mission Locale sur les filières chimie et environnement.",
    ],
    status: "En construction",
    learnMore: "https://www.saint-avold.fr/",
  },
  {
    id: "maintenance",
    name: "Maintenance industrielle",
    city: "Saint-Avold",
    sector: "Industrie & maintenance",
    description:
      "Un ensemble de savoir-faire techniques pour comprendre, entretenir et sécuriser les équipements des sites industriels en transition.",
    careers: [
      "Technicien de maintenance",
      "Électromécanicien",
      "Technicien instrumentation",
    ],
    skills: [
      "Débrouillardise technique et diagnostic",
      "Lecture de plans et schémas",
      "Réactivité et sens du service",
    ],
    timeline:
      "Chaque nouveau site industriel rend ces savoir-faire plus visibles dans le territoire, avec des parcours à découvrir progressivement.",
    matchTemplates: [
      "Si vous aimez {traits}, la maintenance industrielle peut être une piste concrète à observer de plus près.",
      "Les sites en reconversion permettent d'explorer des activités liées à {traits}, sans vous enfermer dans un choix immédiat.",
    ],
    preparationSteps: [
      "S'initier à la mécanique ou à l'électrotechnique via des modules courts ou stages découverte.",
      "Développer la rigueur et la sécurité en atelier lors des travaux pratiques à l'E2C.",
      "Se renseigner sur les entreprises industrielles locales pour mieux comprendre la maintenance.",
    ],
    status: "Confirmé",
    learnMore: "https://www.onisep.fr/",
  },
  {
    id: "logistics",
    name: "Flux logistiques régionaux",
    city: "Forbach",
    sector: "Logistique & supply chain",
    description:
      "Une activité clé pour organiser les flux de matières, d'équipements et de produits entre les sites industriels du territoire.",
    careers: [
      "Responsable logistique",
      "Coordinateur transport",
      "Gestionnaire de stocks",
    ],
    skills: [
      "Organisation et coordination",
      "Maîtrise des outils numériques",
      "Fiabilité et sens du détail",
    ],
    timeline:
      "La relocalisation industrielle rend la logistique plus visible dès maintenant, avec des formations et immersions possibles.",
    matchTemplates: [
      "Votre goût pour {traits} peut rendre la logistique régionale intéressante à explorer.",
      "Comprendre les flux peut être une manière concrète d'approfondir {traits}.",
    ],
    preparationSteps: [
      "Travailler l'organisation et la gestion de projet dans vos activités scolaires ou associatives.",
      "Se familiariser avec les outils bureautiques et numériques de suivi et de planification.",
      "Demander une immersion ou une journée découverte dans une entreprise de transport ou d'entrepôt.",
    ],
    status: "Annoncé",
    learnMore: "https://www.onisep.fr/",
  },
  {
    id: "infrastructure",
    name: "Réseaux énergétiques",
    city: "Metz",
    sector: "Infrastructure énergétique",
    description:
      "Des chantiers et réseaux nécessaires pour alimenter, raccorder et moderniser les nouveaux projets énergétiques et industriels.",
    careers: [
      "Électricien industriel",
      "Technicien réseaux",
      "Monteur en installations énergétiques",
    ],
    skills: [
      "Travail en équipe sur chantier",
      "Compréhension des systèmes électriques",
      "Adaptabilité face aux nouvelles normes",
    ],
    timeline:
      "La modernisation des réseaux accompagne chaque nouveau projet — un chantier de long terme, riche en opportunités.",
    matchTemplates: [
      "Votre affinité pour {traits} peut vous aider à explorer les infrastructures qui alimentent l'industrie locale.",
      "Les réseaux énergétiques offrent une piste pour comprendre comment {traits} se traduit dans des projets de territoire.",
    ],
    preparationSteps: [
      "Explorer les bases de l'électricité et du BTP via des modules proposés en lycée pro ou E2C.",
      "Renforcer le travail en équipe sur des projets de chantier simulés ou encadrés.",
      "Contacter un lycée professionnel voisin pour une visite de filière électrotechnique ou énergétique.",
    ],
    status: "Spéculatif",
    learnMore: "https://www.onisep.fr/",
  },
];

function normalizeProjectDataset(rows: typeof rawProjects): Project[] {
  const parsedProjects = safeParseProjects(rows);

  if (parsedProjects.length !== rows.length) {
    console.warn("Project dataset fallback triggered");
  }

  return parsedProjects.map((project, index) => ({
    ...project,
    id: rows[index]?.id ?? project.id,
  }));
}

export const PROJECTS: Project[] = normalizeProjectDataset(rawProjects);

/** Mock data source — replace with API/Sheets fetch without changing consumers. */
export async function getProjects(): Promise<Project[]> {
  return PROJECTS;
}

/** Synchronous project access for matching until recommendation flow is async. */
export function getProjectsSync(): Project[] {
  return PROJECTS;
}

export const TERRITORY_TOPICS: TerritoryTopic[] = [
  {
    id: "hydrogen",
    title: "L'hydrogène bas carbone",
    summary:
      "Carling-Saint-Avold se positionne comme un pôle énergétique majeur en Lorraine.",
    detail:
      "La production d'hydrogène vert vise à décarboner l'industrie locale et à faire émerger de nouvelles compétences dans l'énergie de demain — un tournant visible depuis chez vous.",
  },
  {
    id: "chemistry",
    title: "La chimie circulaire",
    summary:
      "Les anciens sites chimiques se transforment pour recycler et valoriser les matériaux.",
    detail:
      "Plutôt que de tout jeter, l'industrie repense ses cycles : moins de déchets, plus de savoir-faire techniques à découvrir, et une filière qui a du sens pour l'environnement.",
  },
  {
    id: "transition",
    title: "La transition industrielle",
    summary:
      "Saint-Avold ne disparaît pas — elle se réinvente autour de nouvelles activités.",
    detail:
      "Des milliers d'emplois industriels ont existé ici. La reconversion n'efface pas cette histoire : elle la prolonge avec de nouveaux métiers, souvent plus proches de ce qui se construit aujourd'hui en Europe.",
  },
  {
    id: "investment",
    title: "Les investissements de demain",
    summary:
      "Des milliards d'euros sont engagés pour reconstruire la base industrielle régionale.",
    detail:
      "Ces projets ne sont pas abstraits : ils signifient des formations, des stages, des immersions et des secteurs à explorer pour les jeunes du territoire.",
  },
];
