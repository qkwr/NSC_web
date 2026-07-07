import { TherapistPatientDetail } from "@/features/therapist/components/TherapistPatientDetail";
import TherapistPatientDetailFallback from "@/features/therapist/components/TherapistPatientDetailFallback";
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
    return <TherapistPatientDetailFallback patientId={patientId} />;
  }

  return <TherapistPatientDetail patient={result.data} />;
}
