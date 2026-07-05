import { mockPatientHomeByCode } from "../mocks/patientHome.mock";
import type { PatientHomeResult } from "../types/patientHome.types";

export async function getPatientHomeData(
  accessCode: string,
): Promise<PatientHomeResult> {
  await new Promise((resolve) => setTimeout(resolve, 250));

  const normalizedCode = accessCode.trim().toUpperCase();
  const patientHomeData = mockPatientHomeByCode[normalizedCode];

  if (!patientHomeData) {
    return {
      success: false,
      errorMessage: "ไม่พบข้อมูลผู้รับบริการ",
    };
  }

  return {
    success: true,
    data: patientHomeData,
  };
}
