"use client";

import { useMemo, useState } from "react";
import type { Project, Recommendation } from "../lavenir/types";
import { formatProjectStatusLabel } from "../lavenir/timeline-status";

/** Extract a Google Drive file id from a raw id or common Drive URL formats. */
function extractDriveFileId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (/^[\w-]{10,}$/.test(trimmed) && !trimmed.includes("://")) {
    return trimmed;
  }

  const patterns = [
    /drive\.google\.com\/file\/d\/([^/?#]+)/,
    /drive\.google\.com\/open\?id=([^&]+)/,
    /drive\.google\.com\/uc(?:\?[^#]*)?[?&]id=([^&]+)/,
    /[?&]id=([^&]+)/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

/** Proxied image URL (routes Drive images through our reliable server proxy). */
function projectImageProxyUrl(project: Project): string | null {
  const imageUrl = project.imageUrl?.trim();
  if (!imageUrl) return null;
  const fileId = extractDriveFileId(imageUrl);
  if (!fileId) return null;
  return `/api/image?fileId=${encodeURIComponent(fileId)}`;
}

/** Extract the YouTube video id from a standard watch or youtu.be URL. */
function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/,
  );
  return match ? match[1] : null;
}

/** Deterministic, intentional-looking gradient derived from the sector string. */
function sectorGradient(sector: string): string {
  let hash = 0;
  for (let i = 0; i < sector.length; i++) {
    hash = (hash * 31 + sector.charCodeAt(i)) % 360;
  }
  const hue = Math.abs(hash);
  const hue2 = (hue + 38) % 360;
  return `linear-gradient(135deg, hsl(${hue} 42% 32%), hsl(${hue2} 48% 22%))`;
}

const STATUS_OPTIONS = [
  "Confirmé",
  "En construction",
  "Annoncé",
  "Spéculatif",
  "Déjà actif",
];

const TIMELINE_OPTIONS = [
  "Déjà actif",
  "0–1 an",
  "1–3 ans",
  "3–5 ans",
  "Plus de 5 ans",
];

const SELECT_CLASS =
  "w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/20 [&>option]:text-zinc-900";

function ProjectPlaceholder({ project }: { project: Project }) {
  const label = project.sector?.trim() || project.name?.trim() || "Projet";
  return (
    <div
      className="flex h-44 w-full items-center justify-center rounded-2xl"
      style={{ background: sectorGradient(project.sector || project.name) }}
      aria-hidden="true"
    >
      <span className="px-4 text-center text-sm font-semibold uppercase tracking-[0.14em] text-white/85">
        {label}
      </span>
    </div>
  );
}

function ProjectThumbnail({ project }: { project: Project }) {
  const [failed, setFailed] = useState(false);
  const src = projectImageProxyUrl(project);

  if (!src || failed) {
    return <ProjectPlaceholder project={project} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={project.name?.trim() || "Projet"}
      className="h-44 w-full rounded-2xl object-cover"
      onError={() => setFailed(true)}
    />
  );
}

function ExploreCard({
  project,
  recommended,
  onOpen,
}: {
  project: Project;
  recommended: boolean;
  onOpen: () => void;
}) {
  const name = project.name?.trim() || "Projet à découvrir";
  const sector = project.sector?.trim() ?? "";
  const city = project.city?.trim() ?? "";
  const statusLabel = formatProjectStatusLabel(project);

  return (
    <button
      type="button"
      onClick={onOpen}
      className={[
        "group relative flex snap-start flex-col rounded-[1.5rem] bg-white p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2",
        recommended
          ? "border border-emerald-300 ring-1 ring-emerald-200"
          : "border border-zinc-200/80",
      ].join(" ")}
    >
      {recommended && (
        <span className="absolute left-6 top-6 z-10 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
          ✦ Recommandé pour vous
        </span>
      )}

      <ProjectThumbnail project={project} />

      <div className="mt-4 flex flex-1 flex-col px-1 pb-1">
        <h3 className="text-base font-semibold tracking-tight text-zinc-900">
          {name}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {sector && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              {sector}
            </span>
          )}
          {statusLabel && (
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
              {statusLabel}
            </span>
          )}
        </div>

        {city && (
          <p className="mt-3 text-sm text-zinc-500">{city}</p>
        )}
      </div>
    </button>
  );
}

function ProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const name = project.name?.trim() || "Projet à découvrir";
  const sector = project.sector?.trim() ?? "";
  const city = project.city?.trim() ?? "";
  const description = project.description?.trim() ?? "";
  const careers = project.careers ?? [];
  const skills = project.skills ?? [];
  const steps = project.preparationSteps ?? [];
  const statusLabel = formatProjectStatusLabel(project);
  const learnMore = project.learnMore?.trim() ?? "";
  const hasLearnMore = /^https?:\/\//i.test(learnMore);
  const videoUrl = project.videoUrl?.trim() ?? "";
  const youTubeId = videoUrl ? extractYouTubeId(videoUrl) : null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-zinc-950/70 p-4 backdrop-blur-sm sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={name}
      onClick={onClose}
    >
      <div
        className="relative my-4 w-full max-w-2xl rounded-[1.75rem] bg-white p-8 shadow-2xl sm:my-8 sm:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="max-w-lg text-2xl font-semibold tracking-tight text-zinc-900">
          {name}
        </h2>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {sector && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              {sector}
            </span>
          )}
          {city && (
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
              {city}
            </span>
          )}
          {statusLabel && (
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
              {statusLabel}
            </span>
          )}
        </div>

        {description && (
          <p className="mt-6 text-sm leading-loose text-zinc-700">{description}</p>
        )}

        <div className="mt-8 space-y-6">
          {careers.length > 0 && (
            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">
                Métiers à découvrir
              </p>
              <ul className="space-y-2">
                {careers.map((career) => (
                  <li key={career} className="flex items-center gap-2.5 text-sm leading-relaxed text-zinc-700">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    {career}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {skills.length > 0 && (
            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">
                Compétences souvent développées
              </p>
              <ul className="space-y-2">
                {skills.map((skill) => (
                  <li key={skill} className="flex items-center gap-2.5 text-sm leading-relaxed text-zinc-700">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {steps.length > 0 && (
            <div className="rounded-2xl border border-emerald-100/80 bg-emerald-50/40 px-5 py-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                Comment vous préparer dès aujourd&apos;hui
              </p>
              <ul className="space-y-3">
                {steps.map((step) => (
                  <li key={step} className="flex gap-3 text-sm leading-relaxed text-zinc-700">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-700">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {youTubeId && (
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-zinc-900/5">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${youTubeId}`}
                title={`Vidéo — ${name}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {statusLabel && (
            <div className="rounded-2xl border border-zinc-200/60 bg-zinc-50 px-5 py-4">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">
                Horizon
              </p>
              <p className="text-sm leading-loose text-zinc-700">{statusLabel}</p>
            </div>
          )}

          {hasLearnMore && (
            <a
              href={learnMore}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-xl border border-zinc-200 bg-white py-3 text-center text-sm font-medium text-zinc-700 transition-all duration-200 hover:-translate-y-px hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
            >
              En savoir plus
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExploreView({
  projects,
  projectsStatus,
  recommendations = [],
  onBack,
  backLabel = "Retour à mes recommandations",
}: {
  projects: Project[];
  projectsStatus: "loading" | "ready" | "error";
  recommendations?: Recommendation[];
  onBack: () => void;
  backLabel?: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [timelineFilter, setTimelineFilter] = useState("");
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const recommendedKeys = useMemo(
    () => new Set(recommendations.map((rec) => rec.stableProjectKey)),
    [recommendations],
  );

  const sectors = useMemo(() => {
    const unique = new Set<string>();
    for (const project of projects) {
      const sector = project.sector?.trim();
      if (sector) unique.add(sector);
    }
    return [...unique].sort((a, b) => a.localeCompare(b, "fr"));
  }, [projects]);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return projects.filter((project) => {
      if (sectorFilter && project.sector?.trim() !== sectorFilter) return false;
      if (statusFilter && project.status?.trim() !== statusFilter) return false;
      if (timelineFilter && project.timeline?.trim() !== timelineFilter) {
        return false;
      }
      if (query) {
        const haystack = [
          project.name,
          project.description,
          project.sector,
          project.city,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [projects, searchQuery, sectorFilter, statusFilter, timelineFilter]);

  const hasActiveFilters = Boolean(
    searchQuery || sectorFilter || statusFilter || timelineFilter,
  );

  const clearFilters = () => {
    setSearchQuery("");
    setSectorFilter("");
    setStatusFilter("");
    setTimelineFilter("");
  };

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 sm:px-10 sm:py-16">
      <div className="animate-fade-in">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-zinc-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {backLabel}
        </button>

        <div className="mt-8 max-w-2xl">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-100 sm:text-4xl">
            Tous les projets du territoire
          </h2>
          <p className="mt-3 text-sm leading-loose text-zinc-300">
            Explorez l&apos;ensemble des transitions industrielles en cours dans la
            région, au-delà de vos recommandations.
          </p>
        </div>

        {/* Search */}
        <div className="mt-10">
          <label className="relative block">
            <span className="sr-only">Rechercher un projet</span>
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un projet, un secteur, une ville…"
              className="w-full rounded-xl border border-white/15 bg-white/10 py-3 pl-11 pr-4 text-sm text-zinc-100 placeholder:text-zinc-400 outline-none transition-colors focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/20"
            />
          </label>
        </div>

        {/* Filter bar */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-400">Secteur</span>
              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className={SELECT_CLASS}
              >
                <option value="">Tous les secteurs</option>
                {sectors.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-400">Statut</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={SELECT_CLASS}
              >
                <option value="">Tous les statuts</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-400">Chronologie</span>
              <select
                value={timelineFilter}
                onChange={(e) => setTimelineFilter(e.target.value)}
                className={SELECT_CLASS}
              >
                <option value="">Toutes les échéances</option>
                {TIMELINE_OPTIONS.map((timeline) => (
                  <option key={timeline} value={timeline}>
                    {timeline}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {hasActiveFilters && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>

        {/* States */}
        {projectsStatus === "loading" && (
          <p className="mt-10 text-sm text-zinc-300">Chargement des projets…</p>
        )}

        {projectsStatus !== "loading" && projects.length === 0 && (
          <p className="mt-10 text-sm text-zinc-300">
            Les projets ne sont pas disponibles pour le moment. Revenez un peu plus
            tard.
          </p>
        )}

        {projects.length > 0 && filtered.length === 0 && (
          <p className="mt-10 text-sm text-zinc-300">
            Aucun projet ne correspond à ces filtres.
          </p>
        )}

        {filtered.length > 0 && (
          <div className="mt-8 grid snap-y snap-mandatory grid-cols-1 gap-5 sm:snap-none sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <ExploreCard
                key={project.id}
                project={project}
                recommended={recommendedKeys.has(project.stableProjectKey)}
                onOpen={() => setActiveProject(project)}
              />
            ))}
          </div>
        )}
      </div>

      {activeProject && (
        <ProjectModal
          project={activeProject}
          onClose={() => setActiveProject(null)}
        />
      )}
    </main>
  );
}
