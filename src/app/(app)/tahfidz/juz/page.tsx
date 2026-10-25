import Link from "next/link";
import { TombolKirim } from "@/components-form";
import {
  HeaderHalaman,
  Ikon,
  Kartu,
  Kosong,
  Label,
  Lencana,
  PesanNotifikasi,
  input,
  tombolSekunder,
} from "@/components-ui";
import { tanggal } from "@/lib/format";
import { konteks } from "@/lib/konteks";
import { catatKenaikanJuz, hapusKenaikanJuz } from "../actions";

interface BarisJuz {
  id: string;
  santri_id: string;
  juz: number;
  tanggal: string;
  penguji: string | null;
  catatan: string | null;
}

export default async function TahfidzJuzPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; galat?: string }>;
}) {
  const { ok, galat } = await searchParams;
  const { sb, pondokId } = await konteks();

  const [{ data: santri }, { data: rawJuz }] = await Promise.all([
    sb
      .from("santri")
      .select("id, nis, nama")
      .eq("pondok_id", pondokId)
      .eq("status", "aktif")
      .order("nama"),
    sb
      .from("tahfidz_juz")
      .select("*")
      .eq("pondok_id", pondokId)
      .order("tanggal", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  const daftarJuz = (rawJuz ?? []) as BarisJuz[];
  const petaSantri = new Map((santri ?? []).map((s) => [s.id, s]));

  // Kelompokkan juz yang sudah lulus per santri
  const juzPerSantri = new Map<string, number[]>();
  for (const row of daftarJuz) {
    const cur = juzPerSantri.get(row.santri_id) ?? [];
    if (!cur.includes(row.juz)) cur.push(row.juz);
    juzPerSantri.set(row.santri_id, cur.sort((a, b) => a - b));
  }

  const hariIni = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <HeaderHalaman
        kategori="Tahfidz & Muroja'ah Al-Qur'an"
        judul="Kenaikan & Capaian Juz Santri"
        deskripsi="Catat kelulusan ujian/kenaikan juz santri dan pantau total capaian hafalan Al-Qur'an (1–30 Juz)."
        aksi={
          <Link href="/tahfidz" className={tombolSekunder}>
            <Ikon nama="panah-kiri" className="h-4 w-4" />
            Setoran Harian
          </Link>
        }
      />

      <PesanNotifikasi ok={ok} galat={galat} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Peta Total Juz per Santri */}
          <Kartu>
            <h2 className="mb-3 text-base font-bold text-ink">
              Rekap Capaian Hafalan Santri
            </h2>
            {(santri ?? []).length === 0 ? (
              <p className="text-xs text-muted">Belum ada data santri aktif.</p>
            ) : (
              <div className="divide-y divide-line">
                {(santri ?? []).map((s) => {
                  const lulus = juzPerSantri.get(s.id) ?? [];
                  return (
                    <div
                      key={s.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-3"
                    >
                      <div>
                        <div className="text-sm font-bold text-ink">{s.nama}</div>
                        <div className="text-[11px] text-muted">{s.nis}</div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {lulus.length === 0 ? (
                          <span className="text-xs text-muted">Belum ada juz tercatat</span>
                        ) : (
                          <>
                            {lulus.map((j) => (
                              <span
                                key={j}
                                className="inline-flex h-6 items-center rounded-md border border-emerald/25 bg-emerald-pale px-2 text-[11px] font-bold text-emerald"
                              >
                                Juz {j}
                              </span>
                            ))}
                            <Lencana varian="lunas" titik={false}>
                              Total: {lulus.length} Juz
                            </Lencana>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Kartu>

          {/* Riwayat Pencatatan Kenaikan Juz */}
          {daftarJuz.length > 0 && (
            <Kartu>
              <h3 className="mb-3 text-sm font-bold text-ink">
                Riwayat Kenaikan Juz Terbaru
              </h3>
              <div className="divide-y divide-line text-xs">
                {daftarJuz.slice(0, 30).map((r) => {
                  const s = petaSantri.get(r.santri_id);
                  return (
                    <div
                      key={r.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                    >
                      <div>
                        <span className="font-bold text-ink">{s?.nama ?? "Santri"}</span>
                        <span className="mx-1.5 font-semibold text-emerald">
                          · Lulus Juz {r.juz}
                        </span>
                        <span className="text-muted">({tanggal(r.tanggal)})</span>
                        {(r.penguji || r.catatan) && (
                          <div className="text-[11px] text-muted">
                            {r.penguji ? `Penguji: ${r.penguji}` : ""}
                            {r.penguji && r.catatan ? " · " : ""}
                            {r.catatan ?? ""}
                          </div>
                        )}
                      </div>

                      <form action={hapusKenaikanJuz}>
                        <input type="hidden" name="id" value={r.id} />
                        <button className="cursor-pointer text-xs text-muted hover:text-belum">
                          Hapus
                        </button>
                      </form>
                    </div>
                  );
                })}
              </div>
            </Kartu>
          )}
        </div>

        {/* Form Catat Kenaikan Juz */}
        <Kartu>
          <h2 className="mb-1 text-base font-bold text-ink">Catat Kenaikan Juz</h2>
          <p className="mb-4 text-xs text-muted">
            Rekam saat santri telah menyelesaikan atau lulus ujian satu juz Al-Qur&apos;an.
          </p>

          <form action={catatKenaikanJuz} className="space-y-3.5">
            <label className="block">
              <Label>Pilih Santri *</Label>
              <select name="santri_id" required className={input}>
                <option value="">— Pilih nama santri —</option>
                {(santri ?? []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama} ({s.nis})
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              <label className="block">
                <Label>Nomor Juz (1–30) *</Label>
                <select name="juz" defaultValue="30" className={input}>
                  <option value="30">Juz 30 (Juz &apos;Amma)</option>
                  {Array.from({ length: 29 }, (_, i) => i + 1).map((j) => (
                    <option key={j} value={j}>
                      Juz {j}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <Label>Tanggal Lulus</Label>
                <input name="tanggal" type="date" defaultValue={hariIni} className={input} />
              </label>
            </div>

            <label className="block">
              <Label>Ustadz Penyimak / Penguji (Opsional)</Label>
              <input
                name="penguji"
                placeholder="Contoh: Ust. Ahmad"
                className={input}
              />
            </label>

            <label className="block">
              <Label>Catatan (Opsional)</Label>
              <input
                name="catatan"
                placeholder="Contoh: Tasmi' sekali duduk"
                className={input}
              />
            </label>

            <TombolKirim className="w-full">Simpan Kenaikan Juz</TombolKirim>
          </form>
        </Kartu>
      </div>
    </div>
  );
}
