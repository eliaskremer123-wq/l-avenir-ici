"use client";

import { useEffect, useState } from "react";

type Screen = "discover" | "loading" | "results";

const INTERESTS = [
  "Sciences",
  "Technologie",
  "Travail manuel",
  "Environnement",
  "Construction",
  "Logistique",
  "Commerce",
  "Créativité",
  "Travail avec les personnes",
  "Organisation",
  "Numérique",
  "Gestion",
] as const;

type Interest = (typeof INTERESTS)[number];

const LOADING_MESSAGES = [
  "Analyse des projets industriels...",
  "Identification des secteurs émergents...",
  "Recherche des opportunités adaptées...",
];

type Project = {
  id: string;
  name: string;
  sector: string;
  description: string;
  matchReasons: Partial<Record<Interest, string>>;
  skills: string[];
  nextStep: string;
};

const PROJECTS: Project[] = [
  {
    id: "hydrogen",
    name: "Hydrogène Carling",
    sector: "Technologies de l'hydrogène",
    description:
      "Un hub énergétique en pleine transformation autour de la production et de la distribution d'hydrogène bas carbone pour alimenter l'industrie locale.",
    matchReasons: {
      Sciences:
        "Votre curiosité scientifique correspond aux enjeux de recherche et d'innovation énergétique.",
      Technologie:
        "Les procédés de production et les systèmes de contrôle recrutent des profils techniques.",
      Environnement:
        "Ce projet vise à décarboner l'industrie — un levier concret pour la transition écologique.",
      Numérique:
        "La supervision des installations et l'analyse de données sont au cœur de ces métiers.",
    },
    skills: [
      "Analyse et rigueur scientifique",
      "Automatisation et systèmes industriels",
      "Sensibilité environnementale",
    ],
    nextStep:
      "Explorer les formations en énergies renouvelables ou en procédés industriels près de Saint-Avold.",
  },
  {
    id: "chemistry",
    name: "Chimie circulaire",
    sector: "Chimie circulaire",
    description:
      "Des usines qui repensent la production pour recycler, valoriser les déchets et réduire l'impact environnemental des matériaux.",
    matchReasons: {
      Sciences:
        "La chimie appliquée et les laboratoires de contrôle sont essentiels à ces filières.",
      Environnement:
        "L'économie circulaire répond directement à votre intérêt pour la durabilité.",
      "Travail manuel":
        "Les opérateurs de production et techniciens de terrain sont indispensables sur site.",
      Organisation:
        "La traçabilité des flux et la qualité demandent une organisation rigoureuse.",
    },
    skills: [
      "Précision et sécurité en milieu industriel",
      "Gestion des matières et des flux",
      "Esprit d'équipe sur des procédés complexes",
    ],
    nextStep:
      "Se renseigner sur les CAP/BTS chimie, environnement ou production industrielle.",
  },
  {
    id: "maintenance",
    name: "Maintenance industrielle",
    sector: "Maintenance industrielle",
    description:
      "Garantir le bon fonctionnement des équipements dans les sites de production — un métier clé de la relocalisation industrielle.",
    matchReasons: {
      "Travail manuel":
        "Vous aimez agir concrètement : la maintenance combine diagnostic et intervention sur le terrain.",
      Technologie:
        "Capteurs, automates et outils numériques transforment ce métier traditionnel.",
      Construction:
        "L'assemblage, l'installation et la rénovation d'équipements font partie du quotidien.",
      Organisation:
        "Planifier les interventions et anticiper les pannes exige méthode et autonomie.",
    },
    skills: [
      "Débrouillardise technique",
      "Lecture de plans et schémas",
      "Réactivité et sens du service",
    ],
    nextStep:
      "Découvrir les formations en maintenance industrielle ou électrotechnique.",
  },
  {
    id: "logistics",
    name: "Flux logistiques régionaux",
    sector: "Logistique & supply chain",
    description:
      "Coordonner le transport, le stockage et la distribution des matières premières et produits finis entre les sites industriels du bassin.",
    matchReasons: {
      Logistique:
        "Votre intérêt pour la logistique trouve un écho direct dans ces flux en expansion.",
      Organisation:
        "Optimiser les trajets et les délais demande une forte capacité d'organisation.",
      Commerce:
        "Comprendre les besoins clients et fournisseurs est central dans la chaîne logistique.",
      Gestion:
        "Piloter des stocks et des équipes relève de compétences en gestion opérationnelle.",
    },
    skills: [
      "Coordination et communication",
      "Maîtrise des outils numériques",
      "Sens du détail et de la fiabilité",
    ],
    nextStep:
      "Consulter les offres de formation en transport-logistique ou supply chain.",
  },
  {
    id: "energy-infra",
    name: "Réseaux énergétiques",
    sector: "Infrastructure énergétique",
    description:
      "Moderniser les réseaux électriques et les infrastructures qui alimentent les nouvelles activités industrielles de la région.",
    matchReasons: {
      Construction:
        "Les chantiers d'infrastructure offrent des opportunités concrètes sur le terrain.",
      Sciences:
        "Comprendre l'énergie et les réseaux repose sur des bases scientifiques solides.",
      Technologie:
        "Smart grids et monitoring connecté transforment ces métiers.",
      Environnement:
        "Intégrer les énergies renouvelables dans le réseau local est un enjeu majeur.",
    },
    skills: [
      "Travail en équipe sur chantier",
      "Compréhension des systèmes électriques",
      "Adaptabilité face aux nouvelles normes",
    ],
    nextStep:
      "Se renseigner sur les métiers du BTP énergétique ou de l'électrotechnique.",
  },
];

function scoreProject(project: Project, selected: Set<Interest>): number {
  return INTERESTS.filter(
    (interest) => selected.has(interest) && project.matchReasons[interest],
  ).length;
}

function getMatchReason(project: Project, selected: Set<Interest>): string {
  for (const interest of INTERESTS) {
    if (selected.has(interest) && project.matchReasons[interest]) {
      return project.matchReasons[interest]!;
    }
  }
  return "Ce projet s'inscrit dans la dynamique industrielle de Saint-Avold et pourrait vous surprendre.";
}

function Spinner() {
  return (
    <div className="relative h-14 w-14" aria-hidden="true">
      <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
      <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-emerald-500 border-r-emerald-400/40" />
    </div>
  );
}

function InterestCard({
  label,
  selected,
  onToggle,
}: {
  label: Interest;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={[
        "group relative rounded-2xl border px-5 py-4 text-left transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2",
        selected
          ? "border-emerald-300 bg-emerald-50/80 shadow-md shadow-emerald-100/60 -translate-y-0.5"
          : "border-slate-200/80 bg-white shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md hover:shadow-slate-200/50",
      ].join(" ")}
    >
      <span
        className={[
          "block text-sm font-medium tracking-tight transition-colors",
          selected ? "text-emerald-900" : "text-slate-700 group-hover:text-slate-900",
        ].join(" ")}
      >
        {label}
      </span>
      {selected && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
    </button>
  );
}

function ProjectCard({
  project,
  matchReason,
}: {
  project: Project;
  matchReason: string;
}) {
  return (
    <article className="flex flex-col rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm shadow-slate-200/40 transition-shadow hover:shadow-md hover:shadow-slate-200/60">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-slate-900">
            {project.name}
          </h3>
          <p className="mt-1 text-sm font-medium text-sky-700/80">{project.sector}</p>
        </div>
      </div>

      <p className="text-[15px] leading-relaxed text-slate-600">{project.description}</p>

      <div className="mt-6 space-y-5">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-700/70">
            Pourquoi cela vous correspond
          </p>
          <p className="text-sm leading-relaxed text-slate-700">{matchReason}</p>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Compétences valorisées demain
          </p>
          <ul className="space-y-2">
            {project.skills.map((skill) => (
              <li
                key={skill}
                className="flex items-start gap-2 text-sm text-slate-600"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                {skill}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-slate-50 px-5 py-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Prochaine piste à explorer
          </p>
          <p className="text-sm leading-relaxed text-slate-700">{project.nextStep}</p>
        </div>
      </div>
    </article>
  );
}

type MatchedProject = {
  project: Project;
  matchReason: string;
};

function computeMatchedProjects(selected: Set<Interest>): MatchedProject[] {
  const scored = PROJECTS.map((project) => ({
    project,
    score: scoreProject(project, selected),
  })).sort((a, b) => b.score - a.score);

  const withMatches = scored.filter((item) => item.score > 0);
  const pool = withMatches.length >= 3 ? withMatches : scored;

  return pool.slice(0, 4).map((item) => ({
    project: item.project,
    matchReason: getMatchReason(item.project, selected),
  }));
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("discover");
  const [selectedInterests, setSelectedInterests] = useState<Set<Interest>>(
    new Set(),
  );
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [matchedProjects, setMatchedProjects] = useState<MatchedProject[]>([]);

  const toggleInterest = (interest: Interest) => {
    setSelectedInterests((prev) => {
      const next = new Set(prev);
      if (next.has(interest)) {
        next.delete(interest);
      } else {
        next.add(interest);
      }
      return next;
    });
  };

  const handleDiscover = () => {
    setScreen("loading");
    setLoadingMessageIndex(0);
  };

  const handleReset = () => {
    setScreen("discover");
  };

  useEffect(() => {
    if (screen !== "loading") return;

    const messageInterval = setInterval(() => {
      setLoadingMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 700);

    const finishTimeout = setTimeout(() => {
      setMatchedProjects(computeMatchedProjects(selectedInterests));
      setScreen("results");
    }, 2000);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(finishTimeout);
    };
  }, [screen, selectedInterests]);

  const canSubmit = selectedInterests.size > 0;

  return (
    <div className="min-h-full bg-slate-50/80 font-sans text-slate-900">
      <header className="border-b border-slate-200/60 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-slate-800">
              L&apos;Avenir Ici
            </span>
          </div>
          <span className="hidden text-xs text-slate-400 sm:block">
            Saint-Avold
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12 sm:px-8 sm:py-16 lg:py-20">
        {screen === "discover" && (
          <div>
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl sm:leading-[1.15] lg:text-[2.75rem]">
                Et si l&apos;avenir de Saint-Avold avait une place pour vous ?
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
                De nouveaux projets transforment Saint-Avold. Découvrez lesquels
                correspondent à vos intérêts et les compétences qui pourront vous
                ouvrir ces opportunités demain.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {INTERESTS.map((interest) => (
                <InterestCard
                  key={interest}
                  label={interest}
                  selected={selectedInterests.has(interest)}
                  onToggle={() => toggleInterest(interest)}
                />
              ))}
            </div>

            <div className="mt-14 flex flex-col items-center">
              <button
                type="button"
                onClick={handleDiscover}
                disabled={!canSubmit}
                className={[
                  "w-full max-w-md rounded-2xl px-8 py-4 text-base font-semibold tracking-tight transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2",
                  canSubmit
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/25 active:scale-[0.99]"
                    : "cursor-not-allowed bg-slate-200 text-slate-400 shadow-none",
                ].join(" ")}
              >
                Découvrir mon avenir
              </button>
              {!canSubmit && (
                <p className="mt-4 text-sm text-slate-400">
                  Sélectionnez au moins un intérêt pour continuer
                </p>
              )}
            </div>
          </div>
        )}

        {screen === "loading" && (
          <div
            className="flex min-h-[60vh] flex-col items-center justify-center text-center"
            role="status"
            aria-live="polite"
          >
            <Spinner />
            <h2 className="mt-10 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Analyse des opportunités de Saint-Avold...
            </h2>
            <p
              key={loadingMessageIndex}
              className="mt-4 text-base text-slate-500 transition-opacity duration-300"
            >
              {LOADING_MESSAGES[loadingMessageIndex]}
            </p>
          </div>
        )}

        {screen === "results" && (
          <div>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium text-emerald-700/80">
                {selectedInterests.size} intérêt
                {selectedInterests.size > 1 ? "s" : ""} sélectionné
                {selectedInterests.size > 1 ? "s" : ""}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Votre avenir pourrait ressembler à ceci
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-slate-500">
                Voici quelques projets en émergence à Saint-Avold qui correspondent
                à ce que vous avez partagé — des pistes concrètes, pas des promesses
                d&apos;emploi.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              {matchedProjects.map(({ project, matchReason }) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  matchReason={matchReason}
                />
              ))}
            </div>

            <div className="mt-16 flex justify-center border-t border-slate-200/60 pt-12">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-xl px-6 py-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
              >
                Explorer d&apos;autres possibilités
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200/40 bg-white/50">
        <div className="mx-auto max-w-5xl px-6 py-6 sm:px-8">
          <p className="text-center text-xs text-slate-400">
            Un outil civique pour comprendre la transition industrielle de
            Saint-Avold
          </p>
        </div>
      </footer>
    </div>
  );
}
