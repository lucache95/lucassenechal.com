"use client";

import { useReducer, useCallback, useEffect } from "react";
import { QuestionCard } from "@/components/intake/question-card";
import { IntakeProgress } from "@/components/intake/intake-progress";
import { MIN_QUESTIONS, STAGE_1_CAP, type IntakeQuestion } from "@/lib/data/intake-questions";
import type { IntakeAnswer } from "@/lib/schemas/intake";

// ── State types ──────────────────────────────────────────────────

interface IntakeState {
  answers: IntakeAnswer[];
  currentQuestion: IntakeQuestion | null;
  currentAnswer: string;
  isLoading: boolean;
  questionCount: number;
  minReached: boolean;
  showMinReachedCTA: boolean;
  history: IntakeQuestion[];
}

type IntakeAction =
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_QUESTION"; question: IntakeQuestion }
  | { type: "SET_ANSWER"; value: string }
  | { type: "SUBMIT_ANSWER"; answer: IntakeAnswer; question: IntakeQuestion }
  | { type: "GO_BACK" }
  | { type: "SHOW_MIN_CTA" }
  | { type: "HIDE_MIN_CTA" }
  | { type: "RESTORE_SESSION"; state: Partial<IntakeState> };

function intakeReducer(state: IntakeState, action: IntakeAction): IntakeState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.loading };
    case "SET_QUESTION":
      return {
        ...state,
        currentQuestion: action.question,
        currentAnswer: "",
        isLoading: false,
      };
    case "SET_ANSWER":
      return { ...state, currentAnswer: action.value };
    case "SUBMIT_ANSWER": {
      const newCount = state.questionCount + 1;
      const newMinReached = newCount >= MIN_QUESTIONS;
      return {
        ...state,
        answers: [...state.answers, action.answer],
        history: [...state.history, action.question],
        questionCount: newCount,
        minReached: newMinReached,
        currentAnswer: "",
        // Show CTA immediately when minimum first reached
        showMinReachedCTA: newMinReached && !state.minReached ? true : state.showMinReachedCTA,
      };
    }
    case "GO_BACK": {
      if (state.history.length === 0) return state;
      const prevQuestion = state.history[state.history.length - 1];
      const prevAnswer = state.answers[state.answers.length - 1];
      return {
        ...state,
        currentQuestion: prevQuestion,
        currentAnswer: prevAnswer?.answerValue || "",
        answers: state.answers.slice(0, -1),
        history: state.history.slice(0, -1),
        questionCount: Math.max(0, state.questionCount - 1),
        minReached: Math.max(0, state.questionCount - 1) >= MIN_QUESTIONS,
        showMinReachedCTA: false,
        isLoading: false,
      };
    }
    case "SHOW_MIN_CTA":
      return { ...state, showMinReachedCTA: true };
    case "HIDE_MIN_CTA":
      return { ...state, showMinReachedCTA: false };
    case "RESTORE_SESSION":
      return { ...state, ...action.state };
    default:
      return state;
  }
}

const initialState: IntakeState = {
  answers: [],
  currentQuestion: null,
  currentAnswer: "",
  isLoading: true,
  questionCount: 0,
  minReached: false,
  showMinReachedCTA: false,
  history: [],
};

// ── Session storage key ──────────────────────────────────────────

const SESSION_KEY = "intake-session";

// ── Component ────────────────────────────────────────────────────

interface IntakeContainerProps {
  onComplete: (answers: IntakeAnswer[]) => void;
  onBack: () => void;
}

export function IntakeContainer({ onComplete, onBack }: IntakeContainerProps) {
  const [state, dispatch] = useReducer(intakeReducer, initialState);

  // ── Fetch next question ──────────────────────────────────────

  const fetchNextQuestion = useCallback(
    async (answeredIds: string[], answers: IntakeAnswer[], questionCount: number) => {
      dispatch({ type: "SET_LOADING", loading: true });

      try {
        const res = await fetch("/api/intake/next-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answeredQuestionIds: answeredIds,
            answers: answers.map((a) => ({
              questionId: a.questionId,
              answerValue: a.answerValue,
            })),
            questionCount,
          }),
        });

        const data = await res.json();

        if (data.done) {
          // No more questions -- force plan generation
          onComplete(answers);
          return;
        }

        dispatch({ type: "SET_QUESTION", question: data.question });
      } catch (error) {
        console.error("Failed to fetch next question:", error);
        dispatch({ type: "SET_LOADING", loading: false });
      }
    },
    [onComplete]
  );

  // ── Initial load + session recovery ──────────────────────────

  useEffect(() => {
    // Try to restore session
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.answers?.length > 0) {
          dispatch({ type: "RESTORE_SESSION", state: parsed });
          // Fetch next question after restore
          const answeredIds = parsed.answers.map((a: IntakeAnswer) => a.questionId);
          fetchNextQuestion(answeredIds, parsed.answers, parsed.questionCount || 0);
          return;
        }
      }
    } catch {
      // Ignore session storage errors
    }

    // Fresh start
    fetchNextQuestion([], [], 0);
  }, [fetchNextQuestion]);

  // ── Save to sessionStorage on answer changes ─────────────────

  useEffect(() => {
    if (state.answers.length > 0) {
      try {
        sessionStorage.setItem(
          SESSION_KEY,
          JSON.stringify({
            answers: state.answers,
            history: state.history,
            questionCount: state.questionCount,
            minReached: state.minReached,
          })
        );
      } catch {
        // Ignore storage errors
      }
    }
  }, [state.answers, state.history, state.questionCount, state.minReached]);

  // ── Handle answer submission ─────────────────────────────────

  const handleSubmit = useCallback(() => {
    if (!state.currentQuestion) return;

    const answerValue = state.currentAnswer.trim() || "Skipped";
    const answer: IntakeAnswer = {
      questionId: state.currentQuestion.id,
      questionText: state.currentQuestion.text,
      answerValue,
      answerDisplay:
        answerValue === "Skipped" ? "Skipped" : answerValue,
      sequenceOrder: state.questionCount + 1,
    };

    dispatch({ type: "SUBMIT_ANSWER", answer, question: state.currentQuestion });

    const newAnswers = [...state.answers, answer];
    const newCount = state.questionCount + 1;
    const newMinReached = newCount >= MIN_QUESTIONS;

    // If minimum just reached, show CTA instead of auto-fetching next question
    if (newMinReached && !state.minReached) {
      return;
    }

    // If already past minimum and CTA was dismissed, keep going
    if (!state.showMinReachedCTA || !newMinReached) {
      const answeredIds = newAnswers.map((a) => a.questionId);
      fetchNextQuestion(answeredIds, newAnswers, newCount);
    }
  }, [state, fetchNextQuestion]);

  // ── Handle skip ──────────────────────────────────────────────

  const handleSkip = useCallback(() => {
    if (!state.currentQuestion) return;

    const answer: IntakeAnswer = {
      questionId: state.currentQuestion.id,
      questionText: state.currentQuestion.text,
      answerValue: "Skipped",
      answerDisplay: "Skipped",
      sequenceOrder: state.questionCount + 1,
    };

    dispatch({ type: "SUBMIT_ANSWER", answer, question: state.currentQuestion });

    const newAnswers = [...state.answers, answer];
    const newCount = state.questionCount + 1;
    const newMinReached = newCount >= MIN_QUESTIONS;

    if (newMinReached && !state.minReached) {
      return;
    }

    const answeredIds = newAnswers.map((a) => a.questionId);
    fetchNextQuestion(answeredIds, newAnswers, newCount);
  }, [state, fetchNextQuestion]);

  // ── Handle "Continue answering" from min-reached CTA ─────────

  const handleContinue = useCallback(() => {
    dispatch({ type: "HIDE_MIN_CTA" });
    const answeredIds = state.answers.map((a) => a.questionId);
    fetchNextQuestion(answeredIds, state.answers, state.questionCount);
  }, [state.answers, state.questionCount, fetchNextQuestion]);

  // ── Handle "Generate plan" ───────────────────────────────────

  const handleGeneratePlan = useCallback(() => {
    // Clear session storage on completion
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore
    }
    onComplete(state.answers);
  }, [state.answers, onComplete]);

  // ── Handle back navigation ───────────────────────────────────

  const handleBack = useCallback(() => {
    dispatch({ type: "GO_BACK" });
  }, []);

  // ── Render ───────────────────────────────────────────────────

  const totalEstimate = STAGE_1_CAP;

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-16">
      {/* Top navigation */}
      <div className="w-full max-w-2xl mb-8 flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-sm text-muted hover:text-foreground transition-colors duration-200 underline underline-offset-2"
        >
          Back to services
        </button>
        {state.questionCount > 0 && (
          <button
            onClick={handleBack}
            className="text-sm text-muted hover:text-foreground transition-colors duration-200 flex items-center gap-1"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="shrink-0"
            >
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Previous question
          </button>
        )}
      </div>

      {/* Min-reached CTA or question card */}
      {state.showMinReachedCTA && state.minReached ? (
        <IntakeProgress
          currentQuestion={state.questionCount}
          totalEstimate={totalEstimate}
          minReached={true}
          onGeneratePlan={handleGeneratePlan}
          onContinue={handleContinue}
        />
      ) : (
        <>
          {/* Question */}
          {state.currentQuestion && (
            <QuestionCard
              question={state.currentQuestion}
              currentAnswer={state.currentAnswer}
              onAnswer={(value) =>
                dispatch({ type: "SET_ANSWER", value })
              }
              onSubmit={handleSubmit}
              isLoading={state.isLoading}
            />
          )}

          {/* Skip link */}
          {!state.isLoading && state.currentQuestion && !state.currentQuestion.isRequired && (
            <button
              onClick={handleSkip}
              className="mt-6 text-xs text-muted-foreground hover:text-muted transition-colors duration-200"
            >
              Skip this question
            </button>
          )}
        </>
      )}

      {/* Progress bar (compact, always visible) */}
      {!state.showMinReachedCTA && state.questionCount > 0 && (
        <div className="mt-12 w-full max-w-2xl">
          <IntakeProgress
            currentQuestion={state.questionCount}
            totalEstimate={totalEstimate}
            minReached={false}
            onGeneratePlan={handleGeneratePlan}
            onContinue={handleContinue}
          />
        </div>
      )}
    </div>
  );
}

export default IntakeContainer;
