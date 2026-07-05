"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import { updatePatientProfile } from "../services/therapistDashboardService";
import type { PatientProfile } from "../types/therapist.types";

function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] bg-[#F8FEFF] p-5 ring-1 ring-[#D7EFF0]">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="font-semibold">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-[#D7EFF0] bg-white px-4 py-3 text-[#123232]";

export default function TherapistPatientEditForm({
  patientId,
  initialProfile,
}: {
  patientId: string;
  initialProfile: PatientProfile;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<PatientProfile>(initialProfile);
  const [isSaving, setIsSaving] = useState(false);

  function updateProfile(patch: Partial<PatientProfile>) {
    setProfile((current) => ({
      ...current,
      ...patch,
    }));
  }

  async function handleSave() {
    setIsSaving(true);
    const normalizedProfile = {
      ...profile,
      id: patientId,
    };
    const result = await updatePatientProfile(patientId, normalizedProfile);
    setIsSaving(false);

    if (result.success) {
      router.push(`/therapist/patients/${patientId}`);
    }
  }

  return (
    <main className="min-h-dvh bg-[linear-gradient(180deg,#F6FEFF_0%,#EAF9FB_58%,#DFF3F5_100%)] px-5 py-6 text-[#123232] sm:px-8">
      <div className="mx-auto w-full max-w-[980px] rounded-[34px] bg-white px-8 py-8 shadow-[0_26px_70px_rgba(24,112,108,0.13)] ring-1 ring-[#CDEEEF]">
        <h1 className="text-3xl font-bold">แก้ไขข้อมูลผู้รับบริการ</h1>

        <div className="mt-8 grid gap-6">
          <FormSection title="ข้อมูลผู้รับบริการ">
            <Field label="ชื่อ-นามสกุล">
              <input
                className={inputClass}
                value={profile.fullName}
                onChange={(event) => updateProfile({ fullName: event.target.value })}
              />
            </Field>

            <Field label="รหัสผู้รับบริการ">
              <input
                className={inputClass}
                value={profile.patientCode}
                onChange={(event) =>
                  updateProfile({ patientCode: event.target.value })
                }
              />
            </Field>

            <Field label="อายุ">
              <input
                type="number"
                className={inputClass}
                value={profile.age || ""}
                onChange={(event) =>
                  updateProfile({
                    age: event.target.value === "" ? 0 : Number(event.target.value),
                  })
                }
              />
            </Field>

            <Field label="เพศ">
              <select
                className={inputClass}
                value={profile.gender}
                onChange={(event) => updateProfile({ gender: event.target.value })}
              >
                <option value="ชาย">ชาย</option>
                <option value="หญิง">หญิง</option>
                <option value="อื่น ๆ">อื่น ๆ</option>
              </select>
            </Field>

            <Field label="วันเกิด">
              <input
                className={inputClass}
                value={profile.birthDate}
                onChange={(event) => updateProfile({ birthDate: event.target.value })}
              />
            </Field>

            <Field label="จังหวัดภูมิลำเนา">
              <input
                className={inputClass}
                value={profile.province}
                onChange={(event) => updateProfile({ province: event.target.value })}
              />
            </Field>

            <Field label="รหัสไปรษณีย์">
              <input
                className={inputClass}
                value={profile.postalCode}
                onChange={(event) => updateProfile({ postalCode: event.target.value })}
              />
            </Field>

            <Field label="อาชีพ">
              <input
                className={inputClass}
                value={profile.occupation}
                onChange={(event) => updateProfile({ occupation: event.target.value })}
              />
            </Field>
          </FormSection>

          <FormSection title="ข้อมูลผู้ดูแล">
            <Field label="ชื่อ-นามสกุลผู้ดูแล">
              <input
                className={inputClass}
                value={profile.caregiverName}
                onChange={(event) =>
                  updateProfile({ caregiverName: event.target.value })
                }
              />
            </Field>

            <Field label="ความเกี่ยวข้องกับผู้รับบริการ">
              <input
                className={inputClass}
                value={profile.caregiverRelationship}
                onChange={(event) =>
                  updateProfile({ caregiverRelationship: event.target.value })
                }
              />
            </Field>
          </FormSection>

          <FormSection title="ข้อมูลครอบครัว">
            <Field label="สถานะครอบครัว">
              <select
                className={inputClass}
                value={profile.familyStatus}
                onChange={(event) =>
                  updateProfile({ familyStatus: event.target.value })
                }
              >
                <option value="มีครอบครัว">มีครอบครัว</option>
                <option value="อยู่คนเดียว">อยู่คนเดียว</option>
                <option value="อื่น ๆ">อื่น ๆ</option>
              </select>
            </Field>

            <Field label="จำนวนสมาชิกในครอบครัว">
              <input
                type="number"
                className={inputClass}
                value={profile.householdMembersCount || ""}
                onChange={(event) =>
                  updateProfile({
                    householdMembersCount:
                      event.target.value === "" ? 0 : Number(event.target.value),
                  })
                }
              />
            </Field>

            <Field label="ชื่อคู่สมรส">
              <input
                className={inputClass}
                value={profile.spouseName}
                onChange={(event) => updateProfile({ spouseName: event.target.value })}
              />
            </Field>

            <div className="flex items-center gap-3 rounded-xl border border-[#D7EFF0] bg-white px-4 py-3">
              <input
                id="hasChildren"
                type="checkbox"
                className="h-5 w-5 accent-[#1FA89C]"
                checked={profile.hasChildren}
                onChange={(event) =>
                  updateProfile({ hasChildren: event.target.checked })
                }
              />
              <label htmlFor="hasChildren" className="font-semibold">
                มีลูกหรือไม่
              </label>
            </div>

            <Field label="จำนวนลูก">
              <input
                type="number"
                className={inputClass}
                value={profile.childrenCount || ""}
                onChange={(event) =>
                  updateProfile({
                    childrenCount:
                      event.target.value === "" ? 0 : Number(event.target.value),
                  })
                }
              />
            </Field>
          </FormSection>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push(`/therapist/patients/${patientId}`)}
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
