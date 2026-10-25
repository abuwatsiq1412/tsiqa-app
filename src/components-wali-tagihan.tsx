"use client";

import { useState } from "react";
import { LembarBawah, CaraBayar, FormKonfirmasi } from "@/components-wali";
import { IkonW } from "@/components-wali-ikon";

export interface TagihanItem {
  id: string; judul: string; kode: string; nominal: number; terbayar: number; sisa: number;
  jatuhTempo: string; status: "lunas" | "terlambat" | "cicilan" | "belum" | "menunggu";
  label: string; chip: string; tolak: string | null;
}

const rp = (n: number) => "Rp" + n.toLocaleString("id-ID");

export function DaftarTagihan({ items, anakId, rekening, wa, pondok, hari, aksi, bukaId }: {
  items: TagihanItem[]; anakId: string; rekening: string | null; wa: string | null; pondok: string; hari: string;
  aksi: (f: FormData) => Promise<void>; bukaId?: string;
}) {
  const [saring, setSaring] = useState<"semua" | "belum" | "lunas">("semua");
  const [pilih, setPilih] = useState<string | null>(bukaId ?? null);
  const [form, setForm] = useState(false);
  const tampil = items.filter((x) => saring === "semua" || (saring === "lunas") === (x.status === "lunas"));
  const t = items.find((x) => x.id === pilih) ?? null;
  const tutup = () => { setPilih(null); setForm(false); };

  return (
    <>
      <div role="tablist" className="flex gap-2">
        {([["semua", "Semua"], ["belum", "Belum lunas"], ["lunas", "Lunas"]] as const).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={saring === k} onClick={() => setSaring(k)}
            className={`tekan h-10 cursor-pointer rounded-full px-4 text-[13px] font-bold ${saring === k ? "bg-forest text-white" : "border border-line bg-white text-muted"}`}>{l}</button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        {tampil.length === 0 && <p className="rounded-2xl border border-dashed border-line py-10 text-center text-sm text-muted">Belum ada tagihan di sini.</p>}
        {tampil.map((x) => (
          <button key={x.id} onClick={() => setPilih(x.id)} className="tekan flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-line bg-white p-4 text-left">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-bold">{x.judul}</span>
              <span className="mt-0.5 block text-xs text-muted">Jatuh tempo {x.jatuhTempo}</span>
            </span>
            <span className="text-right">
              <span className="block text-[15px] font-extrabold">{rp(x.status === "lunas" ? x.nominal : x.sisa)}</span>
              <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${x.chip}`}>{x.label}</span>
            </span>
          </button>
        ))}
      </div>

      {t && (
        <LembarBawah judul={t.judul} tutup={tutup}>
          <div className="mt-1 text-xs text-muted">{t.kode}</div>
          <div className="mt-3 rounded-2xl bg-surface-soft/70 p-4 text-sm">
            <Baris k="Nominal" v={rp(t.nominal)} />
            <Baris k="Sudah dibayar" v={rp(t.terbayar)} />
            <Baris k="Sisa" v={rp(t.sisa)} tebal />
            <Baris k="Jatuh tempo" v={t.jatuhTempo} />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-muted">Status</span>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${t.chip}`}>{t.label}</span>
            </div>
          </div>

          {t.status === "menunggu" && (
            <p className="mt-3 rounded-xl bg-gold-pale px-4 py-3 text-[13px] leading-relaxed text-gold-ink">Bukti transfer Anda sudah terkirim dan sedang dicek bendahara.</p>
          )}
          {t.tolak && t.status !== "menunggu" && t.status !== "lunas" && (
            <p className="mt-3 rounded-xl bg-belum-bg px-4 py-3 text-[13px] leading-relaxed text-belum">Konfirmasi terakhir ditolak: {t.tolak}</p>
          )}

          {t.sisa > 0 && t.status !== "menunggu" && (
            form ? (
              <div className="mt-4">
                <FormKonfirmasi aksi={aksi} tagihanId={t.id} anakId={anakId} sisa={t.sisa} hari={hari} />
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-2.5">
                <button onClick={() => setForm(true)} className="tekan flex h-[50px] cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald text-[15px] font-bold text-white">
                  <IkonW n="unggah" className="h-5 w-5" />Sudah transfer
                </button>
                <CaraBayar nominal={rp(t.sisa)} untuk={`${t.judul} · ${pondok}`} rekening={rekening} wa={wa}
                  pesanWa={`Assalamu'alaikum, saya wali santri. Mau bertanya soal tagihan ${t.judul}.`} label="Lihat cara bayar" gaya="terang" />
              </div>
            )
          )}
        </LembarBawah>
      )}
    </>
  );
}

function Baris({ k, v, tebal }: { k: string; v: string; tebal?: boolean }) {
  return <div className="flex items-center justify-between py-1"><span className="text-muted">{k}</span><span className={tebal ? "font-extrabold" : "font-semibold"}>{v}</span></div>;
}
