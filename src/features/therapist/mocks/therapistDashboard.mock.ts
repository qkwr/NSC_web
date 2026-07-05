import type {
  TherapistDashboardData,
  TherapistPatientDetail,
} from "../types/therapist.types";

export const mockTherapistPatients: TherapistPatientDetail[] = [
  {
    id: "patient-001",
    code: "PN001",
    name: "สมชาย ใจดี",
    age: 64,
    caregiverName: "คุณมาลี",
    lastSessionAt: "2026-07-05T09:20:00.000Z",
    latestSessionAt: "2026-07-05T09:20:00.000Z",
    latestTrainingSet: "ชุดที่ 2",
    latestAssessmentDate: "2026-07-04",
    needsFollowUp: true,
    pn001ProgressPercent: 100,
    pn002ProgressPercent: 42,
    pn001Summary: {
      title: "แบบประเมินมาตรฐาน",
      completedQuestions: 30,
      totalQuestions: 30,
      note: "ทำครบทุกหมวดแล้ว รอตีความผลทางคลินิก",
    },
    pn002Naming: {
      categoryName: "สัตว์",
      latestSetTitle: "ชุดที่ 2",
      completedQuestions: 19,
      totalQuestions: 45,
      correctWords: ["แมว", "ช้าง", "กระต่าย", "มด"],
      missedWords: ["ฮิปโป", "ฉลาม", "นกยูง"],
      wordsToReview: ["ฮิปโป", "ฉลาม", "นกยูง", "ผีเสื้อ"],
    },
  },
  {
    id: "patient-002",
    code: "PN002",
    name: "สายใจ เมตตา",
    age: 58,
    caregiverName: "คุณอนันต์",
    lastSessionAt: "2026-07-04T15:10:00.000Z",
    latestSessionAt: "2026-07-04T15:10:00.000Z",
    latestTrainingSet: "ชุดที่ 1",
    latestAssessmentDate: "2026-07-03",
    needsFollowUp: false,
    pn001ProgressPercent: 100,
    pn002ProgressPercent: 33,
    pn001Summary: {
      title: "แบบประเมินมาตรฐาน",
      completedQuestions: 30,
      totalQuestions: 30,
      note: "ทำครบแล้ว เริ่มแบบฝึกเรียกชื่อภาพได้",
    },
    pn002Naming: {
      categoryName: "สัตว์",
      latestSetTitle: "ชุดที่ 1",
      completedQuestions: 15,
      totalQuestions: 45,
      correctWords: ["หมา", "จระเข้"],
      missedWords: ["ค้างคาว", "แมงมุม"],
      wordsToReview: ["ค้างคาว", "แมงมุม", "แรด"],
    },
  },
];

export const mockTherapistDashboard: TherapistDashboardData = {
  totalPatients: mockTherapistPatients.length,
  activeToday: 1,
  followUpCount: mockTherapistPatients.filter((patient) => patient.needsFollowUp)
    .length,
  patients: mockTherapistPatients,
  recentSessions: [
    {
      id: "recent-001",
      patientId: "patient-001",
      patientName: "สมชาย ใจดี",
      moduleName: "แบบฝึกเรียกชื่อภาพ",
      summary: "ฝึกหมวดสัตว์ ชุดที่ 2",
      completedAt: "2026-07-05T09:20:00.000Z",
    },
    {
      id: "recent-002",
      patientId: "patient-002",
      patientName: "สายใจ เมตตา",
      moduleName: "แบบประเมินมาตรฐาน",
      summary: "ทำครบ 30 ข้อ",
      completedAt: "2026-07-04T15:10:00.000Z",
    },
  ],
};
