import {
  mockTherapistDashboard,
  mockTherapistPatients,
} from "../mocks/therapistDashboard.mock";
import type {
  TherapistDashboardData,
  TherapistPatientDetail,
  TherapistPatientSummary,
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

  // Rebuild counts from live mock state so that mutations stay in sync.
  return {
    success: true,
    data: {
      ...mockTherapistDashboard,
      totalPatients: mockTherapistPatients.length,
      followUpCount: mockTherapistPatients.filter((patient) => patient.needsFollowUp).length,
      patients: mockTherapistPatients,
    },
  };
}

export async function getTherapistPatientDetail(
  patientId: string,
): Promise<TherapistServiceResult<TherapistPatientDetail>> {
  await waitForMockApi();

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

export async function createPatient(
  patient: TherapistPatientDetail,
): Promise<TherapistServiceResult<TherapistPatientDetail>> {
  await waitForMockApi();

  const newPatient: TherapistPatientDetail = {
    ...patient,
    id: `patient-${String(mockTherapistPatients.length + 1).padStart(3, "0")}`,
    lastSessionAt: new Date().toISOString(),
    latestSessionAt: new Date().toISOString(),
  };

  mockTherapistPatients.push(newPatient);

  return {
    success: true,
    data: newPatient,
  };
}

export async function updatePatient(
  patientId: string,
  updates: TherapistPatientDetail,
): Promise<TherapistServiceResult<TherapistPatientDetail>> {
  await waitForMockApi();

  const index = mockTherapistPatients.findIndex((item) => item.id === patientId);
  if (index === -1) {
    return {
      success: false,
      errorMessage: "ไม่พบข้อมูลผู้ป่วย",
    };
  }

  mockTherapistPatients[index] = {
    ...mockTherapistPatients[index],
    ...updates,
    id: patientId,
  };

  return {
    success: true,
    data: mockTherapistPatients[index],
  };
}

export async function deletePatient(
  patientId: string,
): Promise<TherapistServiceResult<null>> {
  await waitForMockApi();

  const index = mockTherapistPatients.findIndex((item) => item.id === patientId);
  if (index === -1) {
    return {
      success: false,
      errorMessage: "ไม่พบข้อมูลผู้ป่วย",
    };
  }

  mockTherapistPatients.splice(index, 1);

  return {
    success: true,
    data: null,
  };
}
