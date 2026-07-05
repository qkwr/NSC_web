import {
  mockCategoryScores,
  mockProgressBySession,
  mockSessionResults,
} from "../mocks/therapistClinical.mock";
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
  void patientId;

  return { success: true, data: mockSessionResults };
}
