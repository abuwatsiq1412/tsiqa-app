import { notFound } from "next/navigation";
import Link from "next/link";
import { wajibStaf } from "@/lib/staf";
import { rupiah, tanggal } from "@/lib/format";
import { hargaCore, hitungDiskonModul, BULAN_BAYAR_TAHUNAN, statusAkses } from "@/lib/harga";
import {
  Kartu,
  Label,
  input,
  tombol,
  tombolSekunder,
  HeaderHalaman,
  Lencana,
  PesanNotifikasi,
  AvatarInisial,
  Ikon,
} from "@/components-ui";
import {
  ubahLangganan,
  aturModul,
  perpanjang,
  setujuiPondok,
  resetSandiPengurus,
  simpanHargaKhusus,
} from "./actions";
import { ambilKesepakatanHarga } from "@/lib/harga-kesepakatan";

const PETA_STATUS: Record<string, { label: string; varian: "lunas" | "cicilan" | "belum" | "netral" }> = {
  menunggu: { label: "Menunggu Verifikasi", varian: "cicilan" },
  aktif: { label: "Aktif", varian: "lunas" },
  percobaan: { label: "Percobaan", varian: "cicilan" },
  tenggang: { label: "Masa Tenggang", varian: "cicilan" },
  terkunci: { label: "Terkunci", varian: "belum" },
  berhenti: { label: "Berhenti", varian: "netral" },
};

export default async function DetailPondok({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ galat?: string; ok?: string }>;
}) {
  const { id } = await params;
  const { galat, ok } = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const sb = await wajibStaf();

  const [
    { data: p },
    { data: l },
    { data: katalog },
    { data: aktif },
    { data: anggota },
    { data: bayar },
    { data: ringkas },
    kesepakatan,
  ] = await Promise.all([
    sb.from("pondok").select("*").eq("id", id).maybeSingle(),
    sb.from("langganan").select("*").eq("pondok_id", id).maybeSingle(),
    sb.from("modul").select("*").order("urutan"),
    sb.from("addon_pondok").select("kode, aktif").eq("pondok_id", id),
    sb.from("anggota_pondok").select("user_id, nama, peran, aktif").eq("pondok_id", id).order("created_at"),
    sb.from("pembayaran_langganan").select("*").eq("pondok_id", id).order("created_at", { ascending: false }).limit(10),
    sb.rpc("konsol_ringkasan"),
    ambilKesepakatanHarga(id),
  ]);

  if (!p) notFound();
  const modulSiap = new Set(["keuangan", "akademik", "portal_guru", "portal_wali", "perizinan", "tahfidz", "website"]);
  const daftarKatalog = (katalog ?? []).map((m) =>
    modulSiap.has(m.kode) ? { ...m, tersedia: true } : m
  );
  if (!daftarKatalog.some((m) => m.kode === "website")) {
    daftarKatalog.push({
      kode: "website",
      nama: "Website Pondok (CMS)",
      kategori: "Publikasi",
      harga_bulanan: 25000,
      tersedia: true,
      urutan: 11,
    });
  }
  const r = (ringkas ?? []).find((x: { pondok_id: string }) => x.pondok_id === id);
  const hidup = new Set((aktif ?? []).filter((a) => a.aktif).map((a) => a.kode));
  const akses = statusAkses(l?.status ?? null, l?.berakhir ?? null, new Date(), l?.siklus ?? null);
  const diskonModul = hitungDiskonModul(
    daftarKatalog.filter((m) => hidup.has(m.kode)).map((m) => Number(m.harga_bulanan)),
  );
  const totalModul = diskonModul.totalSetelahDiskon;
  const bulananStandar = l ? hargaCore(l.kuota_santri) + totalModul : 0;
  const bulanan = kesepakatan.harga_khusus ?? bulananStandar;
  const tahunan = bulanan * BULAN_BAYAR_TAHUNAN;
  const confAkses = PETA_STATUS[akses] ?? { label: akses, varian: "netral" };

  const noWaPondok = p.telepon ? String(p.telepon).replace(/[^0-9]/g, "") : "";
  const tautanWaPengurus = noWaPondok
    ? `https://wa.me/${noWaPondok}?text=${encodeURIComponent(
        `Assalamu’alaikum Pengurus ${p.nama}, kami dari tim TSIQA ingin mengonfirmasi pendaftaran dan layanan sistem pondok Anda.`
      )}`
    : null;

  return (
    <div className="space-y-6">
      <HeaderHalaman
        judul={
          <div className="flex flex-wrap items-center gap-3">
            <span>{p.nama}</span>
            <Lencana varian={confAkses.varian}>{confAkses.label}</Lencana>
            {kesepakatan.harga_khusus !== null && (
              <Lencana varian="lunas">Harga Khusus: {rupiah(bulanan)}/bln</Lencana>
            )}
          </div>
        }
        deskripsi={`${p.kode}${p.nama_pimpinan ? ` · Pimpinan: ${p.nama_pimpinan}` : ""}${p.kota ? ` · ${p.kota}` : ""}${p.telepon ? ` · WA +${p.telepon}` : ""} · sejak ${tanggal(p.created_at)}`}
        aksi={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/dokumen/langganan/${id}/invoice`}
              className={tombolSekunder}
            >
              <Ikon.Kuitansi className="h-4 w-4" />
              Surat Penawaran & Invoice
            </Link>
            <Link
              href={`/dokumen/langganan/${id}/sla`}
              className={tombolSekunder}
            >
              <Ikon.Kunci className="h-4 w-4" />
              Piagam SLA
            </Link>
            {tautanWaPengurus && (
              <a
                href={tautanWaPengurus}
                target="_blank"
                rel="noopener noreferrer"
                className={tombolSekunder}
              >
                Hubungi WA Pengurus
              </a>
            )}
            <Link href="/konsol" className={tombolSekunder}>
              <Ikon.PanahKiri className="h-4 w-4" />
              Semua pondok
            </Link>
          </div>
        }
      />

      {ok && <PesanNotifikasi tipe="sukses" pesan={ok} />}
      {galat && <PesanNotifikasi tipe="error" pesan={galat} />}

      {/* Banner Persetujuan Cepat bila Pondok Baru Menunggu Verifikasi */}
      {akses === "menunggu" && (
        <Kartu className="border-amber-300 bg-amber-50/70">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Lencana varian="cicilan">Pendaftaran Baru</Lencana>
                <h2 className="text-sm font-bold text-ink">
                  Menunggu Verifikasi & Aktivasi Admin TSIQA
                </h2>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Pengurus pondok ini telah mendaftar dan saat ini tertahan di layar tunggu verifikasi. Klik tombol di kanan untuk menyetujui dan membuka akses masa percobaan 14 hari.
              </p>
            </div>
            <form action={setujuiPondok} className="flex shrink-0 items-center gap-2">
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="hari" value="14" />
              <button className={tombol}>
                <Ikon.Centang className="h-4 w-4" />
                Setujui & Aktifkan (14 Hari)
              </button>
            </form>
          </div>
        </Kartu>
      )}

      <div className="flex items-center gap-3 rounded-xl border border-emerald/25 bg-emerald-pale/40 px-4 py-3 text-xs text-ink">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald text-on-brand">
          <Ikon.Kunci className="h-4 w-4" />
        </span>
        <div>
          <strong className="font-semibold">Privasi & Kedaulatan Data Pondok Terkunci (RLS Aktif):</strong>{" "}
          <span className="text-muted">
            Konsol TSIQA hanya mengelola lisensi, kuota, dan sakelar modul. Data internal santri, buku kas keuangan, dan nilai akademik diisolasi penuh milik pondok.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Atur Status & Kuota + Harga Kesepakatan Khusus */}
        <Kartu>
          <div className="flex items-center gap-2 border-b border-line pb-3 mb-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-pale text-emerald">
              <Ikon.Koin className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-ink">Konfigurasi Langganan & Tarif</h2>
              <p className="text-xs text-muted">
                Tarif efektif:{" "}
                <strong className="text-ink">{rupiah(bulanan)}</strong> / bln ·{" "}
                <strong className="text-emerald">{rupiah(tahunan)}</strong> / thn ({BULAN_BAYAR_TAHUNAN} bln)
                {kesepakatan.harga_khusus !== null && (
                  <span className="ml-1 text-muted">
                    (tarif standar {rupiah(bulananStandar)}/bln)
                  </span>
                )}
              </p>
            </div>
          </div>

          {l && (
            <form action={ubahLangganan} className="space-y-4">
              <input type="hidden" name="id" value={id} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label>Status Langganan</Label>
                  <select
                    name="status"
                    defaultValue={akses === "menunggu" ? "menunggu" : l.status}
                    className={input}
                  >
                    <option value="menunggu">Menunggu Verifikasi</option>
                    <option value="percobaan">Percobaan</option>
                    <option value="aktif">Aktif</option>
                    <option value="berhenti">Berhenti</option>
                  </select>
                </div>
                <div>
                  <Label>Siklus Penagihan</Label>
                  <select name="siklus" defaultValue={l.siklus} className={input}>
                    <option value="bulanan">Bulanan</option>
                    <option value="tahunan">Tahunan (Bayar {BULAN_BAYAR_TAHUNAN} Bln)</option>
                    <option value="percobaan">Percobaan</option>
                  </select>
                </div>
                <div>
                  <Label>Kuota Santri Aktif</Label>
                  <input
                    name="kuota_santri"
                    type="number"
                    min={1}
                    step={50}
                    defaultValue={l.kuota_santri}
                    className={input}
                  />
                </div>
                <div>
                  <Label>Tanggal Berakhir Lisensi</Label>
                  <input
                    name="berakhir"
                    type="date"
                    defaultValue={l.berakhir}
                    className={input}
                  />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button className={tombol}>
                  <Ikon.Centang className="h-4 w-4" />
                  Simpan Konfigurasi
                </button>
              </div>
            </form>
          )}

          {/* Form Harga Kesepakatan Khusus (Custom Deal) */}
          <div className="mt-5 border-t border-line pt-4">
            <div className="mb-2.5 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                  Harga Kesepakatan Khusus (Opsional)
                </h3>
                <p className="text-[11px] text-muted">
                  Tetapkan harga khusus hasil musyawarah/beasiswa pondok. Otomatis tampil di Surat Penawaran & Invoice. Kosongkan untuk kembali ke tarif standar ({rupiah(bulananStandar)}/bln).
                </p>
              </div>
            </div>
            <form action={simpanHargaKhusus} className="space-y-3">
              <input type="hidden" name="id" value={id} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label>Nominal Bulanan Disepakati (Rp)</Label>
                  <input
                    name="harga_khusus"
                    type="number"
                    min={0}
                    step={1000}
                    defaultValue={kesepakatan.harga_khusus ?? ""}
                    placeholder={`Standar: ${bulananStandar}`}
                    className={input}
                  />
                </div>
                <div>
                  <Label>Catatan Kesepakatan / Diskon</Label>
                  <input
                    name="catatan_harga"
                    defaultValue={kesepakatan.catatan_harga ?? ""}
                    placeholder="Mis. Kemitraan Perintis / Pondok Wakaf"
                    className={input}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button className={tombolSekunder}>
                  Simpan Harga Kesepakatan
                </button>
              </div>
            </form>
          </div>
        </Kartu>

        {/* Catat Pembayaran & Perpanjangan */}
        <Kartu>
          <div className="flex items-center gap-2 border-b border-line pb-3 mb-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-pale text-emerald">
              <Ikon.Kuitansi className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-ink">Catat Pembayaran & Terbitkan Kwitansi</h2>
              <p className="text-xs text-muted">
                1 bln = <strong className="text-ink">{rupiah(bulanan)}</strong> · 12 bln (tahunan bayar {BULAN_BAYAR_TAHUNAN} bln) = <strong className="text-emerald">{rupiah(tahunan)}</strong>
              </p>
            </div>
          </div>

          <form action={perpanjang} className="space-y-3">
            <input type="hidden" name="id" value={id} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label>Durasi Tambahan (Bulan)</Label>
                <input
                  name="bulan"
                  type="number"
                  min={1}
                  max={36}
                  defaultValue={l?.siklus === "tahunan" ? 12 : 1}
                  className={input}
                />
              </div>
              <div>
                <Label>Nominal Dibayar (Rp)</Label>
                <input
                  name="jumlah"
                  type="number"
                  min={0}
                  defaultValue={l?.siklus === "tahunan" ? tahunan : bulanan}
                  className={input}
                />
              </div>
              <div>
                <Label>Siklus</Label>
                <select
                  name="siklus"
                  defaultValue={l?.siklus === "percobaan" ? "bulanan" : l?.siklus}
                  className={input}
                >
                  <option value="bulanan">Bulanan (1 Bulan)</option>
                  <option value="tahunan">Tahunan (12 Bulan · Bayar {BULAN_BAYAR_TAHUNAN} Bln)</option>
                </select>
              </div>
              <div>
                <Label>Keterangan / Ref Transfer</Label>
                <input
                  name="catatan"
                  placeholder="Contoh: Transfer BSI an. Yayasan Pondok"
                  className={input}
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button className={tombol}>
                <Ikon.Centang className="h-4 w-4" />
                Catat Pembayaran & Perpanjang
              </button>
            </div>
          </form>

          {(bayar ?? []).length > 0 && (
            <div className="mt-4 border-t border-line pt-3">
              <div className="text-xs font-semibold text-ink mb-2">
                Riwayat Pembayaran & Kwitansi Resmi
              </div>
              <ul className="divide-y divide-line/60 text-xs">
                {(bayar ?? []).map((b) => (
                  <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                    <div>
                      <span className="font-medium text-ink">{tanggal(b.tanggal)}</span>
                      <span className="text-muted"> · {b.bulan} bln {b.catatan ? `(${b.catatan})` : ""}</span>
                      <span className="text-muted text-[11px] block">Aktif s/d {tanggal(b.berakhir_baru)}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-semibold text-emerald">{rupiah(Number(b.jumlah))}</span>
                      <Link
                        href={`/dokumen/langganan/${id}/kwitansi/${b.id}`}
                        className="inline-flex h-7 items-center gap-1 rounded-md border border-line bg-surface-soft px-2.5 text-[11px] font-semibold text-ink no-underline transition hover:border-emerald hover:text-emerald"
                      >
                        <Ikon.Kuitansi className="h-3 w-3" />
                        Kwitansi
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Kartu>

        {/* Modul Add-on Pondok */}
        <Kartu className="lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-line pb-3 mb-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-pale text-emerald">
              <Ikon.Modul className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-ink">Katalog Modul Aktif</h2>
              <p className="text-xs text-muted">
                Aktifkan atau nonaktifkan modul add-on khusus untuk pondok ini.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {daftarKatalog.map((m) => {
              const isAktif = hidup.has(m.kode);
              return (
                <div
                  key={m.kode}
                  className={`flex items-center justify-between rounded-xl border p-4 transition-colors ${
                    isAktif ? "border-emerald/30 bg-emerald-pale/25" : "border-line bg-surface-soft/40"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ink text-sm">{m.nama}</span>
                      {isAktif && <Lencana varian="lunas">Aktif</Lencana>}
                    </div>
                    <div className="text-xs text-muted mt-0.5">
                      {rupiah(Number(m.harga_bulanan))} / bulan {!m.tersedia && " · Belum tersedia publik"}
                    </div>
                  </div>
                  <form action={aturModul}>
                    <input type="hidden" name="id" value={id} />
                    <input type="hidden" name="kode" value={m.kode} />
                    <input type="hidden" name="aktif" value={isAktif ? "0" : "1"} />
                    <button
                      disabled={!m.tersedia && !isAktif}
                      className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        isAktif
                          ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                          : "bg-emerald text-white hover:bg-emerald-hover shadow-[0_1px_2px_rgba(15,118,110,0.2)]"
                      } disabled:opacity-40`}
                    >
                      {isAktif ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        </Kartu>

        {/* Pengguna Pondok & Reset Sandi */}
        <Kartu className="lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-line pb-3 mb-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-pale text-emerald">
              <Ikon.Pengguna className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-ink">Staf & Pengguna Pesantren (Bantuan Reset Sandi)</h2>
              <p className="text-xs text-muted">
                Daftar pengurus pondok ini. Bila pengurus lupa sandi, Anda dapat mengatur ulang kata sandinya langsung di sini tanpa perlu email verifikasi.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-soft/60 text-xs font-medium text-muted">
                <tr>
                  <th className="px-4 py-2.5">Nama Staf</th>
                  <th className="px-4 py-2.5">Peran</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Atur Ulang Kata Sandi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {(anggota ?? []).map((a, i) => (
                  <tr key={i} className="hover:bg-emerald-pale/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <AvatarInisial nama={a.nama} ukuran="sm" />
                        <span className="font-medium text-ink">{a.nama}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-muted">{a.peran}</td>
                    <td className="px-4 py-3">
                      <Lencana varian={a.aktif ? "lunas" : "netral"}>
                        {a.aktif ? "Aktif" : "Nonaktif"}
                      </Lencana>
                    </td>
                    <td className="px-4 py-3">
                      <form action={resetSandiPengurus} className="flex items-center justify-end gap-2">
                        <input type="hidden" name="id" value={id} />
                        <input type="hidden" name="user_id" value={String(a.user_id)} />
                        <input
                          name="sandi_baru"
                          type="text"
                          minLength={8}
                          required
                          placeholder="Sandi baru (min. 8)"
                          className="h-8 w-40 rounded-lg border border-line bg-surface px-2.5 text-xs text-ink outline-none focus:border-emerald"
                        />
                        <button className="h-8 cursor-pointer rounded-lg bg-surface-soft px-3 text-xs font-semibold text-ink hover:bg-emerald hover:text-white transition">
                          Reset Sandi
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
                {(anggota ?? []).length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-xs text-muted">
                      Belum ada staf terdaftar pada tenant ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Kartu>
      </div>
    </div>
  );
}
