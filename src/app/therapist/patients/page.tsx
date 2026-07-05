import Link from "next/link";
import { getTherapistDashboardData } from "@/features/therapist/services/therapistDashboardService";

export default async function TherapistPatientsPage() {
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

  return (
    <main className="min-h-dvh bg-[linear-gradient(180deg,#F6FEFF_0%,#EAF9FB_58%,#DFF3F5_100%)] px-5 py-6 text-[#123232] sm:px-8">
      <div className="mx-auto w-full max-w-[980px]">
        <Link
          className="mb-5 inline-flex min-h-[56px] items-center justify-center rounded-full bg-white px-7 text-lg font-bold text-[#13756F] shadow-[0_10px_24px_rgba(17,103,99,0.1)] ring-1 ring-[#CDEEEF] transition hover:bg-[#F7FFFF]"
          href="/therapist/dashboard"
        >
          กลับแดชบอร์ด
        </Link>
        <h1 className="text-[2.4rem] font-bold leading-tight sm:text-[3rem]">
          รายชื่อผู้ป่วย
        </h1>
        <div className="mt-6 grid gap-4">
          {result.data.patients.map((patient) => (
            <Link
              key={patient.id}
              className="rounded-[30px] bg-white px-6 py-5 shadow-[0_16px_36px_rgba(17,103,99,0.09)] ring-1 ring-[#CDEEEF] transition hover:bg-[#F8FEFF]"
              href={`/therapist/patients/${patient.id}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-2xl font-bold">{patient.name}</p>
                  <p className="mt-1 text-lg font-semibold text-[#557276]">
                    {patient.code} · อายุ {patient.age} ปี
                  </p>
                </div>
                <p className="rounded-full bg-[#EAF9F8] px-5 py-2 text-lg font-bold text-[#0F756F]">
                  PN002 {patient.pn002ProgressPercent}%
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
