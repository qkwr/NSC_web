"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AUTO_RECORDING_CONFIG } from "../config/autoRecordingConfig";

export type VoiceRecordingState =
  | "idle"
  | "requesting-permission"
  | "tts-playing"
  | "listening"
  | "speaking"
  | "processing"
  | "completed"
  | "no-speech"
  | "error";

export type RecordingStopReason =
  | "silence"
  | "no-speech"
  | "max-duration"
  | "manual-stop";

export type RecordingResult = {
  blob: Blob;
  mimeType: string;
  sizeBytes: number;
  durationMs: number;
  stopReason: RecordingStopReason;
};

export type RecordingDebugSnapshot = {
  rmsLevel: number;
  speechThreshold: number;
  mimeType: string;
  chunkCount: number;
  sizeBytes: number;
  durationMs: number;
  stopReason?: RecordingStopReason;
  isSpeechDetected: boolean;
};

type AutoVoiceRecorderOptions = {
  promptText: string;
  onRecordingComplete: (result: RecordingResult) => Promise<void> | void;
  onNoSpeech?: () => void;
  onError?: (message: string) => void;
};

type BrowserWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

let sharedMicrophoneStream: MediaStream | null = null;

function isStreamActive(stream: MediaStream | null) {
  return Boolean(stream?.getTracks().some((track) => track.readyState === "live"));
}

export async function requestAutoRecordingMicrophoneStream(): Promise<MediaStream> {
  if (isStreamActive(sharedMicrophoneStream) && sharedMicrophoneStream) {
    return sharedMicrophoneStream;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("เบราว์เซอร์นี้ยังไม่รองรับการใช้ไมโครโฟน");
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });

  sharedMicrophoneStream = stream;
  return stream;
}

export function releaseAutoRecordingMicrophoneStream() {
  sharedMicrophoneStream?.getTracks().forEach((track) => track.stop());
  sharedMicrophoneStream = null;
}

export function getVoiceRecordingStatusText(state: VoiceRecordingState) {
  if (state === "requesting-permission") return "กำลังเตรียมไมค์";
  if (state === "tts-playing") return "กำลังอ่านโจทย์";
  if (state === "listening") return "กำลังฟังคำตอบ...";
  if (state === "speaking") return "ได้ยินแล้ว กำลังบันทึกเสียง...";
  if (state === "processing") return "กำลังตรวจคำตอบ...";
  if (state === "completed") return "บันทึกเสียงแล้ว";
  if (state === "no-speech") return "ยังไม่ได้ยินคำตอบ ลองตอบอีกครั้งนะ";
  if (state === "error") return "ไมค์มีปัญหา ลองใหม่อีกครั้ง";

  return "พร้อมเริ่มฟัง";
}

function getSupportedMimeType() {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
    return "";
  }

  return (
    AUTO_RECORDING_CONFIG.mediaRecorderMimeTypes.find((mimeType) =>
      MediaRecorder.isTypeSupported(mimeType),
    ) ?? ""
  );
}

function createMediaRecorder(stream: MediaStream) {
  const mimeType = getSupportedMimeType();

  return mimeType
    ? new MediaRecorder(stream, { mimeType })
    : new MediaRecorder(stream);
}

function getRmsLevel(data: Uint8Array) {
  let sum = 0;

  for (const value of data) {
    const normalizedValue = (value - 128) / 128;
    sum += normalizedValue * normalizedValue;
  }

  return Math.sqrt(sum / data.length);
}

function getChunkSize(chunks: Blob[]) {
  return chunks.reduce((totalSize, chunk) => totalSize + chunk.size, 0);
}

function createInitialDebugSnapshot(): RecordingDebugSnapshot {
  return {
    rmsLevel: 0,
    speechThreshold: AUTO_RECORDING_CONFIG.speechThreshold,
    mimeType: getSupportedMimeType(),
    chunkCount: 0,
    sizeBytes: 0,
    durationMs: 0,
    isSpeechDetected: false,
  };
}

export function useAutoVoiceRecorder({
  promptText,
  onRecordingComplete,
  onNoSpeech,
  onError,
}: AutoVoiceRecorderOptions) {
  const [state, setState] = useState<VoiceRecordingState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [hasPermission, setHasPermission] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [debugSnapshot, setDebugSnapshot] = useState<RecordingDebugSnapshot>(
    createInitialDebugSnapshot,
  );

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const noSpeechTimerRef = useRef<number | null>(null);
  const maxRecordingTimerRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const discardNextRecordingRef = useRef(false);
  const promptRunIdRef = useRef(0);
  const recordingRunIdRef = useRef(0);
  const recordingStartedAtRef = useRef(0);
  const activeStopReasonRef = useRef<RecordingStopReason>("manual-stop");
  const hasDetectedSpeechRef = useRef(false);
  const lastSpeechAtRef = useRef(0);
  const lastDebugUpdateAtRef = useRef(0);
  const speechCandidateStartedAtRef = useRef<number | null>(null);
  const optionsRef = useRef({
    promptText,
    onRecordingComplete,
    onNoSpeech,
    onError,
  });

  useEffect(() => {
    optionsRef.current = {
      promptText,
      onRecordingComplete,
      onNoSpeech,
      onError,
    };
  }, [onError, onNoSpeech, onRecordingComplete, promptText]);

  const clearTimers = useCallback(() => {
    if (noSpeechTimerRef.current) {
      window.clearTimeout(noSpeechTimerRef.current);
      noSpeechTimerRef.current = null;
    }

    if (maxRecordingTimerRef.current) {
      window.clearTimeout(maxRecordingTimerRef.current);
      maxRecordingTimerRef.current = null;
    }
  }, []);

  const stopVoiceAnalysisLoop = useCallback(() => {
    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const cleanupAudioAnalysis = useCallback(() => {
    stopVoiceAnalysisLoop();

    sourceRef.current?.disconnect();
    sourceRef.current = null;

    analyserRef.current?.disconnect();
    analyserRef.current = null;

    if (audioContextRef.current?.state !== "closed") {
      void audioContextRef.current?.close();
    }

    audioContextRef.current = null;
    setAudioLevel(0);
  }, [stopVoiceAnalysisLoop]);

  const setErrorState = useCallback((message: string) => {
    setErrorMessage(message);
    setState("error");
    optionsRef.current.onError?.(message);
  }, []);

  const prepareAudioAnalysis = useCallback(
    async (stream: MediaStream) => {
      if (!isStreamActive(stream)) {
        setErrorState("ไมโครโฟนหยุดทำงาน กรุณาอนุญาตใหม่อีกครั้ง");
        return false;
      }

      const existingContext = audioContextRef.current;
      if (
        existingContext &&
        existingContext.state !== "closed" &&
        analyserRef.current
      ) {
        if (existingContext.state === "suspended") {
          await existingContext.resume().catch(() => undefined);
        }

        return true;
      }

      const RecorderAudioContext =
        window.AudioContext ?? (window as BrowserWindow).webkitAudioContext;

      if (!RecorderAudioContext) {
        setErrorState("เบราว์เซอร์นี้ยังไม่รองรับการวิเคราะห์เสียง");
        return false;
      }

      try {
        cleanupAudioAnalysis();

        const audioContext = new RecorderAudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);

        analyser.fftSize = AUTO_RECORDING_CONFIG.analyserFftSize;
        source.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        sourceRef.current = source;

        if (audioContext.state === "suspended") {
          await audioContext.resume().catch(() => undefined);
        }

        return true;
      } catch {
        cleanupAudioAnalysis();
        setErrorState("เตรียมระบบวิเคราะห์เสียงไม่สำเร็จ ลองใหม่อีกครั้ง");
        return false;
      }
    },
    [cleanupAudioAnalysis, setErrorState],
  );

  const requestPermission = useCallback(async () => {
    setErrorMessage("");

    if (isStreamActive(streamRef.current) && streamRef.current) {
      const isPrepared = await prepareAudioAnalysis(streamRef.current);
      setHasPermission(isPrepared);
      return isPrepared;
    }

    setState("requesting-permission");

    try {
      const stream = await requestAutoRecordingMicrophoneStream();
      streamRef.current = stream;
      const isPrepared = await prepareAudioAnalysis(stream);
      setHasPermission(isPrepared);
      return isPrepared;
    } catch {
      setHasPermission(false);
      setErrorState("เปิดไมค์ไม่สำเร็จ กรุณาอนุญาตการใช้ไมโครโฟน");
      return false;
    }
  }, [prepareAudioAnalysis, setErrorState]);

  const stopRecorder = useCallback(
    (
      discardRecording = false,
      stopReason: RecordingStopReason = "manual-stop",
    ) => {
      activeStopReasonRef.current = stopReason;
      discardNextRecordingRef.current = discardRecording;

      if (discardRecording) {
        recordingRunIdRef.current += 1;
      }

      const recorder = recorderRef.current;

      clearTimers();
      cleanupAudioAnalysis();

      if (recorder?.state === "recording" || recorder?.state === "paused") {
        if (discardRecording) {
          recorderRef.current = null;
        }

        recorder.stop();
        return;
      }

      if (discardRecording) {
        chunksRef.current = [];
        recorderRef.current = null;
      }
    },
    [cleanupAudioAnalysis, clearTimers],
  );

  const resetQuestion = useCallback(() => {
    promptRunIdRef.current += 1;
    window.speechSynthesis?.cancel();
    stopRecorder(true, "manual-stop");
    chunksRef.current = [];
    hasDetectedSpeechRef.current = false;
    lastSpeechAtRef.current = 0;
    speechCandidateStartedAtRef.current = null;
    setDebugSnapshot(createInitialDebugSnapshot());
    setErrorMessage("");
    setState("idle");
  }, [stopRecorder]);

  const finishAsNoSpeech = useCallback(() => {
    const durationMs = recordingStartedAtRef.current
      ? Math.round(performance.now() - recordingStartedAtRef.current)
      : 0;

    stopRecorder(true, "no-speech");
    setDebugSnapshot((currentSnapshot) => ({
      ...currentSnapshot,
      durationMs,
      stopReason: "no-speech",
      isSpeechDetected: false,
    }));
    setState("no-speech");
    optionsRef.current.onNoSpeech?.();
  }, [stopRecorder]);

  const stopAnswer = useCallback(
    (stopReason: RecordingStopReason = "manual-stop") => {
      const recorder = recorderRef.current;

      if (recorder?.state !== "recording" && recorder?.state !== "paused") {
        return;
      }

      setState("processing");
      stopRecorder(false, stopReason);
    },
    [stopRecorder],
  );

  const startListening = useCallback(
    async (expectedPromptRunId: number) => {
      if (expectedPromptRunId !== promptRunIdRef.current) {
        return;
      }

      const stream = streamRef.current;

      if (!stream) {
        setErrorState("ยังไม่ได้เปิดไมค์");
        return;
      }

      if (typeof MediaRecorder === "undefined") {
        setErrorState("เบราว์เซอร์นี้ยังไม่รองรับการบันทึกเสียง");
        return;
      }

      try {
        let analyser = analyserRef.current;
        let audioContext = audioContextRef.current;

        if (!analyser || !audioContext || audioContext.state === "closed") {
          const isPrepared = await prepareAudioAnalysis(stream);
          if (!isPrepared || expectedPromptRunId !== promptRunIdRef.current) {
            return;
          }

          analyser = analyserRef.current;
          audioContext = audioContextRef.current;
        }

        if (!analyser || !audioContext) {
          setErrorState("เตรียมระบบฟังเสียงไม่สำเร็จ ลองใหม่อีกครั้ง");
          return;
        }

        if (audioContext.state === "suspended") {
          await audioContext.resume().catch(() => undefined);
        }

        if (expectedPromptRunId !== promptRunIdRef.current) {
          return;
        }

        const recorder = createMediaRecorder(stream);

        recorderRef.current = recorder;
        chunksRef.current = [];
        discardNextRecordingRef.current = false;
        recordingRunIdRef.current += 1;
        const recorderRunId = recordingRunIdRef.current;
        recordingStartedAtRef.current = performance.now();
        activeStopReasonRef.current = "manual-stop";
        hasDetectedSpeechRef.current = false;
        lastSpeechAtRef.current = 0;
        lastDebugUpdateAtRef.current = 0;
        speechCandidateStartedAtRef.current = null;

        const mimeType = recorder.mimeType || getSupportedMimeType() || "audio/webm";
        setDebugSnapshot({
          rmsLevel: 0,
          speechThreshold: AUTO_RECORDING_CONFIG.speechThreshold,
          mimeType,
          chunkCount: 0,
          sizeBytes: 0,
          durationMs: 0,
          isSpeechDetected: false,
        });

        recorder.addEventListener("dataavailable", (event) => {
          if (
            recorderRunId === recordingRunIdRef.current &&
            event.data.size > 0
          ) {
            chunksRef.current.push(event.data);
          }
        });

        recorder.addEventListener("stop", () => {
          if (recorderRunId !== recordingRunIdRef.current) {
            return;
          }

          const chunks = chunksRef.current;
          const chunkCount = chunks.length;
          const shouldDiscard = discardNextRecordingRef.current;
          const durationMs = recordingStartedAtRef.current
            ? Math.round(performance.now() - recordingStartedAtRef.current)
            : 0;
          const stopReason = activeStopReasonRef.current;

          chunksRef.current = [];
          recorderRef.current = null;
          discardNextRecordingRef.current = false;

          if (shouldDiscard) {
            return;
          }

          const audioBlob = new Blob(chunks, {
            type: mimeType,
          });

          const result: RecordingResult = {
            blob: audioBlob,
            mimeType,
            sizeBytes: audioBlob.size,
            durationMs,
            stopReason,
          };

          setDebugSnapshot({
            rmsLevel: 0,
            speechThreshold: AUTO_RECORDING_CONFIG.speechThreshold,
            mimeType,
            chunkCount,
            sizeBytes: result.sizeBytes,
            durationMs,
            stopReason,
            isSpeechDetected: hasDetectedSpeechRef.current,
          });

          if (process.env.NODE_ENV === "development") {
            console.debug("[PoodPlearn auto recording]", {
              mimeType: result.mimeType,
              chunkCount,
              sizeBytes: result.sizeBytes,
              durationMs: result.durationMs,
              stopReason: result.stopReason,
            });
          }

          if (chunkCount === 0 || result.sizeBytes <= 0) {
            setErrorState("ไม่ได้รับเสียงที่บันทึกไว้ กรุณาลองตอบใหม่อีกครั้ง");
            return;
          }

          void Promise.resolve(optionsRef.current.onRecordingComplete(result))
            .then(() => setState("completed"))
            .catch(() => {
              setErrorState("ตรวจคำตอบไม่สำเร็จ ลองบันทึกใหม่อีกครั้ง");
            });
        });

        recorder.start(AUTO_RECORDING_CONFIG.recorderTimesliceMs);
        setState("listening");

        noSpeechTimerRef.current = window.setTimeout(
          finishAsNoSpeech,
          AUTO_RECORDING_CONFIG.noSpeechTimeoutMs,
        );

        maxRecordingTimerRef.current = window.setTimeout(
          () => stopAnswer("max-duration"),
          AUTO_RECORDING_CONFIG.maxRecordingMs,
        );

        const buffer = new Uint8Array(analyser.fftSize);

        const detectVoice = () => {
          analyser.getByteTimeDomainData(buffer);

          const level = getRmsLevel(buffer);
          const now = performance.now();
          const hasVoice = level >= AUTO_RECORDING_CONFIG.speechThreshold;

          setAudioLevel(level);

          if (
            process.env.NODE_ENV === "development" &&
            now - lastDebugUpdateAtRef.current >= 250
          ) {
            lastDebugUpdateAtRef.current = now;
            setDebugSnapshot((currentSnapshot) => ({
              ...currentSnapshot,
              rmsLevel: level,
              chunkCount: chunksRef.current.length,
              sizeBytes: getChunkSize(chunksRef.current),
              durationMs: Math.round(now - recordingStartedAtRef.current),
              isSpeechDetected: hasDetectedSpeechRef.current,
            }));
          }

          if (hasVoice) {
            if (!speechCandidateStartedAtRef.current) {
              speechCandidateStartedAtRef.current = now;
            }

            if (
              !hasDetectedSpeechRef.current &&
              now - speechCandidateStartedAtRef.current >=
                AUTO_RECORDING_CONFIG.minSpeechDurationMs
            ) {
              hasDetectedSpeechRef.current = true;
              lastSpeechAtRef.current = now;
              setState("speaking");

              if (noSpeechTimerRef.current) {
                window.clearTimeout(noSpeechTimerRef.current);
                noSpeechTimerRef.current = null;
              }
            }

            if (hasDetectedSpeechRef.current) {
              lastSpeechAtRef.current = now;
            }
          } else {
            speechCandidateStartedAtRef.current = null;

            if (
              hasDetectedSpeechRef.current &&
              now - lastSpeechAtRef.current >= AUTO_RECORDING_CONFIG.endSilenceMs
            ) {
              stopAnswer("silence");
              return;
            }
          }

          animationFrameRef.current = window.requestAnimationFrame(detectVoice);
        };

        animationFrameRef.current = window.requestAnimationFrame(detectVoice);
      } catch {
        setErrorState("เริ่มบันทึกเสียงไม่สำเร็จ ลองใหม่อีกครั้ง");
      }
    },
    [finishAsNoSpeech, prepareAudioAnalysis, setErrorState, stopAnswer],
  );

  const startPromptFlow = useCallback(
    async (nextPromptText = optionsRef.current.promptText) => {
      promptRunIdRef.current += 1;
      const promptRunId = promptRunIdRef.current;

      window.speechSynthesis?.cancel();
      stopRecorder(true, "manual-stop");
      setDebugSnapshot(createInitialDebugSnapshot());

      const canUseMicrophone = await requestPermission();

      if (!canUseMicrophone || promptRunId !== promptRunIdRef.current) {
        return;
      }

      setErrorMessage("");
      setState("tts-playing");

      if (
        !("speechSynthesis" in window) ||
        typeof SpeechSynthesisUtterance === "undefined"
      ) {
        setErrorState("เบราว์เซอร์นี้ยังไม่รองรับเสียงอ่านโจทย์");
        return;
      }

      if (!nextPromptText.trim()) {
        setErrorState("ไม่มีข้อความโจทย์สำหรับอ่าน");
        return;
      }

      const utterance = new SpeechSynthesisUtterance(nextPromptText);
      utterance.lang = AUTO_RECORDING_CONFIG.ttsLang;
      utterance.rate = AUTO_RECORDING_CONFIG.ttsRate;
      utterance.onend = () => {
        if (promptRunId !== promptRunIdRef.current) {
          return;
        }

        void startListening(promptRunId);
      };
      utterance.onerror = () => {
        if (promptRunId !== promptRunIdRef.current) {
          return;
        }

        setErrorState("อ่านโจทย์ไม่สำเร็จ กรุณากดฟังโจทย์อีกครั้ง");
      };

      window.speechSynthesis.speak(utterance);
    },
    [requestPermission, setErrorState, startListening, stopRecorder],
  );

  const retryCurrentQuestion = useCallback(() => {
    void startPromptFlow(optionsRef.current.promptText);
  }, [startPromptFlow]);

  const release = useCallback(() => {
    resetQuestion();
    releaseAutoRecordingMicrophoneStream();
    streamRef.current = null;
    setHasPermission(false);
  }, [resetQuestion]);

  useEffect(() => release, [release]);

  return {
    audioLevel,
    debugSnapshot,
    errorMessage,
    hasPermission,
    state,
    release,
    requestPermission,
    resetQuestion,
    retryCurrentQuestion,
    startPromptFlow,
    stopAnswer,
  };
}
