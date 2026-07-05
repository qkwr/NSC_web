import Link from "next/link";
import TherapistPatientEditForm from "@/features/therapist/components/TherapistPatientEditForm";
import { getTherapistPatientDetail } from "@/features/therapist/services/therapistDashboardService";

type PageProps = {
  params: Promise<{
    patientId: string;
  }>;
};

export default async function EditTherapistPatientPage({ params }: PageProps) {
  const { patientId } = await params;
  const result = await getTherapistPatientDetail(patientId);

  if (!result.success) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#EFFBFD] p-6">
        <div className="w-full max-w-[560px] rounded-[32px] bg-white px-8 py-8 text-center shadow-[0_18px_45px_rgba(24,112,108,0.08)] ring-1 ring-[#CDEEEF]">
          <h1 className="text-2xl font-bold text-[#B42318]">
            ไม่พบข้อมูลผู้รับบริการ
          </h1>
          <Link
            href="/therapist/patients"
            className="mt-6 inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#1FA89C] px-6 text-base font-bold text-white shadow-[0_10px_24px_rgba(31,168,156,0.22)] hover:bg-[#178F84]"
          >
            กลับไปรายการผู้รับบริการ
          </Link>
        </div>
      </main>
    );
  }

  return (
    <TherapistPatientEditForm
      patientId={patientId}
      initialProfile={result.data.patientProfile}
    />
  );
}
