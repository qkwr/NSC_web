export type TherapistPatientSummary = {
  id: string;
  code: string;
  name: string;
  age: number;
  lastSessionAt: string;
  latestSessionAt: string;
  needsFollowUp: boolean;
  pn001ProgressPercent: number;
  pn002ProgressPercent: number;
  latestTrainingSet: string;
};

export type TherapistRecentSession = {
  id: string;
  patientId: string;
  patientName: string;
  moduleName: string;
  summary: string;
  completedAt: string;
};

export type TherapistDashboardData = {
  totalPatients: number;
  activeToday: number;
  followUpCount: number;
  patients: TherapistPatientSummary[];
  recentSessions: TherapistRecentSession[];
};

export type TherapistPatientDetail = TherapistPatientSummary & {
  caregiverName: string;
  latestAssessmentDate: string;
  pn001Summary: {
    title: string;
    completedQuestions: number;
    totalQuestions: number;
    note: string;
  };
  pn002Naming: {
    categoryName: "สัตว์";
    latestSetTitle: string;
    completedQuestions: number;
    totalQuestions: number;
    correctWords: string[];
    missedWords: string[];
    wordsToReview: string[];
  };
};

export type TherapistServiceSuccessResult<T> = {
  success: true;
  data: T;
  errorMessage?: never;
};

export type TherapistServiceFailureResult = {
  success: false;
  data?: never;
  errorMessage: string;
};

export type TherapistServiceResult<T> =
  | TherapistServiceSuccessResult<T>
  | TherapistServiceFailureResult;
