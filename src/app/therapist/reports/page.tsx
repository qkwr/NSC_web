import { getTherapistDashboardData } from "@/features/therapist/services/therapistDashboardService";
import { mockCategoryScores, mockProgressBySession } from "@/features/therapist/mocks/therapistClinical.mock";
import { generateClinicalReport } from "@/features/therapist/utils/reportHelpers";
import ClinicalReportActions from "@/features/therapist/components/ClinicalReportActions";

export default async function TherapistReportsPage() {
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

  const reportText = generateClinicalReport(mockCategoryScores);

  return (
    <main className="min-h-dvh bg-[linear-gradient(180deg,#F6FEFF_0%,#EAF9FB_58%,#DFF3F5_100%)] px-5 py-6 text-[#123232] sm:px-8">
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex min-h-[38px] items-center rounded-full bg-[#F2FBFB] px-5 text-base font-semibold text-[#12847D] ring-1 ring-[#CDEEEF]">
              รายงานผล
            </p>
            <h1 className="mt-4 text-[2.4rem] font-bold leading-tight sm:text-[3rem]">
              รายงานผลการฝึกทั่วไป
            </h1>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-[34px] bg-white px-7 py-7 shadow-[0_18px_48px_rgba(17,103,99,0.1)] ring-1 ring-[#CDEEEF]">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[26px] bg-[#F8FEFF] p-5 ring-1 ring-[#D7EFF0]">
                <h2 className="text-xl font-bold">ภาพรวมความสามารถรายหมวด</h2>
                <div className="mt-4 space-y-4">
                  {mockCategoryScores.map((item) => {
                    const percent = Math.round((item.score / item.maxScore) * 100);
                    return (
                      <div key={item.category}>
                        <div className="flex items-center justify-between text-base font-semibold text-[#45686A]">
                          <span>{item.category}</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-[#DDF2F3]">
                          <div className="h-full rounded-full bg-[#27B6AB]" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[26px] bg-[#F8FEFF] p-5 ring-1 ring-[#D7EFF0]">
                <h2 className="text-xl font-bold">แนวโน้มคะแนน Naming</h2>
                <div className="mt-4 space-y-3">
                  {mockProgressBySession.map((session) => (
                    <div key={session.date} className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                      <div className="flex items-center justify-between text-sm font-semibold text-[#45686A]">
                        <span>{session.date}</span>
                        <span>{session.naming}/15</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[26px] bg-[#F8FEFF] p-5 ring-1 ring-[#D7EFF0]">
              <h2 className="text-xl font-bold">สรุปคำตอบ</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#12847D]">ถูกต้อง</p>
                  <p className="mt-3 text-3xl font-bold text-[#0F756F]">19</p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#A65312]">ผิด</p>
                  <p className="mt-3 text-3xl font-bold text-[#9A6A13]">8</p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#13756F]">ควรฝึกซ้ำ</p>
                  <p className="mt-3 text-3xl font-bold text-[#0F756F]">18</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[34px] bg-white px-7 py-7 shadow-[0_18px_48px_rgba(17,103,99,0.1)] ring-1 ring-[#CDEEEF]">
            <h2 className="text-2xl font-bold">สรุปรายงานผลการฝึก</h2>
            <p className="mt-3 text-sm text-[#557276]">ผลจาก AI/ASR เป็นข้อมูลเบื้องต้น กรุณาตรวจซ้ำจากเสียงผู้ป่วย</p>
            <textarea
              readOnly
              value={reportText}
              className="mt-4 min-h-[240px] w-full rounded-[24px] border border-[#D7EFF0] bg-[#F8FEFF] p-4 text-sm leading-7"
            />
            <ClinicalReportActions reportText={reportText} />
          </div>
        </div>
      </div>
    </main>
  );
}
