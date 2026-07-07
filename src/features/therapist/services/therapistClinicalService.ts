import {
  mockCategoryScores,
  mockProgressBySession,
  mockSessionResults,
} from "../mocks/therapistClinical.mock";
import { getSavedNamingResponsesForPatient } from "@/features/training/services/pn002NamingService";
import type {
  CategoryScore,
  ProgressBySession,
  SessionResultItem,
} from "../types/therapistClinical.types";

const MOCK_API_DELAY_MS = 150;

async function waitForMockApi() {
  await new Promise((r) => setTimeout(r, MOCK_API_DELAY_MS));
}

export async function getPatientClinicalOverview(patientId: string): Promise<{
  success: true;
  data: { categoryScores: CategoryScore[]; progressBySession: ProgressBySession[] };
} | { success: false; errorMessage: string }> {
  await waitForMockApi();
  void patientId;

  return { success: true, data: { categoryScores: mockCategoryScores, progressBySession: mockProgressBySession } };
}

export async function getPatientSessionResults(patientId: string): Promise<{
  success: true;
  data: SessionResultItem[];
} | { success: false; errorMessage: string }> {
  await waitForMockApi();

  const savedTrainingResults: SessionResultItem[] =
    getSavedNamingResponsesForPatient(patientId).map(({ response, question }) => ({
      id: response.responseId,
      date: response.submittedAt.slice(0, 10),
      asrTranscript: response.mockAnswer ?? (response.skipped ? "ข้ามข้อนี้" : ""),
      expectedAnswer: question?.answer,
      aiCorrect: response.isCorrect,
      therapistReviewStatus: response.skipped ? "needs-review" : "not-reviewed",
      therapistNote: response.hintLevelUsed
        ? `ใช้คำใบ้ระดับ ${response.hintLevelUsed}`
        : "",
    }));

  const baseResults = patientId === "patient-001" ? mockSessionResults : [];

  return { success: true, data: [...savedTrainingResults, ...baseResults] };
}
