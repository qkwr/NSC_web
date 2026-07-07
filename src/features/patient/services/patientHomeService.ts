import { getPatientByPatientCode } from "@/features/therapist/services/therapistDashboardService";
import type { PatientHomeData, PatientHomeResult } from "../types/patientHome.types";

function getDisplayFirstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

function createPatientHomeData(patientCode: string, patient: {
  id: string;
  name: string;
  pn001ProgressPercent: number;
  pn002ProgressPercent: number;
}): PatientHomeData {
  const needsAssessment = patient.pn001ProgressPercent < 100;

  return {
    patient: {
      id: patient.id,
      code: patientCode,
      name: getDisplayFirstName(patient.name),
    },
    nextAction: needsAssessment
      ? {
          type: "needs_standard_assessment",
          eyebrow: "แบบทดสอบก่อนใช้งาน",
          title: "ทำแบบทดสอบก่อนใช้งาน",
          description:
            "เริ่มต้นด้วยแบบทดสอบก่อนใช้งาน เพื่อให้ระบบวางแผนการฝึกที่เหมาะกับคุณ",
          progressPercent: patient.pn001ProgressPercent,
          buttonText: "เริ่มทำแบบทดสอบก่อนใช้งาน",
          targetPath: "/patient/assessment/start",
        }
      : {
          type: "has_daily_training_plan",
          eyebrow: "แบบฝึกวันนี้",
          title: "ฝึกเรียกชื่อภาพ",
          description:
            "ระบบเลือกแบบฝึกให้จากผลการประเมินที่ผ่านมา",
          progressPercent: patient.pn002ProgressPercent,
          buttonText: "เริ่มฝึกวันนี้",
          targetPath: "/patient/training/today",
        },
  };
}

export async function getPatientHomeData(
  patientCode: string,
): Promise<PatientHomeResult> {
  const result = await getPatientByPatientCode(patientCode);

  if (!result.success) {
    return {
      success: false,
      errorMessage: "ไม่พบข้อมูลผู้รับบริการ",
    };
  }

  return {
    success: true,
    data: createPatientHomeData(patientCode.trim().toUpperCase(), result.data),
  };
}
