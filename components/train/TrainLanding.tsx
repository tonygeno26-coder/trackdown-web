"use client";

import { GraduationCap, Spade } from "lucide-react";
import { TrainCard, TrainHeader } from "@/components/train/TrainingUi";

export default function TrainLanding({
  onDealerTraining,
  onPlayerTraining,
}: {
  onDealerTraining: () => void;
  onPlayerTraining: () => void;
}) {
  return (
    <div className="pb-28">
      <TrainHeader
        title="Train"
        subtitle="Dealer procedures and player skill development."
      />

      <div className="space-y-4">
        <TrainCard
          title="Dealer Training"
          description="Hold'em, Omaha, and mixed game dealing checklists plus dealer academy drills."
          icon={<GraduationCap size={22} strokeWidth={1.75} />}
          onClick={onDealerTraining}
        />
        <TrainCard
          title="Player Training"
          description="Poker decisions, pot odds, blackjack, hand review, and Solver Pro."
          icon={<Spade size={22} strokeWidth={1.75} />}
          onClick={onPlayerTraining}
        />
      </div>
    </div>
  );
}
