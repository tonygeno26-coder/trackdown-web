"use client";

import { useEffect, useMemo, useState } from "react";
import {
  GraduationCap,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Spade,
  Layers,
  Shuffle,
  Hand,
} from "lucide-react";
import { TrainHeader } from "@/components/train/TrainingUi";
import { SurfaceCard, SectionHeader, ProgressBar } from "@/components/ui";
import {
  DEALING_PROCEDURE_GAME_META,
  DEALING_PROCEDURE_GAME_ORDER,
  GAME_SPECIFIC_PROCEDURE_GAMES,
  DealingProcedureGame,
  procedureCount,
} from "@/lib/training/dealing-procedures";
import {
  migrateDealingProcedureProgress,
  reviewedCountForGame,
} from "@/lib/training/dealing-procedure-progress";
import { buildAdaptiveDashboard } from "@/lib/training/adaptive-recommendations";
import { FocusRecommendation, TrainerRoute } from "@/lib/training/adaptive-types";
import AdaptiveFocusCard from "@/components/train/AdaptiveFocusCard";

const GAME_ICONS: Record<DealingProcedureGame, typeof Spade> = {
  mechanics: Hand,
  holdem: Spade,
  omaha: Layers,
  mixed: Shuffle,
};

function ProcedureGameCard({
  game,
  expanded,
  onToggle,
  onOpen,
  foundational = false,
}: {
  game: DealingProcedureGame;
  expanded: boolean;
  onToggle: () => void;
  onOpen: () => void;
  foundational?: boolean;
}) {
  const meta = DEALING_PROCEDURE_GAME_META[game];
  const Icon = GAME_ICONS[game];
  const total = procedureCount(game);
  const reviewed = reviewedCountForGame(game);
  const pct = total > 0 ? Math.round((reviewed / total) * 100) : 0;

  return (
    <SurfaceCard
      feature
      className={`overflow-hidden ${foundational ? "border-td-gold/50 ring-1 ring-td-gold/20" : ""}`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            foundational ? "bg-td-gold/15 text-td-goldsoft" : "bg-td-surface2 text-td-gold"
          }`}
        >
          <Icon size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="text-[15px] font-bold text-td-cream">{meta.title}</span>
              {foundational && (
                <span className="rounded-full bg-td-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-td-goldsoft">
                  Start here
                </span>
              )}
            </span>
            {expanded ? (
              <ChevronDown size={16} className="shrink-0 text-td-muted" />
            ) : (
              <ChevronRight size={16} className="shrink-0 text-td-muted" />
            )}
          </span>
          <span className="mt-0.5 block text-[12px] text-td-muted">{meta.description}</span>
          <span className="mt-2 block text-[11px] font-semibold text-td-goldsoft">
            {reviewed}/{total} reviewed · {pct}%
          </span>
          <ProgressBar value={pct} max={100} className="mt-2" />
        </span>
      </button>
      {expanded && (
        <div className="border-t border-td-border/60 px-4 pb-4 pt-3">
          <p className="mb-3 text-[12px] text-td-muted">
            {foundational
              ? "Foundational checklist — master these before game-specific procedures."
              : `Reference checklist for ${meta.title.toLowerCase()} dealing — mark items reviewed as you study.`}
          </p>
          <button
            type="button"
            onClick={onOpen}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-td-gold/40 bg-td-gold/10 py-3 text-[13px] font-semibold text-td-goldsoft hover:border-td-gold/60"
          >
            <ClipboardCheck size={16} />
            Open checklist
          </button>
        </div>
      )}
    </SurfaceCard>
  );
}

export default function DealerTrainingLanding({
  onBack,
  onProcedureChecklist,
  onAcademy,
  onAdaptivePractice,
}: {
  onBack: () => void;
  onProcedureChecklist: (game: DealingProcedureGame) => void;
  onAcademy: () => void;
  onAdaptivePractice: (route: TrainerRoute) => void;
}) {
  const [expanded, setExpanded] = useState<DealingProcedureGame | null>("mechanics");
  const [progress] = useState(() => migrateDealingProcedureProgress());
  const [dashboard, setDashboard] = useState(() => buildAdaptiveDashboard());

  useEffect(() => {
    setDashboard(buildAdaptiveDashboard());
  }, []);

  const dealerFocus = useMemo(
    () => dashboard.todaysFocus.filter((item) => item.area === "dealer"),
    [dashboard.todaysFocus]
  );

  const handleFocusPractice = (item: FocusRecommendation) => {
    onAdaptivePractice(item.trainerRoute);
  };

  const totalReviewed = progress.reviewedIds.length;
  const totalItems = DEALING_PROCEDURE_GAME_ORDER.reduce((n, g) => n + procedureCount(g), 0);

  return (
    <div className="pb-28">
      <TrainHeader
        title="Dealer Training"
        subtitle="Procedure checklists and dealer academy drills."
        onBack={onBack}
      />

      {dealerFocus.length > 0 && (
        <>
          <SectionHeader title="Today's Focus" />
          <div className="mb-6 space-y-2">
            {dealerFocus.map((item) => (
              <AdaptiveFocusCard key={item.area + item.topic} item={item} onPractice={handleFocusPractice} />
            ))}
          </div>
        </>
      )}

      <SectionHeader title="Dealing Procedures" />
      <p className="mb-3 text-[13px] text-td-muted">
        {totalReviewed} of {totalItems} procedures reviewed across all categories.
      </p>

      <div className="mb-4">
        <ProcedureGameCard
          game="mechanics"
          foundational
          expanded={expanded === "mechanics"}
          onToggle={() => setExpanded((e) => (e === "mechanics" ? null : "mechanics"))}
          onOpen={() => onProcedureChecklist("mechanics")}
        />
      </div>

      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-td-muted">
        By game
      </p>
      <div className="mb-6 grid gap-3">
        {GAME_SPECIFIC_PROCEDURE_GAMES.map((game) => (
          <ProcedureGameCard
            key={game}
            game={game}
            expanded={expanded === game}
            onToggle={() => setExpanded((e) => (e === game ? null : game))}
            onOpen={() => onProcedureChecklist(game)}
          />
        ))}
      </div>

      <SectionHeader title="Dealer Academy" />
      <p className="mb-3 text-[13px] text-td-muted">
        Interactive drills — pot math, side pots, board reading, quizzes, and more.
      </p>
      <button type="button" onClick={onAcademy} className="w-full text-left">
        <SurfaceCard feature className="p-5 transition hover:border-td-gold/40">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-td-surface2 text-td-gold">
              <GraduationCap size={22} strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[16px] font-bold text-td-cream">Dealer Academy</span>
              <span className="mt-1 block text-[13px] leading-relaxed text-td-muted">
                Pot calculation, PLO math, side pots, misdeals, tournaments, speed drills, and dealing tips.
              </span>
            </span>
            <ChevronRight size={18} className="mt-1 shrink-0 text-td-muted" />
          </div>
        </SurfaceCard>
      </button>
    </div>
  );
}
