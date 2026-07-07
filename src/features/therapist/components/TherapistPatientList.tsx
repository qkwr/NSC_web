"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { TherapistPatientSummary } from "../types/therapist.types";
import {
  deletePatient,
  getTherapistDashboardData,
} from "../services/therapistDashboardService";

type TherapistPatientListProps = {
  patients: TherapistPatientSummary[];
};

export default function TherapistPatientList({ patients }: TherapistPatientListProps) {
  const router = useRouter();
  const [visiblePatients, setVisiblePatients] = useState(patients);

  useEffect(() => {
    let isActive = true;

    async function loadPatients() {
      const result = await getTherapistDashboardData();
      if (!isActive || !result.success) {
        return;
      }

      setVisiblePatients(result.data.patients);
    }

    loadPatients();

    return () => {
      isActive = false;
    };
  }, [patients]);

  async function handleDelete(patientId: string) {
    const confirmed = window.confirm("คุณแน่ใจว่าต้องการลบผู้รับบริการรายนี้? การกระทำนี้ไม่สามารถย้อนกลับได้");
    if (!confirmed) return;

    const result = await deletePatient(patientId);
    if (result.success) {
      setVisiblePatients((current) =>
        current.filter((patient) => patient.id !== patientId),
      );
      router.refresh();
      alert("ลบผู้รับบริการเรียบร้อยแล้ว");
    } else {
      alert(result.errorMessage);
    }
  }

  return (
    <div className="grid gap-4">
      {visiblePatients.map((patient) => (
        <div
          key={patient.id}
          className="rounded-[30px] bg-white px-6 py-5 shadow-[0_16px_36px_rgba(17,103,99,0.09)] ring-1 ring-[#CDEEEF]"
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_220px] lg:items-center">
            <div>
              <p className="text-2xl font-bold text-[#123232]">{patient.name}</p>
              <p className="mt-1 text-lg font-semibold text-[#557276]">
                {patient.code} · อายุ {patient.age} ปี · ฝึกล่าสุด {patient.lastSessionAt.slice(0, 10)}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 sm:justify-end">
              <Link
                href={`/therapist/patients/${patient.id}`}
                className="inline-flex min-h-[50px] items-center justify-center rounded-full bg-[#1FA89C] px-5 text-base font-bold text-white shadow-[0_10px_24px_rgba(31,168,156,0.22)] hover:bg-[#178F84]"
              >
                ดูรายละเอียด
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(patient.id)}
                className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-[#E2B8B3] bg-[#FFEEF0] px-5 text-base font-bold text-[#B42318] hover:bg-[#FFE7E9]"
              >
                ลบ
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
