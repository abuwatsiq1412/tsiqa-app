import { muatWali, pilihAnak, dataAnak, statusTagihan, GAYA } from "@/lib/wali";
import { tanggalLengkap, hariIni } from "@/lib/waktu";
import { nomorWA } from "@/lib/format";
import { DaftarTagihan } from "@/components-wali-tagihan";
import { kirimKonfirmasi } from "../../actions";

export const metadata = { title: "Tagihan" };

const GALAT: Record<string, string> = {
  nominal: "Nominal belum sesuai dengan sisa tagihan.", bukti: "Pilih foto atau PDF bukti transfer.", berkas: "Berkas harus foto atau PDF, maksimal 5 MB.",
  tagihan: "Tagihan tidak ditemukan.", unggah: "Bukti belum berhasil diunggah. Coba lagi.", menunggu: "Tagihan ini masih menunggu verifikasi.", ditolak: "Konfirmasi belum bisa dikirim. Coba lagi.",
};

export default async function Tagihan({ searchParams }: { searchParams: Promise<{ a?: string; buka?: string; ok?: string; galat?: string }> }) {
  const { a, buka, ok, galat } = await searchParams;
  const { sb, anak } = await muatWali();
  const aktif = pilihAnak(anak, a);
  if (!aktif) return null;
  const d = await dataAnak(sb, aktif);
  const tolak = new Map<string, string>();
  for (const k of d.konfirmasi) if (k.status === "ditolak" && k.alasan_tolak && !tolak.has(k.tagihan_id as string)) tolak.set(k.tagihan_id as string, k.alasan_tolak);

  const items = d.tagihan.map((t) => {
    const s = statusTagihan(t, d.menunggu.has(t.id));
    return { id: t.id, judul: t.judul, kode: t.kode, nominal: t.nominal, terbayar: t.terbayar, sisa: t.sisa,
      jatuhTempo: tanggalLengkap(t.jatuh_tempo), status: s, label: GAYA[s].label, chip: GAYA[s].chip, tolak: tolak.get(t.id) ?? null };
  });

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Tagihan</h1>
      <p className="mb-4 mt-0.5 text-[13px] text-muted">{aktif.nama}</p>
      {ok && <p role="status" className="mb-4 rounded-xl bg-emerald-pale px-4 py-3 text-[13px] font-semibold text-emerald">Bukti terkirim. Bendahara akan mengeceknya.</p>}
      {galat && GALAT[galat] && <p role="alert" className="mb-4 rounded-xl bg-belum-bg px-4 py-3 text-[13px] font-medium text-belum">{GALAT[galat]}</p>}
      <DaftarTagihan items={items} anakId={aktif.id} rekening={d.rekening} wa={d.pondok?.telepon ? nomorWA(d.pondok.telepon) : null}
        pondok={d.pondok?.nama ?? "Pondok"} hari={hariIni()} aksi={kirimKonfirmasi} bukaId={buka} key={aktif.id + (buka ?? "")} />
    </div>
  );
}
