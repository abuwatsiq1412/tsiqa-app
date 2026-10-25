import { notFound } from "next/navigation";
import Link from "next/link";
import { konteks } from "@/lib/konteks";
import { BarProgres, HeaderHalaman, Ikon, Kartu, Label, Lencana, PesanNotifikasi, input, tombol, tombolSekunder, Kosong } from "@/components-ui";
import { rupiah, tanggal } from "@/lib/format";
import { waktuLengkap } from "@/lib/waktu";
import { catatBayar, batalkanBayar } from "../../actions";

export default async function DetailTagihan({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ galat?: string; ok?: string }>;
}) {
  const { id } = await params;
  const { galat, ok } = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { sb, peran } = await konteks();
  const { data: t } = await sb.from("tagihan").select("*").eq("id", id).maybeSingle();
  if (!t) notFound();
  const [{ data: s }, { data: bayar }] = await Promise.all([
    sb.from("santri").select("nama, nis, nama_wali, no_wa_wali").eq("id", t.santri_id).maybeSingle(),
    sb.from("pembayaran").select("*").eq("tagihan_id", id).order("tanggal"),
  ]);
  const boleh = peran === "admin" || peran === "bendahara";
  const balik = `/keuangan/tagihan/${id}`;
  const nominal = Number(t.nominal);
  const terbayar = Number(t.terbayar);
  const sisa = Number(t.sisa);

  return (
    <>
      <HeaderHalaman
        kategori={`Rincian Tagihan · ${t.kode}`}
        judul={t.judul}
        deskripsi={`${s?.nama ?? "Santri"} · NIS ${s?.nis ?? "-"} · Wali: ${s?.nama_wali ?? "-"}`}
        aksi={
          <>
            {t.status !== "lunas" && (
              <a
                href={`/keuangan/tagihan/${id}/wa`}
                target="_blank"
                rel="noreferrer"
                className={tombolSekunder}
              >
                <Ikon nama="wa" className="h-4 w-4 text-emerald" />
                <span>Kirim Pengingat WA</span>
              </a>
            )}
            <Link href="/keuangan/tagihan" className={tombolSekunder}>
              <Ikon nama="panah-kiri" className="mr-1 inline h-3.5 w-3.5 align-[-2px]" />Semua Tagihan
            </Link>
          </>
        }
      />

      <PesanNotifikasi ok={ok} galat={galat} />

      <div className="grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2">
        <Kartu className="space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <div className="text-xs text-muted">Sisa Tagihan Saat Ini</div>
              <div className="mt-0.5 text-2xl font-bold text-ink">{rupiah(sisa)}</div>
            </div>
            <Lencana
              varian={
                t.status === "lunas" ? "lunas" : t.status === "cicilan" ? "cicilan" : "belum"
              }
            >
              {t.status === "lunas" ? "Lunas" : t.status === "cicilan" ? "Cicilan" : "Belum Bayar"}
            </Lencana>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted">
              <span>Progres Pelunasan</span>
              <span className="font-semibold text-ink">
                {rupiah(terbayar)} dari {rupiah(nominal)}
              </span>
            </div>
            <BarProgres nilai={terbayar} maks={nominal || 1} />
          </div>

          <dl className="divide-y divide-line/70 text-sm">
            <div className="flex justify-between py-2">
              <dt className="text-muted">Nomor Tagihan</dt>
              <dd className="font-mono text-xs font-semibold text-ink">{t.kode}</dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-muted">Jatuh Tempo</dt>
              <dd className="font-medium text-ink">{tanggal(t.jatuh_tempo)}</dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-muted">Wali Santri</dt>
              <dd className="font-medium text-ink">
                {s?.nama_wali} <span className="text-xs text-muted">(+{s?.no_wa_wali})</span>
              </dd>
            </div>
            {t.wa_terakhir && (
              <div className="flex justify-between py-2">
                <dt className="text-muted">Pengingat WA Terakhir</dt>
                <dd className="text-xs text-muted">{waktuLengkap(t.wa_terakhir)}</dd>
              </div>
            )}
          </dl>
        </Kartu>

        {t.status !== "lunas" ? (
          <Kartu>
            <h2 className="mb-1 text-base font-semibold text-ink">Catat Pembayaran</h2>
            <p className="mb-4 text-xs text-muted">
              Bisa dibayar penuh maupun dicicil sebagian. Kwitansi otomatis terbit setelah disimpan.
            </p>
            <form action={catatBayar} className="space-y-4">
              <input type="hidden" name="tagihan" value={id} />
              <input type="hidden" name="balik" value={balik} />
              <label className="block">
                <Label>Nominal Diterima (Rp)</Label>
                <input
                  name="nominal"
                  type="number"
                  min={1}
                  max={sisa}
                  defaultValue={sisa}
                  required
                  className={input}
                />
              </label>
              <label className="block">
                <Label>Metode Pembayaran</Label>
                <select name="metode" className={input}>
                  <option value="tunai">Tunai di Kantor Pondok</option>
                  <option value="transfer">Transfer Bank</option>
                  <option value="qris">QRIS</option>
                </select>
              </label>
              <button className={`${tombol} w-full`}>
                <Ikon nama="kasir" className="h-4 w-4" />
                <span>Simpan & Cetak Kwitansi</span>
              </button>
            </form>
          </Kartu>
        ) : (
          <Kartu varian="mint" className="flex flex-col items-center justify-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald text-white">
              <Ikon nama="cek" className="h-6 w-6" />
            </span>
            <h2 className="mt-3 text-base font-bold text-ink">Tagihan Ini Sudah Lunas</h2>
            <p className="mt-1 text-xs text-muted">
              Seluruh kewajiban pembayaran pada tagihan ini telah terpenuhi. Terima kasih.
            </p>
          </Kartu>
        )}

        <Kartu className=" lg:col-span-2 !p-0 overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-sm font-semibold text-ink">Riwayat Pembayaran Tagihan Ini</h2>
            <p className="text-xs text-muted">Klik nomor kwitansi untuk melihat atau mencetak ulang bukti pembayaran</p>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-surface-soft/70 text-left text-xs font-medium text-muted">
              <tr>
                <th className="px-5 py-3">No. Kwitansi</th>
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3">Metode</th>
                <th className="px-4 py-3">Penerima</th>
                <th className="px-4 py-3 text-right">Nominal</th>
                <th className="px-5 py-3 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(bayar ?? []).map((b) => (
                <tr
                  key={b.id}
                  className={
                    b.dibatalkan_pada
                      ? "bg-surface-soft/40 text-muted line-through"
                      : "transition hover:bg-surface-soft/60"
                  }
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/keuangan/kwitansi/${b.id}`}
                      className="font-mono text-xs font-semibold text-emerald no-underline hover:underline"
                    >
                      {b.nomor_kwitansi}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{waktuLengkap(b.tanggal)}</td>
                  <td className="px-4 py-3 capitalize">{b.metode}</td>
                  <td className="px-4 py-3">{b.penerima_nama}</td>
                  <td className="px-4 py-3 text-right font-semibold">{rupiah(Number(b.nominal))}</td>
                  <td className="px-5 py-3 text-right no-underline">
                    {boleh && !b.dibatalkan_pada && (
                      <form action={batalkanBayar} className="flex justify-end gap-2">
                        <input type="hidden" name="id" value={b.id} />
                        <input type="hidden" name="balik" value={balik} />
                        <input
                          name="alasan"
                          placeholder="Alasan batal..."
                          required
                          className="w-36 rounded-lg border border-line bg-white px-2.5 py-1 text-xs outline-none focus:border-belum"
                        />
                        <button className="rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-muted transition hover:border-belum hover:text-belum cursor-pointer">
                          Batalkan
                        </button>
                      </form>
                    )}
                    {b.dibatalkan_pada && (
                      <span className="text-xs text-belum">Dibatalkan: {b.alasan_batal}</span>
                    )}
                  </td>
                </tr>
              ))}
              {(bayar ?? []).length === 0 && (
                <tr>
                  <td colSpan={6}><Kosong judul="Belum ada pembayaran" isi="Tagihan ini belum dibayar sama sekali." /></td>
                </tr>
              )}
            </tbody>
          </table>
        </Kartu>
      </div>
    </>
  );
}

