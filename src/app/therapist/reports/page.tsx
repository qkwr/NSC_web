import Link from "next/link";
import { getTherapistDashboardData } from "@/features/therapist/services/therapistDashboardService";

export default async function TherapistReportsPage() {
  const result = await getTherapistDashboardData();

  if (!result.success) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#EFFBFD] p-8">
        <div className="rounded-[32px] bg-white px-8 py-7 text-center shadow-[0_18px_45px_rgba(24,112,108,0.08)] ring-1 ring-[#F3D0D0]">
          <p className="text-2xl font-bold text-[#B42318]">
            {result.errorMessage}
          </p>
          <Link
            href="/therapist/dashboard"
            className="mt-5 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#1FA89C] px-6 text-base font-bold text-white"
          >
            กลับแดชบอร์ด
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[linear-gradient(180deg,#F6FEFF_0%,#EAF9FB_58%,#DFF3F5_100%)] px-5 py-6 text-[#123232] sm:px-8">
      <div className="mx-auto w-full max-w-[1120px]">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex min-h-[36px] items-center rounded-full bg-[#F2FBFB] px-5 text-sm font-bold text-[#12847D] ring-1 ring-[#CDEEEF]">
              PoodPlearn reports
            </p>
            <h1 className="mt-4 text-[clamp(2rem,4vw,3rem)] font-bold leading-tight">
              รายงานผลรายบุคคล
            </h1>
            <p className="mt-2 max-w-[680px] text-base font-semibold leading-7 text-[#557276]">
              เลือกผู้รับบริการเพื่อเปิดหน้ารายงานที่มี Filter, กราฟ,
              ข้อสังเกต, ประวัติการฝึก และปุ่มพิมพ์/บันทึก PDF
            </p>
          </div>
          <Link
            href="/therapist/patients"
            className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-white px-6 text-base font-bold text-[#13756F] shadow-sm ring-1 ring-[#CDEEEF] transition hover:bg-[#F7FFFF]"
          >
            ดูรายชื่อผู้รับบริการ
          </Link>
        </header>

        {result.data.patients.length === 0 ? (
          <section className="mt-6 rounded-[30px] bg-white px-7 py-10 text-center shadow-[0_18px_48px_rgba(17,103,99,0.1)] ring-1 ring-[#CDEEEF]">
            <h2 className="text-2xl font-bold">ยังไม่มีผู้รับบริการ</h2>
            <p className="mt-2 text-base font-semibold text-[#557276]">
              เพิ่มผู้รับบริการก่อนสร้างรายงานผลรายบุคคล
            </p>
            <Link
              href="/therapist/patients/new"
              className="mt-6 inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#1FA89C] px-7 text-base font-bold text-white"
            >
              เพิ่มผู้รับบริการใหม่
            </Link>
          </section>
        ) : (
          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {result.data.patients.map((patient) => (
              <article
                key={patient.id}
                className="rounded-[28px] bg-white p-5 shadow-[0_16px_36px_rgba(17,103,99,0.09)] ring-1 ring-[#CDEEEF]"
              >
                <p className="text-xl font-bold">{patient.name}</p>
                <p className="mt-2 w-fit rounded-full bg-[#F2FBFB] px-4 py-1.5 text-sm font-bold text-[#13756F] ring-1 ring-[#CDEEEF]">
                  Patient Code {patient.code}
                </p>
                <div className="mt-4 grid gap-2 text-sm font-semibold text-[#557276]">
                  <p>ฝึกล่าสุด {patient.latestSessionAt?.slice(0, 10) || "—"}</p>
                  <p>ชุดล่าสุด {patient.latestTrainingSet || "—"}</p>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href={`/therapist/patients/${patient.id}/training-detail`}
                    className="inline-flex min-h-[46px] flex-1 items-center justify-center rounded-full bg-[#1FA89C] px-5 text-center text-sm font-bold text-white shadow-[0_10px_24px_rgba(31,168,156,0.18)] transition hover:bg-[#178F84]"
                  >
                    เปิดรายงาน
                  </Link>
                  <Link
                    href={`/therapist/patients/${patient.id}`}
                    className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-white px-5 text-sm font-bold text-[#13756F] ring-1 ring-[#CDEEEF] transition hover:bg-[#F7FFFF]"
                  >
                    รายละเอียด
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
