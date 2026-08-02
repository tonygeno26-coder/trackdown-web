"use client";

import { useState } from "react";
import TrainLanding from "@/components/train/TrainLanding";
import TrainingProgress from "@/components/train/TrainingProgress";
import DealerTrainingHome from "@/components/train/dealer/DealerTrainingHome";
import DealingTips from "@/components/train/dealer/DealingTips";
import PotCalculationTrainer from "@/components/train/dealer/PotCalculationTrainer";
import PloPotTrainer from "@/components/train/dealer/PloPotTrainer";
import GamingTrainingHome from "@/components/train/gaming/GamingTrainingHome";
import PokerDecisionSimulator from "@/components/train/gaming/PokerDecisionSimulator";
import PotOddsTrainer from "@/components/train/gaming/PotOddsTrainer";

type TrainView =
  | "landing"
  | "progress"
  | "dealer-home"
  | "dealing-tips"
  | "pot-calc"
  | "plo-calc"
  | "gaming-home"
  | "poker-simulator"
  | "pot-odds";

export default function TrainScreen() {
  const [view, setView] = useState<TrainView>("landing");
  const [stack, setStack] = useState<TrainView[]>([]);

  const navigate = (next: TrainView) => {
    setStack((s) => [...s, view]);
    setView(next);
  };

  const goBack = () => {
    setStack((s) => {
      const prev = s[s.length - 1] ?? "landing";
      setView(prev);
      return s.slice(0, -1);
    });
  };

  switch (view) {
    case "landing":
      return (
        <TrainLanding
          onDealer={() => navigate("dealer-home")}
          onGaming={() => navigate("gaming-home")}
          onProgress={() => navigate("progress")}
        />
      );
    case "progress":
      return <TrainingProgress onBack={goBack} />;
    case "dealer-home":
      return (
        <DealerTrainingHome
          onBack={goBack}
          onModule={(key) => {
            if (key === "tips") navigate("dealing-tips");
            else if (key === "pot") navigate("pot-calc");
            else if (key === "plo") navigate("plo-calc");
          }}
        />
      );
    case "dealing-tips":
      return <DealingTips onBack={goBack} />;
    case "pot-calc":
      return <PotCalculationTrainer onBack={goBack} />;
    case "plo-calc":
      return <PloPotTrainer onBack={goBack} />;
    case "gaming-home":
      return (
        <GamingTrainingHome
          onBack={goBack}
          onModule={(key) => {
            if (key === "simulator") navigate("poker-simulator");
            else if (key === "potodds") navigate("pot-odds");
          }}
        />
      );
    case "poker-simulator":
      return <PokerDecisionSimulator onBack={goBack} />;
    case "pot-odds":
      return <PotOddsTrainer onBack={goBack} />;
    default:
      return null;
  }
}
