import type { PatientHomeData } from "../types/patientHome.types";

export const mockPatientHomeByCode: Record<string, PatientHomeData> = {
  "P-482913": {
    patient: {
      id: "patient-001",
      code: "P-482913",
      name: "สมชาย",
    },
    nextAction: {
      type: "needs_standard_assessment",
      eyebrow: "แบบประเมินเริ่มต้น",
      title: "ทำแบบทดสอบก่อนใช้งาน",
      description:
        "เริ่มต้นด้วยแบบประเมินเพื่อให้ระบบวางแผนการฝึกที่เหมาะกับคุณ",
      progressPercent: 0,
      buttonText: "เริ่มทำแบบประเมิน",
      targetPath: "/patient/assessment/start",
    },
  },
  "P-739204": {
    patient: {
      id: "patient-002",
      code: "P-739204",
      name: "ใจดี",
    },
    nextAction: {
      type: "has_daily_training_plan",
      eyebrow: "แบบฝึกวันนี้",
      title: "ฝึกเรียกชื่อภาพ",
      description: "ระบบเลือกแบบฝึกให้จากผลการประเมินที่ผ่านมา",
      progressPercent: 60,
      buttonText: "เริ่มฝึกวันนี้",
      targetPath: "/patient/training/today",
    },
  },
};
