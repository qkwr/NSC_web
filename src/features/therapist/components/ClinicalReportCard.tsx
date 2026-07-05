"use client";

import React, { useState } from "react";
import type { CategoryScore } from "../types/therapistClinical.types";
import { generateClinicalReport } from "../utils/reportHelpers";

export function ClinicalReportCard({ categoryScores }: { categoryScores: CategoryScore[] }) {
  const [text, setText] = useState<string>(() => generateClinicalReport(categoryScores));

  function copyReport() {
    navigator.clipboard.writeText(text).then(() => alert("คัดลอกข้อความรายงานแล้ว"));
  }

  function downloadPdf() {
    // Placeholder: print currently
    alert("Export PDF: coming soon — will use window.print() as a simple fallback");
    // window.print();
  }

  return (
    <div>
      <h3 className="mb-3 text-xl font-bold">สรุปรายงานผลการฝึก</h3>
      <p className="mb-3 text-sm text-[#557276]">ประมวลผลจากคะแนนล่าสุด (ข้อความสามารถแก้ไขก่อนส่งออก)</p>
      <textarea
        className="w-full min-h-[160px] rounded border p-3 font-medium"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="mt-3 flex gap-3">
        <button className="rounded bg-[#1FA89C] px-4 py-2 text-white" onClick={copyReport}>
          คัดลอกข้อความรายงาน
        </button>
        <button className="rounded border px-4 py-2" onClick={downloadPdf}>
          ดาวน์โหลด PDF
        </button>
      </div>
    </div>
  );
}

export default ClinicalReportCard;
