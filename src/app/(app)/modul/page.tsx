import Link from "next/link";
import { konteks } from "@/lib/konteks";
import { daftarModul } from "@/lib/modul";
import { rupiah, tanggal } from "@/lib/format";
import { hariIni } from "@/lib/waktu";
import { BULAN_BAYAR_TAHUNAN, hargaCore, statusAkses, hitungDiskonModul } from "@/lib/harga";
import { ambilKesepakatanHarga } from "@/lib/harga-kesepakatan";
import { waLink } from "@/app/_lib/pricing";
import { BarProgres, HeaderHalaman, Ikon, Kartu, Lencana, tombol, tombolSekunder } from "@/components-ui";

const STATUS: Record<string, { label: string; varian: "lunas" | "cicilan" | "belum" | "netral" }> = {
  aktif: { label: "Aktif", varian: "lunas" },
  percobaan: { label: "Percobaan", varian: "cicilan" },
  tenggang: { label: "Masa tenggang", varian: "cicilan" },
  terkunci: { label: "Berakhir", varian: "belum" },
  berhenti: { label: "Berhenti", varian: "netral" },
};

export default async function Langganan() {
  const { sb, peran, pondokId } = await konteks();
  const [modul, { data: lg }, { count: aktifSantri }, { data: pondok }, { data: bayar }, kesepakatan] = await Promise.all([
    daftarModul(),
    sb.from("langganan").select("status, siklus, kuota_santri, berakhir").maybeSingle(),
    sb.from("santri").select("id", { count: "exact", head: true }).eq("status", "aktif"),
    sb.from("pondok").select("nama").maybeSingle(),
    // Riwayat hanya terbaca oleh admin pondok (aturan database).
    sb.from("pembayaran_langganan").select("id, tanggal, jumlah, bulan, berakhir_baru, catatan").order("created_at", { ascending: false }).limit(10),
    ambilKesepakatanHarga(pondokId),
  ]);

  const nama = pondok?.nama ?? "";
  const kuota = lg?.kuota_santri ?? 150;
  const santri = aktifSantri ?? 0;
  const akses = statusAkses(lg?.status ?? null, lg?.berakhir ?? null, new Date(), lg?.siklus ?? null);
  const st = STATUS[akses] ?? STATUS.berhenti;
  const sisa = lg?.berakhir
    ? Math.round((new Date(lg.berakhir).getTime() - new Date(hariIni()).getTime()) / 86_400_000)
    : null;
  const hargaAktif = modul.filter((m) => m.aktif).map((m) => m.harga_bulanan);
  const diskon = hitungDiskonModul(hargaAktif);
  const bulananStandar = hargaCore(kuota) + diskon.totalSetelahDiskon;
  const bulananEfektif = kesepakatan.harga_khusus ?? bulananStandar;
  const tahunanEfektif = bulananEfektif * BULAN_BAYAR_TAHUNAN;
  const hubungi = (pesan: string) => waLink(`Halo TSIQA, ${pesan} (${nama})`);

  return (
    <>
      <HeaderHalaman
        judul="Langganan & Dokumen Resmi"
        deskripsi="Kelola modul aktif, unduh Surat Penawaran / Invoice untuk musyawarah yayasan, serta cetak Kwitansi Lunas."
        aksi={
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/dokumen/langganan/${pondokId}/invoice`} className={tombolSekunder}>
              <Ikon.Kuitansi className="h-4 w-4" />
              <span>Surat Penawaran & Invoice</span>
            </Link>
            <Link href={`/dokumen/langganan/${pondokId}/sla`} className={tombolSekunder}>
              <Ikon.Kunci className="h-4 w-4" />
              <span>Piagam SLA</span>
            </Link>
            <a href={hubungi("saya ingin memperpanjang langganan.")} target="_blank" rel="noopener" className={tombol}>
              <Ikon nama="wa" className="h-4 w-4" />
              <span>Perpanjang</span>
            </a>
          </div>
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Kartu>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Status Layanan</span>
            <Lencana varian={st.varian}>{st.label}</Lencana>
          </div>
          <div className="mt-3 text-lg font-bold tracking-tight text-ink">
            {lg?.berakhir ? `s.d. ${tanggal(lg.berakhir)}` : "-"}
          </div>
          <div className="mt-1 text-xs text-muted">
            {sisa === null ? "" : sisa > 0 ? `${sisa} hari lagi` : sisa === 0 ? "Berakhir hari ini" : "Sudah lewat"}
            {lg?.siklus && lg.siklus !== "percobaan" ? ` · siklus ${lg.siklus}` : ""}
          </div>
        </Kartu>

        <Kartu>
          <span className="text-xs font-medium text-muted">Kuota santri aktif</span>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-lg font-bold tracking-tight text-ink">{santri}</span>
            <span className="text-sm text-muted">/ {kuota}</span>
          </div>
          <div className="mt-2"><BarProgres nilai={santri} maks={kuota} /></div>
          <a href={hubungi("saya ingin menambah kuota santri.")} target="_blank" rel="noopener" className="mt-2 inline-block text-xs font-medium text-emerald hover:underline">
            Tambah kuota<Ikon nama="panah" className="ml-1 inline h-3.5 w-3.5 align-[-2px]" />
          </a>
        </Kartu>

        <Kartu>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Biaya langganan</span>
            {kesepakatan.harga_khusus !== null && (
              <Lencana varian="lunas">Harga Kesepakatan</Lencana>
            )}
          </div>
          <div className="mt-3 text-lg font-bold tracking-tight text-ink">
            {rupiah(bulananEfektif)} <span className="text-sm font-normal text-muted">/ bulan</span>
          </div>
          <div className="mt-1 text-xs text-muted">
            Tahunan ({BULAN_BAYAR_TAHUNAN} bln, gratis 1 bln): <strong className="text-emerald">{rupiah(tahunanEfektif)}/thn</strong>
          </div>
          {kesepakatan.catatan_harga ? (
            <div className="mt-1 text-[11px] font-medium text-emerald">
              {kesepakatan.catatan_harga}
            </div>
          ) : (
            <div className="mt-1 text-[11px] text-muted">
              Core + {hargaAktif.length} modul{diskon.persenDiskon > 0 ? ` (diskon ${Math.round(diskon.persenDiskon * 100)}%)` : ""}
            </div>
          )}
        </Kartu>
      </div>

      <h2 className="mb-3 text-sm font-semibold text-ink">Modul</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modul.map((m) => (
          <Kartu key={m.kode} varian={m.aktif ? "mint" : "putih"} className="flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-emerald">{m.kategori}</span>
                {m.aktif ? (
                  <Lencana varian="lunas">Aktif</Lencana>
                ) : !m.tersedia ? (
                  <Lencana varian="netral" titik={false}>Menyusul</Lencana>
                ) : null}
              </div>
              <h3 className="mt-2 text-base font-bold text-ink">{m.nama}</h3>
            </div>
            <div className="flex items-center justify-between border-t border-line/70 pt-3">
              <div>
                <span className="text-sm font-bold text-ink">{rupiah(m.harga_bulanan)}</span>
                <span className="text-xs text-muted"> / bulan</span>
              </div>
              {!m.aktif && m.tersedia && (
                <a href={hubungi(`saya ingin mengaktifkan modul ${m.nama}.`)} target="_blank" rel="noopener" className={tombolSekunder}>
                  Aktifkan
                </a>
              )}
            </div>
          </Kartu>
        ))}
      </div>

      {peran === "admin" && (bayar ?? []).length > 0 && (
        <>
          <h2 className="mb-3 mt-8 text-sm font-semibold text-ink">Riwayat pembayaran & kwitansi</h2>
          <Kartu className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-line bg-surface-soft/70 text-left text-xs font-medium text-muted">
                  <tr>
                    <th className="px-5 py-3">Tanggal</th>
                    <th className="px-4 py-3">Periode</th>
                    <th className="px-4 py-3">Berlaku s.d.</th>
                    <th className="px-4 py-3 text-right">Jumlah</th>
                    <th className="px-5 py-3 text-right">Bukti Resmi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {(bayar ?? []).map((b) => (
                    <tr key={b.id}>
                      <td className="px-5 py-3">{tanggal(b.tanggal)}</td>
                      <td className="px-4 py-3 text-muted">
                        {b.bulan} bulan{b.catatan ? ` · ${b.catatan}` : ""}
                      </td>
                      <td className="px-4 py-3 text-muted">{tanggal(b.berakhir_baru)}</td>
                      <td className="px-4 py-3 text-right font-mono font-medium text-ink">{rupiah(Number(b.jumlah))}</td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/dokumen/langganan/${pondokId}/kwitansi/${b.id}`}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-surface-soft px-3 text-xs font-semibold text-ink no-underline transition hover:border-emerald hover:text-emerald"
                        >
                          <Ikon.Kuitansi className="h-3.5 w-3.5" />
                          <span>Cetak Kwitansi</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Kartu>
        </>
      )}
    </>
  );
}

