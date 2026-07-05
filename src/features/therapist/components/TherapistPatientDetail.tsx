import Link from "next/link";
import type { TherapistPatientDetail as TherapistPatientDetailData } from "../types/therapist.types";

import TherapistPatientActions from "./TherapistPatientActions";

type TherapistPatientDetailProps = {
  patient: TherapistPatientDetailData;
};

function ProgressLine({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-base font-bold text-[#45686A]">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[#DDF2F3]">
        <div
          className="h-full rounded-full bg-[#1FA89C]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function ProfileItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-[#F8FEFF] px-4 py-3 ring-1 ring-[#D7EFF0]">
      <p className="text-sm font-bold text-[#12847D]">{label}</p>
      <p className="mt-1 text-base font-semibold text-[#123232]">{value}</p>
    </div>
  );
}

function WordChips({
  tone,
  words,
}: {
  tone: "teal" | "amber" | "rose";
  words: string[];
}) {
  const className =
    tone === "teal"
      ? "bg-[#EAF9F8] text-[#0F756F] ring-[#CDEEEF]"
      : tone === "amber"
        ? "bg-[#FFF7E8] text-[#8A5D12] ring-[#F3EAC8]"
        : "bg-[#FFF1F3] text-[#B42318] ring-[#F8C9C4]";

  return (
    <div className="flex flex-wrap gap-3">
      {words.map((word) => (
        <span
          key={word}
          className={`rounded-full px-5 py-2 text-lg font-bold ring-1 ${className}`}
        >
          {word}
        </span>
      ))}
    </div>
  );
}

export function TherapistPatientDetail({
  patient,
}: TherapistPatientDetailProps) {
  const profile = patient.patientProfile;
  const childrenSummary = profile.hasChildren
    ? `มีลูก ${profile.childrenCount} คน`
    : "ไม่มีลูก";

  return (
    <main className="min-h-dvh bg-[linear-gradient(180deg,#F6FEFF_0%,#EAF9FB_58%,#DFF3F5_100%)] px-5 py-6 text-[#123232] sm:px-8">
      <div className="mx-auto w-full max-w-[1180px]">
        <Link
          href="/therapist/patients"
          className="mb-5 inline-flex min-h-[50px] items-center justify-center rounded-full bg-white px-6 text-base font-bold text-[#13756F] shadow-[0_10px_24px_rgba(17,103,99,0.1)] ring-1 ring-[#CDEEEF] transition hover:bg-[#F7FFFF]"
        >
          กลับไปรายการผู้รับบริการ
        </Link>

        <section className="rounded-[36px] bg-white px-7 py-8 shadow-[0_26px_70px_rgba(24,112,108,0.13)] ring-1 ring-[#CDEEEF] sm:px-9">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div>
              <p className="inline-flex min-h-[38px] items-center rounded-full bg-[#F2FBFB] px-5 text-base font-semibold text-[#12847D] ring-1 ring-[#CDEEEF]">
                {profile.patientCode}
              </p>
              <h1 className="mt-4 text-[2.45rem] font-bold leading-tight sm:text-[3.1rem]">
                {profile.fullName}
              </h1>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <ProfileItem label="อายุ" value={`${profile.age} ปี`} />
                <ProfileItem label="จังหวัด" value={profile.province} />
                <ProfileItem
                  label="ผู้ดูแล"
                  value={`${profile.caregiverName} (${profile.caregiverRelationship})`}
                />
                <ProfileItem
                  label="สมาชิกในครอบครัว"
                  value={`${profile.householdMembersCount} คน`}
                />
                <ProfileItem label="ข้อมูลบุตร" value={childrenSummary} />
              </div>
            </div>

            <div className="rounded-[28px] bg-[#F8FEFF] p-6 ring-1 ring-[#D7EFF0]">
              <h2 className="text-2xl font-bold">ความคืบหน้าแบบฝึก</h2>
              <div className="mt-5 grid gap-4">
                <ProgressLine
                  label="แบบฝึกเรียกชื่อภาพ"
                  value={patient.pn002ProgressPercent}
                />
              </div>
            </div>
          </div>

          <TherapistPatientActions patientId={patient.id} />
        </section>

        <section className="mt-6">
          <article className="rounded-[34px] bg-white px-7 py-7 shadow-[0_18px_48px_rgba(17,103,99,0.1)] ring-1 ring-[#CDEEEF]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">แบบฝึกเรียกชื่อภาพ</h2>
                <p className="mt-2 text-lg font-semibold text-[#13756F]">
                  หมวด{patient.pn002Naming.categoryName} ·{" "}
                  {patient.pn002Naming.latestSetTitle}
                </p>
              </div>
              <p className="rounded-full bg-[#EAF9F8] px-5 py-2 text-lg font-bold text-[#0F756F]">
                {patient.pn002Naming.completedQuestions}/
                {patient.pn002Naming.totalQuestions} ข้อ
              </p>
            </div>

            <div className="mt-6 grid gap-5">
              <div>
                <h3 className="mb-3 text-xl font-bold">คำที่ตอบถูก</h3>
                <WordChips tone="teal" words={patient.pn002Naming.correctWords} />
              </div>
              <div>
                <h3 className="mb-3 text-xl font-bold">คำที่ตอบผิด</h3>
                <WordChips tone="rose" words={patient.pn002Naming.missedWords} />
              </div>
              <div>
                <h3 className="mb-3 text-xl font-bold">คำที่ควรฝึกซ้ำ</h3>
                <WordChips tone="amber" words={patient.pn002Naming.wordsToReview} />
              </div>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
