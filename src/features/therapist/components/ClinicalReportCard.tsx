"use client";

import { useState } from "react";
import type { CategoryScore } from "../types/therapistClinical.types";
import type { TherapistPatientDetail } from "../types/therapist.types";
import { generateClinicalReport } from "../utils/reportHelpers";

export function ClinicalReportCard({
  categoryScores,
  patient,
}: {
  categoryScores: CategoryScore[];
  patient: TherapistPatientDetail;
}) {
  const [text, setText] = useState<string>(() =>
    generateClinicalReport(categoryScores, patient),
  );
  const [copyStatus, setCopyStatus] = useState("คัดลอกรายงาน");

  async function copyReport() {
    await navigator.clipboard.writeText(text);
    setCopyStatus("คัดลอกแล้ว");
    window.setTimeout(() => setCopyStatus("คัดลอกรายงาน"), 2000);
  }

  function downloadPdf() {
    alert("ฟังก์ชันดาวน์โหลด PDF กำลังพัฒนาต่อ");
  }

  return (
    <div>
      <p className="inline-flex min-h-[34px] items-center rounded-full bg-[#F2FBFB] px-4 text-sm font-bold text-[#12847D] ring-1 ring-[#CDEEEF]">
        Clinical report
      </p>
      <h3 className="mt-3 text-xl font-bold">รายงานผลรายบุคคล</h3>
      <p className="mt-2 text-sm font-medium leading-6 text-[#557276]">
        รายงานนี้ผูกกับผู้รับบริการรายนี้เท่านั้น และควรตรวจยืนยันจากเสียงจริงก่อนนำไปใช้
      </p>

      <div className="mt-4 rounded-[22px] bg-[#F8FEFF] p-4 ring-1 ring-[#D7EFF0]">
        <p className="text-sm font-bold text-[#12847D]">{patient.name}</p>
        <p className="mt-1 text-sm font-semibold text-[#557276]">
          วันที่ประเมินล่าสุด {patient.latestAssessmentDate}
        </p>
      </div>

      <textarea
        aria-label="เนื้อหารายงานผลรายบุคคล"
        className="mt-4 min-h-[260px] w-full rounded-[24px] border border-[#D7EFF0] bg-[#F8FEFF] p-4 text-sm font-medium leading-7 text-[#123232]"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />

      <div className="mt-3 flex flex-col gap-3">
        <button
          type="button"
          className="rounded-full bg-[#1FA89C] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(31,168,156,0.22)] hover:bg-[#178F84]"
          onClick={copyReport}
        >
          {copyStatus}
        </button>
        <button
          type="button"
          className="rounded-full border border-[#CDEEEF] bg-white px-5 py-3 text-sm font-bold text-[#13756F] hover:bg-[#F7FFFF]"
          onClick={downloadPdf}
        >
          ดาวน์โหลด PDF
        </button>
      </div>
    </div>
  );
}

export default ClinicalReportCard;
