import { ReactNode } from "react";
import TherapistSidebar from "@/components/therapist/TherapistSidebar";

export default function TherapistLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#EAF9F8] text-[#123232]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <TherapistSidebar />
        <div className="flex-1 rounded-[36px] bg-white px-0 py-0 shadow-[0_24px_80px_rgba(24,112,108,0.08)]">
          {children}
        </div>
      </div>
    </div>
  );
}
