"use client";

import {
  progressCategoryOptions,
  progressTimeRangeOptions,
  type PatientProgressFilters,
  type ProgressCategoryKey,
  type ProgressTimeRangeKey,
} from "../utils/patientProgress";

type ProgressFiltersProps = {
  value: PatientProgressFilters;
  onChange: (value: PatientProgressFilters) => void;
};

export function ProgressFilters({ value, onChange }: ProgressFiltersProps) {
  return (
    <div className="no-print flex flex-col gap-3 rounded-[22px] bg-[#F8FEFF] p-3 ring-1 ring-[#D7EFF0] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 flex-wrap gap-2">
        {progressCategoryOptions.map((option) => {
          const isActive = value.categoryKey === option.key;

          return (
            <button
              key={option.key}
              type="button"
              className={`min-h-[40px] rounded-full px-4 text-sm font-bold transition focus:outline-none focus:ring-4 focus:ring-[#1FA89C]/20 ${
                isActive
                  ? "bg-[#1FA89C] text-white shadow-sm"
                  : "bg-white text-[#13756F] ring-1 ring-[#CDEEEF] hover:bg-[#F7FFFF]"
              }`}
              onClick={() =>
                onChange({
                  ...value,
                  categoryKey: option.key as ProgressCategoryKey,
                })
              }
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <label className="flex shrink-0 items-center gap-2 text-sm font-bold text-[#45686A]">
        <span>ช่วงเวลา</span>
        <select
          className="min-h-[40px] rounded-full border border-[#CDEEEF] bg-white px-4 text-sm font-bold text-[#13756F] outline-none focus:border-[#1FA89C] focus:ring-4 focus:ring-[#1FA89C]/15"
          value={value.timeRangeKey}
          onChange={(event) =>
            onChange({
              ...value,
              timeRangeKey: event.target.value as ProgressTimeRangeKey,
            })
          }
        >
          {progressTimeRangeOptions.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
export default ProgressFilters;
