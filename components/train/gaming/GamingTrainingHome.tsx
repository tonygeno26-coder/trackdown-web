"use client";

import { Brain, Percent, Target, Layers, ArrowUpCircle, Eye, ClipboardCheck } from "lucide-react";
import { TrainCard, TrainHeader, TrainModuleGrid } from "@/components/train/TrainingUi";

const MODULES = [
  { key: "simulator", title: "Poker Decision Simulator", desc: "Solver-style training scenarios with recommended frequencies.", icon: Brain, ready: true },
  { key: "potodds", title: "Pot Odds", desc: "Calculate required equity for profitable calls.", icon: Percent, ready: true },
  { key: "equity", title: "Equity Estimation", desc: "Estimate hand equity vs ranges.", icon: Target, ready: false },
  { key: "preflop", title: "Preflop Ranges", desc: "Study opening and defending ranges.", icon: Layers, ready: false },
  { key: "pushfold", title: "Push/Fold", desc: "Short-stack tournament decisions.", icon: ArrowUpCircle, ready: false },
  { key: "handreading", title: "Hand Reading", desc: "Narrow villain ranges street by street.", icon: Eye, ready: false },
  { key: "review", title: "Session Review", desc: "Quiz yourself on past hand reviews.", icon: ClipboardCheck, ready: false },
] as const;

export default function GamingTrainingHome({
  onBack,
  onModule,
}: {
  onBack: () => void;
  onModule: (key: string) => void;
}) {
  return (
    <div className="pb-28">
      <TrainHeader title="Gaming Training" subtitle="Poker-focused decision and odds practice." onBack={onBack} />
      <TrainModuleGrid>
        {MODULES.map(({ key, title, desc, icon: Icon, ready }) => (
          <TrainCard
            key={key}
            title={title}
            description={desc}
            icon={<Icon size={20} strokeWidth={1.75} />}
            onClick={ready ? () => onModule(key) : undefined}
            disabled={!ready}
            badge={ready ? undefined : "Coming Soon"}
          />
        ))}
      </TrainModuleGrid>
    </div>
  );
}
