"use client";

import Image from "next/image";
import Link from "next/link";
import {
  type ReactNode,
  type SVGProps,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { FeedbackBubble } from "@/components/ui/FeedbackBubble";
import { FeedbackOverlay } from "@/components/ui/FeedbackOverlay";
import {
  getVoiceRecordingStatusText,
  useAutoVoiceRecorder,
  type RecordingDebugSnapshot,
  type VoiceRecordingState,
} from "@/features/speech/hooks/useAutoVoiceRecorder";
import {
  getStandardAssessmentSession,
  saveStandardAssessmentAnswer,
} from "../services/standardAssessmentService";
import type {
  AssessmentAnswer,
  QuestionChoice,
  QuestionInteractionType,
  StandardAssessmentQuestion,
  StandardAssessmentSession,
} from "../types/assessment.types";

type ChoiceFeedbackState = "correct" | "wrong" | null;
type QuestionProgressState = {
  answeredQuestionIndexes: number[];
  skippedQuestionIndexes: number[];
};

function isVoiceInteraction(interactionType: QuestionInteractionType) {
  return (
    interactionType === "voice_question" ||
    interactionType === "repeat_after" ||
    interactionType === "name_image"
  );
}

function isImageChoiceInteraction(interactionType: QuestionInteractionType) {
  return interactionType === "image_choice";
}

function isYesNoInteraction(interactionType: QuestionInteractionType) {
  return interactionType === "yes_no_choice";
}

function getMockAnswerForQuestion(question: StandardAssessmentQuestion) {
  if (
    question.interactionType === "image_choice" ||
    question.interactionType === "yes_no_choice"
  ) {
    return undefined;
  }

  return `mock ${question.interactionType} answer`;
}

function getMockOutcomeForQuestion(question: StandardAssessmentQuestion) {
  if (question.order % 5 === 0) return "wrong";
  if (question.order % 2 === 0) return "almost";

  return "correct";
}

function getDisplayPrompt(promptText: string) {
  return promptText.replace("คำถามจำลอง:", "").trim();
}

function getCategoryDisplay(question: StandardAssessmentQuestion) {
  if (question.interactionType === "voice_question") {
    return "พูดตอบ";
  }

  if (question.interactionType === "image_choice") {
    return "ชี้รูป";
  }

  if (question.interactionType === "yes_no_choice") {
    return "ตอบใช่/ไม่ใช่";
  }

  if (question.interactionType === "repeat_after") {
    return "พูดตาม";
  }

  if (question.interactionType === "name_image") {
    return "เรียกชื่อ";
  }

  return question.categoryLabel;
}

function getQuestionInstruction(interactionType: QuestionInteractionType) {
  if (interactionType === "voice_question") {
    return "พูดตอบ";
  }

  if (interactionType === "image_choice") {
    return "ชี้รูป";
  }

  if (interactionType === "yes_no_choice") {
    return "ตอบใช่/ไม่ใช่";
  }

  if (interactionType === "repeat_after") {
    return "พูดตาม";
  }

  if (interactionType === "name_image") {
    return "เรียกชื่อ";
  }

  return "คำถาม";
}

function getPromptSizeClass(promptText: string) {
  if (promptText.length > 30) {
    return "text-[clamp(1.4rem,2.45vw,2.4rem)]";
  }

  if (promptText.length > 18) {
    return "text-[clamp(1.7rem,2.9vw,2.95rem)]";
  }

  return "text-[clamp(2.5rem,3.9vw,3.75rem)]";
}

function getRepeatPromptSizeClass(promptText: string) {
  if (promptText.length > 26) {
    return "text-[clamp(2.2rem,3vw,3.25rem)] leading-[1.18]";
  }

  if (promptText.length > 16) {
    return "text-[clamp(2.9rem,4vw,4rem)] leading-[1.16]";
  }

  return "text-[clamp(4rem,5vw,4.5rem)] leading-[1.12]";
}

type AssessmentImageProps = {
  alt: string;
  className: string;
  fallbackClassName: string;
  height: number;
  src?: string;
  width: number;
};

function AssessmentImage({
  alt,
  className,
  fallbackClassName,
  height,
  src,
  width,
}: AssessmentImageProps) {
  const [failedSrc, setFailedSrc] = useState<string>();

  if (!src || failedSrc === src) {
    return <div className={fallbackClassName}>ไม่มีรูปภาพ</div>;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setFailedSrc(src)}
    />
  );
}

function ChatCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.3 9.1 9.1 0 0 1-3.9-.9L3 20l1.4-4.2A8 8 0 0 1 3 11.5 8.6 8.6 0 0 1 12 3a8.6 8.6 0 0 1 9 8.5Z" />
      <path d="M8.5 11.5h.01" />
      <path d="M12 11.5h.01" />
      <path d="M15.5 11.5h.01" />
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
      strokeWidth="2.5"
      strokeLinecap="round"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function ClipboardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 4h6a2 2 0 0 1 2 2v1H7V6a2 2 0 0 1 2-2Z" />
      <path d="M8 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
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
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
      <path d="M16 9.5a4 4 0 0 1 0 5" />
      <path d="M19 6.5a8 8 0 0 1 0 11" />
    </svg>
  );
}

function MicrophoneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="8" y="3" width="8" height="11" rx="4" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
      <path d="M8 21h8" />
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
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function LeafDecoration({ side }: { side: "left" | "right" }) {
  const isRight = side === "right";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute bottom-[96px] hidden h-40 w-28 lg:block ${
        isRight ? "right-8 scale-x-[-1]" : "left-8"
      }`}
    >
      <div className="absolute bottom-0 left-11 h-24 w-3 rounded-full bg-[#7AD8CC]/45" />
      {[0, 1, 2, 3, 4, 5].map((item) => (
        <span
          key={item}
          className={`absolute h-7 w-5 rounded-[999px_999px_999px_0] bg-[#77D7CB]/45 ${
            item % 2 === 0 ? "left-7 rotate-[-34deg]" : "left-14 rotate-[34deg]"
          }`}
          style={{ bottom: 12 + item * 16 }}
        />
      ))}
      <div className="absolute bottom-0 left-6 h-5 w-16 rounded-t-full bg-[#61BFB6]/60" />
    </div>
  );
}

function SessionProgress({ percent }: { percent: number }) {
  const safePercent = Math.min(100, Math.max(0, percent));

  return (
    <div className="mx-auto w-full max-w-[860px]" aria-label="ความคืบหน้า">
      <div className="h-3 overflow-hidden rounded-full bg-[#E6EFF2] shadow-inner">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#189C94,#27B6AB)] transition-[width] duration-300"
          style={{ width: `${safePercent}%` }}
        />
      </div>
    </div>
  );
}

function SessionPill({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex min-h-[56px] items-center justify-center gap-3.5 rounded-full bg-[#F2FBFB] px-8 py-3 text-xl font-bold text-[#12847D] ring-1 ring-[#CDEEEF]">
      <ChatCircleIcon className="h-7 w-7" />
      <span>{children}</span>
    </div>
  );
}

type QuestionCardProps = {
  question: StandardAssessmentQuestion;
  promptText: string;
};

function QuestionCard({ question, promptText }: QuestionCardProps) {
  const instructionText = getQuestionInstruction(question.interactionType);
  const questionImageSrc = question.imageSrc ?? question.imageUrl;
  const isNamingImageQuestion = question.interactionType === "name_image";
  const isImageChoiceQuestion = question.interactionType === "image_choice";
  const isYesNoQuestion = question.interactionType === "yes_no_choice";
  const isRepeatQuestion = question.interactionType === "repeat_after";
  const showInstructionBadge =
    question.interactionType !== "voice_question" &&
    question.interactionType !== "image_choice" &&
    question.interactionType !== "yes_no_choice" &&
    question.interactionType !== "repeat_after" &&
    question.interactionType !== "name_image";

  return (
    <article
      className={`flex w-full flex-col items-center justify-center rounded-[32px] bg-white/96 text-center shadow-[0_18px_48px_rgba(17,103,99,0.12)] ring-1 ring-[#CDEEEF] ${
        isNamingImageQuestion
          ? "h-[clamp(500px,58vh,570px)] max-w-[640px] gap-9 px-8 py-8"
          : isImageChoiceQuestion
            ? "h-[clamp(260px,34vh,320px)] max-w-[460px] px-8 py-7"
            : isYesNoQuestion
              ? "h-[clamp(330px,42vh,390px)] max-w-[660px] px-10 py-7"
              : "h-[clamp(330px,42vh,390px)] max-w-[640px] px-10 py-7"
      }`}
    >
      {showInstructionBadge ? (
        <div
          className={`inline-flex items-center justify-center gap-3 rounded-full bg-[#F2FBFB] font-semibold text-[#12847D] ring-1 ring-[#CDEEEF] ${
            isNamingImageQuestion
              ? "min-h-[36px] px-4 text-base"
              : "mb-5 min-h-[42px] px-5 text-lg"
          }`}
        >
          <ChatCircleIcon
            className={isNamingImageQuestion ? "h-5 w-5" : "h-6 w-6"}
          />
          <span>{instructionText}</span>
        </div>
      ) : null}

      {questionImageSrc || isNamingImageQuestion ? (
        <div
          className={`flex items-center justify-center overflow-hidden ring-1 ${
            isNamingImageQuestion
              ? "h-[clamp(240px,32vh,300px)] w-[clamp(260px,34vh,340px)] rounded-[34px] bg-white/90 p-2 shadow-sm ring-[#CDEEEF]"
              : "mb-5 h-[clamp(136px,20vh,184px)] w-[clamp(136px,20vh,184px)] rounded-[28px] bg-[#F4FCFC] shadow-inner ring-[#D7EFF0]"
          }`}
        >
          <AssessmentImage
            src={questionImageSrc}
            alt={promptText}
            width={320}
            height={320}
            className={`h-full w-full object-contain ${
              isNamingImageQuestion ? "" : "p-3"
            }`}
            fallbackClassName="flex h-full w-full items-center justify-center rounded-[24px] bg-[#F4FCFC] px-4 text-center text-sm font-semibold text-[#13756F]/60"
          />
        </div>
      ) : null}

      <h1
        className={`max-w-full break-words text-center font-bold text-[#143839] ${
          isNamingImageQuestion
            ? "text-[clamp(2.45rem,3.55vw,3.55rem)] leading-[1.18]"
            : isRepeatQuestion
              ? getRepeatPromptSizeClass(promptText)
            : `leading-[1.04] ${getPromptSizeClass(promptText)}`
        }`}
      >
        {promptText}
      </h1>
    </article>
  );
}

type VoiceControlsProps = {
  audioLevel: number;
  debugSnapshot: RecordingDebugSnapshot;
  errorMessage: string;
  recordingState: VoiceRecordingState;
  showReplayFeedback: boolean;
  onReplayPrompt: () => void;
  onRetryRecording: () => void;
  onStopAnswer: () => void;
};

function VoiceControls({
  audioLevel,
  debugSnapshot,
  errorMessage,
  recordingState,
  showReplayFeedback,
  onReplayPrompt,
  onRetryRecording,
  onStopAnswer,
}: VoiceControlsProps) {
  const micStatusText = getVoiceRecordingStatusText(recordingState);
  const showStopFallback =
    recordingState === "listening" || recordingState === "speaking";
  const showRetryFallback =
    recordingState === "no-speech" ||
    recordingState === "error" ||
    recordingState === "completed";

  return (
    <section className="grid h-full min-h-[360px] w-full max-w-[680px] grid-cols-[minmax(0,1fr)_124px] items-center gap-6">
      <div className="flex min-h-0 flex-col items-center justify-center gap-3 text-center">
        <p className="text-lg font-semibold text-[#12847D]">{micStatusText}</p>

        <div className="relative flex h-[clamp(208px,35vh,270px)] w-full items-center justify-center">
          <div className="absolute left-8 top-1/2 hidden -translate-y-1/2 items-center gap-2 text-[#86D9D2]/75 xl:flex">
            {[7, 16, 30, 46, 62, 44, 28, 15, 7].map((height, index) => (
              <span
                key={`left-wave-${index}`}
                className="w-2.5 rounded-full bg-current"
                style={{ height }}
              />
            ))}
          </div>
          <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 items-center gap-2 text-[#86D9D2]/75 xl:flex">
            {[7, 15, 28, 44, 62, 46, 30, 16, 7].map((height, index) => (
              <span
                key={`right-wave-${index}`}
                className="w-2.5 rounded-full bg-current"
                style={{ height }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={showStopFallback ? onStopAnswer : onRetryRecording}
            disabled={!showStopFallback && !showRetryFallback}
            aria-label={micStatusText}
            className="relative flex h-[clamp(154px,20vh,190px)] w-[clamp(154px,20vh,190px)] items-center justify-center rounded-full outline-none transition focus:ring-4 focus:ring-[#1FA89C]/25"
          >
            <span
              aria-hidden="true"
              className={`absolute inset-[-30px] rounded-full border-2 border-[#BFEAE7] ${
                recordingState === "listening" || recordingState === "speaking"
                  ? "animate-pulse"
                  : ""
              }`}
            />
            <span
              aria-hidden="true"
              className={`absolute inset-[-16px] rounded-full border-2 border-[#CDEEEF] ${
                recordingState === "speaking" ? "animate-pulse" : ""
              }`}
            />
            <span
              className="relative flex h-full w-full items-center justify-center rounded-full bg-[linear-gradient(180deg,#41C9BE_0%,#13958C_100%)] text-white shadow-[0_18px_42px_rgba(20,149,141,0.28)] transition-transform"
              style={{
                transform:
                  recordingState === "speaking"
                    ? `scale(${1 + Math.min(audioLevel * 1.6, 0.09)})`
                    : undefined,
              }}
            >
              <MicrophoneIcon className="h-[54%] w-[54%]" />
            </span>
          </button>
        </div>

        <div className="flex min-h-[96px] flex-col items-center justify-center gap-2">
          <p
            className={`inline-flex min-h-[58px] min-w-[290px] items-center justify-center rounded-full px-8 text-xl font-bold shadow-[0_10px_28px_rgba(17,103,99,0.12)] ring-1 ${
              recordingState === "no-speech" || recordingState === "error"
                ? "bg-[#FFF8E6] text-[#9A6A13] ring-[#F3E2B6]"
                : "bg-white text-[#0F756F] ring-[#CDEEEF]"
            }`}
          >
            {micStatusText}
          </p>

          {errorMessage ? (
            <p className="max-w-[380px] text-sm font-semibold text-[#B42318]">
              {errorMessage}
            </p>
          ) : null}

          {process.env.NODE_ENV === "development" ? (
            <p className="max-w-[430px] text-[11px] font-semibold text-[#557276]">
              DEV mic rms {debugSnapshot.rmsLevel.toFixed(3)} / threshold{" "}
              {debugSnapshot.speechThreshold.toFixed(3)}
              {" | "}chunks {debugSnapshot.chunkCount}
              {" | "}blob {debugSnapshot.sizeBytes} B
              {" | "}duration {debugSnapshot.durationMs} ms
              {debugSnapshot.stopReason ? ` | ${debugSnapshot.stopReason}` : ""}
            </p>
          ) : null}
        </div>

        <div className="flex min-h-[42px] flex-wrap justify-center gap-3">
          {showStopFallback ? (
            <button
              className="inline-flex min-h-[40px] items-center justify-center rounded-full bg-white px-5 text-sm font-bold text-[#B42318] shadow-sm ring-1 ring-[#F8C9C4] transition hover:bg-[#FFF3F1] focus:outline-none focus:ring-4 focus:ring-[#D92D20]/15 active:scale-[0.98]"
              onClick={onStopAnswer}
              type="button"
            >
              หยุดตอบ
            </button>
          ) : null}

          {showRetryFallback ? (
            <button
              className="inline-flex min-h-[40px] items-center justify-center rounded-full bg-white px-5 text-sm font-bold text-[#13756F] shadow-sm ring-1 ring-[#CDEEEF] transition hover:bg-[#F7FFFF] focus:outline-none focus:ring-4 focus:ring-[#1FA89C]/20 active:scale-[0.98]"
              onClick={onRetryRecording}
              type="button"
            >
              ลองบันทึกใหม่
            </button>
          ) : null}
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-start self-start pt-[clamp(3.4rem,8vh,4.8rem)]">
        <FeedbackBubble message="กำลังเล่นโจทย์" isVisible={showReplayFeedback} />
        <button
          className="flex h-[clamp(74px,12vh,92px)] w-[clamp(74px,12vh,92px)] items-center justify-center rounded-full bg-white text-[#14867F] shadow-[0_12px_28px_rgba(17,103,99,0.11)] ring-1 ring-[#CDEEEF] transition hover:bg-[#F7FFFF] focus:outline-none focus:ring-4 focus:ring-[#1FA89C]/20 active:scale-[0.98]"
          type="button"
          onClick={onReplayPrompt}
          aria-label="ฟังโจทย์อีกครั้ง"
        >
          <SpeakerIcon className="h-[52%] w-[52%]" />
        </button>
        <p className="mt-3 text-center text-lg font-semibold leading-tight text-[#13756F]">
          ฟังโจทย์อีกครั้ง
        </p>
      </div>
    </section>
  );
}

type ImageChoiceControlsProps = {
  choices: QuestionChoice[] | undefined;
  selectedOptionId: string;
  feedbackState: ChoiceFeedbackState;
  isLocked: boolean;
  onSelect: (choice: QuestionChoice) => void;
};

function ImageChoiceControls({
  choices,
  selectedOptionId,
  feedbackState,
  isLocked,
  onSelect,
}: ImageChoiceControlsProps) {
  return (
    <section className="flex w-full max-w-[880px] flex-wrap items-center justify-center gap-3">
      {choices?.map((choice) => {
        const isSelected = selectedOptionId === choice.id;
        const isCorrectSelected = isSelected && feedbackState === "correct";
        const isWrongSelected = isSelected && feedbackState === "wrong";
        const choiceImageSrc = choice.imageSrc ?? choice.imageUrl;

        return (
          <button
            key={choice.id}
            type="button"
            aria-label={`เลือก${choice.label}`}
            disabled={isLocked}
            onClick={() => onSelect(choice)}
            className={`relative flex h-[clamp(260px,36vh,300px)] w-[clamp(220px,16vw,240px)] cursor-pointer flex-col items-center justify-center rounded-[28px] px-5 text-center transition focus:outline-none focus:ring-4 focus:ring-[#1FA89C]/20 active:scale-[0.98] disabled:cursor-not-allowed ${
              isCorrectSelected
                ? "bg-[#EAF9F8] shadow-[0_18px_36px_rgba(31,168,156,0.18)] ring-2 ring-[#1FA89C]"
                : isWrongSelected
                  ? "bg-[#FFF1F3] shadow-[0_18px_36px_rgba(217,45,32,0.12)] ring-2 ring-[#F97066]"
                  : "bg-white shadow-[0_12px_28px_rgba(17,103,99,0.09)] ring-1 ring-[#D7EFF0] hover:bg-[#F7FFFF]"
            }`}
          >
            {isCorrectSelected || isWrongSelected ? (
              <span
                className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-xl font-bold shadow-sm ${
                  isCorrectSelected
                    ? "bg-[#1FA89C] text-white"
                    : "bg-[#F97066] text-white"
                }`}
                aria-hidden="true"
              >
                {isCorrectSelected ? "✓" : "×"}
              </span>
            ) : null}

            {choiceImageSrc ? (
              <div className="flex h-[clamp(190px,27vh,220px)] w-full max-w-[220px] items-center justify-center overflow-hidden rounded-3xl bg-[#F8FEFF]">
                <AssessmentImage
                  src={choiceImageSrc}
                  alt={choice.label}
                  width={240}
                  height={240}
                  className="h-full w-full object-contain p-2"
                  fallbackClassName="flex h-full w-full items-center justify-center rounded-2xl px-4 text-center text-sm font-semibold text-[#13756F]/60"
                />
              </div>
            ) : (
              <div className="flex h-[clamp(190px,27vh,220px)] w-full max-w-[220px] items-center justify-center rounded-3xl bg-[#F8FEFF] px-5 text-center text-xl font-bold text-[#6B7B80] ring-1 ring-[#D7EFF0]">
                ยังไม่มีรูป
              </div>
            )}
          </button>
        );
      })}
    </section>
  );
}

type ImageChoiceFeedbackOverlayProps = {
  expectedAnswer?: string;
  feedbackState: ChoiceFeedbackState;
  visible: boolean;
};

function ImageChoiceFeedbackOverlay({
  expectedAnswer,
  feedbackState,
  visible,
}: ImageChoiceFeedbackOverlayProps) {
  if (!visible || !feedbackState) {
    return null;
  }

  const isCorrect = feedbackState === "correct";

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-live="polite"
    >
      <div
        className={`mx-auto w-full max-w-xl rounded-[28px] p-8 text-center shadow-[0_18px_40px_rgba(0,0,0,0.08)] ${
          isCorrect ? "bg-[#E9F9F0]" : "bg-[#FFF1F3]"
        }`}
      >
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-5xl font-bold text-white ${
            isCorrect ? "bg-[#1FA89C]" : "bg-[#F97066]"
          }`}
          aria-hidden="true"
        >
          {isCorrect ? "✓" : "×"}
        </div>
        <h3 className="mt-5 text-3xl font-bold leading-tight text-[#123232]">
          {isCorrect ? "ถูกต้อง! เก่งมากเลย" : "ยังไม่ถูกต้อง"}
        </h3>
        {isCorrect && expectedAnswer ? (
          <p className="mt-3 text-lg font-bold text-[#2C6A4F]">
            คำตอบที่ถูก: {expectedAnswer}
          </p>
        ) : null}
        <div className="mt-6 inline-flex items-center justify-center rounded-full bg-white/65 px-6 py-3 text-base font-bold text-[#123232]">
          กำลังบันทึกคำตอบ
        </div>
      </div>
    </div>
  );
}

type YesNoControlsProps = {
  choices: QuestionChoice[] | undefined;
  selectedOptionId: string;
  feedbackState: ChoiceFeedbackState;
  isLocked: boolean;
  onSelect: (choice: QuestionChoice) => void;
};

function YesNoControls({
  choices,
  selectedOptionId,
  feedbackState,
  isLocked,
  onSelect,
}: YesNoControlsProps) {
  return (
    <section className="flex w-full max-w-[640px] items-center justify-center gap-6">
      {choices?.map((choice) => {
        const isSelected = selectedOptionId === choice.id;
        const isCorrectSelected = isSelected && feedbackState === "correct";
        const isWrongSelected = isSelected && feedbackState === "wrong";

        return (
          <button
            key={choice.id}
            type="button"
            disabled={isLocked}
            onClick={() => onSelect(choice)}
            className={`flex h-[clamp(220px,32vh,260px)] min-w-[220px] max-w-[280px] flex-1 flex-col items-center justify-center rounded-[32px] px-6 text-3xl font-bold transition focus:outline-none focus:ring-4 focus:ring-[#1FA89C]/20 active:scale-[0.98] ${
              isCorrectSelected
                ? "bg-[#EAF9F8] text-[#0F756F] shadow-[0_18px_36px_rgba(31,168,156,0.16)] ring-2 ring-[#1FA89C]"
                : isWrongSelected
                  ? "bg-[#FFF1F3] text-[#B42318] shadow-[0_18px_36px_rgba(217,45,32,0.12)] ring-2 ring-[#F97066]"
                  : isSelected
                    ? "bg-[#F2FBFB] text-[#0F756F] shadow-[0_18px_36px_rgba(31,168,156,0.12)] ring-2 ring-[#86D9D2]"
                : "bg-white text-[#123232] shadow-[0_12px_28px_rgba(17,103,99,0.09)] ring-1 ring-[#D7EFF0] hover:bg-[#F7FFFF]"
            } disabled:cursor-not-allowed`}
          >
            <span className="mb-5 text-[4.2rem] leading-none">
              {choice.id === "yes" ? "✓" : "×"}
            </span>
            <span>{choice.label}</span>
          </button>
        );
      })}
    </section>
  );
}

type BottomControlsProps = {
  isSkipping: boolean;
  skippedCount: number;
  onSkip: () => void;
  onReviewSkipped: () => void;
};

function BottomControls({
  isSkipping,
  skippedCount,
  onSkip,
  onReviewSkipped,
}: BottomControlsProps) {
  return (
    <div className="relative z-20 grid shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-6 px-9 pb-8 pt-3">
      <div className="flex justify-start">
        {skippedCount > 0 ? (
          <button
            className="inline-flex min-h-[58px] items-center justify-center rounded-full bg-white px-7 text-lg font-bold text-[#13756F] shadow-[0_10px_24px_rgba(17,103,99,0.11)] ring-1 ring-[#CDEEEF] transition hover:bg-[#F7FFFF] focus:outline-none focus:ring-4 focus:ring-[#1FA89C]/20 active:scale-[0.98]"
            type="button"
            onClick={onReviewSkipped}
          >
            กลับไปข้อที่ข้าม ({skippedCount})
          </button>
        ) : null}
      </div>
      <div />
      <div className="flex justify-end">
        <button
          className="inline-flex min-h-[72px] w-full max-w-[330px] items-center justify-center gap-4 rounded-full bg-[linear-gradient(180deg,#27B5AA_0%,#13958C_100%)] px-9 text-2xl font-bold text-white shadow-[0_14px_30px_rgba(19,149,140,0.23)] transition hover:translate-y-[-1px] focus:outline-none focus:ring-4 focus:ring-[#1FA89C]/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55"
          type="button"
          disabled={isSkipping}
          onClick={onSkip}
        >
          <ArrowRightIcon className="h-9 w-9" />
          <span>{isSkipping ? "กำลังข้าม..." : "ข้ามข้อนี้"}</span>
        </button>
      </div>
    </div>
  );
}

export function AssessmentSessionClient() {
  const router = useRouter();
  const [session, setSession] = useState<StandardAssessmentSession | null>(
    null,
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [showReplayFeedback, setShowReplayFeedback] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackType, setFeedbackType] = useState<
    "correct" | "almost" | "wrong" | "skipped"
  >("correct");
  const [imageChoiceFeedbackState, setImageChoiceFeedbackState] =
    useState<ChoiceFeedbackState>(null);
  const [imageChoiceFeedbackVisible, setImageChoiceFeedbackVisible] =
    useState(false);
  const [isImageChoiceSaving, setIsImageChoiceSaving] = useState(false);
  const [feedbackMockAnswer, setFeedbackMockAnswer] = useState<string>();
  const [feedbackExpected, setFeedbackExpected] = useState<string | undefined>(
    undefined,
  );
  const [isSkipping, setIsSkipping] = useState(false);
  const [skippedQuestionIndexes, setSkippedQuestionIndexes] = useState<
    number[]
  >([]);
  const [answeredQuestionIndexes, setAnsweredQuestionIndexes] = useState<
    number[]
  >([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [voiceErrorMessage, setVoiceErrorMessage] = useState("");
  const [questionStartedAt, setQuestionStartedAt] = useState(() => Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const lastAutoPromptQuestionIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    let isActive = true;

    async function loadSession() {
      const result = await getStandardAssessmentSession();

      if (!isActive) {
        return;
      }

      if (!result.success) {
        setErrorMessage(result.errorMessage);
        setIsLoading(false);
        return;
      }

      setSession(result.data);
      setQuestionStartedAt(Date.now());
      setIsLoading(false);
    }

    loadSession();

    return () => {
      isActive = false;
    };
  }, []);

  const currentQuestion = session?.questions[currentQuestionIndex];
  const promptText = currentQuestion
    ? getDisplayPrompt(currentQuestion.promptText)
    : "";
  const isVoiceQuestion = currentQuestion
    ? isVoiceInteraction(currentQuestion.interactionType)
    : false;
  const isImageChoiceQuestion = currentQuestion
    ? isImageChoiceInteraction(currentQuestion.interactionType)
    : false;
  const isYesNoQuestion = currentQuestion
    ? isYesNoInteraction(currentQuestion.interactionType)
    : false;
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
    promptText,
    onRecordingComplete: async (recordingResult) => {
      if (!currentQuestion) return;
      if (recordingResult.sizeBytes <= 0) return;

      const mockAnswer = getMockAnswerForQuestion(currentQuestion);
      const outcome = getMockOutcomeForQuestion(currentQuestion);

      setFeedbackMockAnswer(mockAnswer ?? "");
      setFeedbackExpected(currentQuestion.expectedAnswer ?? undefined);
      setFeedbackType(outcome as "correct" | "almost" | "wrong");
      setFeedbackVisible(true);

      // The recorder now provides a real Blob boundary. This repo has no ASR
      // service yet, so the existing mock assessment flow still drives scoring.
      const isSaved = await saveCurrentAnswer({
        questionId: currentQuestion.id,
        answerType: isImageChoiceInteraction(currentQuestion.interactionType)
          ? "image_choice"
          : "mock_audio",
        mockRecordingState: "recorded",
        mockAnswer,
        isCorrect: outcome === "correct",
        ...getAnswerMetadata(),
      });

      if (!isSaved) {
        throw new Error("Save assessment voice answer failed");
      }

      const nextQuestionProgress = markCurrentQuestionAnswered();
      const delay = outcome === "correct" ? 5000 : 3000;

      window.setTimeout(() => {
        setFeedbackVisible(false);
        goToNextQuestionOrResult(nextQuestionProgress);
      }, delay);
    },
    onError: setVoiceErrorMessage,
  });

  useEffect(() => {
    if (!session || !currentQuestion || !isVoiceQuestion) {
      return;
    }

    if (lastAutoPromptQuestionIdRef.current === currentQuestion.id) {
      return;
    }

    lastAutoPromptQuestionIdRef.current = currentQuestion.id;
    void startPromptFlow(promptText);
  }, [
    currentQuestion,
    isVoiceQuestion,
    promptText,
    session,
    startPromptFlow,
  ]);

  function resetQuestionUiState() {
    setSelectedOptionId("");
    resetAutoRecorderQuestion();
    setShowReplayFeedback(false);
    setImageChoiceFeedbackState(null);
    setImageChoiceFeedbackVisible(false);
    setIsImageChoiceSaving(false);
    setFeedbackExpected(undefined);
    setFeedbackMockAnswer(undefined);
    setErrorMessage("");
    setVoiceErrorMessage("");
  }

  function moveToQuestion(questionIndex: number) {
    resetQuestionUiState();
    setQuestionStartedAt(Date.now());
    setCurrentQuestionIndex(questionIndex);
  }

  function getNextPendingQuestionIndex({
    answeredQuestionIndexes: pendingAnsweredQuestionIndexes,
    skippedQuestionIndexes: pendingSkippedQuestionIndexes,
  }: QuestionProgressState) {
    if (!session) {
      return undefined;
    }

    const answeredQuestionIndexSet = new Set(pendingAnsweredQuestionIndexes);

    for (
      let questionIndex = currentQuestionIndex + 1;
      questionIndex < session.totalQuestions;
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

  function goToNextQuestionOrResult(progressState: QuestionProgressState) {
    if (!session) {
      return;
    }

    const nextQuestionIndex = getNextPendingQuestionIndex(progressState);

    if (typeof nextQuestionIndex === "number") {
      moveToQuestion(nextQuestionIndex);
      return;
    }

    router.push("/patient/assessment/result");
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

  function getAnswerMetadata(): Pick<
    AssessmentAnswer,
    "hintLevelUsed" | "hintCountUsed" | "responseTimeMs"
  > {
    return {
      hintLevelUsed: 0,
      hintCountUsed: 0,
      responseTimeMs: Math.max(0, Date.now() - questionStartedAt),
    };
  }

  async function saveCurrentAnswer(answer: AssessmentAnswer) {
    const result = await saveStandardAssessmentAnswer(answer);

    if (!result.success) {
      setErrorMessage(result.errorMessage);
      return false;
    }

    return true;
  }

  async function handleImageChoiceSelect(choice: QuestionChoice) {
    if (!session || !isImageChoiceQuestion || isImageChoiceSaving) {
      return;
    }

    const currentQuestion = session.questions[currentQuestionIndex];

    setSelectedOptionId(choice.id);
    setErrorMessage("");

    setIsImageChoiceSaving(true);
    setImageChoiceFeedbackState(choice.isCorrect ? "correct" : "wrong");
    setImageChoiceFeedbackVisible(true);
    setFeedbackExpected(choice.isCorrect ? currentQuestion.expectedAnswer : undefined);

    const isSaved = await saveCurrentAnswer({
      questionId: currentQuestion.id,
      answerType: "image_choice",
      selectedOptionId: choice.id,
      isCorrect: choice.isCorrect,
      ...getAnswerMetadata(),
    });

    if (!isSaved) {
      setIsImageChoiceSaving(false);
      setImageChoiceFeedbackVisible(false);
      return;
    }

    const nextQuestionProgress = markCurrentQuestionAnswered();

    window.setTimeout(() => {
      setImageChoiceFeedbackVisible(false);
      setIsImageChoiceSaving(false);
      goToNextQuestionOrResult(nextQuestionProgress);
    }, 1200);
  }

  async function handleYesNoSelect(choice: QuestionChoice) {
    if (!session || !isYesNoQuestion || isImageChoiceSaving) {
      return;
    }

    const currentQuestion = session.questions[currentQuestionIndex];

    setSelectedOptionId(choice.id);
    setErrorMessage("");

    setIsImageChoiceSaving(true);
    setImageChoiceFeedbackState(choice.isCorrect ? "correct" : "wrong");
    setImageChoiceFeedbackVisible(true);
    setFeedbackExpected(choice.isCorrect ? currentQuestion.expectedAnswer : undefined);

    const isSaved = await saveCurrentAnswer({
      questionId: currentQuestion.id,
      answerType: "yes_no_choice",
      selectedOptionId: choice.id,
      isCorrect: choice.isCorrect,
      ...getAnswerMetadata(),
    });

    if (!isSaved) {
      setIsImageChoiceSaving(false);
      setImageChoiceFeedbackVisible(false);
      return;
    }

    const nextQuestionProgress = markCurrentQuestionAnswered();

    window.setTimeout(() => {
      setImageChoiceFeedbackVisible(false);
      setIsImageChoiceSaving(false);
      goToNextQuestionOrResult(nextQuestionProgress);
    }, 1200);
  }

  async function handleSkipQuestion() {
    if (!session || isSkipping) {
      return;
    }

    const currentWasSkipped =
      skippedQuestionIndexes.includes(currentQuestionIndex);

    setIsSkipping(true);

    const currentQuestion = session.questions[currentQuestionIndex];
    const skippedAnswer: AssessmentAnswer = {
      questionId: currentQuestion.id,
      answerType: "skipped",
      skipped: true,
      isCorrect: false,
      ...getAnswerMetadata(),
    };
    const isSaved = currentWasSkipped
      ? true
      : await saveCurrentAnswer(skippedAnswer);

    setIsSkipping(false);

    if (isSaved) {
      const nextQuestionProgress = markCurrentQuestionSkipped();
      setFeedbackType("skipped");
      setFeedbackVisible(true);
      window.setTimeout(() => {
        setFeedbackVisible(false);
        goToNextQuestionOrResult(nextQuestionProgress);
      }, 1200);
    }
  }

  function handleReplayPrompt() {
    if (!currentQuestion || !isVoiceQuestion) return;

    setShowReplayFeedback(true);
    lastAutoPromptQuestionIdRef.current = currentQuestion.id;
    void startPromptFlow(promptText);

    window.setTimeout(() => {
      setShowReplayFeedback(false);
    }, 700);
  }

  function handleRetryRecording() {
    if (!currentQuestion || !isVoiceQuestion) return;

    lastAutoPromptQuestionIdRef.current = currentQuestion.id;
    retryCurrentQuestion();
  }

  function handleStopAnswer() {
    stopAnswer("manual-stop");
  }

  if (isLoading) {
    return (
      <main className="flex h-dvh items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#F6FEFF_0%,#EAF9FB_58%,#DFF3F5_100%)] p-6 text-[#123232]">
        <p className="text-center text-3xl font-bold text-[#45686A]">
          กำลังโหลด...
        </p>
      </main>
    );
  }

  if (errorMessage && !session) {
    return (
      <main className="flex h-dvh items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#F6FEFF_0%,#EAF9FB_58%,#DFF3F5_100%)] p-6 text-[#123232]">
        <div className="w-full max-w-[680px] rounded-[32px] border border-[#F3D0D0] bg-white px-7 py-9 text-center shadow-[0_18px_45px_rgba(24,112,108,0.08)]">
          <p className="text-2xl font-bold text-[#B42318]">{errorMessage}</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  if (!currentQuestion) {
    return null;
  }

  const progressPercent = (currentQuestion.order / session.totalQuestions) * 100;
  const categoryLabel = getCategoryDisplay(currentQuestion);

  return (
    <main className="flex h-dvh items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#F6FEFF_0%,#EAF9FB_58%,#DFF3F5_100%)] p-6 text-[#123232]">
      <section className="relative mx-auto flex h-[calc(100dvh-48px)] max-h-[860px] min-h-[680px] w-[min(1500px,calc(100vw-48px))] flex-col overflow-hidden rounded-[36px] bg-white/95 px-9 py-7 shadow-[0_26px_70px_rgba(17,103,99,0.15)] ring-1 ring-[#CDEEEF]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(214,247,244,0.68),rgba(255,255,255,0)_39%)]"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-20 left-0 h-44 w-[44%] rounded-tr-[100%] bg-[#D8F4F0]/80"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-14 right-0 h-44 w-[52%] rounded-tl-[100%] bg-[#D8F4F0]/78"
        />
        <LeafDecoration side="left" />
        <LeafDecoration side="right" />

        <header className="relative z-10 grid h-[clamp(158px,17vh,172px)] shrink-0 grid-cols-[148px_minmax(0,1fr)_242px] items-start gap-5">
          <div className="flex flex-col items-start gap-2.5">
            <Link
              className="flex h-[clamp(58px,9vh,68px)] w-[clamp(58px,9vh,68px)] items-center justify-center rounded-full bg-white text-[#0D5960] shadow-[0_10px_24px_rgba(17,103,99,0.12)] ring-1 ring-[#D5EFF0] transition hover:bg-[#F7FFFF] focus:outline-none focus:ring-4 focus:ring-[#1FA89C]/20 active:scale-[0.98]"
              href="/patient/home"
              aria-label="ออกจากแบบทดสอบ"
            >
              <CloseIcon className="h-[54%] w-[54%]" />
            </Link>
            <p className="text-base font-semibold leading-none text-[#13756F]">
              ออกจากแบบทดสอบ
            </p>
          </div>

          <div className="pt-2 text-center">
            <SessionProgress percent={progressPercent} />
            <p className="mt-5 text-[clamp(1.18rem,1.9vw,1.45rem)] font-semibold leading-none text-[#183C3F]">
              ข้อที่ {currentQuestion.order} จากทั้งหมด {session.totalQuestions} ข้อ
            </p>
            <div className="mt-4 flex justify-center">
              <SessionPill>{categoryLabel}</SessionPill>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              className="inline-flex min-h-[50px] items-center justify-center gap-2.5 rounded-full bg-white/86 px-5 text-base font-semibold text-[#127C78] shadow-[0_8px_20px_rgba(17,103,99,0.08)] ring-1 ring-[#D7EFF0] transition hover:bg-[#F7FFFF] focus:outline-none focus:ring-4 focus:ring-[#1FA89C]/20 active:scale-[0.98]"
            >
              <ClipboardIcon className="h-6 w-6" />
              <span>แผนความคืบหน้า</span>
            </button>
          </div>
        </header>

        <div
          className={`relative z-10 grid min-h-0 flex-1 items-center px-5 pb-2 pt-[clamp(1.5rem,3vh,2.75rem)] ${
            isImageChoiceQuestion
              ? "grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-6"
              : isYesNoQuestion
                ? "grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-10"
                : "grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-8"
          }`}
        >
          <div className="flex min-h-0 items-center justify-center">
            <QuestionCard question={currentQuestion} promptText={promptText} />
          </div>

          <div className="flex min-h-0 items-center justify-center">
            {isVoiceQuestion ? (
              <VoiceControls
                audioLevel={voiceAudioLevel}
                debugSnapshot={voiceDebugSnapshot}
                errorMessage={
                  voiceErrorMessage || autoRecorderErrorMessage
                }
                recordingState={recordingState}
                showReplayFeedback={showReplayFeedback}
                onReplayPrompt={handleReplayPrompt}
                onRetryRecording={handleRetryRecording}
                onStopAnswer={handleStopAnswer}
              />
            ) : null}

            {isImageChoiceQuestion ? (
              <ImageChoiceControls
                choices={currentQuestion.choices}
                feedbackState={imageChoiceFeedbackState}
                isLocked={isImageChoiceSaving}
                selectedOptionId={selectedOptionId}
                onSelect={handleImageChoiceSelect}
              />
            ) : null}

            {isYesNoQuestion ? (
              <YesNoControls
                choices={currentQuestion.choices}
                feedbackState={imageChoiceFeedbackState}
                isLocked={isImageChoiceSaving}
                selectedOptionId={selectedOptionId}
                onSelect={handleYesNoSelect}
              />
            ) : null}
          </div>

          {errorMessage ? (
            <div className="absolute bottom-[96px] left-1/2 z-20 -translate-x-1/2 rounded-full bg-[#FEE2E2] px-6 py-3 text-lg font-bold text-[#B91C1C] shadow-sm">
              {errorMessage}
            </div>
          ) : null}
        </div>

        <BottomControls
          isSkipping={isSkipping}
          skippedCount={skippedQuestionIndexes.length}
          onSkip={handleSkipQuestion}
          onReviewSkipped={handleReviewSkippedQuestion}
        />

        <FeedbackOverlay
          visible={feedbackVisible}
          type={feedbackType}
          mockAnswer={feedbackMockAnswer}
          expectedAnswer={feedbackExpected}
          onClose={() => setFeedbackVisible(false)}
        />

        <ImageChoiceFeedbackOverlay
          expectedAnswer={currentQuestion.expectedAnswer}
          feedbackState={imageChoiceFeedbackState}
          visible={imageChoiceFeedbackVisible}
        />
      </section>
    </main>
  );
}
