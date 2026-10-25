import Link from "next/link";
import { muatWali, pilihAnak, dataAnak, tautan } from "@/lib/wali";
import { tanggalLengkap } from "@/lib/waktu";
import { IkonW } from "@/components-wali-ikon";

export const metadata = { title: "Riwayat" };
const rp = (n: number) => "Rp" + n.toLocaleString("id-ID");

export default async function Riwayat({ searchParams }: { searchParams: Promise<{ a?: string }> }) {
  const { a } = await searchParams;
  const { sb, anak } = await muatWali();
  const aktif = pilihAnak(anak, a);
  if (!aktif) return null;
  const d = await dataAnak(sb, aktif);
  const judul = new Map(d.tagihan.map((t) => [t.id, t.judul]));
  const menunggu = d.konfirmasi.filter((k) => k.status === "menunggu");

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Riwayat</h1>
      <p className="mb-4 mt-0.5 text-[13px] text-muted">Pembayaran {aktif.nama}</p>

      {menunggu.map((k) => (
        <div key={k.id} className="mb-2.5 flex items-center gap-3 rounded-2xl bg-gold-pale p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gold-ink"><IkonW n="jam" /></span>
          <span className="flex-1"><span className="block text-sm font-bold text-gold-ink">Menunggu verifikasi</span><span className="block text-xs text-gold-ink/80">{judul.get(k.tagihan_id as string) ?? "Tagihan"}</span></span>
          <span className="text-sm font-extrabold text-gold-ink">{rp(k.nominal)}</span>
        </div>
      ))}

      {d.bayar.length === 0 && menunggu.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line py-10 text-center text-sm text-muted">Belum ada pembayaran tercatat.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {d.bayar.map((p) => (
            <Link key={p.id} href={tautan(`/wali/kwitansi/${p.id}`, aktif.id)} className="tekan flex items-center gap-3 rounded-2xl border border-line bg-white p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lunas-bg text-lunas"><IkonW n="kwitansi" /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-[15px] font-bold">{judul.get(p.tagihan_id as string) ?? "Pembayaran"}</span><span className="block text-xs text-muted">{tanggalLengkap(p.tanggal)} · {p.nomor_kwitansi}</span></span>
              <span className="text-[15px] font-extrabold text-lunas">{rp(p.nominal)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
