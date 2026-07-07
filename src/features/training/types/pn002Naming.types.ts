export type NamingInternalLevel = "easy" | "medium" | "hard";

export type NamingHint = {
  level: 1 | 2 | 3;
  type: "category" | "feature" | "initial_sound";
  text: string;
};

export type NamingQuestion = {
  id: string;
  moduleId: "PN002";
  categoryId: "animals";
  categoryName: "สัตว์";
  internalLevel: NamingInternalLevel;
  setId: "set-1" | "set-2" | "set-3";
  order: number;
  label: string;
  promptText: "ภาพนี้คืออะไร";
  answer: string;
  acceptableAnswers: string[];
  imageSrc?: string;
  hints: NamingHint[];
};

export type NamingSet = {
  id: "set-1" | "set-2" | "set-3";
  moduleId: "PN002";
  categoryId: "animals";
  categoryName: "สัตว์";
  title: string;
  totalQuestions: number;
  internalLevel: NamingInternalLevel;
  questions: NamingQuestion[];
};

export type NamingCategory = {
  id: "animals";
  moduleId: "PN002";
  name: "สัตว์";
  title: string;
  description: string;
  totalSets: number;
  totalQuestions: number;
  sets: Array<Pick<NamingSet, "id" | "title" | "totalQuestions">>;
};

export type TrainingModule = {
  id: "PN002";
  title: string;
  subtitle: string;
  categories: NamingCategory[];
};

export type NamingSessionState = {
  sessionId: string;
  patientId: string;
  moduleId: "PN002";
  categoryId: "animals";
  setId: NamingSet["id"];
  startedAt: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  responses: NamingResponse[];
};

export type NamingResponse = {
  responseId: string;
  sessionId: string;
  questionId: string;
  setId: NamingSet["id"];
  answerType: "mock_audio" | "skipped";
  mockAnswer?: string;
  isCorrect?: boolean;
  skipped?: boolean;
  hintLevelUsed: 0 | 1 | 2 | 3;
  responseTimeMs: number;
  submittedAt: string;
};

export type NamingSessionSummary = {
  sessionId: string;
  setId: NamingSet["id"];
  categoryName: "สัตว์";
  completedQuestions: number;
  totalQuestions: number;
  correctCount: number;
  skippedCount: number;
  wordsToReview: string[];
  completedAt: string;
};

export type TrainingServiceSuccessResult<T> = {
  success: true;
  data: T;
  errorMessage?: never;
};

export type TrainingServiceFailureResult = {
  success: false;
  data?: never;
  errorMessage: string;
};

export type TrainingServiceResult<T> =
  | TrainingServiceSuccessResult<T>
  | TrainingServiceFailureResult;
