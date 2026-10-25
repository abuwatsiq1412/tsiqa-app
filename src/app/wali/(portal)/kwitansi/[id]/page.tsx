import Link from "next/link";
import { notFound } from "next/navigation";
import { muatWali, tautan } from "@/lib/wali";
import { terbilang } from "@/lib/format";
import { waktuLengkap } from "@/lib/waktu";
import { TombolCetak } from "@/components-cetak";
import { IkonW } from "@/components-wali-ikon";

export const metadata = { title: "Kwitansi" };
const rp = (n: number) => "Rp" + n.toLocaleString("id-ID");
const huruf = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default async function KwitansiWali({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ a?: string }> }) {
  const { id } = await params;
  const { a } = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { sb, anak } = await muatWali();
  const { data: b } = await sb.from("pembayaran").select("id, tagihan_id, santri_id, pondok_id, nominal, tanggal, metode, nomor_kwitansi, dibatalkan_pada").eq("id", id).maybeSingle();
  if (!b || !anak.some((x) => x.id === b.santri_id)) notFound();
  const [{ data: t }, { data: p }] = await Promise.all([
    sb.from("tagihan").select("judul, kode").eq("id", b.tagihan_id).maybeSingle(),
    sb.from("pondok").select("nama, alamat, kota, telepon, nama_bendahara").eq("id", b.pondok_id).maybeSingle(),
  ]);
  const s = anak.find((x) => x.id === b.santri_id)!;
  const batal = !!b.dibatalkan_pada;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link href={tautan("/wali/riwayat", a ?? s.id)} className="tekan flex h-11 items-center gap-1 text-sm font-bold text-emerald"><IkonW n="kiri" className="h-5 w-5" />Riwayat</Link>
        <TombolCetak />
      </div>
      <article className="rounded-3xl border border-line bg-white p-5 print:border-0 print:p-0">
        <div className="text-center">
          <div className="text-base font-extrabold">{p?.nama}</div>
          {p?.alamat && <div className="text-xs text-muted">{p.alamat}{p.kota ? `, ${p.kota}` : ""}</div>}
        </div>
        <div className="my-4 border-t border-dashed border-line" />
        <div className="text-center text-sm font-extrabold tracking-wide">KWITANSI{batal ? " (DIBATALKAN)" : ""}</div>
        <div className="text-center font-mono text-xs text-muted">{b.nomor_kwitansi}</div>
        <dl className="mt-4 space-y-2.5 text-sm">
          <Baris k="Telah diterima dari" v={`Wali ${s.nama}`} />
          <Baris k="NIS" v={s.nis} />
          <Baris k="Untuk" v={t?.judul ?? "Pembayaran"} />
          <Baris k="Metode" v={huruf(String(b.metode))} />
          <Baris k="Tanggal" v={waktuLengkap(b.tanggal)} />
        </dl>
        <div className="mt-4 rounded-2xl bg-surface-soft p-4 text-center">
          <div className={`text-3xl font-extrabold tracking-tight ${batal ? "text-muted line-through" : "text-forest"}`}>{rp(Number(b.nominal))}</div>
          <div className="mt-1 text-xs italic text-muted">{huruf(terbilang(Number(b.nominal)))}</div>
        </div>
        {p?.nama_bendahara && <div className="mt-6 text-right text-xs text-muted">Bendahara<br /><span className="mt-6 inline-block font-semibold text-ink">{p.nama_bendahara}</span></div>}
      </article>
    </div>
  );
}

function Baris({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-4"><dt className="text-muted">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>;
}
