"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { TherapistPatientDetail } from "@/features/therapist/types/therapist.types";
import { getTherapistPatientDetail, updatePatient } from "@/features/therapist/services/therapistDashboardService";

type PageProps = {
  params: {
    patientId: string;
  };
};

export default function EditTherapistPatientPage({ params }: PageProps) {
  const router = useRouter();
  const [form, setForm] = useState<Partial<TherapistPatientDetail>>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const result = await getTherapistPatientDetail(params.patientId);
      if (result.success) {
        setForm(result.data);
      }
      setIsLoading(false);
    }
    load();
  }, [params.patientId]);

  async function handleSave() {
    if (!form) return;
    setIsSaving(true);
    const result = await updatePatient(params.patientId, form as TherapistPatientDetail);
    setIsSaving(false);
    if (result.success) {
      router.push(`/therapist/patients/${params.patientId}`);
    }
  }

  if (isLoading || !form) {
    return (
      <main className="min-h-dvh flex items-center justify-center bg-[#EFFBFD] p-6">
        <p className="text-xl font-bold text-[#45686A]">กำลังโหลดข้อมูล...</p>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[linear-gradient(180deg,#F6FEFF_0%,#EAF9FB_58%,#DFF3F5_100%)] px-5 py-6 text-[#123232] sm:px-8">
      <div className="mx-auto w-full max-w-[980px] rounded-[34px] bg-white px-8 py-8 shadow-[0_26px_70px_rgba(24,112,108,0.13)] ring-1 ring-[#CDEEEF]">
        <h1 className="text-3xl font-bold">แก้ไขข้อมูลผู้รับบริการ</h1>
        <div className="mt-8 grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="font-semibold">ชื่อ-นามสกุล</span>
              <input
                className="w-full rounded-xl border border-[#D7EFF0] bg-[#F8FEFF] px-4 py-3"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label className="space-y-2">
              <span className="font-semibold">รหัส PN001</span>
              <input
                className="w-full rounded-xl border border-[#D7EFF0] bg-[#F8FEFF] px-4 py-3"
                value={form.code || ""}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="font-semibold">อายุ</span>
              <input
                type="number"
                className="w-full rounded-xl border border-[#D7EFF0] bg-[#F8FEFF] px-4 py-3"
                value={form.age || ""}
                onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
              />
            </label>
            <label className="space-y-2">
              <span className="font-semibold">จังหวัดภูมิลำเนา</span>
              <input
                className="w-full rounded-xl border border-[#D7EFF0] bg-[#F8FEFF] px-4 py-3"
                value={form.latestTrainingSet || ""}
                onChange={(e) => setForm({ ...form, latestTrainingSet: e.target.value })}
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="font-semibold">ชื่อ-นามสกุลผู้ดูแล</span>
              <input
                className="w-full rounded-xl border border-[#D7EFF0] bg-[#F8FEFF] px-4 py-3"
                value={form.caregiverName || ""}
                onChange={(e) => setForm({ ...form, caregiverName: e.target.value })}
              />
            </label>
            <label className="space-y-2">
              <span className="font-semibold">ความเกี่ยวข้อง</span>
              <input
                className="w-full rounded-xl border border-[#D7EFF0] bg-[#F8FEFF] px-4 py-3"
                value={form.pn001Summary?.note || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pn001Summary: {
                      ...form.pn001Summary,
                      note: e.target.value,
                    },
                  })
                }
              />
            </label>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push(`/therapist/patients/${params.patientId}`)}
              className="rounded-full border border-[#CDEEEF] bg-white px-7 py-3 text-lg font-semibold text-[#13756F] shadow-sm hover:bg-[#F7FFFF]"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="rounded-full bg-[#1FA89C] px-7 py-3 text-lg font-bold text-white shadow-[0_10px_24px_rgba(31,168,156,0.22)] hover:bg-[#178F84] disabled:opacity-60"
            >
              {isSaving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
