import Link from "next/link";
import TherapistPatientDetailClient from "@/features/therapist/components/TherapistPatientDetailClient";
import { mockTherapistPatients } from "@/features/therapist/mocks/therapistDashboard.mock";
import { getPatientClinicalOverview } from "@/features/therapist/services/therapistClinicalService";
import { getTherapistPatientDetail } from "@/features/therapist/services/therapistDashboardService";

type PageProps = {
  params: Promise<{
    patientId: string;
  }>;
};

export function generateStaticParams() {
  return mockTherapistPatients.map((patient) => ({ patientId: patient.id }));
}
export default async function TherapistPatientTrainingDetailPage({
  params,
}: PageProps) {
  const { patientId } = await params;
  const [patientResult, clinicalResult] = await Promise.all([
    getTherapistPatientDetail(patientId),
    getPatientClinicalOverview(patientId),
  ]);

  if (!patientResult.success) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#EFFBFD] p-8">
        <div className="rounded-[32px] bg-white px-8 py-7 text-center shadow-[0_18px_45px_rgba(24,112,108,0.08)] ring-1 ring-[#F3D0D0]">
          <p className="text-2xl font-bold text-[#B42318]">
            {patientResult.errorMessage}
          </p>
          <Link
            href="/therapist/patients"
            className="mt-5 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#1FA89C] px-6 text-base font-bold text-white"
          >
            กลับรายชื่อผู้รับบริการ
          </Link>
        </div>
      </main>
    );
  }

  if (!clinicalResult.success) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#EFFBFD] p-8">
        <div className="rounded-[32px] bg-white px-8 py-7 text-center shadow-[0_18px_45px_rgba(24,112,108,0.08)] ring-1 ring-[#F3D0D0]">
          <p className="text-2xl font-bold text-[#B42318]">
            {clinicalResult.errorMessage}
          </p>
          <Link
            href={`/therapist/patients/${patientId}`}
            className="mt-5 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#1FA89C] px-6 text-base font-bold text-white"
          >
            กลับหน้ารายละเอียด
          </Link>
        </div>
      </main>
    );
  }

  const patient = patientResult.data;
  const { categoryScores, progressBySession } = clinicalResult.data;

  return (
    <main className="print-report-page min-h-dvh bg-[linear-gradient(180deg,#F6FEFF_0%,#EAF9FB_58%,#DFF3F5_100%)] px-4 py-4 text-[#123232] sm:px-6 lg:h-[calc(100dvh-2rem)] lg:min-h-0 lg:overflow-hidden">
      <div className="print-report-container mx-auto flex h-full min-h-0 w-full max-w-[1280px] flex-col">
        <section className="print-card rounded-[28px] bg-white px-5 py-4 shadow-[0_18px_48px_rgba(17,103,99,0.1)] ring-1 ring-[#CDEEEF] sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="inline-flex min-h-[32px] items-center rounded-full bg-[#F2FBFB] px-4 text-xs font-bold text-[#12847D] ring-1 ring-[#CDEEEF]">
                Patient Code {patient.code}
              </p>
              <h1 className="mt-2 truncate text-[clamp(1.7rem,2.6vw,2.35rem)] font-bold leading-tight">
                รายละเอียดการฝึกของ {patient.name}
              </h1>
              <p className="mt-1 text-sm font-semibold text-[#557276]">
                ประเมินล่าสุด {patient.latestAssessmentDate || "—"} ·
                รายงานและกราฟใช้ข้อมูลตาม Filter
              </p>
            </div>
            <div className="no-print flex flex-wrap gap-2">
              <Link
                href={`/therapist/patients/${patient.id}`}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-white px-5 text-sm font-bold text-[#13756F] ring-1 ring-[#CDEEEF] transition hover:bg-[#F7FFFF]"
              >
                กลับหน้ารายละเอียด
              </Link>
              <Link
                href="/therapist/patients"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#1FA89C] px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(31,168,156,0.18)] transition hover:bg-[#178F84]"
              >
                รายชื่อผู้รับบริการ
              </Link>
            </div>
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
