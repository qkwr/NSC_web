import {
  mockTherapistDashboard,
  mockTherapistPatients,
} from "../mocks/therapistDashboard.mock";
import type {
  PatientProfile,
  TherapistDashboardData,
  TherapistPatientDetail,
  TherapistServiceResult,
} from "../types/therapist.types";

const MOCK_API_DELAY_MS = 150;

async function waitForMockApi() {
  await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY_MS));
}

function syncPatientFromProfile(patient: TherapistPatientDetail): TherapistPatientDetail {
  const existingProfile = patient.patientProfile as Partial<PatientProfile> | undefined;
  const fallbackProfile: PatientProfile = {
    id: patient.id,
    patientCode: patient.code,
    fullName: patient.name,
    age: patient.age,
    gender: "",
    birthDate: "",
    province: "",
    postalCode: "",
    occupation: "",
    caregiverName: patient.caregiverName,
    caregiverRelationship: "",
    familyStatus: "มีครอบครัว",
    householdMembersCount: 0,
    spouseName: "",
    hasChildren: false,
    childrenCount: 0,
  };
  const profile: PatientProfile = {
    ...fallbackProfile,
    ...existingProfile,
  };

  profile.id = patient.id;
  profile.patientCode = profile.patientCode || patient.code;
  profile.fullName = profile.fullName || patient.name;
  profile.age = profile.age || patient.age;
  profile.caregiverName = profile.caregiverName || patient.caregiverName;

  return {
    ...patient,
    patientProfile: profile,
    code: profile.patientCode,
    name: profile.fullName,
    age: profile.age,
    caregiverName: profile.caregiverName,
  };
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
      patients: mockTherapistPatients.map(syncPatientFromProfile),
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
      errorMessage: "ไม่พบข้อมูลผู้รับบริการ",
    };
  }

  return {
    success: true,
    data: syncPatientFromProfile(patient),
  };
}

export async function createPatient(
  patient: TherapistPatientDetail,
): Promise<TherapistServiceResult<TherapistPatientDetail>> {
  await waitForMockApi();

  const newPatient: TherapistPatientDetail = syncPatientFromProfile({
    ...patient,
    id: `patient-${String(mockTherapistPatients.length + 1).padStart(3, "0")}`,
    lastSessionAt: new Date().toISOString(),
    latestSessionAt: new Date().toISOString(),
  });

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
      errorMessage: "ไม่พบข้อมูลผู้รับบริการ",
    };
  }

  mockTherapistPatients[index] = syncPatientFromProfile({
    ...mockTherapistPatients[index],
    ...updates,
    id: patientId,
  });

  return {
    success: true,
    data: mockTherapistPatients[index],
  };
}

export async function updatePatientProfile(
  patientId: string,
  patientProfile: PatientProfile,
): Promise<TherapistServiceResult<TherapistPatientDetail>> {
  await waitForMockApi();

  const index = mockTherapistPatients.findIndex((item) => item.id === patientId);
  if (index === -1) {
    return {
      success: false,
      errorMessage: "ไม่พบข้อมูลผู้รับบริการ",
    };
  }

  mockTherapistPatients[index] = syncPatientFromProfile({
    ...mockTherapistPatients[index],
    patientProfile: {
      ...patientProfile,
      id: patientId,
    },
  });

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
      errorMessage: "ไม่พบข้อมูลผู้รับบริการ",
    };
  }

  mockTherapistPatients.splice(index, 1);

  return {
    success: true,
    data: null,
  };
}
