"use client";

import { useMemo, useState } from "react";
import PatientProgressSummaryCards from "./PatientProgressSummaryCards";
import ProgressChart from "./ProgressChart";
import ProgressFilters from "./ProgressFilters";
import ProgressInsights from "./ProgressInsights";
import ReportPreview from "./ReportPreview";
import TrainingHistory from "./TrainingHistory";
import type { TherapistPatientDetail as TherapistPatientDetailData } from "../types/therapist.types";
import type {
  CategoryScore,
  ProgressBySession,
} from "../types/therapistClinical.types";
import {
  getCategoryAggregates,
  getFilteredProgressPoints,
  getProgressInsights,
  getProgressSummary,
  type PatientProgressFilters,
} from "../utils/patientProgress";

type ActiveWorkspaceTab = "overview" | "report";

export default function TherapistPatientDetailClient({
  patient,
  categoryScores,
  progressBySession,
}: {
  patient: TherapistPatientDetailData;
  categoryScores: CategoryScore[];
  progressBySession: ProgressBySession[];
}) {
  const [activeTab, setActiveTab] = useState<ActiveWorkspaceTab>("overview");
  const [filters, setFilters] = useState<PatientProgressFilters>({
    categoryKey: "overview",
    timeRangeKey: "all",
  });

  const points = useMemo(
    () => getFilteredProgressPoints(progressBySession, categoryScores, filters),
    [categoryScores, filters, progressBySession],
  );
  const aggregates = useMemo(
    () => getCategoryAggregates(progressBySession, categoryScores, filters),
    [categoryScores, filters, progressBySession],
  );
  const summary = useMemo(() => getProgressSummary(points), [points]);
  const insights = useMemo(
    () => getProgressInsights({ aggregates, filters, points }),
    [aggregates, filters, points],
  );
  return (
    <section className="mt-4 flex min-h-0 flex-1 flex-col gap-4">
      <div className="no-print flex flex-col gap-3 rounded-[26px] bg-white p-3 shadow-sm ring-1 ring-[#CDEEEF] xl:flex-row xl:items-center xl:justify-between">
        <ProgressFilters value={filters} onChange={setFilters} />
        <div className="flex shrink-0 rounded-full bg-[#F2FBFB] p-1 ring-1 ring-[#CDEEEF]">
          {[
            { key: "overview", label: "ภาพรวม" },
            { key: "report", label: "รายงาน" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`min-h-[38px] rounded-full px-5 text-sm font-bold transition ${
                activeTab === tab.key
                  ? "bg-[#1FA89C] text-white shadow-sm"
                  : "text-[#13756F] hover:bg-white"
              }`}
              onClick={() => setActiveTab(tab.key as ActiveWorkspaceTab)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[220px_minmax(0,1fr)_300px] xl:grid-cols-[240px_minmax(0,1fr)_320px]">
        <aside className="min-h-0 overflow-y-auto rounded-[26px] bg-[#F8FEFF] p-3 ring-1 ring-[#D7EFF0] lg:overflow-visible">
          <PatientProgressSummaryCards summary={summary} />
        </aside>

        <div className="min-h-0">
          {activeTab === "overview" ? (
            <ProgressChart categoryKey={filters.categoryKey} points={points} />
          ) : (
            <ReportPreview
              filters={filters}
              insights={insights}
              patient={patient}
              points={points}
              summary={summary}
            />
          )}
        </div>

        <aside className="grid min-h-0 gap-4 lg:grid-rows-[minmax(0,1fr)_minmax(190px,0.82fr)]">
          <ProgressInsights insights={insights} />
          <TrainingHistory points={points} />
        </aside>
      </div>
    </section>
  );
}
