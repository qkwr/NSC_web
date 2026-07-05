export type TodayTrainingPlan = {
  patientId: string;
  planId: string;
  sourceAssessmentId: string;
  moduleId: "PN002";
  moduleName: "Naming";
  categoryId: "animals";
  categoryName: "สัตว์";
  assignedSetId: "set-1" | "set-2" | "set-3";
  totalQuestions: number;
  reason: string;
  sessionId: string;
  status: "ready" | "in_progress" | "completed";
};

export type TrainingPlanServiceSuccessResult<T> = {
  success: true;
  data: T;
  errorMessage?: never;
};

export type TrainingPlanServiceFailureResult = {
  success: false;
  data?: never;
  errorMessage: string;
};

export type TrainingPlanServiceResult<T> =
  | TrainingPlanServiceSuccessResult<T>
  | TrainingPlanServiceFailureResult;
