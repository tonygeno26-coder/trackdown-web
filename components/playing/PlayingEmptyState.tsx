"use client";

import { motion } from "framer-motion";
import { Plus, Spade, TrendingUp, DollarSign, History, Trophy } from "lucide-react";
import {
  PlayingCard,
  PrimaryPlayingButton,
  playingFadeIn,
  playingStagger,
} from "@/components/playing/PlayingUi";

const features = [
  {
    icon: TrendingUp,
    title: "Track Results",
    description: "Log wins, losses, and expenses.",
    accent: "text-td-gold",
  },
  {
    icon: DollarSign,
    title: "Hourly Rate",
    description: "See your real-time win rate.",
    accent: "text-td-goldsoft",
  },
  {
    icon: History,
    title: "Session History",
    description: "Review previous sessions.",
    accent: "text-td-gold",
  },
  {
    icon: Trophy,
    title: "Improve Game",
    description: "Analyze long-term performance.",
    accent: "text-td-goldsoft",
  },
];

export default function PlayingEmptyState({ onStart }: { onStart: () => void }) {
  return (
    <motion.div variants={playingStagger} initial="initial" animate="animate" className="space-y-8">
      <motion.div variants={playingFadeIn}>
        <PlayingCard className="relative overflow-hidden px-7 py-14 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,color-mix(in_srgb,#c8202f_14%,transparent),transparent_62%)]"
          />

          <motion.div
            animate={{ scale: [1, 1.04, 1], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-td-gold/25 bg-td-surface2/60 shadow-td-glow-sm"
          >
            <Spade size={42} strokeWidth={1.5} className="text-td-gold" />
          </motion.div>

          <h2 className="relative font-display text-[26px] font-extrabold uppercase tracking-[3px] text-td-cream">
            No Session Running
          </h2>
          <p className="relative mx-auto mt-4 max-w-[300px] text-[14px] leading-relaxed text-td-muted">
            Track buy-ins, cash-outs, and your hourly win rate while you play.
          </p>

          <div className="relative mt-10">
            <PrimaryPlayingButton onClick={onStart} className="mx-auto max-w-[340px]">
              <Plus size={18} strokeWidth={2.5} />
              Start Playing Session
            </PrimaryPlayingButton>
          </div>
        </PlayingCard>
      </motion.div>

      <motion.div variants={playingFadeIn} className="grid grid-cols-2 gap-3.5">
        {features.map((feature) => (
          <motion.div
            key={feature.title}
            variants={playingFadeIn}
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
          >
            <PlayingCard className="flex h-full flex-col gap-3 px-4 py-5">
              <feature.icon size={20} strokeWidth={1.75} className={feature.accent} />
              <div>
                <h3 className="font-display text-[13px] font-bold uppercase tracking-[1px] text-td-cream">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-td-muted">
                  {feature.description}
                </p>
              </div>
            </PlayingCard>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
