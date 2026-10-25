/** Kerangka abu-abu berdenyut saat halaman dimuat, supaya klik langsung terasa direspons. */
const Blok = ({ className = "" }: { className?: string }) => <div className={`animate-pulse rounded-lg bg-line/60 ${className}`} />;

export function SkeletonHalaman() {
  return (
    <div role="status" aria-label="Memuat" className="space-y-6">
      <div className="space-y-2"><Blok className="h-7 w-48" /><Blok className="h-4 w-72 max-w-full" /></div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="rounded-xl border border-line bg-white p-5"><Blok className="h-3 w-24" /><Blok className="mt-4 h-7 w-20" /><Blok className="mt-4 h-2 w-full" /></div>)}
      </div>
      <div className="space-y-px overflow-hidden rounded-xl border border-line bg-white">
        {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="flex items-center gap-4 px-5 py-4"><Blok className="h-9 w-9 rounded-full" /><Blok className="h-4 flex-1" /><Blok className="h-4 w-20" /></div>)}
      </div>
    </div>
  );
}

export function SkeletonPonsel() {
  return (
    <div role="status" aria-label="Memuat" className="space-y-4">
      <Blok className="h-9 w-40" />
      <Blok className="h-40 w-full rounded-3xl" />
      {[0, 1, 2].map((i) => <Blok key={i} className="h-16 w-full rounded-2xl" />)}
    </div>
  );
}
