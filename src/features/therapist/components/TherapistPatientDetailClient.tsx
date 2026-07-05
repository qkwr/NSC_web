"use client";

import React from "react";
import ClinicalCharts from "./ClinicalCharts";
import SessionReviewList from "./SessionReviewList";
import ClinicalReportCard from "./ClinicalReportCard";
import type { TherapistPatientDetail as TherapistPatientDetailData } from "../types/therapist.types";
import type { CategoryScore, ProgressBySession } from "../types/therapistClinical.types";

export default function TherapistPatientDetailClient({
  patient,
  categoryScores,
  progressBySession,
}: {
  patient: TherapistPatientDetailData;
  categoryScores: CategoryScore[];
  progressBySession: ProgressBySession[];
}) {
  return (
    <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
      <div>
        <div className="rounded-[28px] bg-white px-6 py-6 shadow-[0_12px_30px_rgba(17,103,99,0.08)] ring-1 ring-[#CDEEEF]">
          <ClinicalCharts scores={categoryScores} progress={progressBySession} />
        </div>

        <div className="mt-6 rounded-[28px] bg-white px-6 py-6 shadow-[0_12px_30px_rgba(17,103,99,0.08)] ring-1 ring-[#CDEEEF]">
          <SessionReviewList patientId={patient.id} />
        </div>
      </div>

      <aside>
        <div className="rounded-[28px] bg-white px-6 py-6 shadow-[0_12px_30px_rgba(17,103,99,0.08)] ring-1 ring-[#CDEEEF]">
          <ClinicalReportCard categoryScores={categoryScores} />
        </div>
      </aside>
    </section>
  );
}
