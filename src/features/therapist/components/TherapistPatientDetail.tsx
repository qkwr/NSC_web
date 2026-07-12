"use client";

import Link from "next/link";
import { useState } from "react";
import type {
  PatientProfile,
  TherapistPatientDetail as TherapistPatientDetailData,
} from "../types/therapist.types";
import type {
  CategoryScore,
  ProgressBySession,
} from "../types/therapistClinical.types";
import TherapistPatientActions from "./TherapistPatientActions";
import TherapistPatientDetailClient from "./TherapistPatientDetailClient";

type TherapistPatientDetailProps = {
  categoryScores: CategoryScore[];
  patient: TherapistPatientDetailData;
  progressBySession: ProgressBySession[];
};

function getSafePatientProfile(
  patient: TherapistPatientDetailData,
): PatientProfile {
  const existingProfile = patient.patientProfile as
    | Partial<PatientProfile>
    | undefined;

  const fallbackProfile: PatientProfile = {
    id: patient.id,
    patientCode: patient.code,
    fullName: patient.name,
    age: patient.age,
    gender: "",
    birthDate: "",
    province: "—",
    postalCode: "",
    occupation: "",
    caregiverName: patient.caregiverName || "—",
    caregiverRelationship: "—",
    familyStatus: "—",
    householdMembersCount: 0,
    spouseName: "",
    hasChildren: false,
    childrenCount: 0,
  };

  return {
    ...fallbackProfile,
    ...existingProfile,
    id: existingProfile?.id || patient.id,
    patientCode: existingProfile?.patientCode || patient.code,
    fullName: existingProfile?.fullName || patient.name,
    age: existingProfile?.age || patient.age,
    caregiverName: existingProfile?.caregiverName || patient.caregiverName || "—",
  };
}
function ProfileChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] bg-[#F8FEFF] px-4 py-3 ring-1 ring-[#D7EFF0]">
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#12847D]">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-[#123232]">{value || "—"}</p>
    </div>
  );
}

export function TherapistPatientDetail({
  categoryScores,
  patient,
  progressBySession,
}: TherapistPatientDetailProps) {
  const [copyStatus, setCopyStatus] = useState("");
  const profile = getSafePatientProfile(patient);

  async function handleCopyPatientCode() {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(profile.patientCode);
    setCopyStatus("คัดลอกรหัสแล้ว");
  }

  return (
    <main className="min-h-dvh overflow-x-clip bg-[linear-gradient(180deg,#F6FEFF_0%,#EAF9FB_58%,#DFF3F5_100%)] px-3 py-3 text-[#123232] sm:px-5">
      <div className="mx-auto flex w-full max-w-[1500px] min-w-0 flex-col">
        <section className="min-w-0 rounded-[24px] bg-white px-5 py-4 shadow-[0_14px_36px_rgba(17,103,99,0.08)] ring-1 ring-[#CDEEEF] sm:px-6">
          <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/therapist/patients"
                  className="no-print inline-flex min-h-[38px] items-center justify-center rounded-full bg-white px-4 text-sm font-bold text-[#13756F] ring-1 ring-[#CDEEEF] transition hover:bg-[#F7FFFF]"
                >
                  กลับรายชื่อ
                </Link>
                <button
                  type="button"
                  className="no-print inline-flex min-h-[38px] items-center justify-center rounded-full bg-[#F2FBFB] px-4 text-sm font-bold text-[#13756F] ring-1 ring-[#CDEEEF] transition hover:bg-[#F7FFFF]"
                  onClick={handleCopyPatientCode}
                >
                  {copyStatus || `Patient Code ${profile.patientCode}`}
                </button>
              </div>
              <h1 className="mt-3 text-[clamp(1.75rem,2.7vw,2.45rem)] font-bold leading-tight">
                {profile.fullName}
              </h1>
              <p className="mt-1 text-sm font-semibold text-[#557276]">
                ประเมินล่าสุด {patient.latestAssessmentDate || "—"} · ฝึกล่าสุด{" "}
                {patient.latestSessionAt?.slice(0, 10) || "—"}
              </p>
            </div>

            <div className="no-print xl:min-w-[360px]">
              <TherapistPatientActions patientId={patient.id} />
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <ProfileChip label="อายุ" value={`${profile.age || "—"} ปี`} />
            <ProfileChip label="จังหวัด" value={profile.province || "—"} />
            <ProfileChip
              label="ผู้ดูแล"
              value={`${profile.caregiverName || "—"} (${profile.caregiverRelationship || "—"})`}
            />
            <ProfileChip
              label="หมวดล่าสุด"
              value={patient.latestTrainingSet || patient.pn002Naming.latestSetTitle || "—"}
            />
            <ProfileChip
              label="ภาพรวมการฝึก"
              value={`${patient.pn002Naming.completedQuestions || "—"}/${patient.pn002Naming.totalQuestions || "—"} ข้อ`}
            />
          </div>
        </section>

        <TherapistPatientDetailClient
          patient={patient}
          categoryScores={categoryScores}
          progressBySession={progressBySession}
        />
      </div>
    </main>
  );
}
