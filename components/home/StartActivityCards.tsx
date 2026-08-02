"use client";

import { BriefcaseBusiness, Spade } from "lucide-react";
import { motion } from "framer-motion";
import { SurfaceCard } from "@/components/ui";

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
        className="w-full text-left disabled:opacity-45"
      >
        <SurfaceCard feature className="flex items-center gap-4 px-5 py-5 transition-colors hover:border-td-gold/40">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-td-gold/15 text-td-gold">
            <BriefcaseBusiness size={22} strokeWidth={1.75} aria-hidden />
          </span>
          <span>
            <span className="block font-display text-[15px] font-bold uppercase tracking-[1px] text-td-cream">
              Start Dealer Shift
            </span>
            <span className="mt-1 block text-[13px] leading-relaxed text-td-muted">
              Track downs, tips, breaks and shift earnings
            </span>
          </span>
        </SurfaceCard>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.985 }}
        onClick={onStartGaming}
        disabled={disabled}
        className="w-full text-left disabled:opacity-45"
      >
        <SurfaceCard feature className="flex items-center gap-4 px-5 py-5 transition-colors hover:border-td-goldsoft/30">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-td-goldsoft/10 text-td-goldsoft">
            <Spade size={22} strokeWidth={1.75} aria-hidden />
          </span>
          <span>
            <span className="block font-display text-[15px] font-bold uppercase tracking-[1px] text-td-cream">
              Start Gaming Session
            </span>
            <span className="mt-1 block text-[13px] leading-relaxed text-td-muted">
              Track poker, table games and session results
            </span>
          </span>
        </SurfaceCard>
      </motion.button>
    </div>
  );
}
