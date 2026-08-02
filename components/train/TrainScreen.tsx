"use client";

import { useState } from "react";
import TrainLanding from "@/components/train/TrainLanding";
import TrainingProgress from "@/components/train/TrainingProgress";
import DealerTrainingHome from "@/components/train/dealer/DealerTrainingHome";
import DealingTips from "@/components/train/dealer/DealingTips";
import PotCalculationTrainer from "@/components/train/dealer/PotCalculationTrainer";
import PloPotTrainer from "@/components/train/dealer/PloPotTrainer";
import PokerTrainingHome from "@/components/train/gaming/PokerTrainingHome";
import PokerDecisionSimulator from "@/components/train/gaming/PokerDecisionSimulator";
import PotOddsTrainer from "@/components/train/gaming/PotOddsTrainer";
import MyHandsScreen from "@/components/train/my-hands/MyHandsScreen";
import HandReviewScreen from "@/components/train/my-hands/HandReviewScreen";
import BlackjackTrainingHome from "@/components/train/gaming/BlackjackTrainingHome";
import BlackjackTrainer from "@/components/train/gaming/BlackjackTrainer";
import BlackjackSettings from "@/components/train/gaming/BlackjackSettings";
import BlackjackProgress from "@/components/train/gaming/BlackjackProgress";
import SolverProLockedScreen from "@/components/train/premium/SolverProLockedScreen";
import SolverProScreen from "@/components/train/premium/SolverProScreen";
import { isSolverProUnlocked } from "@/lib/premium/entitlements";
import { SavedHand } from "@/lib/hands/types";
import { AdaptiveTopic, BlackjackTopic, PokerTopic, TrainerRoute } from "@/lib/training/adaptive-types";
import { BLACKJACK_TOPICS, POKER_TOPICS } from "@/lib/training/adaptive-topics";
import { BlackjackTrainingMode } from "@/lib/training/blackjack";

type TrainView =
  | "landing"
  | "progress"
  | "dealer-home"
  | "dealing-tips"
  | "pot-calc"
  | "plo-calc"
  | "poker-home"
  | "poker-simulator"
  | "pot-odds"
  | "my-hands"
  | "hand-review"
  | "blackjack-home"
  | "blackjack-trainer"
  | "blackjack-settings"
  | "blackjack-progress"
  | "solver-pro";

export default function TrainScreen() {
  const [view, setView] = useState<TrainView>("landing");
  const [stack, setStack] = useState<TrainView[]>([]);
  const [blackjackMode, setBlackjackMode] = useState<BlackjackTrainingMode>("random");
  const [adaptiveTopic, setAdaptiveTopic] = useState<AdaptiveTopic | undefined>();
  const [solverUnlocked, setSolverUnlocked] = useState(() => isSolverProUnlocked());
  const [reviewHand, setReviewHand] = useState<SavedHand | null>(null);

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

  const navigateAdaptive = (route: TrainerRoute) => {
    if (route.type !== "dealer-home" && route.type !== "poker-home" && route.type !== "blackjack-home") {
      setAdaptiveTopic(route.topic);
    }
    switch (route.type) {
      case "pot-calc":
        navigate("pot-calc");
        break;
      case "plo-calc":
        navigate("plo-calc");
        break;
      case "poker-simulator":
        navigate("poker-simulator");
        break;
      case "pot-odds":
        navigate("pot-odds");
        break;
      case "blackjack-trainer":
        setBlackjackMode("random");
        navigate("blackjack-trainer");
        break;
      case "dealer-home":
        navigate("dealer-home");
        break;
      case "poker-home":
        navigate("poker-home");
        break;
      case "blackjack-home":
        navigate("blackjack-home");
        break;
      default:
        navigate("landing");
    }
  };

  switch (view) {
    case "landing":
      return (
        <TrainLanding
          onDealer={() => navigate("dealer-home")}
          onPoker={() => navigate("poker-home")}
          onBlackjack={() => navigate("blackjack-home")}
          onSolverPro={() => {
            setSolverUnlocked(isSolverProUnlocked());
            navigate("solver-pro");
          }}
          onProgress={() => navigate("progress")}
          onAdaptivePractice={navigateAdaptive}
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
      return <PotCalculationTrainer onBack={goBack} focusTopic={adaptiveTopic ?? "pot_calculations"} />;
    case "plo-calc":
      return <PloPotTrainer onBack={goBack} focusTopic={adaptiveTopic ?? "plo_pot_calculations"} />;
    case "poker-home":
      return (
        <PokerTrainingHome
          onBack={goBack}
          onModule={(key) => {
            if (key === "simulator") navigate("poker-simulator");
            else if (key === "potodds") navigate("pot-odds");
            else if (key === "my-hands") navigate("my-hands");
            else if (key === "solver-pro") {
              setSolverUnlocked(isSolverProUnlocked());
              navigate("solver-pro");
            }
          }}
        />
      );
    case "poker-simulator":
      return (
        <PokerDecisionSimulator
          onBack={goBack}
          focusTopic={
            adaptiveTopic && (POKER_TOPICS as string[]).includes(adaptiveTopic)
              ? (adaptiveTopic as PokerTopic)
              : undefined
          }
        />
      );
    case "pot-odds":
      return (
        <PotOddsTrainer
          onBack={goBack}
          focusTopic={
            adaptiveTopic && (POKER_TOPICS as string[]).includes(adaptiveTopic)
              ? (adaptiveTopic as PokerTopic)
              : "bet_sizing"
          }
        />
      );
    case "my-hands":
      return (
        <MyHandsScreen
          onBack={goBack}
          onReview={(hand) => {
            setReviewHand(hand);
            navigate("hand-review");
          }}
        />
      );
    case "hand-review":
      return reviewHand ? (
        <HandReviewScreen hand={reviewHand} onBack={goBack} />
      ) : (
        <MyHandsScreen onBack={goBack} onReview={() => {}} />
      );
    case "blackjack-home":
      return (
        <BlackjackTrainingHome
          onBack={goBack}
          onMode={(mode) => {
            setBlackjackMode(mode);
            navigate("blackjack-trainer");
          }}
          onSettings={() => navigate("blackjack-settings")}
          onProgress={() => navigate("blackjack-progress")}
        />
      );
    case "blackjack-trainer":
      return (
        <BlackjackTrainer
          mode={blackjackMode}
          onBack={goBack}
          focusTopic={
            adaptiveTopic && (BLACKJACK_TOPICS as string[]).includes(adaptiveTopic)
              ? (adaptiveTopic as BlackjackTopic)
              : undefined
          }
        />
      );
    case "blackjack-settings":
      return <BlackjackSettings onBack={goBack} />;
    case "blackjack-progress":
      return <BlackjackProgress onBack={goBack} />;
    case "solver-pro":
      return solverUnlocked ? (
        <SolverProScreen onBack={goBack} />
      ) : (
        <SolverProLockedScreen onBack={goBack} unlocked={false} />
      );
    default:
      return null;
  }
}
