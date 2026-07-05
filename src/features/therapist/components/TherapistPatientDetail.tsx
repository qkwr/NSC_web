import Link from "next/link";
import type { TherapistPatientDetail as TherapistPatientDetailData } from "../types/therapist.types";

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
  return (
    <main className="min-h-dvh bg-[linear-gradient(180deg,#F6FEFF_0%,#EAF9FB_58%,#DFF3F5_100%)] px-5 py-6 text-[#123232] sm:px-8">
      <div className="mx-auto w-full max-w-[1180px]">
        <Link
          className="mb-5 inline-flex min-h-[56px] items-center justify-center rounded-full bg-white px-7 text-lg font-bold text-[#13756F] shadow-[0_10px_24px_rgba(17,103,99,0.1)] ring-1 ring-[#CDEEEF] transition hover:bg-[#F7FFFF]"
          href="/therapist/dashboard"
        >
          กลับแดชบอร์ด
        </Link>

        <section className="rounded-[36px] bg-white px-7 py-8 shadow-[0_26px_70px_rgba(24,112,108,0.13)] ring-1 ring-[#CDEEEF] sm:px-9">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div>
              <p className="inline-flex min-h-[38px] items-center rounded-full bg-[#F2FBFB] px-5 text-base font-semibold text-[#12847D] ring-1 ring-[#CDEEEF]">
                {patient.code}
              </p>
              <h1 className="mt-4 text-[2.45rem] font-bold leading-tight sm:text-[3.1rem]">
                {patient.name}
              </h1>
              <p className="mt-3 text-xl font-semibold text-[#557276]">
                อายุ {patient.age} ปี · ผู้ดูแล {patient.caregiverName}
              </p>
              <p className="mt-2 text-lg font-semibold text-[#557276]">
                วันที่ประเมินล่าสุด {patient.latestAssessmentDate}
              </p>
            </div>

            <div className="rounded-[28px] bg-[#F8FEFF] p-6 ring-1 ring-[#D7EFF0]">
              <h2 className="text-2xl font-bold">ความคืบหน้าการฝึก</h2>
              <div className="mt-5 grid gap-4">
                <ProgressLine
                  label="PN001 Assessment"
                  value={patient.pn001ProgressPercent}
                />
                <ProgressLine
                  label="PN002 เรียกชื่อภาพ"
                  value={patient.pn002ProgressPercent}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <article className="rounded-[34px] bg-white px-7 py-7 shadow-[0_18px_48px_rgba(17,103,99,0.1)] ring-1 ring-[#CDEEEF]">
            <h2 className="text-2xl font-bold">{patient.pn001Summary.title}</h2>
            <p className="mt-4 text-[2.4rem] font-bold text-[#0F756F]">
              {patient.pn001Summary.completedQuestions}/
              {patient.pn001Summary.totalQuestions}
            </p>
            <p className="mt-3 text-lg font-medium leading-8 text-[#557276]">
              {patient.pn001Summary.note}
            </p>
          </article>

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

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                className="min-h-[58px] flex-1 rounded-full bg-[#1FA89C] px-6 text-lg font-bold text-white shadow-[0_12px_26px_rgba(31,168,156,0.22)]"
                type="button"
              >
                ดูรายละเอียดแบบฝึก
              </button>
              <button
                className="min-h-[58px] flex-1 rounded-full bg-white px-6 text-lg font-bold text-[#13756F] shadow-[0_10px_24px_rgba(17,103,99,0.1)] ring-1 ring-[#CDEEEF]"
                type="button"
              >
                ปรับแผนฝึก
              </button>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
