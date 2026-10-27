import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { HeaderHalaman, Ikon, Kartu, Lencana, tombol, tombolSekunder, type NamaIkon, Kosong } from "@/components-ui";
import { RingkasanKeuangan } from "@/modules/keuangan/widget";
import { rupiah } from "@/lib/format";
import { waktuLengkap, hariIni } from "@/lib/waktu";

const MENU: { href: string; judul: string; ket: string; ikon: NamaIkon }[] = [
  {
    href: "/keuangan/tagihan",
    judul: "Tagihan Syahriyah",
    ket: "Terbitkan tagihan dan pantau tunggakan.",
    ikon: "tagihan",
  },
  {
    href: "/keuangan/pembayaran",
    judul: "Kasir Pembayaran",
    ket: "Catat pembayaran dan cetak kwitansi.",
    ikon: "kasir",
  },
  {
    href: "/keuangan/laporan",
    judul: "Laporan Arus Kas",
    ket: "Rekap penerimaan harian & ekspor Excel.",
    ikon: "laporan",
  },
  {
    href: "/keuangan/keringanan",
    judul: "Keringanan & Beasiswa",
    ket: "Tarif khusus yatim, beasiswa, atau potongan.",
    ikon: "keringanan",
  },
  {
    href: "/keuangan/pengaturan",
    judul: "Pengaturan Keuangan",
    ket: "Nominal standar syahriyah & rekening resmi.",
    ikon: "pengaturan",
  },
];

export default async function Keuangan() {
  const sb = await supabaseServer();
  const [
    { count: lewatTempo },
    { data: pengaturan },
    { data: transaksiTerbaru },
  ] = await Promise.all([
    sb
      .from("tagihan")
      .select("id", { count: "exact", head: true })
      .neq("status", "lunas")
      .lt("jatuh_tempo", hariIni()),
    sb.from("keuangan_pengaturan").select("syahriyah_default, rekening_resmi").maybeSingle(),
    sb
      .from("pembayaran")
      .select("id, nomor_kwitansi, santri_id, nominal, metode, tanggal, penerima_nama, dibatalkan_pada")
      .is("dibatalkan_pada", null)
      .order("tanggal", { ascending: false })
      .limit(6),
  ]);

  const ids = [...new Set((transaksiTerbaru ?? []).map((b) => b.santri_id as string))];
  const { data: namaSantri } = ids.length
    ? await sb.from("santri").select("id, nama, nis").in("id", ids)
    : { data: [] };
  const petaSantri = new Map((namaSantri ?? []).map((s) => [s.id as string, s]));

  return (
    <>
      <HeaderHalaman
        judul="Ringkasan Keuangan"
        aksi={
          <Link href="/keuangan/pembayaran" className={tombol}>
            <Ikon nama="kasir" className="h-3.5 w-3.5" />
            <span>Terima Pembayaran</span>
          </Link>
        }
      />

      {/* Baris KPI Keuangan: Tonjolkan Kas Masuk di Kartu Deep Forest */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <RingkasanKeuangan />

        <Kartu>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Lewat Jatuh Tempo</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-belum-bg text-belum">
              <Ikon nama="peringatan" className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-ink">{lewatTempo ?? 0}</div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted">
            <span>Tagihan perlu diingatkan</span>
            <Link href="/keuangan/tagihan?status=belum" className="font-semibold text-emerald hover:underline">
              Cek<Ikon nama="panah" className="ml-1 inline h-3.5 w-3.5 align-[-2px]" />
            </Link>
          </div>
        </Kartu>

        <Kartu varian="soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Syahriyah Standar</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-emerald">
              <Ikon nama="pengaturan" className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-ink">
            {rupiah(Number(pengaturan?.syahriyah_default ?? 0))}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted">
            <span className="truncate">{pengaturan?.rekening_resmi || "Rekening belum diatur"}</span>
            <Link href="/keuangan/pengaturan" className="shrink-0 font-semibold text-emerald hover:underline">
              Ubah
            </Link>
          </div>
        </Kartu>
      </div>

      {/* Konten 2 Kolom: Transaksi Terbaru & Menu Modul Keuangan */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_360px]">
        <Kartu className="!p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-ink">Penerimaan terbaru</h2>
              
            </div>
            <Link href="/keuangan/laporan" className="text-xs font-semibold text-emerald hover:underline">
              Laporan lengkap<Ikon nama="panah" className="ml-1 inline h-3.5 w-3.5 align-[-2px]" />
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-surface-soft/70 text-left text-xs font-medium text-muted">
              <tr>
                <th className="px-5 py-2.5">Kwitansi & Waktu</th>
                <th className="px-4 py-2.5">Santri</th>
                <th className="px-4 py-2.5">Metode</th>
                <th className="px-5 py-2.5 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(transaksiTerbaru ?? []).map((b) => {
                const s = petaSantri.get(b.santri_id);
                return (
                  <tr key={b.id} className="transition hover:bg-surface-soft/60">
                    <td className="px-5 py-3">
                      <Link
                        href={`/keuangan/kwitansi/${b.id}`}
                        className="font-mono text-xs font-semibold text-emerald hover:underline"
                      >
                        {b.nomor_kwitansi}
                      </Link>
                      <div className="text-[11px] text-muted">{waktuLengkap(b.tanggal)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink">{s?.nama ?? "-"}</div>
                      <div className="text-xs text-muted">Penerima: {b.penerima_nama}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Lencana varian="mint" titik={false}>
                        {String(b.metode).charAt(0).toUpperCase() + String(b.metode).slice(1)}
                      </Lencana>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-ink tabular-nums">
                      {rupiah(Number(b.nominal))}
                    </td>
                  </tr>
                );
              })}
              {(transaksiTerbaru ?? []).length === 0 && (
                <tr>
                  <td colSpan={4}><Kosong judul="Belum ada pembayaran" isi="Pembayaran yang dicatat akan tampil di sini." /></td>
                </tr>
              )}
            </tbody>
          </table>
        </Kartu>

        <div className="space-y-3">
          <div className="px-1 text-xs font-medium text-muted">
            Sub-Menu Keuangan
          </div>
          {MENU.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="group flex items-start gap-3.5 rounded-xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(24,38,34,0.03)] transition hover:border-emerald/40 hover:bg-emerald-pale/30"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-emerald transition group-hover:bg-emerald group-hover:text-white">
                <Ikon nama={m.ikon} className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-ink group-hover:text-emerald">
                  {m.judul}
                </div>
                <div className="mt-0.5 text-xs leading-relaxed text-muted">{m.ket}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

