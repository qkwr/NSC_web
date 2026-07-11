export const AUTO_RECORDING_CONFIG = {
  noSpeechTimeoutMs: 15000,
  endSilenceMs: 4000,
  maxRecordingMs: 30000,
  speechThreshold: 0.035,
  minSpeechDurationMs: 240,
  analyserFftSize: 2048,
  recorderTimesliceMs: 250,
  ttsRate: 0.86,
  ttsLang: "th-TH",
  mediaRecorderMimeTypes: [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ],
} as const;
