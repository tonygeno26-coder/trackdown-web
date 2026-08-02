"use client";

import { useState } from "react";
import { QuizMode, ProcedureQuizQuestion } from "@/lib/training/dealer-types";
import { TOURNAMENT_QUIZ_QUESTIONS, pickTournamentQuestions } from "@/lib/training/tournament-procedure-quiz";
import { CASH_GAME_QUIZ_QUESTIONS, pickCashQuestions } from "@/lib/training/cash-game-procedure-quiz";
import { recordAdaptiveAttempt } from "@/lib/training/adaptive-storage";
import {
  loadTrainingProgress,
  saveTrainingProgress,
  recordTournamentQuizResult,
  recordCashQuizResult,
} from "@/lib/training/progress";
import {
  DrillScreen,
  DrillHeader,
  DrillPromptCard,
  DrillResultCard,
  DrillNavigation,
  DrillProgressBar,
} from "@/components/train/shared";
import { ChoiceButton, PrimaryButton } from "@/components/ui";

type QuizType = "tournament" | "cash";

const MODES: { key: QuizMode; label: string }[] = [
  { key: "quick", label: "Quick Quiz (10Q)" },
  { key: "full", label: "Full Practice" },
  { key: "mistakes", label: "Mistakes Review" },
  { key: "timed", label: "Timed Challenge (2 min)" },
];

export default function ProcedureQuizTrainer({
  onBack,
  quizType,
}: {
  onBack: () => void;
  quizType: QuizType;
}) {
  const progress = loadTrainingProgress();
  const mistakeKey = quizType === "tournament" ? progress.dealer.tournamentQuiz : progress.dealer.cashQuiz;
  const [questions, setQuestions] = useState<ProcedureQuizQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const startMs = useState(() => Date.now())[0];

  const question = questions[idx];
  const title = quizType === "tournament" ? "Tournament Procedures" : "Cash Game Procedures";
  const caveat = quizType === "tournament" ? "General best practice. TDA rules may vary." : "Room variation — verify local rules.";

  const startQuiz = (m: QuizMode) => {
    const qs =
      quizType === "tournament"
        ? pickTournamentQuestions(m, mistakeKey.mistakeQueue)
        : pickCashQuestions(m, mistakeKey.mistakeQueue);
    setQuestions(
      qs.length
        ? qs
        : (quizType === "tournament" ? TOURNAMENT_QUIZ_QUESTIONS : CASH_GAME_QUIZ_QUESTIONS).slice(0, 10)
    );
    setIdx(0);
    setSelected(null);
    setSubmitted(false);
    setScore(0);
    setStarted(true);
  };

  const recordResult = (correct: boolean) => {
    if (!question) return;
    const ms = Date.now() - startMs;
    recordAdaptiveAttempt({
      date: new Date().toISOString(),
      topic: "procedures",
      difficulty: question.difficulty,
      correct,
      responseMs: ms,
      questionId: question.id,
    });
    const p = loadTrainingProgress();
    saveTrainingProgress(
      quizType === "tournament"
        ? recordTournamentQuizResult(p, question.id, correct, ms)
        : recordCashQuizResult(p, question.id, correct, ms)
    );
  };

  const submit = () => {
    if (!selected || !question) return;
    const isCorrect = selected === question.correctOptionId;
    if (isCorrect) setScore((s) => s + 1);
    recordResult(isCorrect);
    setSubmitted(true);
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      setStarted(false);
      return;
    }
    setIdx((i) => i + 1);
    setSelected(null);
    setSubmitted(false);
  };

  if (!started) {
    return (
      <DrillScreen>
        <DrillHeader title={title} subtitle={caveat} onBack={onBack} />
        <div className="grid gap-2">
          {MODES.map(({ key, label }) => (
            <PrimaryButton key={key} type="button" onClick={() => startQuiz(key)}>{label}</PrimaryButton>
          ))}
        </div>
      </DrillScreen>
    );
  }

  if (!question) {
    return (
      <DrillScreen>
        <DrillHeader title={title} onBack={onBack} />
        <p className="py-8 text-center text-[16px] text-td-cream">Complete! Score: {score}/{questions.length}</p>
        <PrimaryButton type="button" onClick={() => setStarted(false)}>Choose Mode</PrimaryButton>
      </DrillScreen>
    );
  }

  return (
    <DrillScreen>
      <DrillHeader title={title} subtitle={`${idx + 1} of ${questions.length}`} onBack={onBack} />
      <DrillProgressBar value={idx + 1} max={questions.length} />
      <DrillPromptCard meta={question.difficulty} prompt={question.prompt} />
      <div className="mt-4 space-y-2">
        {question.options.map((opt) => (
          <ChoiceButton
            key={opt.id}
            selected={selected === opt.id}
            disabled={submitted}
            onClick={() => !submitted && setSelected(opt.id)}
          >
            {opt.text}
          </ChoiceButton>
        ))}
      </div>
      {submitted && (
        <div className="mt-4">
          <DrillResultCard
            correct={selected === question.correctOptionId}
            title={selected === question.correctOptionId ? "Correct" : "Incorrect"}
          >
            <p>{question.explanation}</p>
            {(question.caveat ?? caveat) && (
              <p className="mt-2 italic text-td-muted">{question.caveat ?? caveat}</p>
            )}
          </DrillResultCard>
        </div>
      )}
      <DrillNavigation>
        {!submitted ? (
          <PrimaryButton type="button" onClick={submit} disabled={!selected}>Submit</PrimaryButton>
        ) : (
          <PrimaryButton type="button" onClick={next}>
            {idx + 1 >= questions.length ? "Finish" : "Next Question"}
          </PrimaryButton>
        )}
      </DrillNavigation>
    </DrillScreen>
  );
}
