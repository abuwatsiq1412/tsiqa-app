import Link from "next/link";
import { muatWali, pilihAnak, dataAnak, statusTagihan, GAYA, namaPendek, inisial, tautan } from "@/lib/wali";
import { tanggalLengkap, hariIni } from "@/lib/waktu";
import { nomorWA } from "@/lib/format";
import { HeroWali, CaraBayar, KepalaBeranda, type KabarItem } from "@/components-wali";
import { IkonW } from "@/components-wali-ikon";

export const metadata = { title: "Beranda" };
const rp = (n: number) => "Rp" + n.toLocaleString("id-ID");

export default async function Beranda({ searchParams }: { searchParams: Promise<{ a?: string }> }) {
  const { a } = await searchParams;
  const { sb, anak } = await muatWali();
  const aktif = pilihAnak(anak, a);
  if (!aktif) return <p className="py-20 text-center text-sm text-muted">Belum ada ananda yang tertaut.</p>;
  const [d, { data: adaRapor }] = await Promise.all([
    dataAnak(sb, aktif),
    sb.from("rapor_catatan").select("id").eq("santri_id", aktif.id).eq("dipublikasi", true).limit(1),
  ]);

  const belum = d.tagihan.filter((t) => t.sisa > 0).sort((x, y) => x.jatuh_tempo.localeCompare(y.jatuh_tempo));
  const terlambat = belum.filter((t) => t.jatuh_tempo < hariIni() && !d.menunggu.has(t.id));
  const nada = d.totalSisa === 0 ? "hijau" : terlambat.length ? "merah" : "emas";
  const chip = d.totalSisa === 0 ? "Semua tagihan lunas" : terlambat.length ? `${terlambat.length} tagihan terlambat` : `${belum.length} tagihan berjalan`;
  const wa = d.pondok?.telepon ? nomorWA(d.pondok.telepon) : null;
  const raporDibuka = (adaRapor ?? []).length > 0;

  const kabar: KabarItem[] = [
    ...d.konfirmasi.filter((k) => k.status !== "menunggu").slice(0, 3).map((k) => ({
      judul: k.status === "diterima" ? "Pembayaran diterima" : "Konfirmasi ditolak",
      isi: k.status === "diterima" ? `Transfer ${rp(k.nominal)} sudah dicek bendahara.` : k.alasan_tolak ?? "Silakan kirim ulang bukti transfer.",
      waktu: tanggalLengkap(k.diproses_pada ?? k.created_at), nada: (k.status === "diterima" ? "hijau" : "merah") as KabarItem["nada"],
    })),
    ...d.tagihan.filter((t) => Date.now() - new Date(t.created_at).getTime() < 14 * 864e5).slice(0, 3).map((t) => ({
      judul: "Tagihan baru", isi: `${t.judul} · ${rp(t.nominal)}`, waktu: tanggalLengkap(t.created_at), nada: "emas" as const,
    })),
  ].slice(0, 6);

  return (
    <div className="flex flex-col gap-5">
      <KepalaBeranda
        anak={anak.map((x) => ({ id: x.id, nama: x.nama, pendek: namaPendek(x), inisial: inisial(x.nama), sub: x.nis }))}
        aktifId={aktif.id} kabar={kabar} />

      <HeroWali pondok={d.pondok?.nama ?? "Pondok"} anak={namaPendek(aktif)} total={d.totalSisa} chip={chip} nada={nada}>
        {d.totalSisa > 0 && (
          <CaraBayar nominal={rp(d.totalSisa)} untuk="Total tagihan belum dibayar" rekening={d.rekening} wa={wa}
            pesanWa={`Assalamu'alaikum, saya wali dari ${aktif.nama}. Mau bertanya soal tagihan.`} />
        )}
        <Link href={tautan("/wali/tagihan", aktif.id)} className="tekan flex h-[46px] flex-1 items-center justify-center rounded-[14px] bg-white/15 text-sm font-bold text-white">Lihat tagihan</Link>
      </HeroWali>

      <section>
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-ink">Perlu dibayar</h2>
          {belum.length > 3 && <Link href={tautan("/wali/tagihan", aktif.id)} className="text-[13px] font-bold text-emerald">Semua</Link>}
        </div>
        {belum.length === 0 ? (
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-pale text-emerald"><IkonW n="centang" /></span>
            <span className="text-sm text-muted">Tidak ada tagihan yang menunggu. Alhamdulillah.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {belum.slice(0, 3).map((t) => {
              const s = statusTagihan(t, d.menunggu.has(t.id)); const g = GAYA[s];
              return (
                <Link key={t.id} href={tautan("/wali/tagihan", aktif.id, `buka=${t.id}`)} className="tekan flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 text-ink">
                  <span className="min-w-0 flex-1"><span className="block truncate text-[15px] font-bold text-ink">{t.judul}</span><span className="mt-0.5 block text-xs text-muted">Jatuh tempo {tanggalLengkap(t.jatuh_tempo)}</span></span>
                  <span className="text-right"><span className="block text-[15px] font-extrabold text-ink">{rp(t.sisa)}</span><span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-bold ${g.chip}`}>{g.label}</span></span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <Link href={tautan("/wali/rapor", aktif.id)} className="tekan flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 text-ink">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-pale text-emerald"><IkonW n="kwitansi" /></span>
        <span className="flex-1">
          <span className="block text-[15px] font-bold text-ink">Rapor & kehadiran</span>
          <span className="block text-xs text-muted">
            {raporDibuka ? "Nilai terbaru sudah dibuka pondok" : "Nilai dan absensi ananda"}
          </span>
        </span>
        {raporDibuka && (
          <span className="rounded-full bg-emerald-pale px-2.5 py-0.5 text-xs font-bold text-emerald">
            Baru
          </span>
        )}
        <IkonW n="kanan" className="h-4 w-4 text-muted" />
      </Link>

      {/* Kartu Tahfidz & Muroja'ah Ananda (Tampil otomatis jika ada data setoran/juz) */}
      {(d.tahfidzJuz.length > 0 || d.tahfidzSetoran.length > 0) && (
        <section className="rounded-2xl border border-line bg-surface p-4 text-ink">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-ink">Tahfidz & Muroja&apos;ah</h2>
            <span className="rounded-full bg-emerald-pale px-2.5 py-0.5 text-xs font-extrabold text-emerald">
              {d.tahfidzJuz.length} Juz Lulus
            </span>
          </div>

          {d.tahfidzJuz.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {d.tahfidzJuz.map((j) => (
                <span
                  key={j.juz}
                  className="rounded-lg border border-emerald/25 bg-emerald-pale/60 px-2.5 py-0.5 text-xs font-bold text-emerald"
                >
                  Juz {j.juz}
                </span>
              ))}
            </div>
          )}

          {d.tahfidzSetoran.length > 0 && (
            <div className="mt-3 divide-y divide-line/60 border-t border-line pt-2 text-xs">
              {d.tahfidzSetoran.map((s, idx) => (
                <div key={idx} className="py-2">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>{tanggalLengkap(s.tanggal)}</span>
                    <span className="font-bold uppercase text-emerald">{s.status}</span>
                  </div>
                  {s.tambah_hafalan && (
                    <div className="mt-0.5 font-semibold text-ink">
                      Tambah: <span className="font-normal">{s.tambah_hafalan}</span>
                    </div>
                  )}
                  {s.ulang_hafalan && (
                    <div className="mt-0.5 font-semibold text-ink">
                      Muroja&apos;ah: <span className="font-normal">{s.ulang_hafalan}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Kartu Status Perizinan Ananda (Tampil otomatis jika ada catatan izin keluar/pulang) */}
      {d.perizinan.length > 0 && (
        <section className="rounded-2xl border border-line bg-surface p-4 text-ink">
          <h2 className="text-base font-extrabold text-ink">Perizinan & Asrama</h2>
          <div className="mt-2 divide-y divide-line/60 text-xs">
            {d.perizinan.map((iz) => (
              <div key={iz.id} className="py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold capitalize text-ink">
                    Izin {iz.jenis}: {iz.alasan}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      iz.status === "keluar"
                        ? "bg-cicilan-bg text-cicilan"
                        : iz.status === "kembali_terlambat"
                        ? "bg-belum-bg text-belum"
                        : "bg-lunas-bg text-lunas"
                    }`}
                  >
                    {iz.status === "keluar"
                      ? "Sedang di Luar"
                      : iz.status === "kembali_terlambat"
                      ? "Kembali Terlambat"
                      : "Sudah Kembali"}
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-muted">
                  Batas kembali: {tanggalLengkap(iz.batas_kembali.slice(0, 10))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-line bg-surface p-4 text-ink">
        <h2 className="text-base font-extrabold text-ink">{aktif.nama}</h2>
        <dl className="mt-2.5 grid grid-cols-3 gap-3 text-sm">
          <div><dt className="text-xs text-muted">NIS</dt><dd className="font-semibold text-ink">{aktif.nis}</dd></div>
          <div><dt className="text-xs text-muted">Kamar</dt><dd className="font-semibold text-ink">{d.kamar ?? "-"}</dd></div>
          <div><dt className="text-xs text-muted">Kelas</dt><dd className="font-semibold text-ink">{d.kelas ?? "-"}</dd></div>
        </dl>
      </section>
    </div>
  );
}