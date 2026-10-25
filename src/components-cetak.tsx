"use client";

export function TombolCetak() {
  return (
    <button onClick={() => window.print()} className="inline-flex items-center justify-center rounded-md bg-emerald px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-hover">
      Cetak
    </button>
  );
}
