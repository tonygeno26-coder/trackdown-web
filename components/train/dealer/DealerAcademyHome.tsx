"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  Calculator,
  Layers,
  AlertTriangle,
  ClipboardList,
  Eye,
  Split,
  Zap,
  BarChart3,
  ChevronRight,
  Target,
} from "lucide-react";
import { TrainHeader } from "@/components/train/TrainingUi";
import { SurfaceCard, PrimaryButton, SectionHeader, StatCard, ProgressBar } from "@/components/ui";
import { DealerModuleKey } from "@/lib/training/dealer-types";
import { buildTodaysFocus, scoreDealerModules, MODULE_LABELS } from "@/lib/training/adaptive-dealer";
import { loadTrainingProgress, accuracyPct, dealerOverallAccuracy } from "@/lib/training/progress";

const MODULES: {
  key: DealerModuleKey;
  title: string;
  desc: string;
  icon: typeof BookOpen;
  difficulty: string;
}[] = [
  { key: "side-pot", title: "Side Pot Simulator", desc: "Multi-way all-in pot breakdowns.", icon: Calculator, difficulty: "intermediate" },
  { key: "misdeal", title: "Misdeal & Exposed Cards", desc: "Floor-call procedure scenarios.", icon: AlertTriangle, difficulty: "intermediate" },
  { key: "tournament-quiz", title: "Tournament Procedures", desc: "TDA-style best practices.", icon: ClipboardList, difficulty: "beginner" },
  { key: "cash-quiz", title: "Cash Game Procedures", desc: "Room-variation procedure drills.", icon: ClipboardList, difficulty: "beginner" },
  { key: "board-reading", title: "Board Reading", desc: "Hold'em and PLO hand evaluation.", icon: Eye, difficulty: "intermediate" },
  { key: "hi-lo", title: "Split Pot / Hi-Lo", desc: "Quartering, odd chips, scoops.", icon: Split, difficulty: "advanced" },
  { key: "speed", title: "Speed Challenges", desc: "Timed dealer math drills.", icon: Zap, difficulty: "intermediate" },
  { key: "tips", title: "Dealing Tips Library", desc: "100+ lessons with search and filters.", icon: BookOpen, difficulty: "beginner" },
  { key: "pot", title: "Pot Calculation", desc: "NLHE pot, call, and raise math.", icon: Calculator, difficulty: "beginner" },
  { key: "plo", title: "PLO Pot Calculation", desc: "Pot-limit Omaha betting sequences.", icon: Layers, difficulty: "intermediate" },
];

function moduleProgress(key: DealerModuleKey) {
  const d = loadTrainingProgress().dealer;
  switch (key) {
    case "pot": return d.potCalc;
    case "plo": return d.ploCalc;
    case "side-pot": return d.sidePot;
    case "misdeal": return d.misdeal;
    case "tournament-quiz": return d.tournamentQuiz;
    case "cash-quiz": return d.cashQuiz;
    case "board-reading": return d.boardReading;
    case "hi-lo": return d.hiLo;
    case "speed": return { attempted: d.speed.totalAttempted, correct: d.speed.totalCorrect, currentStreak: 0, bestStreak: 0 };
    case "tips": return { attempted: d.tips.viewedIds.length, correct: d.tips.completedIds.length, currentStreak: 0, bestStreak: 0 };
  }
}

function moduleLastPracticed(key: DealerModuleKey): string | undefined {
  const d = loadTrainingProgress().dealer;
  switch (key) {
    case "side-pot": return d.sidePot.lastPracticedAt;
    case "misdeal": return d.misdeal.lastPracticedAt;
    case "tournament-quiz": return d.tournamentQuiz.lastPracticedAt;
    case "cash-quiz": return d.cashQuiz.lastPracticedAt;
    case "board-reading": return d.boardReading.lastPracticedAt;
    case "hi-lo": return d.hiLo.lastPracticedAt;
    case "speed": return d.speed.lastPracticedAt;
    default: return undefined;
  }
}

export default function DealerAcademyHome({
  onBack,
  onModule,
  onDashboard,
}: {
  onBack: () => void;
  onModule: (key: DealerModuleKey) => void;
  onDashboard?: () => void;
}) {
  const [progress] = useState(() => loadTrainingProgress());
  const focus = useMemo(() => buildTodaysFocus(progress.dealer), [progress]);
  const scores = useMemo(() => scoreDealerModules(progress.dealer), [progress]);
  const improved = scores.filter((s) => s.attempted >= 3 && s.accuracy >= 70).slice(0, 3);
  const needs = scores.filter((s) => s.tier === "weak" && s.attempted > 0).slice(0, 3);

  const primary = focus[0];
  const secondary = focus.find((f) => f.secondary);

  return (
    <div className="pb-28">
      <TrainHeader
        title="Dealer Academy"
        subtitle="Build accuracy before and during your shift."
        onBack={onBack}
      />

      <SectionHeader title="Today's Focus" />
      <SurfaceCard feature className="mb-4 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-td-gold/15 text-td-gold">
            <Target size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-td-gold">Primary</p>
            <p className="text-[16px] font-bold text-td-cream">{primary?.moduleLabel}</p>
            <p className="mt-1 text-[13px] text-td-muted">{primary?.reason} · ~{primary?.estimatedMinutes} min</p>
          </div>
        </div>
        <PrimaryButton type="button" className="mt-4 w-full" onClick={() => primary && onModule(primary.route)}>
          Continue Training
        </PrimaryButton>
        {secondary && (
          <button
            type="button"
            onClick={() => onModule(secondary.route)}
            className="mt-2 flex w-full items-center justify-between rounded-lg border border-td-border/60 px-3 py-2 text-[13px] text-td-muted"
          >
            <span>Also: {secondary.moduleLabel}</span>
            <ChevronRight size={14} />
          </button>
        )}
      </SurfaceCard>

      <div className="mb-4 grid grid-cols-3 gap-2">
        <StatCard label="Level" value={dealerOverallAccuracy(progress.dealer) >= 80 ? "Pro" : dealerOverallAccuracy(progress.dealer) >= 50 ? "Intermediate" : "Rookie"} />
        <StatCard label="Accuracy" value={`${dealerOverallAccuracy(progress.dealer)}%`} />
        <StatCard label="Streak" value={`${progress.dealer.streakDays}d`} />
      </div>

      {onDashboard && (
        <button
          type="button"
          onClick={onDashboard}
          className="mb-4 flex w-full items-center justify-between rounded-xl border border-td-border bg-td-surface2/50 px-4 py-3"
        >
          <span className="flex items-center gap-2 text-[14px] font-semibold text-td-cream">
            <BarChart3 size={18} className="text-td-gold" />
            Progress Dashboard
          </span>
          <ChevronRight size={16} className="text-td-muted" />
        </button>
      )}

      <SectionHeader title="Skills Overview" />
      <SurfaceCard className="mb-4 space-y-3 p-4">
        {scores.filter((s) => s.attempted > 0).slice(0, 5).map((s) => (
          <div key={s.module}>
            <div className="mb-1 flex justify-between text-[12px]">
              <span className="text-td-muted">{MODULE_LABELS[s.module]}</span>
              <span className="font-mono text-td-cream">{s.accuracy}%</span>
            </div>
            <ProgressBar value={s.accuracy} />
          </div>
        ))}
        {scores.every((s) => s.attempted === 0) && (
          <p className="text-[13px] text-td-muted">Start a module to see skill progress.</p>
        )}
      </SurfaceCard>

      {(improved.length > 0 || needs.length > 0) && (
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          {improved.length > 0 && (
            <SurfaceCard className="p-4">
              <p className="mb-2 text-[11px] font-semibold uppercase text-td-goldsoft">Recently Improved</p>
              {improved.map((s) => (
                <p key={s.module} className="text-[13px] text-td-cream">{MODULE_LABELS[s.module]} · {s.accuracy}%</p>
              ))}
            </SurfaceCard>
          )}
          {needs.length > 0 && (
            <SurfaceCard className="p-4">
              <p className="mb-2 text-[11px] font-semibold uppercase text-red-300">Needs Attention</p>
              {needs.map((s) => (
                <p key={s.module} className="text-[13px] text-td-cream">{MODULE_LABELS[s.module]} · {s.accuracy}%</p>
              ))}
            </SurfaceCard>
          )}
        </div>
      )}

      <SectionHeader title="Training Modules" />
      <div className="grid gap-3">
        {MODULES.map(({ key, title, desc, icon: Icon, difficulty }) => {
          const mp = moduleProgress(key);
          const acc = accuracyPct(mp);
          const last = moduleLastPracticed(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onModule(key)}
              className="w-full text-left"
            >
              <SurfaceCard feature className="p-4 transition hover:border-td-gold/40">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-td-surface2 text-td-gold">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-bold text-td-cream">{title}</p>
                    <p className="mt-0.5 text-[12px] text-td-muted">{desc}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-wide">
                      <span className="rounded-full border border-td-border px-2 py-0.5 text-td-muted">{difficulty}</span>
                      {mp.attempted > 0 && (
                        <span className="rounded-full border border-td-gold/30 px-2 py-0.5 text-td-goldsoft">{acc}%</span>
                      )}
                      {last && (
                        <span className="text-td-muted">Last: {new Date(last).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={16} className="mt-1 shrink-0 text-td-muted" />
                </div>
              </SurfaceCard>
            </button>
          );
        })}
      </div>
    </div>
  );
}
