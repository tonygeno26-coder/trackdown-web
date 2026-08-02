"use client";

import { useMemo, useState } from "react";
import { parseCardList } from "@/lib/cards";
import { SavedHand } from "@/lib/hands/types";
import { PokerAction } from "@/lib/training/types";
import {
  buildDecisionPoints,
  evaluateReplayChoice,
  ReplayDecisionPoint,
} from "@/lib/hands/replay-strategy";
import CardRow from "@/components/cards/CardRow";
import CardFan from "@/components/cards/CardFan";
import { PokerActionButtons, POKER_ACTION_LABELS } from "@/components/train/gaming/PokerActionButtons";
import {
  DrillScreen,
  DrillHeader,
  DrillPromptCard,
  DrillNavigation,
  DrillResultCard,
} from "@/components/train/shared";
import { PrimaryButton, SurfaceCard } from "@/components/ui";

function boardForStreet(fullBoard: string, street: string): string {
  const cards = fullBoard.split(/[\s,]+/).filter(Boolean);
  const limit =
    street === "preflop" ? 0 : street === "flop" ? 3 : street === "turn" ? 4 : street === "river" ? 5 : cards.length;
  return cards.slice(0, limit).join(" ");
}

export default function HandReviewScreen({
  hand,
  onBack,
}: {
  hand: SavedHand;
  onBack: () => void;
}) {
  const points = useMemo(() => buildDecisionPoints(hand), [hand]);
  const [step, setStep] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<PokerAction | null>(null);
  const [dealKey, setDealKey] = useState(0);

  const current: ReplayDecisionPoint | undefined = points[step];
  const heroCards = parseCardList(hand.hero_cards);
  const isPlo = heroCards.length === 4;
  const boardStr =
    current?.board && current.board !== "—"
      ? current.board
      : boardForStreet(hand.board_cards, current?.street ?? "river");
  const boardCards = parseCardList(boardStr);
  const done = step >= points.length;

  const handleSelect = (action: PokerAction) => {
    if (!current || revealed) return;
    setSelected(action);
    setRevealed(true);
  };

  const next = () => {
    setStep((s) => s + 1);
    setRevealed(false);
    setSelected(null);
    setDealKey((k) => k + 1);
  };

  const result =
    current && selected ? evaluateReplayChoice(hand, current, selected) : null;

  return (
    <DrillScreen>
      <DrillHeader
        title="Hand Review"
        subtitle={`${hand.casino || "Hand"} · ${hand.stakes} · ${hand.hero_position} vs ${hand.villain_position}`}
        onBack={onBack}
      />

      <SurfaceCard className="mb-4 space-y-3 p-4 text-center sm:p-5">
        {isPlo ? (
          <CardFan cards={heroCards} highlighted />
        ) : (
          <CardRow cards={heroCards} size="hero" highlighted />
        )}

        {boardCards.length > 0 && (
          <div key={dealKey} className="motion-safe:animate-[fadeIn_0.35s_ease-out]">
            <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wide text-td-muted">
              Board · {current?.street ?? "river"}
            </p>
            <CardRow cards={boardCards} size="medium" overlap />
          </div>
        )}

        <p className="text-[11px] text-td-muted">
          Stack {hand.effective_stack} · Result: {hand.result}
        </p>
      </SurfaceCard>

      {!done && current && (
        <>
          <DrillPromptCard meta={current.street} prompt={current.prompt}>
            {!revealed && (
              <PokerActionButtons
                actions={current.availableActions}
                onSelect={handleSelect}
                large
              />
            )}

            {revealed && result && (
              <DrillResultCard
                correct={result.isPreferred}
                title={result.isPreferred ? "Matches recommended line" : "Alternative line"}
              >
                <p>
                  You chose <strong>{POKER_ACTION_LABELS[result.userAction]}</strong>. Recommended:{" "}
                  <strong>{POKER_ACTION_LABELS[result.recommended]}</strong>.
                </p>
                <p className="mt-2">{result.explanation}</p>
                <ul className="mt-3 space-y-1">
                  {result.factors.map((f) => (
                    <li key={f} className="flex gap-2 text-td-muted">
                      <span className="text-td-goldsoft">•</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </DrillResultCard>
            )}
          </DrillPromptCard>

          {revealed && (
            <DrillNavigation>
              <PrimaryButton type="button" onClick={next}>
                {step < points.length - 1 ? "Next Street" : "Finish Review"}
              </PrimaryButton>
            </DrillNavigation>
          )}
        </>
      )}

      {done && (
        <SurfaceCard className="space-y-4 p-6 text-center">
          <p className="font-display text-lg font-bold text-td-cream">Review Complete</p>
          <p className="text-[13px] text-td-muted">
            You reviewed {points.length} decision point{points.length === 1 ? "" : "s"} across this hand.
          </p>
          {hand.notes && (
            <p className="text-left text-[13px] italic text-td-muted">{hand.notes}</p>
          )}
          <PrimaryButton type="button" onClick={onBack}>Back to My Hands</PrimaryButton>
        </SurfaceCard>
      )}
    </DrillScreen>
  );
}
