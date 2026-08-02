"use client";

import { BriefcaseBusiness, Spade } from "lucide-react";
import { motion } from "framer-motion";

export default function StartActivityCards({
  onStartDealer,
  onStartGaming,
  disabled,
}: {
  onStartDealer: () => void;
  onStartGaming: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-3">
      <motion.button
        whileTap={{ scale: 0.985 }}
        onClick={onStartDealer}
        disabled={disabled}
        className="flex w-full items-center gap-4 rounded-td-lg border border-td-gold/30 bg-td-surface/90 px-5 py-5 text-left shadow-td-card transition-colors hover:border-td-gold/50 disabled:opacity-45"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-td-gold/15 text-td-gold">
          <BriefcaseBusiness size={22} strokeWidth={1.75} />
        </span>
        <span>
          <span className="block font-display text-[15px] font-bold uppercase tracking-[1px] text-td-cream">
            Start Dealer Shift
          </span>
          <span className="mt-1 block text-[13px] leading-relaxed text-td-muted">
            Track downs, tips, breaks and shift earnings
          </span>
        </span>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.985 }}
        onClick={onStartGaming}
        disabled={disabled}
        className="flex w-full items-center gap-4 rounded-td-lg border border-td-border/90 bg-td-surface/90 px-5 py-5 text-left shadow-td-card transition-colors hover:border-td-goldsoft/30 disabled:opacity-45"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-td-goldsoft/10 text-td-goldsoft">
          <Spade size={22} strokeWidth={1.75} />
        </span>
        <span>
          <span className="block font-display text-[15px] font-bold uppercase tracking-[1px] text-td-cream">
            Start Gaming Session
          </span>
          <span className="mt-1 block text-[13px] leading-relaxed text-td-muted">
            Track poker, table games and session results
          </span>
        </span>
      </motion.button>
    </div>
  );
}
