"use client";

import React, { useEffect, useState } from "react";
import type { SessionResultItem } from "../types/therapistClinical.types";
import { getPatientSessionResults } from "../services/therapistClinicalService";

export function SessionReviewList({
  patientId,
  initialItems = [],
}: {
  patientId: string;
  initialItems?: SessionResultItem[];
}) {
  const [items, setItems] = useState<SessionResultItem[]>(initialItems);

  useEffect(() => {
    let active = true;
    async function load() {
      const res = await getPatientSessionResults(patientId);
      if (!active) return;
      if (res.success) setItems(res.data);
    }
    load();
    return () => {
      active = false;
    };
  }, [patientId]);

  function updateItem(id: string, patch: Partial<SessionResultItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
    console.log("Updated session item", id, patch);
  }

  return (
    <div>
      <h3 className="mb-3 text-xl font-bold">ตรวจผลจากเสียงผู้รับบริการ</h3>
      <p className="mb-3 text-sm text-[#557276]">
        ผลจาก AI เป็นข้อมูลเบื้องต้น กรุณาตรวจซ้ำจากเสียงผู้รับบริการ
      </p>
      <div className="space-y-4">
        {items.map((it) => (
          <div key={it.id} className="rounded-lg border border-[#E6F6F4] p-4 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-[#45686A]">{it.date}</div>
                <div className="mt-1 text-lg font-bold">{it.expectedAnswer}</div>
              </div>
              <div className="flex items-center gap-3">
                <audio controls src={it.audioUrl} />
              </div>
            </div>

            <div className="mt-3 grid gap-2">
              <div className="text-sm text-[#557276]">ASR: {it.asrTranscript}</div>
              <div className="text-sm">AI ตัดสิน: {it.aiCorrect ? "ถูกต้อง" : "ไม่ถูกต้อง"}</div>
              <div className="flex items-center gap-2">
                <label className="text-sm">สถานะตรวจของนักบำบัด:</label>
                <select
                  aria-label="สถานะตรวจสอบโดยนักแก้ไขการพูด"
                  value={it.therapistReviewStatus}
                  onChange={(e) => updateItem(it.id, { therapistReviewStatus: e.target.value as
                    | "not-reviewed"
                    | "correct"
                    | "incorrect"
                    | "needs-review",
                  })}
                  className="rounded border p-1"
                >
                  <option value="not-reviewed">ยังไม่ตรวจ</option>
                  <option value="correct">ถูกต้อง</option>
                  <option value="incorrect">ผิด</option>
                  <option value="needs-review">ต้องตรวจซ้ำ</option>
                </select>
              </div>
              <div>
                <textarea
                  aria-label="โน้ตจากนักแก้ไขการพูด"
                  placeholder="โน้ตจากนักแก้ไขการพูด"
                  value={it.therapistNote}
                  onChange={(e) => updateItem(it.id, { therapistNote: e.target.value })}
                  className="w-full rounded border p-2"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SessionReviewList;
