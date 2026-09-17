"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SidePotPlayerInput, SidePotQuestion } from "@/lib/training/dealer-types";
import { gradeSidePotLayers, SidePotGradeResult } from "@/lib/training/side-pot";
import { useMotionSafe } from "@/components/ui/motion";

const CHART_HEIGHT = 168;
const BAR_WIDTH = 48;
const AXIS_WIDTH = 52;

export type UserBuiltLayer = { amount: number; eligibleIds: string[]; bottom: number; top: number };

function getActivePlayers(players: SidePotPlayerInput[]) {
  return players.filter((p) => p.committed > 0);
}

function getDistinctDepths(players: SidePotPlayerInput[]): number[] {
  return [...new Set(getActivePlayers(players).map((p) => p.committed))].sort((a, b) => a - b);
}

function contributorsAtDepth(players: SidePotPlayerInput[], depth: number): SidePotPlayerInput[] {
  return getActivePlayers(players).filter((p) => p.committed >= depth);
}

export function buildUserLayers(
  players: SidePotPlayerInput[],
  boundaries: number[],
  eligibility: Record<number, string[]>
): UserBuiltLayer[] {
  const sorted = [...boundaries].sort((a, b) => a - b);
  const layers: UserBuiltLayer[] = [];
  let prev = 0;
  for (let i = 0; i < sorted.length; i++) {
    const top = sorted[i];
    const increment = top - prev;
    if (increment <= 0) continue;
    const contribs = contributorsAtDepth(players, top);
    const eligibleIds = eligibility[i] ?? [];
    layers.push({
      bottom: prev,
      top,
      amount: increment * contribs.length,
      eligibleIds,
    });
    prev = top;
  }
  return layers;
}

export function computeVisualCanSubmit(
  question: SidePotQuestion,
  boundaries: number[],
  eligibility: Record<number, string[]>
): boolean {
  const players = question.players;
  const maxDepth = Math.max(...getActivePlayers(players).map((p) => p.committed), 1);
  const sorted = [...boundaries].sort((a, b) => a - b);
  const layers = buildUserLayers(players, sorted, eligibility);
  const totalAssigned = layers.reduce((s, l) => s + l.amount, 0);
  const coverageComplete = sorted.length > 0 && sorted[sorted.length - 1] === maxDepth;
  const allBandsHaveEligible = layers.every((l) => l.eligibleIds.length > 0);
  return (
    coverageComplete &&
    Math.abs(totalAssigned - question.totalPot) <= 0.01 &&
    allBandsHaveEligible
  );
}

function formatEligible(ids: string[], players: SidePotPlayerInput[]): string {
  if (ids.length === 0) return "—";
  const byId = new Map(players.map((p) => [p.id, p.name]));
  return ids.map((id) => byId.get(id) ?? id).join(", ");
}

const CHIP_RACK =
  "repeating-linear-gradient(90deg, color-mix(in srgb, var(--color-td-gold) 55%, transparent) 0px, color-mix(in srgb, var(--color-td-gold) 55%, transparent) 3px, color-mix(in srgb, var(--color-td-surface2) 90%, transparent) 3px, color-mix(in srgb, var(--color-td-surface2) 90%, transparent) 7px)";

const CHIP_RACK_DIM =
  "repeating-linear-gradient(90deg, color-mix(in srgb, var(--color-td-muted) 35%, transparent) 0px, color-mix(in srgb, var(--color-td-muted) 35%, transparent) 3px, color-mix(in srgb, var(--color-td-surface2) 70%, transparent) 3px, color-mix(in srgb, var(--color-td-surface2) 70%, transparent) 7px)";

export function SidePotVisualBuilder({
  question,
  boundaries,
  onBoundariesChange,
  selectedBand,
  onSelectedBandChange,
  eligibility,
  onEligibilityChange,
  submitted,
  grade,
}: {
  question: SidePotQuestion;
  boundaries: number[];
  onBoundariesChange: (next: number[]) => void;
  selectedBand: number | null;
  onSelectedBandChange: (index: number | null) => void;
  eligibility: Record<number, string[]>;
  onEligibilityChange: (next: Record<number, string[]>) => void;
  submitted: boolean;
  grade: SidePotGradeResult | null;
}) {
  const motionSafe = useMotionSafe();
  const players = question.players;
  const maxDepth = useMemo(
    () => Math.max(...getActivePlayers(players).map((p) => p.committed), 1),
    [players]
  );
  const distinctDepths = useMemo(() => getDistinctDepths(players), [players]);
  const sortedPlayers = useMemo(
    () =>
      [...getActivePlayers(players)].sort(
        (a, b) => a.committed - b.committed || a.name.localeCompare(b.name)
      ),
    [players]
  );

  const sortedBoundaries = useMemo(() => [...boundaries].sort((a, b) => a - b), [boundaries]);
  const userLayers = useMemo(
    () => buildUserLayers(players, sortedBoundaries, eligibility),
    [players, sortedBoundaries, eligibility]
  );
  const totalAssigned = userLayers.reduce((s, l) => s + l.amount, 0);
  const maxDepthReached =
    sortedBoundaries.length > 0 && sortedBoundaries[sortedBoundaries.length - 1] === maxDepth;
  const allBandsHaveEligible = userLayers.every((l) => l.eligibleIds.length > 0);
  const dollarsComplete =
    maxDepthReached && Math.abs(totalAssigned - question.totalPot) <= 0.01;

  const depthToY = useCallback(
    (depth: number) => CHART_HEIGHT - (depth / maxDepth) * CHART_HEIGHT,
    [maxDepth]
  );

  const toggleBoundary = (depth: number) => {
    if (submitted) return;
    onBoundariesChange(
      boundaries.includes(depth) ? boundaries.filter((d) => d !== depth) : [...boundaries, depth]
    );
    onSelectedBandChange(null);
  };

  const toggleEligible = (playerId: string) => {
    if (submitted || selectedBand === null) return;
    const player = players.find((p) => p.id === playerId);
    if (!player || player.folded) return;
    const layer = userLayers[selectedBand];
    if (!layer) return;
    const contribs = contributorsAtDepth(players, layer.top);
    if (!contribs.some((p) => p.id === playerId)) return;

    const current = eligibility[selectedBand] ?? [];
    const next = current.includes(playerId)
      ? current.filter((id) => id !== playerId)
      : [...current, playerId];
    onEligibilityChange({ ...eligibility, [selectedBand]: next });
  };

  const isPlayerEligibleInBand = (bandIndex: number, playerId: string) =>
    (eligibility[bandIndex] ?? []).includes(playerId);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-[15px] font-bold text-td-cream">{question.title}</h3>
        <p className="mt-1 text-[13px] leading-relaxed text-td-muted">{question.description}</p>
      </div>

      <div className="rounded-xl border border-td-border/80 bg-td-surface2/30 p-3 pb-safe">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-td-muted">
          Tap axis ticks to mark layer boundaries · tap a band · tap players to set eligibility
        </p>

        <div className="mx-auto w-full max-w-[320px]">
          <div className="relative flex" style={{ height: CHART_HEIGHT + 56 }}>
            <div className="relative shrink-0" style={{ width: AXIS_WIDTH }}>
              <div className="absolute right-2 top-0 bottom-8 w-px bg-td-border/80" aria-hidden />
              {distinctDepths.map((depth) => {
                const y = depthToY(depth);
                const active = boundaries.includes(depth);
                return (
                  <button
                    key={depth}
                    type="button"
                    aria-label={`Boundary at $${depth}${active ? " (marked)" : ""}`}
                    aria-pressed={active}
                    disabled={submitted}
                    onClick={() => toggleBoundary(depth)}
                    className="absolute right-0 flex min-h-[44px] min-w-[44px] items-center justify-end pr-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-td-gold/60 disabled:cursor-default"
                    style={{ top: y - 22, height: 44 }}
                  >
                    <span
                      className={`mr-1.5 font-mono text-[11px] font-semibold ${
                        active ? "text-td-goldsoft" : "text-td-muted"
                      }`}
                    >
                      ${depth}
                    </span>
                    <span
                      className={`block h-3 w-3 rounded-full border-2 transition-colors ${
                        active
                          ? "border-td-gold bg-td-gold/30 shadow-[0_0_8px_color-mix(in_srgb,var(--color-td-gold)_40%,transparent)]"
                          : "border-td-border bg-td-surface hover:border-td-gold/50"
                      }`}
                    />
                    <span
                      className={`absolute right-[18px] h-px w-2 ${
                        active ? "bg-td-gold/70" : "bg-td-border/60"
                      }`}
                      style={{ top: 22 }}
                    />
                  </button>
                );
              })}
            </div>

            <div className="relative flex-1">
              {userLayers.map((layer, bandIndex) => {
                const yTop = depthToY(layer.top);
                const yBottom = depthToY(layer.bottom);
                const bandHeight = yBottom - yTop;
                const selected = selectedBand === bandIndex;
                return (
                  <button
                    key={`band-${layer.bottom}-${layer.top}`}
                    type="button"
                    aria-label={`Layer band $${layer.bottom} to $${layer.top}`}
                    aria-pressed={selected}
                    disabled={submitted}
                    onClick={() => onSelectedBandChange(bandIndex)}
                    className={`absolute inset-x-0 min-h-[44px] border-y transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-td-gold/60 disabled:cursor-default ${
                      selected
                        ? "border-td-gold/50 bg-td-gold/10"
                        : "border-td-border/30 bg-td-bg/20 hover:bg-td-gold/5"
                    }`}
                    style={{ top: yTop, height: Math.max(bandHeight, 44) }}
                  />
                );
              })}

              <div className="absolute inset-x-0 bottom-8 h-px bg-td-border" aria-hidden />

              <div className="absolute inset-x-0 bottom-8 flex items-end justify-center gap-3 px-1">
                {sortedPlayers.map((player) => {
                  const barHeight = (player.committed / maxDepth) * CHART_HEIGHT;
                  const folded = player.folded;
                  const bandActive = selectedBand !== null;
                  const eligibleInBand =
                    bandActive && isPlayerEligibleInBand(selectedBand, player.id);
                  const canContrib =
                    bandActive &&
                    userLayers[selectedBand] &&
                    player.committed >= userLayers[selectedBand].top;

                  return (
                    <div
                      key={player.id}
                      className="flex flex-col items-center"
                      style={{ width: BAR_WIDTH }}
                    >
                      <span className="mb-1 font-mono text-[12px] font-bold text-td-goldsoft">
                        ${player.committed}
                      </span>
                      <button
                        type="button"
                        aria-label={`${player.name}${folded ? " (folded)" : ""}`}
                        disabled={submitted || !bandActive || folded || !canContrib}
                        onClick={() => toggleEligible(player.id)}
                        className={`relative min-h-[44px] w-full rounded-t-md border transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-td-gold/60 disabled:cursor-default ${
                          folded
                            ? "border-td-border/40 opacity-40"
                            : eligibleInBand
                              ? "border-td-gold/60 shadow-[0_0_12px_color-mix(in_srgb,var(--color-td-gold)_25%,transparent)]"
                              : bandActive && canContrib
                                ? "border-td-border/60 opacity-70 hover:border-td-gold/40"
                                : "border-td-border/50"
                        }`}
                        style={{
                          height: Math.max(barHeight, 44),
                          background: folded
                            ? CHIP_RACK_DIM
                            : eligibleInBand || !bandActive
                              ? CHIP_RACK
                              : CHIP_RACK_DIM,
                        }}
                      >
                        {bandActive && canContrib && !folded && (
                          <motion.span
                            layout={motionSafe}
                            className={`absolute inset-x-1 rounded-sm ${
                              eligibleInBand ? "bg-td-gold/25" : "bg-transparent"
                            }`}
                            style={{
                              bottom: 0,
                              height: Math.max(
                                ((userLayers[selectedBand]?.top ?? 0) -
                                  (userLayers[selectedBand]?.bottom ?? 0)) /
                                  maxDepth *
                                  CHART_HEIGHT,
                                8
                              ),
                            }}
                          />
                        )}
                      </button>
                      <span
                        className={`mt-1.5 text-[12px] font-semibold ${
                          folded ? "text-td-muted" : "text-td-cream"
                        }`}
                      >
                        {player.name}
                        {folded && <span className="block text-[10px] font-normal">folded</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 rounded-xl border border-td-border/60 bg-td-bg/40 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-td-muted">Your layers</p>
        {userLayers.length === 0 ? (
          <p className="text-[13px] text-td-muted">Mark boundaries on the axis to create layers.</p>
        ) : (
          <AnimatePresence mode="popLayout">
            {userLayers.map((layer, i) => {
              const submittedLayer = grade?.layers[i];
              const showFeedback = submitted && submittedLayer;
              return (
                <motion.div
                  key={`${layer.bottom}-${layer.top}-${i}`}
                  initial={motionSafe ? { opacity: 0, x: -8 } : false}
                  animate={{ opacity: 1, x: 0 }}
                  className={`rounded-lg px-3 py-2 text-[13px] ${
                    showFeedback
                      ? submittedLayer.ok
                        ? "border border-td-goldsoft/40 bg-td-goldsoft/10 text-td-cream"
                        : "border border-td-red/40 bg-td-red/10 text-td-cream"
                      : selectedBand === i
                        ? "border border-td-gold/30 bg-td-gold/5 text-td-cream"
                        : "text-td-cream"
                  }`}
                >
                  <span className="font-mono font-semibold text-td-goldsoft">
                    Layer {i + 1}: ${layer.amount}
                  </span>
                  <span className="text-td-muted"> — eligible: </span>
                  <span>{formatEligible(layer.eligibleIds, players)}</span>
                  {showFeedback && !submittedLayer.ok && (
                    <p className="mt-1 font-mono text-[11px] text-red-300">
                      Expected ${submittedLayer.expectedAmount} — [
                      {formatEligible(submittedLayer.expectedEligibleIds, players)}]
                    </p>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        {!submitted && userLayers.length > 0 && (
          <p className="font-mono text-[11px] text-td-muted">
            Assigned ${totalAssigned} / ${question.totalPot}
            {!maxDepthReached && " · mark boundary at max stack depth"}
            {maxDepthReached && !dollarsComplete && " · boundaries don't cover all chips"}
            {dollarsComplete && !allBandsHaveEligible && " · set eligibility for each band"}
          </p>
        )}
      </div>

      {submitted && grade?.countMessage && (
        <motion.p
          initial={motionSafe ? { opacity: 0, y: 6 } : false}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-td-red/40 bg-td-red/10 px-4 py-3 text-[13px] text-red-300"
        >
          {grade.countMessage}
        </motion.p>
      )}
    </div>
  );
}

export function gradeVisualSidePotAnswer(
  question: SidePotQuestion,
  boundaries: number[],
  eligibility: Record<number, string[]>
) {
  const layers = buildUserLayers(question.players, boundaries, eligibility).map(
    ({ amount, eligibleIds }) => ({ amount, eligibleIds })
  );
  return gradeSidePotLayers(layers, question.expectedLayers);
}
