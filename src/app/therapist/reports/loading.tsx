export default function TherapistReportsLoading() {
  return (
    <main className="min-h-dvh bg-[linear-gradient(180deg,#F6FEFF_0%,#EAF9FB_58%,#DFF3F5_100%)] p-6 text-[#123232]">
      <div className="mx-auto max-w-[1120px]">
        <div className="h-32 animate-pulse rounded-[28px] bg-white shadow-sm ring-1 ring-[#CDEEEF]" />
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-56 animate-pulse rounded-[28px] bg-white shadow-sm ring-1 ring-[#CDEEEF]"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
