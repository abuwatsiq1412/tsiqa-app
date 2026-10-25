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
import { konteks } from "@/lib/konteks";
import { catatIzinKeluar, hapusIzinSantri, tandaiSantriKembali } from "./actions";

interface BarisIzin {
  id: string;
  santri_id: string;
  jenis: "keluar" | "pulang" | "sakit" | "libur";
  alasan: string;
  penjemput: string | null;
  waktu_keluar: string;
  batas_kembali: string;
  waktu_kembali: string | null;
  status: "keluar" | "kembali_tepat" | "kembali_terlambat";
  menit_terlambat: number;
  tindak_lanjut: string | null;
}

const LABEL_JENIS: Record<string, string> = {
  keluar: "Izin Keluar Sebentar",
  pulang: "Izin Pulang (Bermalam)",
  sakit: "Izin Berobat / Sakit",
  libur: "Kepulangan Libur Pondok",
};

function formatWaktu(iso: string) {
  try {
    return new Date(iso).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatDurasiTerlambat(menit: number) {
  if (menit <= 0) return "Tepat Waktu";
  const hari = Math.floor(menit / 1440);
  const jam = Math.floor((menit % 1440) / 60);
  const sisaMenit = menit % 60;
  const bagian: string[] = [];
  if (hari > 0) bagian.push(`${hari} hari`);
  if (jam > 0) bagian.push(`${jam} jam`);
  if (sisaMenit > 0 && hari === 0) bagian.push(`${sisaMenit} mnt`);
  return `Terlambat ${bagian.join(" ")}`;
}

export default async function PerizinanPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; galat?: string }>;
}) {
  const { ok, galat } = await searchParams;
  const { sb, pondokId } = await konteks();

  const [{ data: pondok }, { data: santri }, { data: rawIzin }] = await Promise.all([
    sb.from("pondok").select("nama").eq("id", pondokId).maybeSingle(),
    sb
      .from("santri")
      .select("id, nis, nama, nama_wali, no_wa_wali")
      .eq("pondok_id", pondokId)
      .eq("status", "aktif")
      .order("nama"),
    sb
      .from("perizinan_santri")
      .select("*")
      .eq("pondok_id", pondokId)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const petaSantri = new Map(
    (santri ?? []).map((s) => [s.id, s])
  );
  const semuaIzin = (rawIzin ?? []) as BarisIzin[];
  const sedangDiluar = semuaIzin.filter((x) => x.status === "keluar");
  const riwayatSelesai = semuaIzin.filter((x) => x.status !== "keluar").slice(0, 20);

  const sekarang = new Date();
  const lewatBatasDiluar = sedangDiluar.filter(
    (x) => new Date(x.batas_kembali) < sekarang
  );

  // Default waktu keluar = sekarang, batas kembali = besok sore 17:00
  const isoSekarang = new Date(sekarang.getTime() - sekarang.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  const besok = new Date(sekarang.getTime() + 86400000 - sekarang.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <div className="space-y-6">
      <HeaderHalaman
        kategori="Keamanan & Ketertiban Asrama"
        judul="Izin Keluar, Pulang & Pos Gerbang"
        deskripsi="Catat izin keluar/pulang santri, pantau siapa yang sedang di luar pondok, dan rekam ketepatan waktu kembali."
        aksi={
          <div className="flex flex-wrap gap-2">
            <Link href="/perizinan/keterlambatan" className={tombolSekunder}>
              <Ikon nama="kalender" className="h-4 w-4 text-cicilan" />
              Laporan Keterlambatan
            </Link>
            <Link href="/perizinan/pelanggaran" className={tombolSekunder}>
              <Ikon nama="peringatan" className="h-4 w-4 text-belum" />
              Buku Pelanggaran
            </Link>
          </div>
        }
      />

      <PesanNotifikasi ok={ok} galat={galat} />

      {/* Ringkasan Cepat */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kartu varian="mint">
          <div className="text-xs font-semibold text-muted">Sedang di Luar Pondok</div>
          <div className="mt-1 text-2xl font-extrabold text-ink">
            {sedangDiluar.length} <span className="text-sm font-medium text-muted">Santri</span>
          </div>
          <p className="mt-1 text-xs text-muted">
            Belum check-in kembali di pos keamanan
          </p>
        </Kartu>

        <Kartu>
          <div className="text-xs font-semibold text-muted">Melewati Batas Waktu (Belum Kembali)</div>
          <div className="mt-1 text-2xl font-extrabold text-belum">
            {lewatBatasDiluar.length} <span className="text-sm font-medium text-muted">Santri</span>
          </div>
          <p className="mt-1 text-xs text-muted">
            Perlu segera dihubungi wali santrinya
          </p>
        </Kartu>

        <Link href="/perizinan/keterlambatan" className="group block">
          <Kartu className="h-full transition group-hover:border-emerald/40">
            <div className="flex items-center justify-between text-xs font-semibold text-muted">
              <span>Riwayat Kembali Terlambat</span>
              <Ikon nama="panah" className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </div>
            <div className="mt-1 text-2xl font-extrabold text-cicilan">
              {semuaIzin.filter((x) => x.status === "kembali_terlambat").length}{" "}
              <span className="text-sm font-medium text-muted">Kejadian</span>
            </div>
            <p className="mt-1 text-xs text-muted">Klik untuk buka laporan keterlambatan</p>
          </Kartu>
        </Link>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_380px]">
        {/* Daftar Santri Sedang di Luar & Riwayat */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-base font-bold text-ink">
              Santri Sedang di Luar Pondok ({sedangDiluar.length})
            </h2>

            {sedangDiluar.length === 0 ? (
              <Kosong
                judul="Seluruh Santri Berada di Pondok"
                isi="Tidak ada santri yang sedang berstatus izin di luar pondok saat ini."
              />
            ) : (
              sedangDiluar.map((iz) => {
                const s = petaSantri.get(iz.santri_id);
                const terlambatSekarang = new Date(iz.batas_kembali) < sekarang;
                const selisihMnt = Math.max(
                  0,
                  Math.round((sekarang.getTime() - new Date(iz.batas_kembali).getTime()) / 60000)
                );

                const pesanWa = `Assalamu'alaikum Bapak/Ibu ${s?.nama_wali ?? "Wali Santri"}, kami dari Bagian Keamanan ${pondok?.nama ?? "Pondok"} menginformasikan bahwa ananda *${s?.nama ?? ""}* (${LABEL_JENIS[iz.jenis] ?? iz.jenis}: ${iz.alasan}) memiliki batas kembali ke pondok pada *${formatWaktu(iz.batas_kembali)}*. Mohon kerja samanya agar ananda kembali tepat waktu. Jazakumullahu khairan.`;
                const tautanWa = s?.no_wa_wali
                  ? `https://wa.me/${s.no_wa_wali}?text=${encodeURIComponent(pesanWa)}`
                  : null;

                return (
                  <Kartu
                    key={iz.id}
                    className={
                      terlambatSekarang
                        ? "border-belum/40 bg-belum-bg/20"
                        : ""
                    }
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-ink">
                            {s?.nama ?? "Santri"}
                          </span>
                          <span className="text-xs text-muted">({s?.nis ?? "-"})</span>
                          <Lencana varian="mint" titik={false}>
                            {LABEL_JENIS[iz.jenis] ?? iz.jenis}
                          </Lencana>
                          {terlambatSekarang ? (
                            <Lencana varian="belum">
                              Lewat Batas ({formatDurasiTerlambat(selisihMnt)})
                            </Lencana>
                          ) : (
                            <Lencana varian="cicilan">Sedang di Luar</Lencana>
                          )}
                        </div>
                        <p className="mt-1 text-xs font-medium text-ink">
                          Alasan: {iz.alasan}
                          {iz.penjemput ? ` · Dijemput oleh: ${iz.penjemput}` : ""}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
                          <span>Keluar: {formatWaktu(iz.waktu_keluar)}</span>
                          <span className="font-semibold text-ink">
                            Batas Kembali: {formatWaktu(iz.batas_kembali)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {tautanWa && (
                          <a
                            href={tautanWa}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-emerald transition hover:border-emerald/40"
                          >
                            <Ikon nama="wa" className="h-3.5 w-3.5" />
                            WA Wali
                          </a>
                        )}
                        <form action={hapusIzinSantri}>
                          <input type="hidden" name="id" value={iz.id} />
                          <button className="cursor-pointer text-xs text-muted hover:text-belum">
                            Batal
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Form Check-in Kedatangan Santri */}
                    <form
                      action={tandaiSantriKembali}
                      className="mt-3.5 flex flex-wrap items-end gap-2.5 border-t border-line pt-3"
                    >
                      <input type="hidden" name="id" value={iz.id} />
                      <label className="block flex-1 min-w-[180px]">
                        <span className="mb-1 block text-[11px] font-semibold text-muted">
                          Waktu Tiba di Pondok
                        </span>
                        <input
                          name="waktu_kembali"
                          type="datetime-local"
                          defaultValue={isoSekarang}
                          className="h-9 w-full rounded-lg border border-line bg-surface px-2.5 text-xs text-ink"
                        />
                      </label>
                      <label className="block flex-1 min-w-[180px]">
                        <span className="mb-1 block text-[11px] font-semibold text-muted">
                          Catatan Kedatangan / Ta&apos;zir (Opsional)
                        </span>
                        <input
                          name="tindak_lanjut"
                          placeholder="Mis. Kembali diantar ayah / udzur hujan"
                          className="h-9 w-full rounded-lg border border-line bg-surface px-2.5 text-xs text-ink"
                        />
                      </label>
                      <button className="h-9 cursor-pointer rounded-lg bg-emerald px-3.5 text-xs font-semibold text-on-brand transition hover:bg-emerald-hover">
                        ✓ Tandai Sudah Kembali
                      </button>
                    </form>
                  </Kartu>
                );
              })
            )}
          </div>

          {/* Riwayat Izin Selesai Terbaru */}
          {riwayatSelesai.length > 0 && (
            <Kartu>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-ink">Riwayat Kembalinya Santri Terbaru</h3>
                <Link
                  href="/perizinan/keterlambatan"
                  className="text-xs font-semibold text-emerald hover:underline"
                >
                  Lihat Khusus yang Terlambat →
                </Link>
              </div>
              <div className="divide-y divide-line text-xs">
                {riwayatSelesai.map((iz) => {
                  const s = petaSantri.get(iz.santri_id);
                  return (
                    <div key={iz.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                      <div>
                        <span className="font-semibold text-ink">{s?.nama ?? "Santri"}</span>
                        <span className="text-muted">
                          {" "}
                          · {LABEL_JENIS[iz.jenis] ?? iz.jenis} ({iz.alasan})
                        </span>
                        <div className="text-[11px] text-muted">
                          Kembali: {iz.waktu_kembali ? formatWaktu(iz.waktu_kembali) : "-"}
                          {iz.tindak_lanjut ? ` · Catatan: ${iz.tindak_lanjut}` : ""}
                        </div>
                      </div>
                      <Lencana
                        varian={iz.status === "kembali_terlambat" ? "belum" : "lunas"}
                      >
                        {iz.status === "kembali_terlambat"
                          ? formatDurasiTerlambat(iz.menit_terlambat)
                          : "Tepat Waktu"}
                      </Lencana>
                    </div>
                  );
                })}
              </div>
            </Kartu>
          )}
        </div>

        {/* Formulir Catat Izin Keluar Baru */}
        <Kartu>
          <h2 className="mb-1 text-base font-bold text-ink">Catat Izin Keluar / Pulang</h2>
          <p className="mb-4 text-xs text-muted">
            Begitu disimpan, status santri langsung tercatat <strong>Sedang di Luar</strong>.
          </p>

          <form action={catatIzinKeluar} className="space-y-3.5">
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

            <label className="block">
              <Label>Kategori Izin *</Label>
              <select name="jenis" defaultValue="pulang" className={input}>
                <option value="pulang">Izin Pulang (Bermalam)</option>
                <option value="keluar">Izin Keluar Sebentar (Tanpa Menginap)</option>
                <option value="sakit">Izin Berobat / Sakit</option>
                <option value="libur">Kepulangan Libur Resmi Pondok</option>
              </select>
            </label>

            <label className="block">
              <Label>Keperluan / Alasan Izin *</Label>
              <input
                name="alasan"
                required
                placeholder="Contoh: Acara keluarga / Kontrol dokter gigi"
                className={input}
              />
            </label>

            <label className="block">
              <Label>Penjemput / Pendamping (Opsional)</Label>
              <input
                name="penjemput"
                placeholder="Contoh: Dijemput Ayah kandung"
                className={input}
              />
            </label>

            <div className="grid grid-cols-1 gap-3">
              <label className="block">
                <Label>Waktu Keluar Pondok</Label>
                <input
                  name="waktu_keluar"
                  type="datetime-local"
                  defaultValue={isoSekarang}
                  className={input}
                />
              </label>

              <label className="block">
                <Label>Batas Waktu Wajib Kembali *</Label>
                <input
                  name="batas_kembali"
                  type="datetime-local"
                  defaultValue={besok}
                  required
                  className={input}
                />
              </label>
            </div>

            <TombolKirim className="w-full">Terbitkan Izin Keluar</TombolKirim>
          </form>
        </Kartu>
      </div>
    </div>
  );
}
