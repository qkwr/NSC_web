"use client";

import React from "react";
import type { CategoryScore, ProgressBySession } from "../types/therapistClinical.types";

export function BarComparison({ scores }: { scores: CategoryScore[] }) {
  const max = Math.max(...scores.map((s) => s.maxScore));

  return (
    <div>
      <h3 className="mb-3 text-xl font-bold">ภาพรวมความสามารถรายหมวด</h3>
      <div className="space-y-3">
        {scores.map((s) => (
          <div key={s.category}>
            <div className="mb-1 flex items-center justify-between text-sm font-semibold text-[#45686A]">
              <span>{s.category}</span>
              <span>
                {s.score}/{s.maxScore}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-[#F0F6F6]">
              <div
                className="h-full rounded-full bg-[#27B6AB]"
                style={{ width: `${(s.score / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LineProgress({ progress }: { progress: ProgressBySession[] }) {
  // Simple SVG line chart plotting naming scores over sessions
  const w = 320;
  const h = 120;
  const padding = 24;
  const values = progress.map((p) => p.naming);
  const max = Math.max(...values, 15);

  const points = values
    .map((v, i) => {
      const x = padding + (i * (w - padding * 2)) / Math.max(1, values.length - 1);
      const y = h - padding - (v / max) * (h - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div>
      <h3 className="mb-3 text-xl font-bold">แนวโน้มคะแนน (Naming)</h3>
      <svg width={w} height={h} className="rounded-md bg-white/80 shadow-sm">
        <polyline
          fill="none"
          stroke="#27B6AB"
          strokeWidth={3}
          points={points}
        />
        {values.map((v, i) => {
          const x = padding + (i * (w - padding * 2)) / Math.max(1, values.length - 1);
          const y = h - padding - (v / max) * (h - padding * 2);
          return <circle key={i} cx={x} cy={y} r={4} fill="#0F756F" />;
        })}
      </svg>
    </div>
  );
}

export default function ClinicalCharts({ scores, progress }: { scores: CategoryScore[]; progress: ProgressBySession[] }) {
  return (
    <div>
      <BarComparison scores={scores} />
      <div className="mt-4">
        <LineProgress progress={progress} />
      </div>
    </div>
  );
}
