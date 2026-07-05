import type { PatientHomeData } from "../types/patientHome.types";

export const mockPatientHomeByCode: Record<string, PatientHomeData> = {
  PN001: {
    patient: {
      id: "patient-001",
      code: "PN001",
      name: "สมชาย",
    },
    nextAction: {
      type: "needs_standard_assessment",
      eyebrow: "แบบประเมินเริ่มต้น",
      title: "ทำแบบประเมินมาตรฐาน",
      description:
        "เริ่มต้นด้วยแบบประเมินเพื่อให้ระบบวางแผนการฝึกที่เหมาะกับคุณ",
      progressPercent: 0,
      buttonText: "เริ่มทำแบบประเมิน",
      targetPath: "/patient/assessment/start",
    },
  },
  PN002: {
    patient: {
      id: "patient-002",
      code: "PN002",
      name: "ใจดี",
    },
    nextAction: {
      type: "has_daily_training_plan",
      eyebrow: "แผนการฝึกวันนี้",
      title: "ฝึกเรียกชื่อสิ่งของรอบตัว",
      description: "เริ่มจากแบบฝึกที่ระบบแนะนำตามผลการประเมินที่ผ่านมา",
      progressPercent: 60,
      buttonText: "เริ่มฝึกวันนี้",
      targetPath: "/patient/training/today",
    },
  },
};
