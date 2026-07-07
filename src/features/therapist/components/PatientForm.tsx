"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { PatientProfile } from "../types/therapist.types";
import { formatThaiBirthDate } from "../utils/dateFormat";

type PatientFormMode = "create" | "edit";

type PatientFormProps = {
  mode: PatientFormMode;
  initialValues: PatientProfile;
  onSubmit: (profile: PatientProfile) => Promise<boolean>;
  cancelHref: string;
};

type PatientFormErrors = Partial<Record<keyof PatientProfile, string>>;

const inputClass =
  "w-full rounded-xl border border-[#D7EFF0] bg-white px-4 py-3 text-[#123232] outline-none transition focus:border-[#1FA89C] focus:ring-4 focus:ring-[#1FA89C]/15 disabled:bg-[#EEF6F7] disabled:text-[#7A9294]";

const familyStatusOptions = ["มีครอบครัว", "อยู่คนเดียว", "อยู่กับญาติ", "อื่น ๆ"];
const genderOptions = ["ชาย", "หญิง", "อื่น ๆ"];

export function createEmptyPatientProfile(
  overrides: Partial<PatientProfile> = {},
): PatientProfile {
  return {
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
    ...overrides,
  };
}

function normalizeProfile(profile: PatientProfile): PatientProfile {
  const hasChildren = profile.hasChildren;

  return {
    ...profile,
    patientCode: profile.patientCode.trim(),
    fullName: profile.fullName.trim(),
    gender: profile.gender || "ชาย",
    age: Number.isFinite(profile.age) ? profile.age : 0,
    birthDate: profile.birthDate.trim(),
    province: profile.province.trim(),
    postalCode: profile.postalCode.trim(),
    occupation: profile.occupation.trim(),
    caregiverName: profile.caregiverName.trim(),
    caregiverRelationship: profile.caregiverRelationship.trim(),
    familyStatus: profile.familyStatus || "มีครอบครัว",
    householdMembersCount: Number.isFinite(profile.householdMembersCount)
      ? profile.householdMembersCount
      : 0,
    spouseName: profile.spouseName.trim(),
    hasChildren,
    childrenCount: hasChildren && Number.isFinite(profile.childrenCount)
      ? profile.childrenCount
      : 0,
  };
}

function validateProfile(profile: PatientProfile): PatientFormErrors {
  const normalized = normalizeProfile(profile);
  const errors: PatientFormErrors = {};

  if (!normalized.fullName) {
    errors.fullName = "กรุณากรอกชื่อ-นามสกุล";
  }

  if (!normalized.patientCode) {
    errors.patientCode = "กรุณากรอกรหัสผู้รับบริการ";
  }

  if (normalized.age <= 0) {
    errors.age = "กรุณากรอกอายุเป็นตัวเลข";
  }

  if (!normalized.province) {
    errors.province = "กรุณากรอกจังหวัดภูมิลำเนา";
  }

  if (normalized.postalCode && !/^\d{5}$/.test(normalized.postalCode)) {
    errors.postalCode = "รหัสไปรษณีย์ควรมี 5 หลัก";
  }

  if (!normalized.caregiverName) {
    errors.caregiverName = "กรุณากรอกชื่อผู้ดูแล";
  }

  if (!normalized.caregiverRelationship) {
    errors.caregiverRelationship = "กรุณากรอกความเกี่ยวข้อง";
  }

  if (normalized.householdMembersCount < 0) {
    errors.householdMembersCount = "จำนวนสมาชิกต้องไม่ติดลบ";
  }

  if (normalized.childrenCount < 0) {
    errors.childrenCount = "จำนวนลูกต้องไม่ติดลบ";
  }

  return errors;
}

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
  children,
  error,
  label,
}: {
  children: ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <label className="space-y-2">
      <span className="font-semibold">{label}</span>
      {children}
      {error ? (
        <span className="block text-sm font-semibold text-[#B42318]">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export default function PatientForm({
  mode,
  initialValues,
  onSubmit,
  cancelHref,
}: PatientFormProps) {
  const [profile, setProfile] = useState<PatientProfile>(() =>
    createEmptyPatientProfile(initialValues),
  );
  const [errors, setErrors] = useState<PatientFormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const title = mode === "create" ? "เพิ่มผู้รับบริการใหม่" : "แก้ไขข้อมูลผู้รับบริการ";
  const submitLabel = mode === "create" ? "บันทึกผู้รับบริการ" : "บันทึกการแก้ไข";
  const savingLabel = mode === "create" ? "กำลังบันทึก..." : "กำลังบันทึก...";
  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  function updateProfile(patch: Partial<PatientProfile>) {
    setProfile((current) => ({
      ...current,
      ...patch,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedProfile = normalizeProfile(profile);
    const nextErrors = validateProfile(normalizedProfile);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSaving(true);
    const didSave = await onSubmit(normalizedProfile);
    setIsSaving(false);

    if (!didSave) {
      setErrors((current) => ({
        ...current,
        fullName: current.fullName,
      }));
    }
  }

  return (
    <main className="min-h-dvh bg-[linear-gradient(180deg,#F6FEFF_0%,#EAF9FB_58%,#DFF3F5_100%)] px-5 py-6 text-[#123232] sm:px-8">
      <div className="mx-auto w-full max-w-[980px] rounded-[34px] bg-white px-8 py-8 shadow-[0_26px_70px_rgba(24,112,108,0.13)] ring-1 ring-[#CDEEEF]">
        <h1 className="text-3xl font-bold">{title}</h1>

        <form className="mt-8 grid gap-6" onSubmit={handleSubmit}>
          <FormSection title="ข้อมูลผู้รับบริการ">
            <Field label="ชื่อ-นามสกุล" error={errors.fullName}>
              <input
                className={inputClass}
                required
                value={profile.fullName}
                onChange={(event) => updateProfile({ fullName: event.target.value })}
              />
            </Field>

            <Field label="รหัสผู้รับบริการ" error={errors.patientCode}>
              <input
                className={inputClass}
                placeholder="เช่น PN001"
                required
                value={profile.patientCode}
                onChange={(event) =>
                  updateProfile({ patientCode: event.target.value })
                }
              />
            </Field>

            <Field label="อายุ" error={errors.age}>
              <input
                type="number"
                min={0}
                className={inputClass}
                required
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
                {genderOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="วันเกิด">
              <input
                className={inputClass}
                placeholder="เช่น 2499-01-12"
                value={profile.birthDate}
                onChange={(event) => updateProfile({ birthDate: event.target.value })}
              />
              <p className="text-sm font-medium text-[#557276]">
                แสดงผล: {formatThaiBirthDate(profile.birthDate)}
              </p>
            </Field>

            <Field label="จังหวัดภูมิลำเนา" error={errors.province}>
              <input
                className={inputClass}
                required
                value={profile.province}
                onChange={(event) => updateProfile({ province: event.target.value })}
              />
            </Field>

            <Field label="รหัสไปรษณีย์" error={errors.postalCode}>
              <input
                className={inputClass}
                inputMode="numeric"
                maxLength={5}
                placeholder="เช่น 52000"
                value={profile.postalCode}
                onChange={(event) => updateProfile({ postalCode: event.target.value })}
              />
            </Field>

            <Field label="อาชีพ">
              <input
                className={inputClass}
                placeholder="เช่น เกษตรกร"
                value={profile.occupation}
                onChange={(event) => updateProfile({ occupation: event.target.value })}
              />
            </Field>
          </FormSection>

          <FormSection title="ข้อมูลผู้ดูแล">
            <Field label="ชื่อ-นามสกุลผู้ดูแล" error={errors.caregiverName}>
              <input
                className={inputClass}
                required
                value={profile.caregiverName}
                onChange={(event) =>
                  updateProfile({ caregiverName: event.target.value })
                }
              />
            </Field>

            <Field
              label="ความเกี่ยวข้องกับผู้รับบริการ"
              error={errors.caregiverRelationship}
            >
              <input
                className={inputClass}
                placeholder="เช่น ภรรยา, สามี, บุตร, ญาติ, ผู้ดูแล"
                required
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
                {familyStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="จำนวนสมาชิกในครอบครัว"
              error={errors.householdMembersCount}
            >
              <input
                type="number"
                min={0}
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
                id={`hasChildren-${mode}`}
                type="checkbox"
                className="h-5 w-5 accent-[#1FA89C]"
                checked={profile.hasChildren}
                onChange={(event) =>
                  updateProfile({
                    hasChildren: event.target.checked,
                    childrenCount: event.target.checked ? profile.childrenCount : 0,
                  })
                }
              />
              <label htmlFor={`hasChildren-${mode}`} className="font-semibold">
                มีลูกหรือไม่
              </label>
            </div>

            <Field label="จำนวนลูก" error={errors.childrenCount}>
              <input
                type="number"
                min={0}
                className={inputClass}
                disabled={!profile.hasChildren}
                value={profile.hasChildren ? profile.childrenCount || "" : 0}
                onChange={(event) =>
                  updateProfile({
                    childrenCount:
                      event.target.value === "" ? 0 : Number(event.target.value),
                  })
                }
              />
            </Field>
          </FormSection>

          {hasErrors ? (
            <p className="rounded-2xl bg-[#FFF1F3] px-5 py-3 text-base font-semibold text-[#B42318] ring-1 ring-[#F8C9C4]">
              กรุณาตรวจสอบข้อมูลที่จำเป็นก่อนบันทึก
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href={cancelHref}
              className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-[#CDEEEF] bg-white px-7 text-lg font-semibold text-[#13756F] shadow-sm hover:bg-[#F7FFFF]"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#1FA89C] px-7 text-lg font-bold text-white shadow-[0_10px_24px_rgba(31,168,156,0.22)] hover:bg-[#178F84] disabled:opacity-60"
            >
              {isSaving ? savingLabel : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
