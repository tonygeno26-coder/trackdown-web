"use client";

import {
  BookOpen,
  Calculator,
  Layers,
  ClipboardList,
  Eye,
  Zap,
  HelpCircle,
} from "lucide-react";
import { TrainCard, TrainHeader, TrainModuleGrid } from "@/components/train/TrainingUi";

const MODULES = [
  { key: "tips", title: "Dealing Tips", desc: "Short lessons on pitching, pace, and procedures.", icon: BookOpen, ready: true },
  { key: "pot", title: "Pot Calculation", desc: "NLHE pot, call, and raise math.", icon: Calculator, ready: true },
  { key: "plo", title: "PLO Pot Calculation", desc: "Pot-limit Omaha betting sequences.", icon: Layers, ready: true },
  { key: "side", title: "Side Pots", desc: "Multi-way all-in pot breakdowns.", icon: Calculator, ready: false },
  { key: "proc", title: "Procedures", desc: "Cash vs tournament procedure drills.", icon: ClipboardList, ready: false },
  { key: "board", title: "Board Reading", desc: "Best hand and pot award practice.", icon: Eye, ready: false },
  { key: "speed", title: "Speed Drills", desc: "Timed dealing and counting exercises.", icon: Zap, ready: false },
  { key: "quiz", title: "Quiz Mode", desc: "Mixed dealer knowledge quizzes.", icon: HelpCircle, ready: false },
] as const;

export default function DealerTrainingHome({
  onBack,
  onModule,
}: {
  onBack: () => void;
  onModule: (key: string) => void;
}) {
  return (
    <div className="pb-28">
      <TrainHeader title="Dealer Training" subtitle="Build accuracy before and during your shift." onBack={onBack} />
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
