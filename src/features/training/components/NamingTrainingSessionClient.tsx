"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type SVGProps } from "react";
import { useRouter } from "next/navigation";
import { TrainingImageFrame } from "./TrainingImageFrame";
import {
  getVoiceRecordingStatusText,
  useAutoVoiceRecorder,
} from "@/features/speech/hooks/useAutoVoiceRecorder";
import {
  createMockNamingSession,
  getMockNamingSessionById,
  getMockNamingSessionSummary,
  getNamingSetById,
  submitMockNamingAnswer,
} from "../services/pn002NamingService";
import { getAuthSession } from "@/features/auth/services/authSession";
import type {
  NamingHint,
  NamingQuestion,
  NamingSessionState,
  NamingSessionSummary,
  NamingSet,
} from "../types/pn002Naming.types";

type QuestionProgressState = {
  answeredQuestionIndexes: number[];
  skippedQuestionIndexes: number[];
};

type NamingTrainingSessionClientProps = {
  sessionId?: string;
  setId?: NamingSet["id"];
};

function MicrophoneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      {...props}
    >
      <rect x="8" y="3" width="8" height="11" rx="4" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
      <path d="M8 21h8" />
    </svg>
  );
}

function SpeakerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      {...props}
    >
      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
      <path d="M16 9.5a4 4 0 0 1 0 5" />
      <path d="M19 6.5a8 8 0 0 1 0 11" />
    </svg>
  );
}

function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2.5"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function LightbulbIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      {...props}
    >
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7c.7.5 1 1.1 1 1.8V17h6v-.5c0-.7.3-1.3 1-1.8A7 7 0 0 0 12 2Z" />
    </svg>
  );
}

function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      {...props}
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function getHintBadge(hint: NamingHint) {
  if (hint.type === "category") return "หมวดคำ";
  if (hint.type === "feature") return "ลักษณะ";
  return "เสียงขึ้นต้น";
}

function HintOverlay({
  hint,
  onClose,
}: {
  hint?: NamingHint;
  onClose: () => void;
}) {
  if (!hint) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#123232]/10 p-4">
      <div className="w-full max-w-lg rounded-[30px] bg-[#FFF9E6] p-8 text-center shadow-[0_20px_48px_rgba(0,0,0,0.1)]">
        <span className="inline-flex min-h-[40px] items-center rounded-full bg-white px-5 text-lg font-bold text-[#735C0F]">
          {getHintBadge(hint)}
        </span>
        <h2 className="mt-5 text-3xl font-bold text-[#123232]">คำใบ้</h2>
        <p className="mt-4 text-2xl font-semibold leading-relaxed text-[#354D50]">
          {hint.text}
        </p>
        <button
          className="mt-7 inline-flex min-h-[56px] items-center justify-center rounded-full bg-[#F0E28A] px-9 text-lg font-bold text-[#274024] shadow-sm transition hover:bg-[#EADF7C] focus:outline-none focus:ring-4 focus:ring-[#D6C85B]/30 active:scale-[0.98]"
          onClick={onClose}
          type="button"
        >
          เข้าใจแล้ว
        </button>
      </div>
    </div>
  );
}

function QuestionPanel({ question }: { question: NamingQuestion }) {
  return (
    <article className="flex h-full min-h-0 w-full max-w-[560px] flex-col items-center justify-center gap-3 rounded-[28px] bg-white/96 px-5 py-5 text-center shadow-[0_18px_48px_rgba(17,103,99,0.12)] ring-1 ring-[#CDEEEF]">
      <p className="inline-flex min-h-[38px] items-center justify-center rounded-full bg-[#F2FBFB] px-5 text-base font-semibold text-[#12847D] ring-1 ring-[#CDEEEF]">
        แบบฝึกเรียกชื่อภาพ
      </p>
      <TrainingImageFrame alt={question.answer} imageSrc={question.imageSrc} />
      <h1 className="max-w-full break-words text-center text-[clamp(1.85rem,3.25vw,3.1rem)] font-bold leading-[1.05] text-[#143839]">
        {question.promptText}
      </h1>
    </article>
  );
}

export function NamingTrainingSessionClient({
  sessionId,
  setId,
}: NamingTrainingSessionClientProps) {
  const router = useRouter();
  const [set, setSet] = useState<NamingSet | null>(null);
  const [session, setSession] = useState<NamingSessionState | null>(null);
  const [summary, setSummary] = useState<NamingSessionSummary | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isPracticeStarted, setIsPracticeStarted] = useState(false);
  const [skippedQuestionIndexes, setSkippedQuestionIndexes] = useState<
    number[]
  >([]);
  const [answeredQuestionIndexes, setAnsweredQuestionIndexes] = useState<
    number[]
  >([]);
  const [hintLevel, setHintLevel] = useState<0 | 1 | 2 | 3>(0);
  const [activeHint, setActiveHint] = useState<NamingHint>();
  const [showReplayFeedback, setShowReplayFeedback] = useState(false);
  const [questionStartedAt, setQuestionStartedAt] = useState(() => Date.now());
  const [errorMessage, setErrorMessage] = useState("");
  const [voiceErrorMessage, setVoiceErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const lastAutoPromptQuestionIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    let isActive = true;

    async function loadSession() {
      if (sessionId) {
        const sessionResult = await getMockNamingSessionById(sessionId);

        if (!isActive) return;

        if (!sessionResult.success) {
          setErrorMessage(sessionResult.errorMessage);
          setIsLoading(false);
          return;
        }

        const setResult = await getNamingSetById(sessionResult.data.setId);

        if (!isActive) return;

        if (!setResult.success) {
          setErrorMessage(setResult.errorMessage);
          setIsLoading(false);
          return;
        }

        setSet(setResult.data);
        setSession(sessionResult.data);
        setQuestionStartedAt(Date.now());
        setIsLoading(false);
        return;
      }

      if (setId) {
        const setResult = await getNamingSetById(setId);

        if (!isActive) return;

        if (!setResult.success) {
          setErrorMessage(setResult.errorMessage);
          setIsLoading(false);
          return;
        }

        const authSession = getAuthSession();
        const patientId =
          authSession?.role === "patient" ? authSession.user.id : "patient-001";
        const sessionResult = await createMockNamingSession(
          setResult.data.id,
          patientId,
        );

        if (!isActive) return;

        if (!sessionResult.success) {
          setErrorMessage(sessionResult.errorMessage);
          setIsLoading(false);
          return;
        }

        setSet(setResult.data);
        setSession(sessionResult.data);
        setQuestionStartedAt(Date.now());
        setIsLoading(false);
        return;
      }

      setErrorMessage("ไม่พบข้อมูล session หรือชุดแบบฝึก");
      setIsLoading(false);
    }

    loadSession();

    return () => {
      isActive = false;
    };
  }, [sessionId, setId]);

  const currentQuestion = set?.questions[currentQuestionIndex];
  const {
    audioLevel: voiceAudioLevel,
    debugSnapshot: voiceDebugSnapshot,
    errorMessage: autoRecorderErrorMessage,
    resetQuestion: resetAutoRecorderQuestion,
    retryCurrentQuestion,
    startPromptFlow,
    state: recordingState,
    stopAnswer,
  } = useAutoVoiceRecorder({
    promptText: currentQuestion?.promptText ?? "",
    onRecordingComplete: async (recordingResult) => {
      if (!currentQuestion) return;
      if (recordingResult.sizeBytes <= 0) return;

      // The recorder now provides a real Blob boundary. This repo has no ASR
      // service yet, so the existing mock answer flow still drives scoring.
      const isSaved = await saveAnswer("mock_audio", currentQuestion.answer);
      if (isSaved) markCurrentQuestionAnswered();
    },
    onError: setVoiceErrorMessage,
  });
  const progressPercent = set
    ? ((currentQuestionIndex + 1) / set.totalQuestions) * 100
    : 0;
  const isVoiceBusy =
    recordingState === "requesting-permission" ||
    recordingState === "tts-playing" ||
    recordingState === "listening" ||
    recordingState === "speaking" ||
    recordingState === "processing";
  const canAdvanceQuestion = !isVoiceBusy && !isSaving;

  const hintButtonText = useMemo(
    () => `คำใบ้ ${hintLevel}/3`,
    [hintLevel],
  );

  useEffect(() => {
    if (!isPracticeStarted || !currentQuestion) {
      return;
    }

    if (lastAutoPromptQuestionIdRef.current === currentQuestion.id) {
      return;
    }

    lastAutoPromptQuestionIdRef.current = currentQuestion.id;
    void startPromptFlow(currentQuestion.promptText);
  }, [
    currentQuestion,
    isPracticeStarted,
    startPromptFlow,
  ]);

  async function handleStartPractice() {
    if (!currentQuestion) return;

    setIsPracticeStarted(true);
    lastAutoPromptQuestionIdRef.current = currentQuestion.id;
    await startPromptFlow(currentQuestion.promptText);
  }

  function handleRetryRecording() {
    if (!currentQuestion) return;

    lastAutoPromptQuestionIdRef.current = currentQuestion.id;
    retryCurrentQuestion();
  }

  function handleStopAnswer() {
    stopAnswer("manual-stop");
  }

  function resetQuestionState() {
    resetAutoRecorderQuestion();
    setHintLevel(0);
    setActiveHint(undefined);
    setShowReplayFeedback(false);
    setVoiceErrorMessage("");
    setQuestionStartedAt(Date.now());
  }

  function moveToQuestion(questionIndex: number) {
    resetQuestionState();
    setCurrentQuestionIndex(questionIndex);
  }

  function markCurrentQuestionAnswered() {
    const nextAnsweredQuestionIndexes = answeredQuestionIndexes.includes(
      currentQuestionIndex,
    )
      ? answeredQuestionIndexes
      : [...answeredQuestionIndexes, currentQuestionIndex];
    const nextSkippedQuestionIndexes = skippedQuestionIndexes.filter(
      (questionIndex) => questionIndex !== currentQuestionIndex,
    );

    if (nextAnsweredQuestionIndexes !== answeredQuestionIndexes) {
      setAnsweredQuestionIndexes(nextAnsweredQuestionIndexes);
    }

    if (nextSkippedQuestionIndexes.length !== skippedQuestionIndexes.length) {
      setSkippedQuestionIndexes(nextSkippedQuestionIndexes);
    }

    return {
      answeredQuestionIndexes: nextAnsweredQuestionIndexes,
      skippedQuestionIndexes: nextSkippedQuestionIndexes,
    };
  }

  function markCurrentQuestionSkipped() {
    const nextAnsweredQuestionIndexes = answeredQuestionIndexes.filter(
      (questionIndex) => questionIndex !== currentQuestionIndex,
    );
    const nextSkippedQuestionIndexes = skippedQuestionIndexes.includes(
      currentQuestionIndex,
    )
      ? skippedQuestionIndexes
      : [...skippedQuestionIndexes, currentQuestionIndex];

    if (nextAnsweredQuestionIndexes.length !== answeredQuestionIndexes.length) {
      setAnsweredQuestionIndexes(nextAnsweredQuestionIndexes);
    }

    if (nextSkippedQuestionIndexes !== skippedQuestionIndexes) {
      setSkippedQuestionIndexes(nextSkippedQuestionIndexes);
    }

    return {
      answeredQuestionIndexes: nextAnsweredQuestionIndexes,
      skippedQuestionIndexes: nextSkippedQuestionIndexes,
    };
  }

  function handleReviewSkippedQuestion() {
    const nextSkippedQuestionIndex = skippedQuestionIndexes[0];

    if (typeof nextSkippedQuestionIndex !== "number") {
      return;
    }

    moveToQuestion(nextSkippedQuestionIndex);
  }

  async function completeTrainingSession() {
    if (!session) return;

    const result = await getMockNamingSessionSummary(session.sessionId);
    if (result.success) setSummary(result.data);
  }

  function getNextPendingQuestionIndex({
    answeredQuestionIndexes: pendingAnsweredQuestionIndexes,
    skippedQuestionIndexes: pendingSkippedQuestionIndexes,
  }: QuestionProgressState) {
    if (!set) {
      return undefined;
    }

    const answeredQuestionIndexSet = new Set(pendingAnsweredQuestionIndexes);

    for (
      let questionIndex = currentQuestionIndex + 1;
      questionIndex < set.totalQuestions;
      questionIndex += 1
    ) {
      if (!answeredQuestionIndexSet.has(questionIndex)) {
        return questionIndex;
      }
    }

    const nextSkippedQuestionIndex = pendingSkippedQuestionIndexes.find(
      (questionIndex) => !answeredQuestionIndexSet.has(questionIndex),
    );

    if (typeof nextSkippedQuestionIndex === "number") {
      return nextSkippedQuestionIndex;
    }

    for (
      let questionIndex = 0;
      questionIndex < currentQuestionIndex;
      questionIndex += 1
    ) {
      if (!answeredQuestionIndexSet.has(questionIndex)) {
        return questionIndex;
      }
    }

    return undefined;
  }

  async function goToNextQuestion(progressState: QuestionProgressState) {
    if (!set || !session || !currentQuestion) return;

    const nextQuestionIndex = getNextPendingQuestionIndex(progressState);

    if (typeof nextQuestionIndex === "number") {
      moveToQuestion(nextQuestionIndex);
      return;
    }

    await completeTrainingSession();
  }

  async function handleAdvanceQuestion() {
    if (!set || !session || !currentQuestion || isSaving || !canAdvanceQuestion) {
      return;
    }

    if (recordingState === "completed") {
      const nextQuestionProgress = markCurrentQuestionAnswered();
      await goToNextQuestion(nextQuestionProgress);
      return;
    }

    const currentWasSkipped =
      skippedQuestionIndexes.includes(currentQuestionIndex);
    const isSaved = currentWasSkipped ? true : await saveAnswer("skipped");

    if (!isSaved) {
      return;
    }

    const nextQuestionProgress = markCurrentQuestionSkipped();
    await goToNextQuestion(nextQuestionProgress);
  }

  function normalizeAnswer(answer: string) {
    return answer.trim().toLocaleLowerCase("th-TH");
  }

  async function saveAnswer(
    answerType: "mock_audio" | "skipped",
    submittedAnswer?: string,
  ) {
    if (!session || !set || !currentQuestion || isSaving) return false;

    setIsSaving(true);
    const responseTimeMs = Math.max(0, Date.now() - questionStartedAt);
    const mockAnswer =
      submittedAnswer ??
      (answerType === "mock_audio" ? currentQuestion.answer : undefined);
    const normalizedMockAnswer = mockAnswer ? normalizeAnswer(mockAnswer) : "";
    const isCorrect =
      answerType === "mock_audio" &&
      currentQuestion.acceptableAnswers.some(
        (answer) => normalizeAnswer(answer) === normalizedMockAnswer,
      );
    const result = await submitMockNamingAnswer({
      sessionId: session.sessionId,
      questionId: currentQuestion.id,
      setId: set.id,
      answerType,
      mockAnswer,
      isCorrect,
      skipped: answerType === "skipped",
      hintLevelUsed: hintLevel,
      responseTimeMs,
    });

    setIsSaving(false);

    if (!result.success) {
      setErrorMessage(result.errorMessage);
      return false;
    }

    return true;
  }

  function handleReplayPrompt() {
    if (!currentQuestion || !isPracticeStarted) return;

    setShowReplayFeedback(true);
    lastAutoPromptQuestionIdRef.current = currentQuestion.id;
    void startPromptFlow(currentQuestion.promptText);
    window.setTimeout(() => setShowReplayFeedback(false), 800);
  }

  function handleRequestHint() {
    if (!currentQuestion) return;

    const nextHintLevel = Math.min(3, hintLevel + 1) as 1 | 2 | 3;
    setHintLevel(nextHintLevel);
    setActiveHint(
      currentQuestion.hints.find((hint) => hint.level === nextHintLevel) ??
        currentQuestion.hints[currentQuestion.hints.length - 1],
    );
  }

  if (isLoading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#EFFBFD] p-6">
        <p className="text-center text-3xl font-bold text-[#45686A]">
          กำลังโหลดแบบฝึก...
        </p>
      </main>
    );
  }

  if (errorMessage || !set || !session || !currentQuestion) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#EFFBFD] p-6">
        <div className="w-full max-w-[680px] rounded-[32px] bg-white px-7 py-9 text-center shadow-[0_18px_45px_rgba(24,112,108,0.08)] ring-1 ring-[#F3D0D0]">
          <p className="text-2xl font-bold text-[#B42318]">
            {errorMessage || "ไม่พบแบบฝึก"}
          </p>
          <button
            className="mt-6 rounded-full bg-[#1FA89C] px-7 py-4 text-xl font-bold text-white"
            onClick={() => router.push("/patient/home")}
            type="button"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </main>
    );
  }

  if (summary) {
    return (
      <main className="min-h-dvh bg-[linear-gradient(180deg,#F6FEFF_0%,#EAF9FB_58%,#DFF3F5_100%)] px-5 py-6 text-[#123232] sm:px-8">
        <section className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-[900px] items-center justify-center">
          <article className="w-full rounded-[36px] bg-white px-7 py-9 text-center shadow-[0_26px_70px_rgba(24,112,108,0.13)] ring-1 ring-[#CDEEEF] sm:px-10">
            <p className="mx-auto inline-flex min-h-[42px] items-center rounded-full bg-[#F2FBFB] px-6 text-lg font-semibold text-[#12847D] ring-1 ring-[#CDEEEF]">
              หมวดสัตว์
            </p>
            <h1 className="mt-5 text-[2.4rem] font-bold leading-tight sm:text-[3rem]">
              ฝึกครบ {summary.totalQuestions} ข้อแล้ว
            </h1>
            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[28px] bg-[#EAF9F8] px-5 py-6">
                <p className="text-4xl font-bold text-[#0F756F]">
                  {summary.completedQuestions}
                </p>
                <p className="mt-2 text-lg font-semibold text-[#45686A]">
                  ข้อที่บันทึก
                </p>
              </div>
              <div className="rounded-[28px] bg-[#F6FEFF] px-5 py-6">
                <p className="text-4xl font-bold text-[#0F756F]">
                  {summary.correctCount}
                </p>
                <p className="mt-2 text-lg font-semibold text-[#45686A]">
                  คำที่พูดได้
                </p>
              </div>
              <div className="rounded-[28px] bg-[#FFF7E8] px-5 py-6">
                <p className="text-4xl font-bold text-[#9A6A13]">
                  {summary.skippedCount}
                </p>
                <p className="mt-2 text-lg font-semibold text-[#45686A]">
                  ข้อที่ข้าม
                </p>
              </div>
            </div>
            <Link
              className="mx-auto mt-8 flex min-h-[68px] max-w-[420px] items-center justify-center rounded-[24px] bg-[#1FA89C] px-7 text-2xl font-bold text-white shadow-[0_16px_34px_rgba(31,168,156,0.24)] transition hover:bg-[#178F84]"
              href="/patient/home"
            >
              กลับหน้าหลัก
            </Link>
          </article>
        </section>
      </main>
    );
  }

  const voiceStatusText = getVoiceRecordingStatusText(recordingState);
  const showStopFallback =
    recordingState === "listening" || recordingState === "speaking";
  const showRetryFallback =
    recordingState === "no-speech" ||
    recordingState === "error" ||
    recordingState === "completed";

  return (
    <main className="flex h-dvh items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#F6FEFF_0%,#EAF9FB_58%,#DFF3F5_100%)] p-3 text-[#123232] sm:p-5">
      <section className="relative mx-auto flex h-[calc(100dvh-1.5rem)] min-h-0 w-[min(1500px,calc(100vw-1.5rem))] max-w-[1500px] flex-col overflow-hidden rounded-[30px] bg-white/95 px-5 py-4 shadow-[0_26px_70px_rgba(17,103,99,0.15)] ring-1 ring-[#CDEEEF] sm:h-[calc(100dvh-2.5rem)] sm:w-[min(1500px,calc(100vw-2.5rem))] sm:px-7 sm:py-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 left-0 h-44 w-[44%] rounded-tr-[100%] bg-[#D8F4F0]/80"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-14 right-0 h-44 w-[52%] rounded-tl-[100%] bg-[#D8F4F0]/78"
        />

        {!isPracticeStarted ? (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/88 px-6 backdrop-blur-sm">
            <div className="w-full max-w-[560px] rounded-[30px] bg-white px-8 py-9 text-center shadow-[0_24px_70px_rgba(17,103,99,0.18)] ring-1 ring-[#CDEEEF]">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#1FA89C] text-white shadow-[0_18px_36px_rgba(31,168,156,0.24)]">
                <MicrophoneIcon className="h-14 w-14" />
              </div>
              <h2 className="mt-6 text-[2.15rem] font-bold leading-tight text-[#123232]">
                เริ่มการฝึก
              </h2>
              <p className="mx-auto mt-3 max-w-[420px] text-xl font-semibold leading-8 text-[#557276]">
                ระบบจะอ่านโจทย์ แล้วฟังคำตอบให้อัตโนมัติ
              </p>
              <button
                className="mx-auto mt-7 flex min-h-[66px] w-full max-w-[360px] items-center justify-center rounded-[24px] bg-[#1FA89C] px-7 text-2xl font-bold text-white shadow-[0_16px_34px_rgba(31,168,156,0.24)] transition hover:bg-[#178F84] focus:outline-none focus:ring-4 focus:ring-[#1FA89C]/30 active:scale-[0.98]"
                onClick={handleStartPractice}
                type="button"
              >
                เริ่มการฝึก
              </button>
            </div>
          </div>
        ) : null}

        <header className="relative z-10 grid h-[clamp(94px,13vh,118px)] shrink-0 gap-3 lg:grid-cols-[180px_minmax(0,1fr)_180px]">
          <div className="flex flex-col items-start gap-2">
            <button
              aria-label="ออกจากแบบฝึก"
              className="flex h-[clamp(58px,8vh,66px)] w-[clamp(58px,8vh,66px)] items-center justify-center rounded-full bg-white text-[#0D5960] shadow-[0_10px_24px_rgba(17,103,99,0.12)] ring-1 ring-[#D5EFF0] transition hover:bg-[#F7FFFF] focus:outline-none focus:ring-4 focus:ring-[#1FA89C]/20 active:scale-[0.98]"
              onClick={() => router.replace("/patient/training/today")}
              type="button"
            >
              <CloseIcon className="h-[54%] w-[54%]" />
            </button>
            <p className="text-sm font-semibold leading-none text-[#13756F]">
              ออกจากแบบฝึก
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto max-w-[820px]">
              <div className="h-3 overflow-hidden rounded-full bg-[#E6EFF2] shadow-inner">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#189C94,#27B6AB)] transition-[width] duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <p className="mt-2 text-lg font-bold text-[#183C3F]">
              ข้อที่ {currentQuestionIndex + 1} จากทั้งหมด {set.totalQuestions} ข้อ
            </p>
            <p className="mx-auto mt-3 inline-flex min-h-[34px] items-center rounded-full bg-[#F2FBFB] px-5 text-base font-semibold text-[#12847D] ring-1 ring-[#CDEEEF]">
              หมวดสัตว์
            </p>
          </div>

          <div className="hidden lg:block" />
        </header>

        <div className="relative z-10 grid min-h-0 flex-1 items-center gap-5 py-3 lg:grid-cols-[minmax(360px,0.95fr)_minmax(420px,1.05fr)] lg:pb-[76px]">
          <div className="flex min-h-0 justify-center">
            <QuestionPanel question={currentQuestion} />
          </div>

          <section className="flex min-h-0 flex-col items-center justify-center gap-3 text-center">
            <div className="relative flex h-[clamp(150px,25vh,210px)] w-full items-center justify-center">
              <div className="absolute left-[8%] top-1/2 hidden -translate-y-1/2 items-center gap-2 text-[#86D9D2]/75 xl:flex">
                {[9, 20, 34, 50, 68, 50, 34, 20, 9].map((height, index) => (
                  <span
                    key={`left-wave-${index}`}
                    className="w-2.5 rounded-full bg-current"
                    style={{ height }}
                  />
                ))}
              </div>
              <div className="absolute right-[8%] top-1/2 hidden -translate-y-1/2 items-center gap-2 text-[#86D9D2]/75 xl:flex">
                {[9, 20, 34, 50, 68, 50, 34, 20, 9].map((height, index) => (
                  <span
                    key={`right-wave-${index}`}
                    className="w-2.5 rounded-full bg-current"
                    style={{ height }}
                  />
                ))}
              </div>
              <button
                aria-label={voiceStatusText}
                className="relative flex h-[clamp(126px,17vh,168px)] w-[clamp(126px,17vh,168px)] items-center justify-center rounded-full outline-none transition focus:ring-4 focus:ring-[#1FA89C]/25"
                disabled={!showStopFallback && !showRetryFallback}
                onClick={
                  showStopFallback ? handleStopAnswer : handleRetryRecording
                }
                title={voiceStatusText}
                type="button"
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-[-20px] rounded-full border-2 border-[#BFEAE7] ${
                    recordingState === "listening" || recordingState === "speaking"
                      ? "animate-pulse"
                      : ""
                  }`}
                />
                <span
                  className="relative flex h-full w-full items-center justify-center rounded-full bg-[linear-gradient(180deg,#41C9BE_0%,#13958C_100%)] text-white shadow-[0_18px_42px_rgba(20,149,141,0.28)] transition-transform"
                  style={{
                    transform:
                      recordingState === "speaking"
                        ? `scale(${1 + Math.min(voiceAudioLevel * 1.6, 0.09)})`
                        : undefined,
                  }}
                >
                  <MicrophoneIcon className="h-[54%] w-[54%]" />
                </span>
              </button>
            </div>

            <div className="flex min-h-[84px] flex-col items-center justify-center gap-2">
              <p
                className={`inline-flex min-h-[52px] min-w-[260px] items-center justify-center rounded-full px-7 text-lg font-bold shadow-[0_10px_28px_rgba(17,103,99,0.12)] ring-1 ${
                  recordingState === "no-speech" || recordingState === "error"
                    ? "bg-[#FFF8E6] text-[#9A6A13] ring-[#F3E2B6]"
                    : "bg-white text-[#0F756F] ring-[#CDEEEF]"
                }`}
              >
                {voiceStatusText}
              </p>

              {voiceErrorMessage || autoRecorderErrorMessage ? (
                <p className="max-w-[360px] text-sm font-semibold text-[#B42318]">
                  {voiceErrorMessage || autoRecorderErrorMessage}
                </p>
              ) : null}

              {process.env.NODE_ENV === "development" ? (
                <p className="max-w-[420px] text-[11px] font-semibold text-[#557276]">
                  DEV mic rms {voiceDebugSnapshot.rmsLevel.toFixed(3)} /
                  threshold {voiceDebugSnapshot.speechThreshold.toFixed(3)}
                  {" | "}chunks {voiceDebugSnapshot.chunkCount}
                  {" | "}blob {voiceDebugSnapshot.sizeBytes} B
                  {" | "}duration {voiceDebugSnapshot.durationMs} ms
                  {voiceDebugSnapshot.stopReason
                    ? ` | ${voiceDebugSnapshot.stopReason}`
                    : ""}
                </p>
              ) : null}
            </div>

            <div className="flex min-h-[44px] flex-wrap justify-center gap-3">
              {showStopFallback ? (
                <button
                  className="inline-flex min-h-[40px] items-center justify-center rounded-full bg-white px-5 text-sm font-bold text-[#B42318] shadow-sm ring-1 ring-[#F8C9C4] transition hover:bg-[#FFF3F1] focus:outline-none focus:ring-4 focus:ring-[#D92D20]/15 active:scale-[0.98]"
                  onClick={handleStopAnswer}
                  type="button"
                >
                  หยุดตอบ
                </button>
              ) : null}

              {showRetryFallback ? (
                <button
                  className="inline-flex min-h-[40px] items-center justify-center rounded-full bg-white px-5 text-sm font-bold text-[#13756F] shadow-sm ring-1 ring-[#CDEEEF] transition hover:bg-[#F7FFFF] focus:outline-none focus:ring-4 focus:ring-[#1FA89C]/20 active:scale-[0.98]"
                  onClick={handleRetryRecording}
                  type="button"
                >
                  ลองบันทึกใหม่
                </button>
              ) : null}
            </div>

            <div className="relative">
              {showReplayFeedback ? (
                <p className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#123232] px-5 py-2 text-base font-semibold text-white shadow-lg">
                  กำลังเล่นโจทย์
                </p>
              ) : null}
              <button
                className="inline-flex min-h-[48px] items-center justify-center gap-3 rounded-full bg-white px-6 text-base font-bold text-[#13756F] shadow-[0_10px_24px_rgba(17,103,99,0.11)] ring-1 ring-[#CDEEEF] transition hover:bg-[#F7FFFF] focus:outline-none focus:ring-4 focus:ring-[#1FA89C]/20 active:scale-[0.98]"
                onClick={handleReplayPrompt}
                type="button"
              >
                <SpeakerIcon className="h-6 w-6" />
                ฟังโจทย์อีกครั้ง
              </button>
            </div>
          </section>
        </div>

        <footer className="relative z-20 grid gap-3 lg:absolute lg:bottom-5 lg:left-7 lg:right-7 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
          <div className="flex justify-center lg:justify-start">
            <button
              className="inline-flex min-h-[52px] min-w-[160px] items-center justify-center gap-3 rounded-full bg-white px-6 text-base font-semibold text-[#13756F] shadow-[0_10px_24px_rgba(17,103,99,0.11)] ring-1 ring-[#CDEEEF] transition hover:bg-[#F7FFFF] focus:outline-none focus:ring-4 focus:ring-[#1FA89C]/20 active:scale-[0.98]"
              onClick={handleRequestHint}
              type="button"
            >
              <LightbulbIcon className="h-7 w-7" />
              {hintButtonText}
            </button>
          </div>

          <div className="flex justify-center">
            {skippedQuestionIndexes.length > 0 ? (
              <button
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-white px-6 text-base font-bold text-[#13756F] shadow-[0_10px_24px_rgba(17,103,99,0.11)] ring-1 ring-[#CDEEEF] transition hover:bg-[#F7FFFF] focus:outline-none focus:ring-4 focus:ring-[#1FA89C]/20 active:scale-[0.98]"
                onClick={handleReviewSkippedQuestion}
                type="button"
              >
                กลับไปข้อที่ข้าม ({skippedQuestionIndexes.length})
              </button>
            ) : null}
          </div>

          <div className="flex justify-center lg:justify-end">
            <button
              className="inline-flex min-h-[60px] w-full max-w-[330px] items-center justify-center gap-4 rounded-full bg-[linear-gradient(180deg,#27B5AA_0%,#13958C_100%)] px-9 text-xl font-bold text-white shadow-[0_14px_30px_rgba(19,149,140,0.23)] transition hover:translate-y-[-1px] focus:outline-none focus:ring-4 focus:ring-[#1FA89C]/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55"
              disabled={!canAdvanceQuestion || isSaving}
              onClick={handleAdvanceQuestion}
              type="button"
            >
              <ArrowRightIcon className="h-8 w-8" />
              ไปข้อต่อไป
            </button>
          </div>
        </footer>
      </section>

      <HintOverlay hint={activeHint} onClose={() => setActiveHint(undefined)} />
    </main>
  );
}
