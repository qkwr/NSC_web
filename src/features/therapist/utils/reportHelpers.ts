import type { CategoryScore } from "../types/therapistClinical.types";

type ClinicalReportPatient = {
  name: string;
  latestAssessmentDate: string;
  pn002Naming?: {
    categoryName?: string;
  };
};

export function getLevelFromPercent(percent: number) {
  if (percent < 40) return "น้อย";
  if (percent < 70) return "ปานกลาง";
  if (percent < 85) return "ดี";
  return "ดีมาก";
}

export function getLevelFromTen(score: number) {
  return getLevelFromPercent((score / 10) * 100);
}

export function getLevelFromFifteen(score: number) {
  return getLevelFromPercent((score / 15) * 100);
}

function findScore(categoryScores: CategoryScore[], category: string) {
  return categoryScores.find((score) => score.category === category);
}

function getLevel(categoryScores: CategoryScore[], category: string) {
  const score = findScore(categoryScores, category);
  if (!score || score.maxScore <= 0) return "รอตรวจเพิ่มเติม";

  return getLevelFromPercent((score.score / score.maxScore) * 100);
}

export function generateClinicalReport(
  categoryScores: CategoryScore[],
  patient?: ClinicalReportPatient,
) {
  const spontaneousLevel = getLevel(categoryScores, "Spontaneous");
  const comprehensionLevel = getLevel(categoryScores, "Comprehension");
  const repetitionLevel = getLevel(categoryScores, "Words repetition");
  const namingLevel = getLevel(categoryScores, "Naming");
  const namingCategory = patient?.pn002Naming?.categoryName ?? "รูปภาพ";

  const lines: string[] = [];

  if (patient) {
    lines.push(`รายงานผลการฝึกของ ${patient.name}`);
    lines.push(`วันที่ประเมินล่าสุด ${patient.latestAssessmentDate}`);
    lines.push("");
  }

  lines.push("Aphasia");
  lines.push(`- Spontaneous : ผู้ป่วยสื่อสารโต้ตอบระดับ ${spontaneousLevel}`);
  lines.push(
    `- Comprehension : ผู้ป่วยฟังเข้าใจระดับ ${comprehensionLevel} ชี้รูปภาพตามคำบอกได้ ระดับ ${comprehensionLevel}`,
  );
  lines.push(`- Words repetition : ผู้ป่วยพูดตามได้ระดับ ${repetitionLevel}`);
  lines.push(
    `- Naming : ผู้ป่วยนึกคำศัพท์จากรูปภาพหมวด ${namingCategory} ได้ ระดับ ${namingLevel}`,
  );

  return lines.join("\n");
}
