import type { CategoryScore } from "../types/therapistClinical.types";

export function getLevelFromTen(score: number) {
  if (score <= 3) return "น้อย";
  if (score <= 6) return "ปานกลาง";
  if (score <= 8) return "ดี";
  return "ดีมาก";
}

export function getLevelFromFifteen(score: number) {
  if (score <= 4) return "น้อย";
  if (score <= 8) return "ปานกลาง";
  if (score <= 13) return "ดี";
  return "ดีมาก";
}

export function generateClinicalReport(categoryScores: CategoryScore[]) {
  const spontaneous = categoryScores.find((c) => c.category === "Spontaneous");
  const comprehension = categoryScores.find((c) => c.category === "Comprehension");
  const repetition = categoryScores.find((c) => c.category === "Words repetition");
  const naming = categoryScores.find((c) => c.category === "Naming");

  const sScore = spontaneous?.score ?? 0;
  const cScore = comprehension?.score ?? 0;
  const rScore = repetition?.score ?? 0;
  const nScore = naming?.score ?? 0;

  const lines = [] as string[];
  lines.push("Aphasia");
  lines.push(
    "- Spontaneous : ผู้ป่วยสื่อสารโต้ตอบระดับ " +
      getLevelFromTen(sScore) +
      " (คะแนน " +
      sScore +
      "/" +
      (spontaneous?.maxScore ?? 10) +
      ")",
  );
  lines.push(
    "- Comprehension : ผู้ป่วยฟังเข้าใจระดับ " +
      getLevelFromTen(cScore) +
      " ชี้รูปภาพตามคำบอกได้ ระดับ " +
      getLevelFromTen(cScore) +
      " (คะแนน " +
      cScore +
      "/" +
      (comprehension?.maxScore ?? 10) +
      ")",
  );
  lines.push(
    "- Words repetition : ผู้ป่วยพูดตามได้ระดับ " +
      getLevelFromTen(rScore) +
      " (คะแนน " +
      rScore +
      "/" +
      (repetition?.maxScore ?? 10) +
      ")",
  );
  lines.push(
    "- Naming : ผู้ป่วยนึกคำศัพท์จากรูปภาพหมวด " +
      (naming ? "ทั่วไป" : "-") +
      " ได้ ระดับ " +
      getLevelFromFifteen(nScore) +
      " (คะแนน " +
      nScore +
      "/" +
      (naming?.maxScore ?? 15) +
      ")",
  );

  return lines.join("\n");
}
