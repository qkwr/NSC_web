import {
  mockTherapistDashboard,
  mockTherapistPatients,
} from "../mocks/therapistDashboard.mock";
import type {
  TherapistDashboardData,
  TherapistPatientDetail,
  TherapistServiceResult,
} from "../types/therapist.types";

const MOCK_API_DELAY_MS = 150;

async function waitForMockApi() {
  await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY_MS));
}

export async function getTherapistDashboardData(): Promise<
  TherapistServiceResult<TherapistDashboardData>
> {
  await waitForMockApi();

  // TODO: replace mock data with backend API integration.
  return {
    success: true,
    data: mockTherapistDashboard,
  };
}

export async function getTherapistPatientDetail(
  patientId: string,
): Promise<TherapistServiceResult<TherapistPatientDetail>> {
  await waitForMockApi();

  // TODO: replace mock data with backend API integration.
  const patient = mockTherapistPatients.find((item) => item.id === patientId);

  if (!patient) {
    return {
      success: false,
      errorMessage: "ไม่พบข้อมูลผู้ป่วย",
    };
  }

  return {
    success: true,
    data: patient,
  };
}
