import { TherapistDashboard } from "@/features/therapist/components/TherapistDashboard";
import { getTherapistDashboardData } from "@/features/therapist/services/therapistDashboardService";

export default async function TherapistDashboardPage() {
  const result = await getTherapistDashboardData();

  if (!result.success) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#EFFBFD] p-8">
        <p className="rounded-[32px] bg-white px-8 py-7 text-center text-2xl font-bold text-[#B42318] shadow-[0_18px_45px_rgba(24,112,108,0.08)]">
          {result.errorMessage}
        </p>
      </main>
    );
  }

  return <TherapistDashboard data={result.data} />;
}
