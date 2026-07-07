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
const LOCAL_PATIENTS_STORAGE_KEY = "nsc_therapist_patients";
const PATIENT_CODE_PATTERN = /^P-\d{6}$/;
const LEGACY_PATIENT_CODE_BY_ID: Record<string, string> = {
  "patient-001": "P-482913",
  "patient-002": "P-739204",
};

async function waitForMockApi() {
  await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY_MS));
}

function canUseLocalStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readStoredPatients(): TherapistPatientDetail[] {
  if (!canUseLocalStorage()) {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(LOCAL_PATIENTS_STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredPatients(patients: TherapistPatientDetail[]) {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(
    LOCAL_PATIENTS_STORAGE_KEY,
    JSON.stringify(patients),
  );
}

function getAllPatientsForCurrentRuntime() {
  const storedPatients = readStoredPatients();
  const storedPatientIds = new Set(storedPatients.map((patient) => patient.id));

  return [
    ...mockTherapistPatients.filter((patient) => !storedPatientIds.has(patient.id)),
    ...storedPatients,
  ];
}

export function normalizePatientCode(patientCode: string) {
  return patientCode.trim().toUpperCase();
}

export function validatePatientCodeFormat(patientCode: string) {
  return PATIENT_CODE_PATTERN.test(normalizePatientCode(patientCode));
}

function getPatientCodeValue(patient: TherapistPatientDetail) {
  const profileCode = patient.patientProfile?.patientCode || patient.code;
  const normalizedCode = normalizePatientCode(profileCode);

  if (validatePatientCodeFormat(normalizedCode)) {
    return normalizedCode;
  }

  return LEGACY_PATIENT_CODE_BY_ID[patient.id] ?? normalizedCode;
}

export function isPatientCodeUnique(
  patientCode: string,
  ignoredPatientId?: string,
) {
  const normalizedCode = normalizePatientCode(patientCode);

  if (!validatePatientCodeFormat(normalizedCode)) {
    return false;
  }

  return getAllPatientsForCurrentRuntime()
    .map(syncPatientFromProfile)
    .every((patient) => {
      if (ignoredPatientId && patient.id === ignoredPatientId) {
        return true;
      }

      return getPatientCodeValue(patient) !== normalizedCode;
    });
}

export function generatePatientCode() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const digits = String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
    const nextCode = `P-${digits}`;

    if (isPatientCodeUnique(nextCode)) {
      return nextCode;
    }
  }

  return `P-${String(Date.now()).slice(-6)}`;
}

function upsertStoredPatient(patient: TherapistPatientDetail) {
  const storedPatients = readStoredPatients();
  const existingIndex = storedPatients.findIndex((item) => item.id === patient.id);

  if (existingIndex === -1) {
    writeStoredPatients([...storedPatients, patient]);
    return;
  }

  const nextPatients = [...storedPatients];
  nextPatients[existingIndex] = patient;
  writeStoredPatients(nextPatients);
}

function removeStoredPatient(patientId: string) {
  writeStoredPatients(
    readStoredPatients().filter((patient) => patient.id !== patientId),
  );
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
  profile.patientCode = getPatientCodeValue({
    ...patient,
    patientProfile: profile,
  });
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
  const patients = getAllPatientsForCurrentRuntime();

  // Rebuild counts from live mock state so that mutations stay in sync.
  return {
    success: true,
    data: {
      ...mockTherapistDashboard,
      totalPatients: patients.length,
      followUpCount: patients.filter((patient) => patient.needsFollowUp).length,
      patients: patients.map(syncPatientFromProfile),
    },
  };
}

export async function getTherapistPatientDetail(
  patientId: string,
): Promise<TherapistServiceResult<TherapistPatientDetail>> {
  await waitForMockApi();

  const patient = getAllPatientsForCurrentRuntime().find(
    (item) => item.id === patientId,
  );

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

export async function getPatientByPatientCode(
  patientCode: string,
): Promise<TherapistServiceResult<TherapistPatientDetail>> {
  await waitForMockApi();

  const normalizedCode = normalizePatientCode(patientCode);
  const patient = getAllPatientsForCurrentRuntime()
    .map(syncPatientFromProfile)
    .find((item) => getPatientCodeValue(item) === normalizedCode);

  if (!patient) {
    return {
      success: false,
      errorMessage: "ไม่พบข้อมูลผู้รับบริการจากรหัสนี้",
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

  const normalizedPatient = syncPatientFromProfile(patient);
  if (!isPatientCodeUnique(normalizedPatient.patientProfile.patientCode)) {
    return {
      success: false,
      errorMessage: "รหัสเข้าใช้งานผู้รับบริการนี้ถูกใช้แล้ว",
    };
  }

  const allPatients = getAllPatientsForCurrentRuntime();
  const newPatient: TherapistPatientDetail = syncPatientFromProfile({
    ...normalizedPatient,
    id: `patient-${String(allPatients.length + 1).padStart(3, "0")}`,
    lastSessionAt: new Date().toISOString(),
    latestSessionAt: new Date().toISOString(),
  });

  if (canUseLocalStorage()) {
    upsertStoredPatient(newPatient);
  } else {
    mockTherapistPatients.push(newPatient);
  }

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
    const storedPatient = readStoredPatients().find(
      (item) => item.id === patientId,
    );

    if (!storedPatient) {
      return {
        success: false,
        errorMessage: "ไม่พบข้อมูลผู้รับบริการ",
      };
    }

    const updatedStoredPatient = syncPatientFromProfile({
      ...storedPatient,
      ...updates,
      id: patientId,
    });
    upsertStoredPatient(updatedStoredPatient);

    return {
      success: true,
      data: updatedStoredPatient,
    };
  }

  mockTherapistPatients[index] = syncPatientFromProfile({
    ...mockTherapistPatients[index],
    ...updates,
    id: patientId,
  });

  if (canUseLocalStorage()) {
    upsertStoredPatient(mockTherapistPatients[index]);
  }

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

  if (!isPatientCodeUnique(patientProfile.patientCode, patientId)) {
    return {
      success: false,
      errorMessage: "รหัสเข้าใช้งานผู้รับบริการนี้ถูกใช้แล้วหรือรูปแบบไม่ถูกต้อง",
    };
  }

  const index = mockTherapistPatients.findIndex((item) => item.id === patientId);
  if (index === -1) {
    const storedPatient = readStoredPatients().find(
      (item) => item.id === patientId,
    );

    if (!storedPatient) {
      return {
        success: false,
        errorMessage: "ไม่พบข้อมูลผู้รับบริการ",
      };
    }

    const updatedStoredPatient = syncPatientFromProfile({
      ...storedPatient,
      patientProfile: {
        ...patientProfile,
        id: patientId,
      },
    });
    upsertStoredPatient(updatedStoredPatient);

    return {
      success: true,
      data: updatedStoredPatient,
    };
  }

  mockTherapistPatients[index] = syncPatientFromProfile({
    ...mockTherapistPatients[index],
    patientProfile: {
      ...patientProfile,
      id: patientId,
    },
  });

  if (canUseLocalStorage()) {
    upsertStoredPatient(mockTherapistPatients[index]);
  }

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
    const storedPatient = readStoredPatients().find(
      (item) => item.id === patientId,
    );

    if (!storedPatient) {
      return {
        success: false,
        errorMessage: "ไม่พบข้อมูลผู้รับบริการ",
      };
    }

    removeStoredPatient(patientId);

    return {
      success: true,
      data: null,
    };
  }

  mockTherapistPatients.splice(index, 1);
  removeStoredPatient(patientId);

  return {
    success: true,
    data: null,
  };
}
