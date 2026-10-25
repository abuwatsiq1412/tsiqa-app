"use client";

import { useCallback, useEffect, useState } from "react";
import { simpanAbsensiGuru, type HasilSimpan } from "@/app/guru/actions";

type Status = "hadir" | "izin" | "sakit" | "alpa";
interface Antrean { jadwal: string; tanggal: string; data: { santri_id: string; status: string }[] }
const KUNCI = "guru_antrean_absensi";

const baca = (): Antrean[] => { try { return JSON.parse(localStorage.getItem(KUNCI) ?? "[]"); } catch { return []; } };
const tulis = (a: Antrean[]) => { try { localStorage.setItem(KUNCI, JSON.stringify(a)); } catch {} };

/** Mengirim antrean absensi yang tertunda saat sinyal kembali. Dipasang sekali di tata letak guru. */
export function SinkronAntrean() {
  const [sisa, setSisa] = useState(0);
  const kirim = useCallback(async () => {
    let a = baca();
    if (!a.length || !navigator.onLine) { setSisa(a.length); return; }
    const gagal: Antrean[] = [];
    for (const x of a) {
      try {
        const h: HasilSimpan = await simpanAbsensiGuru(x.jadwal, x.tanggal, x.data);
        if (!h.ok && !h.galat) gagal.push(x); // galat tak dikenal: coba lagi nanti
      } catch { gagal.push(x); }  // masih offline
    }
    a = gagal; tulis(a); setSisa(a.length);
  }, []);
  useEffect(() => {
    kirim();
    window.addEventListener("online", kirim);
    return () => window.removeEventListener("online", kirim);
  }, [kirim]);
  if (!sisa) return null;
  return <div role="status" className="bg-gold-pale px-5 py-2 text-center text-xs font-semibold text-gold-ink">{sisa} absensi menunggu sinyal untuk dikirim</div>;
}

const PILIHAN: { k: Status; l: string; aktif: string }[] = [
  { k: "hadir", l: "H", aktif: "bg-emerald text-white" },
  { k: "izin", l: "I", aktif: "bg-cicilan text-white" },
  { k: "sakit", l: "S", aktif: "bg-gold text-white" },
  { k: "alpa", l: "A", aktif: "bg-belum text-white" },
];

export function FormAbsen({ jadwal, tanggal, santri }: { jadwal: string; tanggal: string; santri: { id: string; nama: string; nis: string; status: Status | null }[] }) {
  const [st, setSt] = useState<Record<string, Status>>(() => Object.fromEntries(santri.map((s) => [s.id, s.status ?? "hadir"])));
  const [pesan, setPesan] = useState<{ t: string; nada: "ok" | "tunda" | "galat" } | null>(null);
  const [kirim, setKirim] = useState(false);
  const ringkas = (["hadir", "izin", "sakit", "alpa"] as Status[]).map((k) => `${Object.values(st).filter((v) => v === k).length} ${k}`).join(" · ");

  const simpan = async () => {
    const data = santri.map((s) => ({ santri_id: s.id, status: st[s.id] }));
    setKirim(true);
    try {
      const h = await simpanAbsensiGuru(jadwal, tanggal, data);
      setPesan(h.ok ? { t: `Absensi tersimpan (${h.n} santri).`, nada: "ok" } : { t: h.galat ?? "Belum berhasil disimpan.", nada: "galat" });
    } catch {
      tulis([...baca().filter((x) => !(x.jadwal === jadwal && x.tanggal === tanggal)), { jadwal, tanggal, data }]);
      setPesan({ t: "Tidak ada sinyal. Absensi disimpan di HP dan dikirim otomatis nanti.", nada: "tunda" });
    }
    setKirim(false);
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs text-muted">{ringkas}</span>
        <button type="button" onClick={() => setSt(Object.fromEntries(santri.map((s) => [s.id, "hadir" as Status])))} className="tekan h-10 cursor-pointer rounded-full border border-emerald px-4 text-[13px] font-bold text-emerald">Semua hadir</button>
      </div>
      <ul className="flex flex-col gap-2">
        {santri.map((s) => (
          <li key={s.id} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3">
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{s.nama}</span><span className="text-xs text-muted">{s.nis}</span></span>
            <span className="flex gap-1.5">
              {PILIHAN.map((p) => (
                <button key={p.k} type="button" aria-pressed={st[s.id] === p.k} aria-label={p.k} onClick={() => setSt((o) => ({ ...o, [s.id]: p.k }))}
                  className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-sm font-extrabold ${st[s.id] === p.k ? p.aktif : "bg-surface-soft text-muted"}`}>{p.l}</button>
              ))}
            </span>
          </li>
        ))}
      </ul>
      {pesan && <p role="status" className={`mt-4 rounded-xl px-4 py-3 text-[13px] font-semibold ${pesan.nada === "ok" ? "bg-emerald-pale text-emerald" : pesan.nada === "tunda" ? "bg-gold-pale text-gold-ink" : "bg-belum-bg text-belum"}`}>{pesan.t}</p>}
      <button onClick={simpan} disabled={kirim} className="tekan sticky bottom-4 mt-4 h-[52px] w-full cursor-pointer rounded-2xl bg-emerald text-base font-bold text-white shadow-lg disabled:opacity-60">{kirim ? "Menyimpan…" : "Simpan absensi"}</button>
    </div>
  );
}
