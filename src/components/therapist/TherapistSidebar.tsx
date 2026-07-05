"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "แดชบอร์ด", href: "/therapist/dashboard" },
  { label: "รายการผู้รับบริการ", href: "/therapist/patients" },
];

export default function TherapistSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[300px] shrink-0 rounded-[34px] border border-[#D7EFF0] bg-white p-6 shadow-[0_26px_70px_rgba(24,112,108,0.08)] lg:block">
      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#12847D]">
          ระบบนักแก้ไขการพูด
        </p>
        <h2 className="mt-4 text-3xl font-bold text-[#123232]">Therapist</h2>
        <p className="mt-3 text-sm text-[#557276]">ดูแลและตรวจสอบผลการฝึกของผู้รับบริการ</p>
      </div>

      <nav className="space-y-3">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-2xl px-4 py-4 text-lg font-semibold transition ${
                active
                  ? "bg-[#EAF9F8] text-[#0F756F] ring-1 ring-[#CDEEEF] shadow-sm"
                  : "text-[#45686A] hover:bg-[#F7FFFF]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-10 rounded-[28px] bg-[#F6FEFF] p-5 ring-1 ring-[#D7EFF0]">
        <p className="text-sm font-bold text-[#12847D]">อย่าลืม</p>
        <p className="mt-3 text-sm leading-6 text-[#557276]">
          ตรวจสอบเสียงผู้รับบริการทุกครั้งก่อนสรุปผล ไม่เชื่อ AI/ASR 100%.
        </p>
      </div>

      <Link
        href="/"
        className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[#1FA89C] px-4 py-3 text-base font-bold text-white shadow-[0_10px_24px_rgba(31,168,156,0.22)] transition hover:bg-[#178F84]"
      >
        ออกจากระบบ
      </Link>
    </aside>
  );
}
