"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ExploreView from "./ExploreView";
import { ANALYSIS_STEPS, PROJECTS, QUESTIONS, TERRITORY_TOPICS } from "../lavenir/data";
import {
  buildPersonalSummary,
  buildReflection,
  canAdvanceQuestion,
  computeRecommendations,
} from "../lavenir/matching";
import type {
  Answers,
  Project,
  QuestionId,
  Recommendation,
  Stage,
} from "../lavenir/types";

const INITIAL_ANSWERS: Answers = {
  location: "",
  locationDetail: "",
  workStyle: [],
  curiosity: [],
  environment: [],
  motivation: [],
  optional: "",
};

const OPTION_CARD =
  "rounded-xl border bg-white text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:ring-offset-2";
const GLASS_PANEL =
  "glass-panel rounded-[1.75rem] sm:rounded-[2rem]";
const GLASS_CARD =
  "glass-panel-subtle rounded-2xl border border-zinc-200/70 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]";
const QUESTIONNAIRE_CARD =
  "mx-auto flex w-full max-w-xl flex-col rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-sm md:max-w-2xl";

function ExperienceBackdrop() {
  return (
    <div className="experience-backdrop" aria-hidden="true">
      <div className="experience-backdrop__base" />
      <div className="experience-backdrop__ambient" />
      <div className="experience-backdrop__grid" />
      <div className="experience-backdrop__noise" />
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-full flex-col font-sans text-zinc-900">
      <ExperienceBackdrop />
      <header className="sticky top-0 z-20">
        <div className="relative mx-auto flex max-w-3xl items-center justify-between px-6 py-5 sm:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10 ring-1 ring-emerald-600/10">
              <div className="h-2 w-2 rounded-full bg-emerald-600" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-zinc-100">
              L&apos;Avenir Ici
            </span>
          </div>
          <span className="text-xs tracking-wide text-zinc-300">Saint-Avold</span>
        </div>
      </header>
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
      <footer className="relative z-10 mt-auto border-b-0 border-t">
        <div className="mx-auto max-w-3xl px-6 py-6 sm:px-10">
          <p className="text-center text-xs leading-relaxed text-zinc-300">
            Un outil civique pour comprendre — et se projeter dans — l&apos;avenir
            industriel de Saint-Avold
          </p>
        </div>
      </footer>
    </div>
  );
}

function FadeIn({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`animate-fade-in ${className}`}>{children}</div>
  );
}

function SelectableCard({
  label,
  selected,
  onToggle,
  compact = false,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={[
        OPTION_CARD,
        "relative flex items-center font-medium leading-snug tracking-tight",
        compact ? "h-14 px-4 py-3 pr-10 text-sm" : "px-5 py-4 pr-10 text-[0.9375rem]",
        selected
          ? "animate-select-pulse border-emerald-400 bg-emerald-50/60 text-zinc-900 ring-1 ring-emerald-200/80 -translate-y-px"
          : "border-zinc-200 text-zinc-700 hover:-translate-y-px hover:border-zinc-300",
      ].join(" ")}
    >
      <span className="line-clamp-2">{label}</span>
      <span
        className={[
          "absolute right-3.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-emerald-600 text-white transition-all duration-300",
          selected
            ? "animate-check-reveal scale-100 opacity-100"
            : "scale-75 opacity-0",
        ].join(" ")}
        aria-hidden="true"
      >
        <svg
          className="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    </button>
  );
}

const CITY_SUGGESTIONS = [
  "Saint-Avold",
  "Forbach",
  "Hambach",
  "Carling",
  "Hayange",
  "Ligny-en-Barrois",
];

function LocationAutocomplete({
  value,
  onChange,
}: {
  value: string;
  onChange: (city: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [dropdownRect, setDropdownRect] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  // Suggestions appear on focus and disappear as soon as the user types.
  const showSuggestions = focused && value.trim().length === 0;

  useEffect(() => {
    if (!showSuggestions || !inputRef.current) {
      setDropdownRect(null);
      return;
    }

    const updatePosition = () => {
      if (!inputRef.current) return;
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownRect({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [showSuggestions]);

  const dropdown =
    showSuggestions && dropdownRect ? (
      <ul
        className="fixed z-[9999] max-h-60 overflow-y-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-lg shadow-zinc-900/10"
        style={{
          top: dropdownRect.top,
          left: dropdownRect.left,
          width: dropdownRect.width,
        }}
      >
        {CITY_SUGGESTIONS.map((city) => (
          <li key={city}>
            <button
              type="button"
              // onMouseDown fires before input blur, so the value is set reliably.
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(city);
                setFocused(false);
              }}
              className="block w-full border-0 bg-white px-4 py-2.5 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:bg-zinc-50 focus-visible:outline-none"
            >
              {city}
            </button>
          </li>
        ))}
      </ul>
    ) : null;

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Entrez votre ville (ex. Saint-Avold, Forbach)"
        autoComplete="off"
        aria-label="Votre ville"
        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-500 transition-colors focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      />
      {dropdown && createPortal(dropdown, document.body)}
    </div>
  );
}

function QuestionNavigation({
  onBack,
  onNext,
  backDisabled,
  nextDisabled,
  nextLabel,
}: {
  onBack: () => void;
  onNext: () => void;
  backDisabled: boolean;
  nextDisabled: boolean;
  nextLabel: string;
}) {
  return (
    <div className="mt-auto flex items-center justify-between gap-4 border-t border-zinc-100 pt-6">
      <button
        type="button"
        onClick={onBack}
        disabled={backDisabled}
        className="rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 disabled:invisible focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
      >
        Retour
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className={[
          "rounded-xl px-7 py-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2",
          nextDisabled
            ? "cursor-not-allowed bg-zinc-100 text-zinc-400"
            : "bg-emerald-600 text-white hover:bg-emerald-700",
        ].join(" ")}
      >
        {nextLabel}
      </button>
    </div>
  );
}

function ConversationProgress({
  currentIndex,
  onStepClick,
}: {
  currentIndex: number;
  answers: Answers;
  onStepClick: (index: number) => void;
}) {
  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;

  return (
    <nav className="mb-6 border-b border-zinc-100 pb-5" aria-label="Progression de la conversation">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs text-zinc-500">Votre parcours</span>
        <span className="text-xs font-medium tabular-nums text-zinc-900">
          {currentIndex + 1} / {QUESTIONS.length}
        </span>
      </div>

      <div className="h-1 w-full rounded-full bg-zinc-200">
        <div
          className="h-1 rounded-full bg-emerald-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-zinc-900">
          {QUESTIONS[currentIndex].dimension}
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          {QUESTIONS.map((q, i) => {
            const isCurrent = i === currentIndex;
            const canNavigate = i <= currentIndex;

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => canNavigate && onStepClick(i)}
                disabled={!canNavigate}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`Étape ${i + 1}${isCurrent ? ", en cours" : ""}`}
                className={[
                  "flex h-6 min-w-6 items-center justify-center text-xs tabular-nums transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-1",
                  isCurrent
                    ? "rounded-full bg-emerald-600 px-1.5 font-medium text-white"
                    : i < currentIndex
                      ? "cursor-pointer text-zinc-500 hover:text-zinc-900"
                      : "cursor-default text-zinc-500 opacity-40",
                ].join(" ")}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
export function WelcomeStage({ onStart }: { onStart: () => void }) {
  return (
    <main className="mx-auto flex max-w-3xl flex-1 flex-col justify-center px-6 py-24 sm:px-10 sm:py-32">
      <FadeIn className="mx-auto w-full max-w-xl">
        <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl px-8 py-14 text-center sm:px-14 sm:py-16">
          <p className="text-sm font-medium tracking-[0.08em] text-emerald-700/80 uppercase">
            Saint-Avold se transforme
          </p>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.08] tracking-tight text-zinc-900 sm:text-6xl">
            Bienvenue.
          </h1>
          <p className="mx-auto mt-8 max-w-md text-lg leading-loose text-zinc-500">
            De nouvelles industries s&apos;installent ici. De nouveaux métiers vont
            exister. Avant de vous montrer où vous pourriez trouver votre place,
            nous voulons d&apos;abord comprendre qui vous êtes.
          </p>
          <button
            type="button"
            onClick={onStart}
            className="mt-14 w-full max-w-xs rounded-2xl bg-emerald-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-600/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2 active:scale-[0.99] sm:w-auto"
          >
            Commencer
          </button>
        </div>
      </FadeIn>
    </main>
  );
}

function UnderstandStage({
  questionIndex,
  answers,
  direction,
  onAnswerChange,
  onLocationDetailChange,
  onNext,
  onBack,
  onStepClick,
}: {
  questionIndex: number;
  answers: Answers;
  direction: "forward" | "back";
  onAnswerChange: (
    questionId: Exclude<QuestionId, "location">,
    value: string[] | string,
  ) => void;
  onLocationDetailChange: (detail: string) => void;
  onNext: () => void;
  onBack: () => void;
  onStepClick: (index: number) => void;
}) {
  const question = QUESTIONS[questionIndex];
  const isLocation = question.id === "location";
  const isOptional = question.id === "optional";

  const toggleOption = (optionId: string) => {
    if (isOptional || isLocation) return;
    const key = question.id as Exclude<QuestionId, "location" | "optional">;
    const current = answers[key] as string[];
    const next = current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId];
    onAnswerChange(key, next);
  };

  const canNext = canAdvanceQuestion(question.id, answers);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-8 sm:px-8">
      <div
        key={question.id}
        className={[
          QUESTIONNAIRE_CARD,
          "min-h-[28rem]",
          direction === "forward"
            ? "animate-question-enter"
            : "animate-question-enter-back",
        ].join(" ")}
      >
        <ConversationProgress
          currentIndex={questionIndex}
          answers={answers}
          onStepClick={onStepClick}
        />

        <div className="mb-5">
          <h2 className="max-w-lg text-xl font-semibold leading-snug tracking-tight text-zinc-900 md:text-2xl">
            {question.prompt}
          </h2>
          {question.subtitle && (
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-zinc-500">
              {question.subtitle}
            </p>
          )}
        </div>

        <div className="flex-1">
          {isLocation ? (
            <LocationAutocomplete
              value={answers.locationDetail}
              onChange={onLocationDetailChange}
            />
          ) : isOptional ? (
            <textarea
              value={answers.optional}
              onChange={(e) => onAnswerChange("optional", e.target.value)}
              rows={4}
              placeholder="Par exemple : une contrainte géographique, une passion, une hésitation sur votre orientation…"
              className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-relaxed text-zinc-900 placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-2.5">
              {question.options!.map((option) => (
                <SelectableCard
                  key={option.id}
                  label={option.label}
                  selected={(answers[question.id as Exclude<QuestionId, "location" | "optional">] as string[]).includes(option.id)}
                  onToggle={() => toggleOption(option.id)}
                  compact
                />
              ))}
            </div>
          )}
        </div>

        <QuestionNavigation
          onBack={onBack}
          onNext={onNext}
          backDisabled={questionIndex === 0}
          nextDisabled={!canNext}
          nextLabel={questionIndex === QUESTIONS.length - 1 ? "Continuer" : "Suivant"}
        />
      </div>
    </main>
  );
}

function ReflectStage({
  reflection,
  onContinue,
}: {
  reflection: string;
  onContinue: () => void;
}) {
  return (
    <main className="mx-auto flex max-w-3xl flex-1 flex-col justify-center px-6 py-20 sm:px-10 sm:py-28">
      <FadeIn className="mx-auto w-full max-w-xl">
        <div className={`${GLASS_PANEL} px-8 py-14 text-center sm:px-12 sm:py-16`}>
          <p className="text-sm font-medium tracking-wide text-emerald-700/75">
            Avant de continuer
          </p>
          <h2 className="mx-auto mt-5 max-w-lg text-2xl font-semibold leading-snug tracking-tight text-zinc-900 sm:text-3xl sm:leading-tight">
            {reflection}
          </h2>
          <p className="mx-auto mt-10 max-w-md text-base leading-loose text-zinc-500">
            Nous allons maintenant comparer cela aux projets qui façonnent
            l&apos;avenir de Saint-Avold.
          </p>
          <button
            type="button"
            onClick={onContinue}
            className="mt-12 rounded-2xl bg-emerald-600 px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2"
          >
            Voir ce qui correspond
          </button>
        </div>
      </FadeIn>
    </main>
  );
}

function AnalyzeStage({ onComplete }: { onComplete: () => void }) {
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    let finished = false;
    const stepDuration = 4000 / ANALYSIS_STEPS.length;
    const timers = ANALYSIS_STEPS.map((_, i) =>
      setTimeout(() => setCompletedCount(i + 1), stepDuration * (i + 1)),
    );
    const finish = setTimeout(() => {
      if (!finished) {
        finished = true;
        onComplete();
      }
    }, 4000);
    return () => {
      finished = true;
      timers.forEach(clearTimeout);
      clearTimeout(finish);
    };
  }, [onComplete]);

  return (
    <main
      className="mx-auto flex max-w-3xl flex-1 flex-col justify-center px-6 py-24 sm:px-10 sm:py-32"
      role="status"
      aria-live="polite"
    >
      <FadeIn className="mx-auto w-full max-w-md">
        <div className={`${GLASS_PANEL} px-8 py-12 sm:px-10 sm:py-14`}>
          <h2 className="text-center text-2xl font-semibold leading-tight tracking-tight text-zinc-900 sm:text-3xl">
            Nous analysons votre profil
          </h2>
          <p className="mt-4 text-center text-sm leading-loose text-zinc-500">
            Quelques instants — nous croisons vos réponses avec le territoire.
          </p>

          <ul className="mt-12 space-y-3">
            {ANALYSIS_STEPS.map((step, i) => {
              const done = i < completedCount;
              const active = i === completedCount;

              return (
                <li
                  key={step}
                  className={[
                    "flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all duration-500 ease-out",
                    done
                      ? "border-emerald-200/60 bg-white/80 shadow-sm"
                      : active
                        ? "border-zinc-200/60 bg-white/50"
                        : "border-transparent bg-transparent opacity-35",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-500",
                      done
                        ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                        : active
                          ? "border-2 border-emerald-400/40 bg-emerald-50/80 text-emerald-600"
                          : "border border-zinc-200/80 text-zinc-300",
                    ].join(" ")}
                  >
                    {done ? (
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span
                    className={[
                      "text-sm font-medium transition-colors duration-300",
                      done ? "text-zinc-800" : "text-zinc-500",
                    ].join(" ")}
                  >
                    {step}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </FadeIn>
    </main>
  );
}

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

/** Build the proxied image URL used by recommendation cards and preloading. */
function projectImageProxyUrl(project: Project): string | undefined {
  const imageUrl = project.imageUrl?.trim();
  if (!imageUrl) return undefined;
  const driveFileId = extractDriveFileId(imageUrl);
  if (!driveFileId) return undefined;
  return `/api/image?fileId=${encodeURIComponent(driveFileId)}`;
}

/** Tracks URLs already handed to the browser so preload + <img> never double-fetch. */
const preloadedImageUrls = new Set<string>();

const preloadImage = (url?: string) => {
  if (!url || preloadedImageUrls.has(url)) return;
  preloadedImageUrls.add(url);
  const img = new Image();
  img.src = url;
};

/** Progressive batch preload — first cards immediately, then staggered background loads. */
function preloadProjectImagesBatch(projects: Project[]) {
  const capped = projects.slice(0, 15);
  if (capped.length === 0) return () => {};

  capped.slice(0, 3).forEach((project) => preloadImage(projectImageProxyUrl(project)));

  const timer2 = setTimeout(() => {
    capped.slice(3, 8).forEach((project) => preloadImage(projectImageProxyUrl(project)));
  }, 800);

  const timer3 = setTimeout(() => {
    capped.slice(8).forEach((project) => preloadImage(projectImageProxyUrl(project)));
  }, 2000);

  return () => {
    clearTimeout(timer2);
    clearTimeout(timer3);
  };
}

function orderedProjectsFromRecommendations(
  recommendations: Recommendation[],
  projects: Project[],
): Project[] {
  return recommendations
    .map((rec) => projects.find((p) => p.id === rec.projectId))
    .filter((project): project is Project => Boolean(project));
}

/** Extract the YouTube video id from a standard watch or youtu.be URL. */
function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/,
  );
  return match ? match[1] : null;
}

function TransitionStage({ onStart }: { onStart: () => void }) {
  return (
    <main className="mx-auto flex max-w-3xl flex-1 flex-col justify-center px-6 py-20 sm:px-10 sm:py-28">
      <FadeIn className="mx-auto w-full max-w-xl">
        <div className={`${GLASS_PANEL} px-8 py-14 text-center sm:px-12 sm:py-16`}>
          <p className="text-sm font-medium tracking-wide text-emerald-700/75">
            Analyse terminée
          </p>
          <h2 className="mx-auto mt-5 max-w-lg text-2xl font-semibold leading-snug tracking-tight text-zinc-900 sm:text-3xl sm:leading-tight">
            Nous avons identifié plusieurs opportunités dans votre région
          </h2>
          <p className="mx-auto mt-6 max-w-md text-base leading-loose text-zinc-500">
            Découvrons-les ensemble
          </p>
          <button
            type="button"
            onClick={onStart}
            className="mt-12 rounded-2xl bg-emerald-600 px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2"
          >
            Commencer
          </button>
        </div>
      </FadeIn>
    </main>
  );
}

function PreparationBlock({
  preparationSteps,
}: {
  preparationSteps?: string[];
}) {
  const steps = preparationSteps ?? [];
  if (steps.length === 0) return null;

  return (
    <div className="rounded-2xl border border-emerald-100/80 bg-emerald-50/40 px-5 py-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
        Comment vous préparer dès aujourd&apos;hui
      </p>
      <ul className="space-y-3">
        {steps.map((step) => (
          <li key={step} className="flex gap-3 text-sm leading-relaxed text-zinc-700">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-700">
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
            <span>{step}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecommendationCard({
  recommendation,
  project,
  isTopMatch,
  expanded,
  onExpand,
  onNext,
  onPrevious,
  showPrevious,
  nextLabel,
}: {
  recommendation: Recommendation;
  project: Project;
  isTopMatch: boolean;
  expanded: boolean;
  onExpand: () => void;
  onNext: () => void;
  onPrevious: () => void;
  showPrevious: boolean;
  nextLabel: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  // Defensive display guards: the live sheet is a weak backend, so any field
  // may arrive missing. Never render undefined or broken blocks.
  const name = project.name?.trim() || "Projet à découvrir";
  const sector = project.sector?.trim() ?? "";
  const description = project.description?.trim() ?? "";
  const careers = project.careers ?? [];
  const skills = project.skills ?? [];
  const steps = project.preparationSteps ?? [];
  const timeline = project.timeline?.trim() ?? "";
  const learnMore = project.learnMore?.trim() ?? "";
  const hasLearnMore = /^https?:\/\//i.test(learnMore);
  const proxiedImageSrc = projectImageProxyUrl(project) ?? null;
  const videoUrl = project.videoUrl?.trim() ?? "";
  const youTubeId = videoUrl ? extractYouTubeId(videoUrl) : null;
  const imagePlaceholder =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 675'%3E%3Crect width='1200' height='675' fill='%23e4e4e7'/%3E%3Ccircle cx='600' cy='300' r='72' fill='%23a1a1aa'/%3E%3Cpath d='M270 535 470 365l130 115 115-95 215 150H270Z' fill='%23a1a1aa'/%3E%3C/svg%3E";

  return (
    <article
      className={[
        "relative flex flex-col rounded-[1.75rem] p-8 transition-all duration-300 sm:p-10",
        isTopMatch
          ? "glass-panel border-emerald-200/70 shadow-[0_24px_64px_rgba(16,185,129,0.1)] ring-1 ring-emerald-100/60"
          : GLASS_CARD,
      ].join(" ")}
    >
      {isTopMatch && (
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-emerald-700">
          Une piste à explorer
        </p>
      )}

      {!expanded && proxiedImageSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageFailed ? imagePlaceholder : proxiedImageSrc}
          alt={name}
          className="mb-6 h-48 w-full rounded-2xl object-cover"
          onError={() => setImageFailed(true)}
        />
      )}

      <h3 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-[1.35rem]">
        {name}
      </h3>
      {sector && (
        <p className="mt-1.5 text-sm font-medium text-zinc-500">{sector}</p>
      )}
      {description && (
        <p
          className={[
            "mt-4 text-sm leading-loose text-zinc-700",
            expanded ? "" : "line-clamp-2",
          ].join(" ")}
        >
          {description}
        </p>
      )}

      {!expanded && (
        <button
          type="button"
          onClick={onExpand}
          className="mt-8 self-start rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2"
        >
          Découvrir ce projet
        </button>
      )}

      {expanded && (
      <div className="mt-8 animate-fade-in space-y-6">
        {recommendation.personalMatch && (
          <div>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
              Pourquoi explorer cette piste
            </p>
            <p className="text-sm leading-loose text-zinc-700">
              {recommendation.personalMatch}
            </p>
          </div>
        )}

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

        {steps.length > 0 && <PreparationBlock preparationSteps={steps} />}

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

        {timeline && (
          <div className="rounded-2xl border border-zinc-200/60 bg-white/70 px-5 py-4 backdrop-blur-sm">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">
              Horizon
            </p>
            <p className="text-sm leading-loose text-zinc-700">{timeline}</p>
          </div>
        )}

        {hasLearnMore && (
          <a
            href={learnMore}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block w-full rounded-xl border border-zinc-200/70 bg-white/60 py-3 text-center text-sm font-medium text-zinc-700 backdrop-blur-sm transition-all duration-200 hover:-translate-y-px hover:border-zinc-300 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
          >
            Explorer ce secteur
          </a>
        )}

        <div
          className={[
            "flex border-t border-zinc-100 pt-6",
            showPrevious ? "justify-between" : "justify-end",
          ].join(" ")}
        >
          {showPrevious && (
            <button
              type="button"
              onClick={onPrevious}
              className="rounded-xl bg-emerald-600 px-7 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2"
            >
              Projet précédent
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            className="rounded-xl bg-emerald-600 px-7 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2"
          >
            {nextLabel}
          </button>
        </div>
      </div>
      )}
    </article>
  );
}

function DiscoverStage({
  personalSummary,
  recommendations,
  projects,
  projectsStatus,
  onContinue,
  onExplore,
}: {
  personalSummary: string;
  recommendations: Recommendation[];
  projects: Project[];
  projectsStatus: "loading" | "ready" | "error";
  onContinue: () => void;
  onExplore: () => void;
}) {
  // Recommendations are ranked directly over the live /api/projects catalog, so
  // each one binds to its real project by id. The local dataset is used only as
  // a last-resort safety fallback so a card is never blank.
  const resolvedRecommendations = recommendations
    .map((recommendation) => {
      const project =
        projects.find((p) => p.id === recommendation.projectId) ??
        PROJECTS.find((p) => p.id === recommendation.projectId);
      return project ? { recommendation, project } : null;
    })
    .filter(
      (entry): entry is { recommendation: Recommendation; project: Project } =>
        entry !== null,
    );

  // Sequential one-at-a-time card flow — local UI state only. Only the current
  // card is mounted; the territory section is revealed after the final card.
  const total = resolvedRecommendations.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [journeyDone, setJourneyDone] = useState(total === 0);
  const current = resolvedRecommendations[currentIndex];

  const handleNextProject = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
      setExpanded(false);
    } else {
      setJourneyDone(true);
    }
  };

  const handlePreviousProject = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setExpanded(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl flex-1 px-6 py-16 sm:px-10 sm:py-24">
      <FadeIn>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-100 sm:text-4xl sm:leading-[1.15]">
            Voici ce que nous avons découvert.
          </h2>
        </div>

        <div className={`${GLASS_PANEL} mx-auto mt-14 max-w-2xl px-8 py-10 sm:px-10 sm:py-12`}>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-600">
            D&apos;après vos sélections
          </p>
          <p className="mt-5 text-base leading-loose text-zinc-700">{personalSummary}</p>
        </div>

        {!journeyDone && (
        <div className="mt-20">
          <h3 className="text-xl font-semibold tracking-tight text-zinc-100">
            Secteurs à explorer
          </h3>
          <p className="mt-3 max-w-lg text-sm leading-loose text-zinc-300">
            Des transitions industrielles réelles, actuellement en cours dans la
            région de Saint-Avold.
          </p>
          {projectsStatus === "loading" && (
            <p className="mt-4 text-xs text-zinc-300">Chargement des données…</p>
          )}
          <p className="mt-6 max-w-lg text-xs leading-relaxed text-zinc-400">
            Cet outil est suggestif — il s&apos;appuie sur les compétences associées à
            ces secteurs, et non sur un bilan psychologique ou scientifique.
            N&apos;hésite pas à en parler avec ton conseiller.
          </p>

          {current && (
            <>
              <p
                className="mt-8 text-xs font-medium tabular-nums text-zinc-300"
                aria-live="polite"
              >
                Projet {currentIndex + 1} / {total}
              </p>
              <div key={current.project.id} className="mt-4 animate-fade-in">
                <RecommendationCard
                  recommendation={current.recommendation}
                  project={current.project}
                  isTopMatch={currentIndex === 0}
                  expanded={expanded}
                  onExpand={() => setExpanded(true)}
                  onNext={handleNextProject}
                  onPrevious={handlePreviousProject}
                  showPrevious={currentIndex > 0}
                  nextLabel={
                    currentIndex < total - 1
                      ? "Projet suivant"
                      : "Voir les transformations du territoire"
                  }
                />
              </div>
            </>
          )}
        </div>
        )}

        {journeyDone && (
        <section className="mt-24 animate-fade-in border-t border-zinc-200/15 pt-20">
          <h3 className="text-xl font-semibold tracking-tight text-zinc-100">
            Que se passe-t-il à Saint-Avold ?
          </h3>
          <p className="mt-4 max-w-xl text-sm leading-loose text-zinc-300">
            Votre parcours personnel s&apos;inscrit dans une transformation plus
            large. Voici les grands mouvements qui redessinent le territoire.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {TERRITORY_TOPICS.map((topic) => (
              <article
                key={topic.id}
                className={`${GLASS_CARD} p-7 sm:p-8`}
              >
                <h4 className="text-base font-semibold text-zinc-900">{topic.title}</h4>
                <p className="mt-2.5 text-sm font-medium leading-relaxed text-zinc-600">
                  {topic.summary}
                </p>
                <p className="mt-4 text-sm leading-loose text-zinc-500">{topic.detail}</p>
              </article>
            ))}
          </div>
        </section>
        )}

        {journeyDone && (
        <div className="mt-20 flex flex-col items-center gap-4 pb-4">
          <button
            type="button"
            onClick={onExplore}
            className="rounded-2xl border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-semibold text-zinc-100 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2"
          >
            Explorer tous les projets
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="rounded-2xl bg-zinc-900 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-zinc-900/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
          >
            Continuer l&apos;exploration
          </button>
        </div>
        )}
      </FadeIn>
    </main>
  );
}

function ContinueStage({
  onRestart,
  onExplore,
}: {
  onRestart: () => void;
  onExplore: () => void;
}) {
  return (
    <main className="mx-auto flex max-w-3xl flex-1 flex-col justify-center px-6 py-20 sm:px-10 sm:py-28">
      <FadeIn className="mx-auto w-full max-w-lg">
        <div className={`${GLASS_PANEL} px-8 py-14 text-center sm:px-12 sm:py-16`}>
          <h2 className="text-2xl font-semibold leading-tight tracking-tight text-zinc-900 sm:text-3xl">
            Votre exploration ne s&apos;arrête pas ici.
          </h2>
          <p className="mx-auto mt-6 max-w-md text-base leading-loose text-zinc-500">
            Saint-Avold continue d&apos;évoluer — et votre parcours aussi. Revenez
            quand vous voulez, ou approfondissez ce qui vous a parlé.
          </p>
          <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            <button
              type="button"
              onClick={onExplore}
              className={`${GLASS_CARD} px-6 py-3.5 text-sm font-medium text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30`}
            >
              Explorer d&apos;autres possibilités
            </button>
            <button
              type="button"
              className={`${GLASS_CARD} px-6 py-3.5 text-sm font-medium text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30`}
            >
              En savoir plus sur Saint-Avold
            </button>
            <button
              type="button"
              onClick={onRestart}
              className="rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2"
            >
              Recommencer
            </button>
          </div>
        </div>
      </FadeIn>
    </main>
  );
}

export default function LavenirExperience() {
  const [stage, setStage] = useState<Stage>("welcome");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [answers, setAnswers] = useState<Answers>(INITIAL_ANSWERS);
  const [reflection, setReflection] = useState("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [personalSummary, setPersonalSummary] = useState("");

  // Single source of truth for the displayed project catalog: /api/projects.
  // Initialized with the local dataset so the UI is never empty, and falls back
  // to it if the request fails. This is the only place the UI loads projects.
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [projectsStatus, setProjectsStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch("/api/projects");
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);

        const data: unknown = await response.json();
        const list =
          data && typeof data === "object" && Array.isArray((data as { projects?: unknown }).projects)
            ? ((data as { projects: Project[] }).projects)
            : [];

        if (cancelled) return;

        if (list.length > 0) {
          setProjects(list);
          setProjectsStatus("ready");
        } else {
          // Keep the local fallback dataset; never blank the screen.
          setProjects(PROJECTS);
          setProjectsStatus("error");
        }
      } catch (error) {
        console.warn(
          "[ui] Failed to load /api/projects — using local fallback dataset.",
          error,
        );
        if (cancelled) return;
        setProjects(PROJECTS);
        setProjectsStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Preload ranked recommendation images only — not the full catalog (wrong order,
  // often missing imageUrl on fallback). Timers cleaned on unmount / re-run.
  useEffect(() => {
    if (recommendations.length === 0) return;

    return preloadProjectImagesBatch(
      orderedProjectsFromRecommendations(recommendations, projects),
    );
  }, [recommendations, projects]);

  const handleAnswerChange = useCallback(
    (questionId: Exclude<QuestionId, "location">, value: string[] | string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
    },
    [],
  );

  const handleLocationDetailChange = useCallback((detail: string) => {
    setAnswers((prev) => ({
      ...prev,
      location: "other",
      locationDetail: detail,
    }));
  }, []);

  const goToQuestion = (index: number) => {
    setDirection(index < questionIndex ? "back" : "forward");
    setQuestionIndex(index);
  };

  const handleUnderstandNext = () => {
    if (questionIndex < QUESTIONS.length - 1) {
      setDirection("forward");
      setQuestionIndex((i) => i + 1);
    } else {
      setReflection(buildReflection(answers));
      setStage("reflect");
    }
  };

  const handleUnderstandBack = () => {
    if (questionIndex > 0) {
      setDirection("back");
      setQuestionIndex((i) => i - 1);
    }
  };

  const handleAnalyzeComplete = useCallback(() => {
    const recs = computeRecommendations(answers, projects);
    const ordered = orderedProjectsFromRecommendations(recs, projects);
    // Start batch-1 preload synchronously so images warm during the transition
    // screen — before useEffect runs and before the first card mounts.
    preloadProjectImagesBatch(ordered);
    setRecommendations(recs);
    setPersonalSummary(buildPersonalSummary());
    setStage("transition");
  }, [answers, projects]);

  const handleRestart = () => {
    setStage("welcome");
    setQuestionIndex(0);
    setDirection("forward");
    setAnswers(INITIAL_ANSWERS);
    setReflection("");
    setRecommendations([]);
    setPersonalSummary("");
  };

  const handleExploreOther = () => {
    setDirection("forward");
    setQuestionIndex(0);
    setStage("understand");
  };

  return (
    <Shell>
      {stage === "welcome" && (
        <WelcomeStage onStart={() => setStage("understand")} />
      )}

      {stage === "understand" && (
        <UnderstandStage
          questionIndex={questionIndex}
          answers={answers}
          direction={direction}
          onAnswerChange={handleAnswerChange}
          onLocationDetailChange={handleLocationDetailChange}
          onNext={handleUnderstandNext}
          onBack={handleUnderstandBack}
          onStepClick={goToQuestion}
        />
      )}

      {stage === "reflect" && (
        <ReflectStage
          reflection={reflection}
          onContinue={() => setStage("analyze")}
        />
      )}

      {stage === "analyze" && (
        <AnalyzeStage onComplete={handleAnalyzeComplete} />
      )}

      {stage === "transition" && (
        <TransitionStage onStart={() => setStage("discover")} />
      )}

      {stage === "discover" && (
        <DiscoverStage
          personalSummary={personalSummary}
          recommendations={recommendations}
          projects={projects}
          projectsStatus={projectsStatus}
          onContinue={() => setStage("continue")}
          onExplore={() => setStage("explore")}
        />
      )}

      {stage === "explore" && (
        <ExploreView
          projects={projects}
          projectsStatus={projectsStatus}
          recommendations={recommendations}
          onBack={() => setStage("discover")}
        />
      )}

      {stage === "continue" && (
        <ContinueStage onRestart={handleRestart} onExplore={handleExploreOther} />
      )}
    </Shell>
  );
}
