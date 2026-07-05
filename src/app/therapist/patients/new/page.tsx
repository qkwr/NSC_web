"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPatient } from "@/features/therapist/services/therapistDashboardService";
import type { TherapistPatientDetail } from "@/features/therapist/types/therapist.types";

export default function NewTherapistPatientPage() {
  const router = useRouter();
  const [form, setForm] = useState<Partial<TherapistPatientDetail>>({
    name: "",
    code: "",
    age: 0,
    patientProfile: {
      id: "",
      patientCode: "",
      fullName: "",
      age: 0,
      gender: "ชาย",
      birthDate: "",
      province: "",
      postalCode: "",
      occupation: "",
      caregiverName: "",
      caregiverRelationship: "",
      familyStatus: "มีครอบครัว",
      householdMembersCount: 0,
      spouseName: "",
      hasChildren: false,
      childrenCount: 0,
    },
    caregiverName: "",
    latestAssessmentDate: "",
    pn001ProgressPercent: 0,
    pn002ProgressPercent: 0,
    latestTrainingSet: "",
    lastSessionAt: new Date().toISOString(),
    needsFollowUp: false,
    pn001Summary: {
      title: "",
      completedQuestions: 0,
      totalQuestions: 0,
      note: "",
    },
    pn002Naming: {
      categoryName: "สัตว์",
      latestSetTitle: "",
      completedQuestions: 0,
      totalQuestions: 0,
      correctWords: [],
      missedWords: [],
      wordsToReview: [],
    },
  });
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    const result = await createPatient(form as TherapistPatientDetail);
    setIsSaving(false);
    if (result.success) {
      router.push("/therapist/patients");
    }
  }

  return (
    <main className="min-h-dvh bg-[linear-gradient(180deg,#F6FEFF_0%,#EAF9FB_58%,#DFF3F5_100%)] px-5 py-6 text-[#123232] sm:px-8">
      <div className="mx-auto w-full max-w-[980px] rounded-[34px] bg-white px-8 py-8 shadow-[0_26px_70px_rgba(24,112,108,0.13)] ring-1 ring-[#CDEEEF]">
        <h1 className="text-3xl font-bold">เพิ่มผู้รับบริการใหม่</h1>
        <div className="mt-8 grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="font-semibold">ชื่อ-นามสกุล</span>
              <input
                className="w-full rounded-xl border border-[#D7EFF0] bg-[#F8FEFF] px-4 py-3"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label className="space-y-2">
              <span className="font-semibold">รหัสผู้รับบริการ</span>
              <input
                className="w-full rounded-xl border border-[#D7EFF0] bg-[#F8FEFF] px-4 py-3"
                value={form.code}
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
                value={form.latestTrainingSet}
                onChange={(e) => setForm({ ...form, latestTrainingSet: e.target.value })}
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="font-semibold">ชื่อ-นามสกุลผู้ดูแล</span>
              <input
                className="w-full rounded-xl border border-[#D7EFF0] bg-[#F8FEFF] px-4 py-3"
                value={form.caregiverName}
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
                      title: form.pn001Summary?.title ?? "",
                      completedQuestions: form.pn001Summary?.completedQuestions ?? 0,
                      totalQuestions: form.pn001Summary?.totalQuestions ?? 0,
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
              onClick={() => router.push("/therapist/patients")}
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
              {isSaving ? "กำลังบันทึก..." : "บันทึกผู้รับบริการ"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
