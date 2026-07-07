"use client";

import ClinicalCharts from "./ClinicalCharts";
import SessionReviewList from "./SessionReviewList";
import ClinicalReportCard from "./ClinicalReportCard";
import type { TherapistPatientDetail as TherapistPatientDetailData } from "../types/therapist.types";
import type {
  CategoryScore,
  ProgressBySession,
  ResponseStatusByCategory,
  SessionResultItem,
} from "../types/therapistClinical.types";

export default function TherapistPatientDetailClient({
  patient,
  categoryScores,
  progressBySession,
  responseStatuses,
  sessionResults,
}: {
  patient: TherapistPatientDetailData;
  categoryScores: CategoryScore[];
  progressBySession: ProgressBySession[];
  responseStatuses: ResponseStatusByCategory[];
  sessionResults: SessionResultItem[];
}) {
  return (
    <section className="print-training-grid mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
      <div>
        <ClinicalCharts
          scores={categoryScores}
          progress={progressBySession}
          responseStatuses={responseStatuses}
        />

        <div className="print-card mt-6 rounded-[28px] bg-white px-6 py-6 shadow-[0_12px_30px_rgba(17,103,99,0.08)] ring-1 ring-[#CDEEEF]">
          <SessionReviewList patientId={patient.id} initialItems={sessionResults} />
        </div>
      </div>

      <aside>
        <div className="print-card rounded-[28px] bg-white px-6 py-6 shadow-[0_12px_30px_rgba(17,103,99,0.08)] ring-1 ring-[#CDEEEF]">
          <ClinicalReportCard categoryScores={categoryScores} patient={patient} />
        </div>
      </aside>
    </section>
  );
}
