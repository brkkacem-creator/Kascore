export default function Loading() {
  return (
    <div className="animate-fade-in">
      <div className="mb-5">
        <div className="h-8 w-40 bg-[#1A1A1A] rounded-xl mb-2 animate-pulse" />
        <div className="h-4 w-56 bg-[#1A1A1A] rounded-lg animate-pulse" />
      </div>
      <div className="h-12 bg-[#111111] border border-[#2A2410] rounded-2xl mb-4 animate-pulse" />
      <div className="flex gap-2 mb-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-7 w-20 bg-[#111111] border border-[#2A2410] rounded-full animate-pulse flex-shrink-0" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="ka-card p-4 animate-pulse">
            <div className="flex justify-between mb-3">
              <div className="h-3 w-28 bg-[#1A1A1A] rounded" />
              <div className="h-3 w-16 bg-[#1A1A1A] rounded" />
            </div>
            <div className="grid grid-cols-3 gap-3 items-center mb-3">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-[#1A1A1A] rounded-full" />
                <div className="h-3 w-16 bg-[#1A1A1A] rounded" />
              </div>
              <div className="h-8 w-14 bg-[#1A1A1A] rounded mx-auto" />
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-[#1A1A1A] rounded-full" />
                <div className="h-3 w-16 bg-[#1A1A1A] rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
