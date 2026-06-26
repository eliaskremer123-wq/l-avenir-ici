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
        label: "Commerce & gestion",
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
        label: "Chimie",
        projectWeights: { chemistry: 4, hydrogen: 1 },
        reflectionPhrase: "la chimie et les matériaux",
      },
      {
        id: "mechanics",
        label: "Mécanique",
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
  "Préparer vos recommandations",
];

export const PROJECTS: Project[] = [
  {
    id: "hydrogen",
    name: "Hydrogène Carling",
    sector: "Technologies de l'hydrogène",
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
      "Les premières formations et stages se multiplient dès les prochaines années, avec une montée en charge progressive du site.",
    matchTemplates: [
      "Votre attrait pour {traits} trouve un écho direct dans un projet qui redéfinit l'énergie de la région.",
      "Ce hub énergétique a besoin de profils curieux et engagés — comme vous semblez l'être sur {traits}.",
    ],
    learnMore:
      "Renseignez-vous sur les filières énergie, procédés industriels et transition écologique proposées près de Saint-Avold.",
  },
  {
    id: "chemistry",
    name: "Chimie circulaire",
    sector: "Chimie circulaire & économie circulaire",
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
      "Votre intérêt pour {traits} correspond à une filière qui repense la production sans gaspiller.",
      "La chimie circulaire valorise exactement le type de curiosité que vous avez décrit : {traits}.",
    ],
    learnMore:
      "Explorez les CAP/BTS chimie, environnement ou production industrielle dans le bassin mosellan.",
  },
  {
    id: "maintenance",
    name: "Maintenance industrielle",
    sector: "Industrie & maintenance",
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
      "Chaque nouveau site industriel crée des besoins immédiats — c'est un métier d'avenir ancré dans le territoire.",
    matchTemplates: [
      "Vous aimez {traits} : la maintenance industrielle, c'est exactement ça — utile, concret, indispensable.",
      "Les sites en reconversion ont besoin de profils comme le vôtre, orientés vers {traits}.",
    ],
    learnMore:
      "Découvrez les formations en maintenance, électrotechnique et mécanique industrielle.",
  },
  {
    id: "logistics",
    name: "Flux logistiques régionaux",
    sector: "Logistique & supply chain",
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
      "La relocalisation industrielle stimule la logistique dès maintenant — des postes accessibles avec formation.",
    matchTemplates: [
      "Votre goût pour {traits} s'aligne avec une logistique en pleine expansion autour de Saint-Avold.",
      "Coordonner les flux demande exactement ce que vous valorisez : {traits}.",
    ],
    learnMore:
      "Consultez les formations en transport-logistique et supply chain de la région.",
  },
  {
    id: "infrastructure",
    name: "Réseaux énergétiques",
    sector: "Infrastructure énergétique",
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
      "Votre affinité pour {traits} rejoint les besoins concrets des infrastructures qui alimentent l'industrie locale.",
      "Bâtir l'avenir énergétique de la région, c'est mobiliser des profils attirés par {traits}.",
    ],
    learnMore:
      "Renseignez-vous sur le BTP énergétique et l'électrotechnique dans les lycées professionnels voisins.",
  },
];

export const TERRITORY_TOPICS: TerritoryTopic[] = [
  {
    id: "hydrogen",
    title: "L'hydrogène bas carbone",
    summary:
      "Carling-Saint-Avold se positionne comme un pôle énergétique majeur en Lorraine.",
    detail:
      "La production d'hydrogène vert vise à décarboner l'industrie locale et à créer des emplois qualifiés dans l'énergie de demain — un tournant visible depuis chez vous.",
  },
  {
    id: "chemistry",
    title: "La chimie circulaire",
    summary:
      "Les anciens sites chimiques se transforment pour recycler et valoriser les matériaux.",
    detail:
      "Plutôt que de tout jeter, l'industrie repense ses cycles : moins de déchets, plus d'emplois techniques, et une filière qui a du sens pour l'environnement.",
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
      "Ces projets ne sont pas abstraits : ils signifient des formations, des stages, des entreprises qui recrutent — et une place possible pour les jeunes du territoire.",
  },
];
