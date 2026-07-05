import type {
  CategoryScore,
  ProgressBySession,
  ResponseStatusByCategory,
  SessionResultItem,
} from "../types/therapistClinical.types";

export const mockCategoryScores: CategoryScore[] = [
  { category: "Spontaneous", score: 7, maxScore: 10 },
  { category: "Comprehension", score: 8, maxScore: 10 },
  { category: "Words repetition", score: 6, maxScore: 10 },
  { category: "Naming", score: 11, maxScore: 15 },
];

export const mockProgressBySession: ProgressBySession[] = [
  { date: "2026-07-01", spontaneous: 5, comprehension: 6, repetition: 5, naming: 8 },
  { date: "2026-07-02", spontaneous: 6, comprehension: 7, repetition: 6, naming: 10 },
  { date: "2026-07-04", spontaneous: 7, comprehension: 8, repetition: 6, naming: 11 },
];

export const mockResponseStatusByCategory: ResponseStatusByCategory[] = [
  { category: "Spontaneous", correct: 7, incorrect: 2, needsPractice: 3, pendingReview: 1 },
  { category: "Comprehension", correct: 8, incorrect: 1, needsPractice: 2, pendingReview: 1 },
  { category: "Words repetition", correct: 6, incorrect: 4, needsPractice: 5, pendingReview: 2 },
  { category: "Naming", correct: 11, incorrect: 4, needsPractice: 6, pendingReview: 2 },
];

export const mockSessionResults: SessionResultItem[] = [
  {
    id: "sr-001",
    date: "2026-07-04",
    audioUrl: "/samples/audio1.mp3",
    asrTranscript: "แมว",
    expectedAnswer: "แมว",
    aiCorrect: true,
    therapistReviewStatus: "not-reviewed",
    therapistNote: "",
  },
  {
    id: "sr-002",
    date: "2026-07-04",
    audioUrl: "/samples/audio2.mp3",
    asrTranscript: "ค้างคาว",
    expectedAnswer: "ค้างคาว",
    aiCorrect: false,
    therapistReviewStatus: "needs-review",
    therapistNote: "เสียงไม่ชัด ต้องฟังซ้ำ",
  },
];
