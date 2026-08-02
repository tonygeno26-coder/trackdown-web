"use client";

import { useMemo, useState } from "react";
import { parseCardList } from "@/lib/cards";
import CardRow from "@/components/cards/CardRow";
import { SavedHand } from "@/lib/hands/types";
import { PokerAction } from "@/lib/training/types";
import {
  buildDecisionPoints,
  evaluateReplayChoice,
  ReplayDecisionPoint,
} from "@/lib/hands/replay-strategy";
import {
  TrainFeedback,
  TrainHeader,
  TrainQuestionCard,
  PrimaryPlayingButton,
  SecondaryPlayingButton,
} from "@/components/train/TrainingUi";
import { PlayingCard } from "@/components/playing/PlayingUi";

const ACTION_LABELS: Record<PokerAction, string> = {
  fold: "Fold",
  check: "Check",
  call: "Call",
  bet: "Bet",
  raise: "Raise",
};

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

  const current: ReplayDecisionPoint | undefined = points[step];
  const heroCards = parseCardList(hand.hero_cards);
  const boardCards = parseCardList(current?.board && current.board !== "—" ? current.board : hand.board_cards);
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
  };

  const result =
    current && selected ? evaluateReplayChoice(hand, current, selected) : null;

  return (
    <div className="pb-28">
      <TrainHeader
        title="Hand Review"
        subtitle={`${hand.casino || "Hand"} · ${hand.stakes} · ${hand.hero_position} vs ${hand.villain_position}`}
        onBack={onBack}
      />

      <PlayingCard className="mb-4 space-y-3 p-5 text-center">
        <CardRow cards={heroCards} size="medium" highlighted />
        {boardCards.length > 0 && (
          <>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-td-muted">Board</p>
            <CardRow cards={boardCards} size="medium" />
          </>
        )}
        <p className="text-[12px] text-td-muted">
          Stack {hand.effective_stack} · Result: {hand.result}
        </p>
      </PlayingCard>

      {!done && current && (
        <>
          <TrainQuestionCard>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-td-goldsoft">
              {current.street}
            </p>
            <p className="text-[15px] font-semibold text-td-cream">{current.prompt}</p>

            {!revealed && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                {current.availableActions.map((action) => (
                  <SecondaryPlayingButton key={action} type="button" onClick={() => handleSelect(action)}>
                    {ACTION_LABELS[action]}
                  </SecondaryPlayingButton>
                ))}
              </div>
            )}

            {revealed && result && (
              <TrainFeedback
                correct={result.isPreferred}
                title={result.isPreferred ? "Matches recommended line" : "Alternative line"}
              >
                <p>
                  You chose <strong>{ACTION_LABELS[result.userAction]}</strong>. Recommended:{" "}
                  <strong>{ACTION_LABELS[result.recommended]}</strong>.
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
              </TrainFeedback>
            )}
          </TrainQuestionCard>

          {revealed && (
            <div className="mt-4">
              <PrimaryPlayingButton type="button" onClick={next}>
                {step < points.length - 1 ? "Next Street" : "Finish Review"}
              </PrimaryPlayingButton>
            </div>
          )}
        </>
      )}

      {done && (
        <PlayingCard className="space-y-4 p-6 text-center">
          <p className="font-display text-lg font-bold text-td-cream">Review Complete</p>
          <p className="text-[13px] text-td-muted">
            You reviewed {points.length} decision point{points.length === 1 ? "" : "s"} across this hand.
          </p>
          {hand.notes && (
            <p className="text-left text-[13px] italic text-td-muted">{hand.notes}</p>
          )}
          <PrimaryPlayingButton type="button" onClick={onBack}>Back to My Hands</PrimaryPlayingButton>
        </PlayingCard>
      )}
    </div>
  );
}
