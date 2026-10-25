import Link from "next/link";
import {
  HeaderHalaman,
  Ikon,
  Kartu,
  Kosong,
  Lencana,
  PesanNotifikasi,
  tombolSekunder,
} from "@/components-ui";
import { konteks } from "@/lib/konteks";
import { simpanTindakLanjutTerlambat } from "../actions";

interface BarisIzin {
  id: string;
  santri_id: string;
  jenis: "keluar" | "pulang" | "sakit" | "libur";
  alasan: string;
  waktu_keluar: string;
  batas_kembali: string;
  waktu_kembali: string | null;
  status: "keluar" | "kembali_tepat" | "kembali_terlambat";
  menit_terlambat: number;
  tindak_lanjut: string | null;
}

const LABEL_JENIS: Record<string, string> = {
  keluar: "Izin Keluar",
  pulang: "Izin Pulang",
  sakit: "Izin Sakit",
  libur: "Libur Pondok",
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

function formatDurasi(menit: number) {
  const hari = Math.floor(menit / 1440);
  const jam = Math.floor((menit % 1440) / 60);
  const mnt = menit % 60;
  const p: string[] = [];
  if (hari > 0) p.push(`${hari} hari`);
  if (jam > 0) p.push(`${jam} jam`);
  if (mnt > 0 && hari === 0) p.push(`${mnt} menit`);
  return p.join(" ") || `${menit} menit`;
}

export default async function LaporanKeterlambatanPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; galat?: string; jenis?: string }>;
}) {
  const { ok, galat, jenis } = await searchParams;
  const { sb, pondokId } = await konteks();

  const [{ data: santri }, { data: kamar }, { data: rawIzin }] = await Promise.all([
    sb
      .from("santri")
      .select("id, nis, nama, kamar_id, nama_wali, no_wa_wali")
      .eq("pondok_id", pondokId),
    sb.from("kamar").select("id, nama").eq("pondok_id", pondokId),
    sb
      .from("perizinan_santri")
      .select("*")
      .eq("pondok_id", pondokId)
      .order("batas_kembali", { ascending: false })
      .limit(250),
  ]);

  const petaKamar = new Map((kamar ?? []).map((k) => [k.id, k.nama]));
  const petaSantri = new Map((santri ?? []).map((s) => [s.id, s]));
  const sekarang = new Date();

  const semua = (rawIzin ?? []) as BarisIzin[];
  // Gabungkan yang sudah kembali terlambat + yang masih di luar tapi sudah lewat batas kembali
  const daftarTerlambat = semua.filter((x) => {
    const lewatDiluar = x.status === "keluar" && new Date(x.batas_kembali) < sekarang;
    const cocokStatus = x.status === "kembali_terlambat" || lewatDiluar;
    const cocokJenis = !jenis || jenis === "semua" || x.jenis === jenis;
    return cocokStatus && cocokJenis;
  });

  return (
    <div className="space-y-6">
      <HeaderHalaman
        kategori="Keamanan & Ketertiban Asrama"
        judul="Laporan Keterlambatan Kedatangan Santri"
        deskripsi="Rekap santri yang terlambat kembali ke pondok baik dari izin keluar, izin pulang bermalam, maupun seusai libur pesantren."
        aksi={
          <Link href="/perizinan" className={tombolSekunder}>
            <Ikon nama="panah-kiri" className="h-4 w-4" />
            Kembali ke Pos Izin
          </Link>
        }
      />

      <PesanNotifikasi ok={ok} galat={galat} />

      {/* Filter Kategori Izin / Libur */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { k: "semua", l: "Semua Keterlambatan" },
          { k: "libur", l: "Seusai Libur Pondok" },
          { k: "pulang", l: "Izin Pulang" },
          { k: "keluar", l: "Izin Keluar Sebentar" },
          { k: "sakit", l: "Izin Berobat" },
        ].map((f) => {
          const aktif = (jenis ?? "semua") === f.k;
          return (
            <Link
              key={f.k}
              href={`/perizinan/keterlambatan?jenis=${f.k}`}
              className={`rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition ${
                aktif
                  ? "border-emerald bg-emerald-pale text-emerald"
                  : "border-line bg-surface text-muted hover:text-ink"
              }`}
            >
              {f.l}
            </Link>
          );
        })}
      </div>

      {daftarTerlambat.length === 0 ? (
        <Kosong
          judul="Tidak Ada Catatan Keterlambatan"
          isi="Alhamdulillah, belum ada santri yang tercatat terlambat kembali pada kategori ini."
        />
      ) : (
        <div className="space-y-3.5">
          {daftarTerlambat.map((iz) => {
            const s = petaSantri.get(iz.santri_id);
            const namaKamar = s?.kamar_id ? petaKamar.get(s.kamar_id) : null;
            const masihDiluar = iz.status === "keluar";
            const menitTelat = masihDiluar
              ? Math.max(
                  0,
                  Math.round((sekarang.getTime() - new Date(iz.batas_kembali).getTime()) / 60000)
                )
              : iz.menit_terlambat;

            return (
              <Kartu key={iz.id} className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-ink">{s?.nama ?? "Santri"}</span>
                      <span className="text-xs text-muted">
                        ({s?.nis ?? "-"}{namaKamar ? ` · Kamar ${namaKamar}` : ""})
                      </span>
                      <Lencana varian="mint" titik={false}>
                        {LABEL_JENIS[iz.jenis] ?? iz.jenis}
                      </Lencana>
                      <Lencana varian="belum">
                        Terlambat {formatDurasi(menitTelat)}
                      </Lencana>
                      {masihDiluar && (
                        <Lencana varian="cicilan">Belum Tiba di Pondok</Lencana>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      Keperluan: <strong className="text-ink">{iz.alasan}</strong> · Batas kembali:{" "}
                      <strong className="text-ink">{formatWaktu(iz.batas_kembali)}</strong> · Tiba aktual:{" "}
                      <strong className="text-ink">
                        {iz.waktu_kembali ? formatWaktu(iz.waktu_kembali) : "Belum kembali"}
                      </strong>
                    </p>
                  </div>
                </div>

                <form
                  action={simpanTindakLanjutTerlambat}
                  className="flex flex-wrap items-center gap-2 border-t border-line pt-2.5"
                >
                  <input type="hidden" name="id" value={iz.id} />
                  <input
                    name="tindak_lanjut"
                    defaultValue={iz.tindak_lanjut ?? ""}
                    placeholder="Catat kebijakan/pembinaan pondok (mis. Ta'zir hafalan juz / surat peringatan / udzur diterima)..."
                    className="h-9 flex-1 rounded-lg border border-line bg-surface-soft/50 px-3 text-xs text-ink outline-none focus:border-emerald"
                  />
                  <button className="h-9 cursor-pointer rounded-lg bg-emerald-pale px-3.5 text-xs font-semibold text-emerald transition hover:bg-emerald hover:text-on-brand">
                    Simpan Catatan Kebijakan
                  </button>
                </form>
              </Kartu>
            );
          })}
        </div>
      )}
    </div>
  );
}
