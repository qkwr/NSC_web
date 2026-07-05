"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { deletePatient } from "../services/therapistDashboardService";

export default function TherapistPatientActions({ patientId }: { patientId: string }) {
  const router = useRouter();

  async function handleDelete() {
    const confirmed = window.confirm("คุณแน่ใจว่าต้องการลบผู้รับบริการรายนี้? การกระทำนี้ไม่สามารถย้อนกลับได้");
    if (!confirmed) return;

    const result = await deletePatient(patientId);
    if (result.success) {
      router.push("/therapist/patients");
      alert("ลบผู้รับบริการเรียบร้อยแล้ว");
    } else {
      alert(result.errorMessage);
    }
  }

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
      <Link
        href={`/therapist/patients/${patientId}/edit`}
        className="min-h-[58px] flex-1 rounded-full bg-[#1FA89C] px-6 text-lg font-bold text-white shadow-[0_12px_26px_rgba(31,168,156,0.22)] hover:bg-[#178F84]"
      >
        แก้ไขข้อมูล
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        className="min-h-[58px] flex-1 rounded-full bg-[#FFEEF0] px-6 text-lg font-bold text-[#B42318] shadow-[0_10px_24px_rgba(180,51,60,0.16)] hover:bg-[#FFE7E9]"
      >
        ลบผู้รับบริการ
      </button>
    </div>
  );
}
