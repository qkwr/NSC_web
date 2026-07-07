import {
  getPatientByPatientCode,
  normalizePatientCode,
  validatePatientCodeFormat,
} from "@/features/therapist/services/therapistDashboardService";
import type { AuthRole, LoginResult } from "../types/auth.types";

const INVALID_ACCESS_CODE_MESSAGE =
  "ไม่พบรหัสเข้าใช้งาน กรุณาตรวจสอบรหัสอีกครั้ง";
const INVALID_THERAPIST_CODE_MESSAGE = "รหัสนักแก้ไขการพูดไม่ถูกต้อง";
const THERAPIST_CODE = "TH001";

const redirectPathByRole: Record<AuthRole, string> = {
  patient: "/patient/home",
  therapist: "/therapist/dashboard",
};

export function validateTherapistCode(code: string) {
  return normalizePatientCode(code) === THERAPIST_CODE;
}

export async function loginWithAccessCode(
  accessCode: string,
): Promise<LoginResult> {
  await new Promise((resolve) => setTimeout(resolve, 350));

  const normalizedCode = normalizePatientCode(accessCode);

  if (!normalizedCode) {
    return {
      success: false,
      errorMessage: INVALID_ACCESS_CODE_MESSAGE,
    };
  }

  if (validateTherapistCode(normalizedCode)) {
    return {
      success: true,
      role: "therapist",
      user: {
        id: "therapist-001",
        accessCode: THERAPIST_CODE,
        role: "therapist",
        displayName: "Therapist 001",
      },
      redirectPath: redirectPathByRole.therapist,
    };
  }

  if (normalizedCode.startsWith("TH")) {
    return {
      success: false,
      errorMessage: INVALID_THERAPIST_CODE_MESSAGE,
    };
  }

  if (!validatePatientCodeFormat(normalizedCode)) {
    return {
      success: false,
      errorMessage: INVALID_ACCESS_CODE_MESSAGE,
    };
  }

  const patientResult = await getPatientByPatientCode(normalizedCode);

  if (!patientResult.success) {
    return {
      success: false,
      errorMessage: INVALID_ACCESS_CODE_MESSAGE,
    };
  }

  return {
    success: true,
    role: "patient",
    user: {
      id: patientResult.data.id,
      accessCode: normalizedCode,
      role: "patient",
      displayName: patientResult.data.name,
    },
    redirectPath: redirectPathByRole.patient,
  };
}
