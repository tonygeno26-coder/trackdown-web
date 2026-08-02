"use client";

import { PokerAction } from "@/lib/training/types";
import { SecondaryButton } from "@/components/ui";

const ACTION_LABELS: Record<PokerAction, string> = {
  fold: "Fold",
  call: "Call",
  check: "Check",
  bet: "Bet",
  raise: "Raise",
};

export function PokerActionButtons({
  actions,
  labels,
  onSelect,
  disabled,
  large,
}: {
  actions: PokerAction[];
  labels?: Partial<Record<PokerAction, string>>;
  onSelect: (action: PokerAction) => void;
  disabled?: boolean;
  large?: boolean;
}) {
  return (
    <div className={`grid grid-cols-2 gap-2 ${large ? "gap-3" : ""}`}>
      {actions.map((action) => (
        <SecondaryButton
          key={action}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(action)}
          className={`font-bold uppercase tracking-wide ${
            large ? "min-h-[56px] text-[14px]" : "py-4 text-[13px]"
          }`}
        >
          {labels?.[action] ?? ACTION_LABELS[action]}
        </SecondaryButton>
      ))}
    </div>
  );
}

export { ACTION_LABELS as POKER_ACTION_LABELS };
