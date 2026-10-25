"use client";

import Link from "next/link";

export function BarAlatDokumen({
  pondokId,
  aktif,
  kembaliHref,
}: {
  pondokId: string;
  aktif: "invoice" | "sla" | "kwitansi";
  kembaliHref: string;
}) {
  return (
    <div className="print:hidden sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={kembaliHref}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink no-underline transition hover:bg-surface-soft"
          >
            ← Kembali
          </Link>
          <div className="inline-flex rounded-lg border border-line bg-surface-soft p-0.5 text-xs font-semibold">
            <Link
              href={`/dokumen/langganan/${pondokId}/invoice`}
              className={`rounded-md px-3 py-1.5 no-underline transition ${
                aktif === "invoice"
                  ? "bg-white text-ink shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
            >
              Surat Penawaran & Invoice
            </Link>
            <Link
              href={`/dokumen/langganan/${pondokId}/sla`}
              className={`rounded-md px-3 py-1.5 no-underline transition ${
                aktif === "sla"
                  ? "bg-white text-ink shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
            >
              Kesepakatan & Garansi (SLA)
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-emerald px-4 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-hover"
        >
          Cetak / Simpan PDF
        </button>
      </div>
    </div>
  );
}
