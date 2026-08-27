"use client";

import { useState } from "react";
import TrainLanding from "@/components/train/TrainLanding";
import TrainingProgress from "@/components/train/TrainingProgress";
import DealerTrainingLanding from "@/components/train/dealer/DealerTrainingLanding";
import DealingProcedureChecklist from "@/components/train/dealer/DealingProcedureChecklist";
import DealerAcademyHome from "@/components/train/dealer/DealerAcademyHome";
import DealerProgressDashboard from "@/components/train/dealer/DealerProgressDashboard";
import DealingTips from "@/components/train/dealer/DealingTips";
import PotCalculationTrainer from "@/components/train/dealer/PotCalculationTrainer";
import PloPotTrainer from "@/components/train/dealer/PloPotTrainer";
import SidePotTrainer from "@/components/train/dealer/SidePotTrainer";
import ProcedureScenarioTrainer from "@/components/train/dealer/ProcedureScenarioTrainer";
import ProcedureQuizTrainer from "@/components/train/dealer/ProcedureQuizTrainer";
import BoardReadingTrainer from "@/components/train/dealer/BoardReadingTrainer";
import HiLoTrainer from "@/components/train/dealer/HiLoTrainer";
import SpeedDrillTrainer from "@/components/train/dealer/SpeedDrillTrainer";
import PlayerTrainingHome from "@/components/train/player/PlayerTrainingHome";
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
import { DealerModuleKey } from "@/lib/training/dealer-types";
import { DealingProcedureGame } from "@/lib/training/dealing-procedures";

type TrainView =
  | "landing"
  | "dealer-training"
  | "procedure-checklist"
  | "player-training"
  | "progress"
  | "dealer-home"
  | "dealer-dashboard"
  | "dealing-tips"
  | "pot-calc"
  | "plo-calc"
  | "side-pot"
  | "misdeal"
  | "tournament-quiz"
  | "cash-quiz"
  | "board-reading"
  | "hi-lo"
  | "speed-drill"
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
  const [procedureGame, setProcedureGame] = useState<DealingProcedureGame>("holdem");
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

  const openProcedureChecklist = (game: DealingProcedureGame) => {
    setProcedureGame(game);
    navigate("procedure-checklist");
  };

  const navigateDealerModule = (key: DealerModuleKey) => {
    const map: Record<DealerModuleKey, TrainView> = {
      tips: "dealing-tips",
      pot: "pot-calc",
      plo: "plo-calc",
      "side-pot": "side-pot",
      misdeal: "misdeal",
      "tournament-quiz": "tournament-quiz",
      "cash-quiz": "cash-quiz",
      "board-reading": "board-reading",
      "hi-lo": "hi-lo",
      speed: "speed-drill",
    };
    navigate(map[key]);
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
      case "side-pot":
        navigate("side-pot");
        break;
      case "misdeal":
        navigate("misdeal");
        break;
      case "tournament-quiz":
        navigate("tournament-quiz");
        break;
      case "cash-quiz":
        navigate("cash-quiz");
        break;
      case "board-reading":
        navigate("board-reading");
        break;
      case "hi-lo":
        navigate("hi-lo");
        break;
      case "speed-drill":
        navigate("speed-drill");
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
          onDealerTraining={() => navigate("dealer-training")}
          onPlayerTraining={() => navigate("player-training")}
        />
      );
    case "dealer-training":
      return (
        <DealerTrainingLanding
          onBack={goBack}
          onProcedureChecklist={openProcedureChecklist}
          onAcademy={() => navigate("dealer-home")}
          onAdaptivePractice={navigateAdaptive}
        />
      );
    case "procedure-checklist":
      return <DealingProcedureChecklist game={procedureGame} onBack={goBack} />;
    case "player-training":
      return (
        <PlayerTrainingHome
          onBack={goBack}
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
        <DealerAcademyHome
          onBack={goBack}
          onModule={navigateDealerModule}
          onDashboard={() => navigate("dealer-dashboard")}
        />
      );
    case "dealer-dashboard":
      return <DealerProgressDashboard onBack={goBack} />;
    case "dealing-tips":
      return <DealingTips onBack={goBack} />;
    case "pot-calc":
      return <PotCalculationTrainer onBack={goBack} focusTopic={adaptiveTopic ?? "pot_calculations"} />;
    case "plo-calc":
      return <PloPotTrainer onBack={goBack} focusTopic={adaptiveTopic ?? "plo_pot_calculations"} />;
    case "side-pot":
      return <SidePotTrainer onBack={goBack} />;
    case "misdeal":
      return <ProcedureScenarioTrainer onBack={goBack} />;
    case "tournament-quiz":
      return <ProcedureQuizTrainer onBack={goBack} quizType="tournament" />;
    case "cash-quiz":
      return <ProcedureQuizTrainer onBack={goBack} quizType="cash" />;
    case "board-reading":
      return <BoardReadingTrainer onBack={goBack} />;
    case "hi-lo":
      return <HiLoTrainer onBack={goBack} />;
    case "speed-drill":
      return <SpeedDrillTrainer onBack={goBack} />;
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
