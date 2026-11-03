"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { loginWithAccessCode } from "../services/authService";
import { saveAuthSession } from "../services/authSession";

function Icon({ kind, className = "h-6 w-6" }: { kind: "heart" | "arrow" | "person" | "clinical" | "shield"; className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {kind === "heart" && <><path d="M20.5 11.5c0 4.7-4 8-9 8a11 11 0 0 1-3.5-.6L3 21l1.4-4.4A7.5 7.5 0 0 1 2.5 11.5c0-4.7 4-8 9-8s9 3.3 9 8Z" /><path d="M11.5 15s-4-2.4-4-4.8a2.2 2.2 0 0 1 4-1.2 2.2 2.2 0 0 1 4 1.2c0 2.4-4 4.8-4 4.8Z" fill="currentColor" stroke="none" /></>}
      {kind === "arrow" && <path d="M4 12h15m-6-6 6 6-6 6" />}
      {kind === "person" && <><circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></>}
      {kind === "clinical" && <><rect x="4" y="5" width="16" height="17" rx="3" /><path d="M9 5V2h6v3m-3 5v7m-3.5-3.5h7" /></>}
      {kind === "shield" && <><path d="m12 2 8 3v6c0 5-3 8.5-8 11-5-2.5-8-6-8-11V5l8-3Z" /><path d="m8 12 3 3 5-6" /></>}
    </svg>
  );
}

function GoogleMark() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 shrink-0"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z" /><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.42l-3.24-2.51c-.9.6-2.05.97-3.37.97-2.6 0-4.81-1.76-5.6-4.12H3.05v2.59A10 10 0 0 0 12 22Z" /><path fill="#FBBC05" d="M6.4 13.92a6 6 0 0 1 0-3.84V7.49H3.05a10 10 0 0 0 0 9.02l3.35-2.59Z" /><path fill="#EA4335" d="M12 5.96c1.47 0 2.79.5 3.82 1.49l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.95 5.49l3.35 2.59C7.19 7.72 9.4 5.96 12 5.96Z" /></svg>;
}

// Frontend demo adapter until PN identifiers are supplied by the backend.
const DEMO_PATIENT_CODES: Record<string, string> = {
  PN001: "P-482913",
  PN002: "P-739204",
};

export function LoginForm() {
  const router = useRouter();
  const inputId = useId();
  const [pn, setPn] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleNotice, setGoogleNotice] = useState("");

  async function handlePatientLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const code = pn.trim().toUpperCase();
    if (!/^PN\d{3,}$/.test(code)) {
      setError("กรุณากรอกรหัส PN ให้ถูกต้อง เช่น PN001");
      return;
    }
    const legacyCode = DEMO_PATIENT_CODES[code];
    if (!legacyCode) {
      setError("ไม่พบรหัส PN นี้ กรุณาตรวจสอบกับนักแก้ไขการพูด");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await loginWithAccessCode(legacyCode);
      if (!result.success) { setError(result.errorMessage); return; }
      if (result.role !== "patient") { setError("กรุณาใช้รหัส PN ของผู้รับบริการ"); return; }
      saveAuthSession(result.user);
      router.push(result.redirectPath);
    } catch {
      setError("เข้าใช้งานไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally { setBusy(false); }
  }

  function handleGoogleLogin() {
    // The backend owns OAuth and session verification. Never grant a mock
    // therapist session merely because the Google button was pressed.
    const loginUrl = process.env.NEXT_PUBLIC_GOOGLE_LOGIN_URL;
    if (loginUrl) { window.location.assign(loginUrl); return; }
    setGoogleNotice("การเข้าสู่ระบบด้วย Google ยังไม่เปิดให้บริการ กรุณาติดต่อผู้ดูแลระบบ");
  }

  return (
    <div className="relative isolate min-h-dvh overflow-hidden bg-[#effaf8] text-[#173d3f]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_5%_5%,#d7f2ed,transparent_45%),radial-gradient(ellipse_at_100%_80%,#ccece7,transparent_45%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-48 -z-10 h-[620px] w-[620px] rounded-full border-[70px] border-white/35" />
      <main className="mx-auto flex min-h-dvh max-w-[1200px] flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" aria-label="พูดเพลิน หน้าแรก" className="flex items-center gap-2.5 rounded-xl text-[#118a82] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#118a82]">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm"><Icon kind="heart" className="h-8 w-8" /></span>
            <span className="text-2xl font-bold tracking-tight">พูดเพลิน<span className="mt-0.5 block text-[10px] font-medium tracking-[0.2em] text-[#607d79]">POODPLEARN</span></span>
          </Link>
          <span className="hidden rounded-full border border-[#c6e6de] bg-white/65 px-4 py-2 text-sm text-[#47756c] sm:block">เพื่อนคู่ใจในการฝึกพูด</span>
        </header>

        <div className="flex flex-1 flex-col justify-center py-8 lg:py-9">
          <section aria-labelledby="welcome-title" className="mb-7 flex items-center justify-between gap-6 sm:mb-8">
            <div className="max-w-[650px]">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#118a82]"><span className="h-2 w-2 rounded-full bg-[#139f94]" />ก้าวเล็ก ๆ สู่การสื่อสารที่มั่นใจ</p>
              <h1 id="welcome-title" className="text-[2rem] font-bold leading-[1.35] tracking-tight text-[#174f48] sm:text-[2.8rem]">ยินดีต้อนรับสู่<span className="text-[#118a82]">พูดเพลิน</span></h1>
              <p className="mt-3 text-base leading-7 text-[#59706d] sm:text-lg">ฝึกพูดและสื่อสารได้ทุกที่ ทุกเวลา<br className="sm:hidden" /> สำหรับผู้ป่วยหลังโรคหลอดเลือดสมอง</p>
            </div>
            <div className="relative hidden h-[188px] w-[260px] shrink-0 overflow-hidden rounded-[100px_100px_32px_32px] border-4 border-white/80 bg-[#e0f4ef] shadow-[0_12px_32px_#25796c12] lg:block">
              <Image src="/images/branding/login-caregiver-patient.png" alt="ผู้รับบริการฝึกพูดร่วมกับนักแก้ไขการพูด" fill sizes="260px" priority className="object-cover object-top" />
            </div>
          </section>

          <div className="mb-4 flex items-center gap-3"><h2 className="shrink-0 text-sm font-semibold text-[#54766f]">เลือกเข้าใช้งานตามบทบาทของคุณ</h2><span aria-hidden="true" className="h-px flex-1 bg-[#cde6df]" /></div>

          <div className="grid gap-5 md:grid-cols-2 lg:gap-7">
            <section aria-labelledby="patient-title" className="relative flex min-w-0 flex-col overflow-hidden rounded-[28px] border border-[#9fd6c9] bg-white p-6 shadow-[0_16px_48px_#286f6010] sm:p-8">
              <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-[#139f94]" />
              <div className="mb-5 flex items-center justify-between gap-3"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e1f5ee] text-[#118a82]"><Icon kind="person" className="h-7 w-7" /></span><span className="rounded-full bg-[#edf8f3] px-3 py-1.5 text-xs font-semibold text-[#32816d]">สำหรับผู้รับบริการ</span></div>
              <h3 id="patient-title" className="text-[1.75rem] font-bold text-[#174f48] sm:text-[2rem]">เริ่มฝึกพูดไปด้วยกัน</h3>
              <p className="mt-2 text-base leading-7 text-[#59706d]">ฝึกตามแผนของคุณ ค่อย ๆ พัฒนาในทุกวัน</p>
              <form onSubmit={handlePatientLogin} noValidate className="mt-6 flex flex-1 flex-col">
                <label htmlFor={inputId} className="mb-2.5 text-base font-bold text-[#245c51]">รหัสประจำตัวผู้รับบริการ (PN)</label>
                <input id={inputId} name="pn" value={pn} onChange={(event) => { setPn(event.target.value); setError(""); }} placeholder="เช่น PN001" autoCapitalize="characters" autoComplete="off" spellCheck={false} disabled={busy} aria-invalid={Boolean(error)} aria-describedby={`${inputId}-hint${error ? ` ${inputId}-error` : ""}`} className="h-16 w-full rounded-2xl border border-[#bddbd2] bg-[#f8fcfa] px-5 text-[1.4rem] font-semibold uppercase tracking-wider text-[#174f48] outline-none transition placeholder:font-normal placeholder:tracking-normal placeholder:text-[#8ba29b] focus:border-[#118a82] focus:bg-white focus:ring-4 focus:ring-[#118a82]/10 disabled:opacity-70" />
                <p id={`${inputId}-hint`} className="mt-2.5 text-sm leading-6 text-[#647e75]">ใช้รหัส PN ที่ได้รับจากนักแก้ไขการพูด</p>
                {error && <p id={`${inputId}-error`} role="alert" className="mt-3 rounded-xl bg-[#fff1ef] px-4 py-3 text-sm leading-6 text-[#b42318]">{error}</p>}
                <button type="submit" disabled={busy} aria-busy={busy} className="mt-5 flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl bg-[linear-gradient(120deg,#139f94,#0d847b)] px-5 py-4 text-xl font-bold text-white shadow-[0_8px_20px_#118a8230] transition hover:brightness-105 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#118a82] active:scale-[0.99] motion-reduce:transition-none disabled:cursor-wait disabled:opacity-60">{busy ? "กำลังเข้าสู่ระบบ..." : "เข้าเริ่มฝึก"}<Icon kind="arrow" /></button>
              </form>
              <p className="mt-5 border-t border-[#e5efea] pt-4 text-center text-sm leading-6 text-[#647e75]">ยังไม่มีรหัส? ติดต่อขอรหัสจากนักแก้ไขการพูด</p>
            </section>

            <section aria-labelledby="therapist-title" className="relative flex min-w-0 flex-col overflow-hidden rounded-[28px] border border-[#d2e5df] bg-[#ffffffed] p-6 shadow-[0_16px_48px_#286f600a] sm:p-8">
              <div className="mb-5 flex items-center justify-between gap-3"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf5f4] text-[#45887f]"><Icon kind="clinical" className="h-7 w-7" /></span><span className="rounded-full bg-[#f0f6f4] px-3 py-1.5 text-xs font-semibold text-[#66847c]">สำหรับนักแก้ไขการพูด</span></div>
              <h3 id="therapist-title" className="text-[1.75rem] font-bold text-[#174f48] sm:text-[2rem]">ดูแลทุกความก้าวหน้า</h3>
              <p className="mt-2 text-base leading-7 text-[#59706d]">ติดตามผลการฝึก และดูแลผู้รับบริการในที่เดียว</p>
              <div className="mt-6 flex flex-1 flex-col">
                <p className="mb-2.5 text-base font-bold text-[#245c51]">เข้าสู่ระบบด้วยบัญชี Gmail</p>
                <div className="flex min-h-16 items-center gap-3 rounded-2xl bg-[#f4f9f7] px-4 py-3 text-sm leading-6 text-[#61786f]"><Icon kind="shield" className="h-6 w-6 shrink-0 text-[#66a393]" /><span>ใช้บัญชี Gmail ของคุณ<br />เพื่อเข้าใช้งานสำหรับนักแก้ไขการพูด</span></div>
                <p className="mt-2.5 text-sm leading-6 text-[#647e75]">ไม่ต้องกรอกรหัสนักแก้ไขการพูด</p>
                <button type="button" onClick={handleGoogleLogin} className="mt-5 flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl border border-[#b8cec5] bg-white px-4 py-4 text-lg font-semibold text-[#304b42] shadow-[0_3px_8px_#245c5108] transition hover:border-[#118a82] hover:bg-[#f8fcfa] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#118a82] active:scale-[0.99] motion-reduce:transition-none"><GoogleMark />เข้าสู่ระบบด้วย Google</button>
                {googleNotice && <p role="status" className="mt-3 rounded-xl bg-[#edf6f2] px-4 py-3 text-sm leading-6 text-[#46675b]">{googleNotice}</p>}
              </div>
              <p className="mt-5 border-t border-[#e5efea] pt-4 text-center text-sm leading-6 text-[#647e75]">สำหรับนักแก้ไขการพูดที่ได้รับสิทธิ์เข้าใช้งาน</p>
            </section>
          </div>
        </div>

        <footer className="flex flex-col items-center justify-between gap-3 pb-1 text-xs leading-6 text-[#6a8278] sm:flex-row"><p className="flex items-center gap-2"><Icon kind="shield" className="h-4 w-4" />พื้นที่สำหรับฝึกพูดและดูแลการสื่อสาร</p><p>PoodPlearn © 2026 · NSC 2026</p></footer>
      </main>
    </div>
  );
}
