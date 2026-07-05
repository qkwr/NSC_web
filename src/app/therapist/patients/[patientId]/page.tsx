import { TherapistPatientDetail } from "@/features/therapist/components/TherapistPatientDetail";
import { mockTherapistPatients } from "@/features/therapist/mocks/therapistDashboard.mock";
import { getTherapistPatientDetail } from "@/features/therapist/services/therapistDashboardService";

type PageProps = {
  params: Promise<{
    patientId: string;
  }>;
};

export function generateStaticParams() {
  return mockTherapistPatients.map((patient) => ({ patientId: patient.id }));
}

export default async function TherapistPatientDetailPage({ params }: PageProps) {
  const { patientId } = await params;
  const result = await getTherapistPatientDetail(patientId);

  if (!result.success) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#EFFBFD] p-8">
        <p className="rounded-[32px] bg-white px-8 py-7 text-center text-2xl font-bold text-[#B42318] shadow-[0_18px_45px_rgba(24,112,108,0.08)]">
          {result.errorMessage}
        </p>
      </main>
    );
  }

  return <TherapistPatientDetail patient={result.data} />;
}
