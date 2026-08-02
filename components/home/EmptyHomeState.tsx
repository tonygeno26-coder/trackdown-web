"use client";

import { Spade } from "lucide-react";
import { motion } from "framer-motion";
import TrackdownHeader from "@/components/TrackdownHeader";
import StartActivityCards from "@/components/home/StartActivityCards";

export default function EmptyHomeState({
  onStartDealer,
  onStartGaming,
  disabled,
}: {
  onStartDealer: () => void;
  onStartGaming: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="flex min-h-[calc(100vh-140px)] flex-col"
    >
      <TrackdownHeader showToday compact />

      <div className="flex flex-1 flex-col justify-between pt-4 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45 }}
          className="flex flex-col items-center px-4 pt-10 text-center"
        >
          <motion.div
            animate={{ opacity: [0.65, 1, 0.65] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-td-border/80 bg-td-surface/60 shadow-td-card"
          >
            <Spade size={28} className="text-td-muted" strokeWidth={1.5} aria-hidden />
          </motion.div>
          <h2 className="font-display text-xl font-bold uppercase tracking-[2px] text-td-cream">
            What are you doing today?
          </h2>
          <p className="mt-3 max-w-[280px] text-[14px] leading-relaxed text-td-muted">
            Start a dealer shift or log a gaming session to track your night.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
        >
          <StartActivityCards
            onStartDealer={onStartDealer}
            onStartGaming={onStartGaming}
            disabled={disabled}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
