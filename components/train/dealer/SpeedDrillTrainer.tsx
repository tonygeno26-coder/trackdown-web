"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SpeedDrillMode, SpeedDrillQuestion, SpeedDrillPersonalBest } from "@/lib/training/dealer-types";
import { pickSpeedQuestions, gradeSpeedAnswer } from "@/lib/training/speed-drill-questions";
import { loadTrainingProgress, saveTrainingProgress, recordSpeedDrillSession } from "@/lib/training/progress";
import {
  DrillScreen,
  DrillHeader,
  DrillPromptCard,
  DrillResultCard,
  DrillNavigation,
  DrillProgressBar,
} from "@/components/train/shared";
import { TrainNumericInput } from "@/components/train/TrainingUi";
import { PrimaryButton, SurfaceCard } from "@/components/ui";

const MODES: { key: SpeedDrillMode; label: string; seconds?: number; questions?: number }[] = [
  { key: "60s", label: "60 sec", seconds: 60 },
  { key: "120s", label: "2 min", seconds: 120 },
  { key: "5q", label: "5 questions", questions: 5 },
  { key: "10q", label: "10 questions", questions: 10 },
];

export default function SpeedDrillTrainer({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<SpeedDrillMode | null>(null);
  const [questions, setQuestions] = useState<SpeedDrillQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const startMs = useRef(Date.now());
  const sessionStart = useRef(Date.now());

  const question = questions[idx];
  const progress = loadTrainingProgress().dealer.speed;
  const best = mode ? progress.personalBests.find((b: SpeedDrillPersonalBest) => b.mode === mode) : undefined;

  const startMode = (m: SpeedDrillMode) => {
    const cfg = MODES.find((x) => x.key === m)!;
    const count = cfg.questions ?? 999;
    setQuestions(pickSpeedQuestions(count === 999 ? 20 : count));
    setMode(m);
    setIdx(0);
    setAnswer("");
    setSubmitted(false);
    setScore(0);
    setFinished(false);
    setRunning(true);
    setTimeLeft(cfg.seconds ?? 0);
    sessionStart.current = Date.now();
    startMs.current = Date.now();
  };

  const finishSession = useCallback(() => {
    if (!mode || finished) return;
    setFinished(true);
    setRunning(false);
    const ms = Date.now() - sessionStart.current;
    saveTrainingProgress(
      recordSpeedDrillSession(loadTrainingProgress(), {
        correct: score,
        attempted: idx + (submitted ? 1 : 0),
        mode,
        ms,
      })
    );
  }, [mode, finished, score, idx, submitted]);

  useEffect(() => {
    if (!running || !mode) return;
    const cfg = MODES.find((x) => x.key === mode)!;
    if (cfg.questions && idx >= cfg.questions) {
      finishSession();
      return;
    }
    if (!cfg.seconds) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          finishSession();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [running, mode, idx, finishSession]);

  useEffect(() => {
    const onBlur = () => setRunning(false);
    const onFocus = () => {
      if (mode && !finished) setRunning(true);
    };
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, [mode, finished]);

  const submit = () => {
    if (!question) return;
    const val = parseFloat(answer);
    const ok = gradeSpeedAnswer(question, val);
    setCorrect(ok);
    setSubmitted(true);
    if (ok) setScore((s) => s + 1);
  };

  const next = () => {
    const cfg = MODES.find((x) => x.key === mode)!;
    if (cfg.questions && idx + 1 >= cfg.questions) {
      finishSession();
      return;
    }
    if (idx + 1 >= questions.length) {
      finishSession();
      return;
    }
    setIdx((i) => i + 1);
    setAnswer("");
    setSubmitted(false);
    startMs.current = Date.now();
  };

  if (!mode) {
    return (
      <DrillScreen>
        <DrillHeader title="Speed Challenges" subtitle="Personal bests tracked separately." onBack={onBack} />
        <div className="grid gap-2">
          {MODES.map(({ key, label }) => {
            const pb = progress.personalBests.find((b: SpeedDrillPersonalBest) => b.mode === key);
            return (
              <PrimaryButton key={key} type="button" onClick={() => startMode(key)}>
                {label}
                {pb && <span className="ml-2 text-[11px] opacity-70">Best: {pb.score}</span>}
              </PrimaryButton>
            );
          })}
        </div>
      </DrillScreen>
    );
  }

  if (finished) {
    return (
      <DrillScreen>
        <DrillHeader title="Speed Challenge" onBack={onBack} />
        <SurfaceCard className="p-6 text-center">
          <p className="font-display text-[24px] font-bold text-td-goldsoft">{score}</p>
          <p className="text-[14px] text-td-muted">correct answers</p>
          {best && <p className="mt-2 text-[12px] text-td-muted">Personal best: {best.score}</p>}
        </SurfaceCard>
        <PrimaryButton type="button" onClick={() => setMode(null)}>Choose Mode</PrimaryButton>
      </DrillScreen>
    );
  }

  if (!question) return null;

  const cfg = MODES.find((x) => x.key === mode)!;

  return (
    <DrillScreen>
      <DrillHeader
        title="Speed Challenge"
        subtitle={cfg.seconds ? `${timeLeft}s · Score ${score}` : `${idx + 1}/${cfg.questions} · Score ${score}`}
        onBack={onBack}
      />
      {cfg.questions && <DrillProgressBar value={idx + 1} max={cfg.questions} />}
      <DrillPromptCard meta={question.type.replace(/_/g, " ")} prompt={question.prompt} />
      {!submitted ? (
        <TrainNumericInput label="Answer" value={answer} onChange={setAnswer} prefix={question.type === "side_pot_count" ? "" : "$"} />
      ) : (
        <DrillResultCard correct={correct} title={correct ? "Correct!" : "Incorrect"}>
          <p>Answer: <span className="font-mono text-td-goldsoft">{question.correctAnswer}</span></p>
        </DrillResultCard>
      )}
      <DrillNavigation>
        {!submitted ? (
          <PrimaryButton type="button" onClick={submit} disabled={!answer.trim()}>Submit</PrimaryButton>
        ) : (
          <PrimaryButton type="button" onClick={next}>Next</PrimaryButton>
        )}
      </DrillNavigation>
    </DrillScreen>
  );
}
