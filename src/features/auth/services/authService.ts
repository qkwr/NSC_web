import { mockAuthRecords } from "../mocks/auth.mock";
import type { AuthRole, LoginResult } from "../types/auth.types";

const INVALID_ACCESS_CODE_MESSAGE =
  "ไม่พบรหัสเข้าใช้งาน กรุณาตรวจสอบอีกครั้ง";

const redirectPathByRole: Record<AuthRole, string> = {
  patient: "/patient/home",
  therapist: "/therapist/dashboard",
};

export async function loginWithAccessCode(
  accessCode: string,
): Promise<LoginResult> {
  await new Promise((resolve) => setTimeout(resolve, 350));

  const normalizedCode = accessCode.trim().toUpperCase();
  const authRecord = mockAuthRecords.find(
    (record) => record.accessCode.toUpperCase() === normalizedCode,
  );

  if (!authRecord) {
    return {
      success: false,
      errorMessage: INVALID_ACCESS_CODE_MESSAGE,
    };
  }

  return {
    success: true,
    role: authRecord.user.role,
    user: authRecord.user,
    redirectPath: redirectPathByRole[authRecord.user.role],
  };
}
