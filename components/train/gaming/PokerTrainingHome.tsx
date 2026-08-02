"use client";

import { Brain, Percent, Hand, Sparkles } from "lucide-react";
import { TrainCard, TrainHeader, TrainModuleGrid } from "@/components/train/TrainingUi";

const MODULES = [
  {
    key: "simulator",
    title: "Decision Trainer",
    desc: "Practice decisions using curated solver-style scenarios.",
    icon: Brain,
    ready: true,
  },
  {
    key: "potodds",
    title: "Pot Odds",
    desc: "Calculate required equity for profitable calls.",
    icon: Percent,
    ready: true,
  },
  {
    key: "my-hands",
    title: "My Hands",
    desc: "Save, search and review hands from your sessions.",
    icon: Hand,
    ready: true,
  },
  {
    key: "solver-pro",
    title: "Solver Pro",
    desc: "Advanced range analysis and GTO study tools.",
    icon: Sparkles,
    ready: true,
    premium: true,
  },
] as const;

export default function PokerTrainingHome({
  onBack,
  onModule,
}: {
  onBack: () => void;
  onModule: (key: string) => void;
}) {
  return (
    <div className="pb-28">
      <TrainHeader
        title="Poker Training"
        subtitle="Decision practice, odds, hand review and premium solver tools."
        onBack={onBack}
      />
      <TrainModuleGrid>
        {MODULES.map((mod) => {
          const { key, title, desc, icon: Icon, ready } = mod;
          const premium = "premium" in mod && mod.premium;
          return (
          <TrainCard
            key={key}
            title={title}
            description={desc}
            icon={<Icon size={20} strokeWidth={1.75} />}
            onClick={ready ? () => onModule(key) : undefined}
            disabled={!ready}
            badge={premium ? "Premium" : undefined}
          />
          );
        })}
      </TrainModuleGrid>
    </div>
  );
}
