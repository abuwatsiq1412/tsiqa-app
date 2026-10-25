import { TombolKirim } from "@/components-form";
import Link from "next/link";
import { konteks } from "@/lib/konteks";
import { HeaderHalaman, Ikon, Kartu, Label, Lencana, PesanNotifikasi, input, tombol, tombolSekunder, Kosong } from "@/components-ui";
import { rupiah, tanggal } from "@/lib/format";
import { NAMA_BULAN, hariIni } from "@/lib/waktu";
import { terbitkanTagihan } from "../actions";

const MAP_STATUS: Record<string, { label: string; varian: "belum" | "cicilan" | "lunas" }> = {
  belum_bayar: { label: "Belum bayar", varian: "belum" },
  cicilan: { label: "Cicilan", varian: "cicilan" },
  lunas: { label: "Lunas", varian: "lunas" },
};

export default async function Tagihan({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    bulan?: string;
    tahun?: string;
    galat?: string;
    ok?: string;
  }>;
}) {
  const { q, status = "belum", bulan, tahun, galat, ok } = await searchParams;
  const { sb, peran } = await konteks();
  const hari = hariIni();
  const [thn, bln] = hari.split("-").map(Number);

  let kueri = sb
    .from("tagihan")
    .select("id, santri_id, kode, judul, nominal, terbayar, sisa, jatuh_tempo, status", {
      count: "exact",
    })
    .order("jatuh_tempo", { ascending: false })
    .order("kode")
    .limit(200);
  if (status === "belum") kueri = kueri.in("status", ["belum_bayar", "cicilan"]);
  else if (["belum_bayar", "cicilan", "lunas"].includes(status)) kueri = kueri.eq("status", status);
  if (/^\d{1,2}$/.test(bulan ?? "")) kueri = kueri.eq("periode_bulan", Number(bulan));
  if (/^\d{4}$/.test(tahun ?? "")) kueri = kueri.eq("periode_tahun", Number(tahun));
  if (q) {
    const { data: cocok } = await sb
      .from("santri")
      .select("id")
      .ilike("nama", `%${q.replace(/[%_,()]/g, "")}%`)
      .limit(200);
    kueri = kueri.in(
      "santri_id",
      (cocok ?? []).map((s) => s.id).concat(["00000000-0000-0000-0000-000000000000"])
    );
  }
  const [{ data, count }, { count: aktif }, { data: peng }] = await Promise.all([
    kueri,
    sb.from("santri").select("id", { count: "exact", head: true }).eq("status", "aktif"),
    sb.from("keuangan_pengaturan").select("syahriyah_default").maybeSingle(),
  ]);
  const ids = [...new Set((data ?? []).map((t) => t.santri_id as string))];
  const { data: nama } = ids.length
    ? await sb.from("santri").select("id, nama, nis").in("id", ids)
    : { data: [] };
  const peta = new Map((nama ?? []).map((s) => [s.id as string, s]));
  const totalSisa = (data ?? []).reduce((a, t) => a + Number(t.sisa), 0);
  const totalNominal = (data ?? []).reduce((a, t) => a + Number(t.nominal), 0);
  const boleh = peran === "admin" || peran === "bendahara";

  return (
    <>
      <HeaderHalaman
        judul="Tagihan"
        aksi={
          <Link href="/keuangan/pembayaran" className={tombolSekunder}>
            <Ikon nama="kasir" className="h-3.5 w-3.5" />
            <span>Buka Kasir</span>
          </Link>
        }
      />

      <PesanNotifikasi ok={ok} galat={galat} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_330px]">
        <div>
          <div role="tablist" className="mb-3 flex flex-wrap gap-2">
            {([["belum", "Belum lunas"], ["belum_bayar", "Belum bayar"], ["cicilan", "Cicilan"], ["lunas", "Lunas"], ["semua", "Semua"]] as const).map(([k, l]) => {
              const u = new URLSearchParams();
              if (q) u.set("q", q);
              u.set("status", k);
              if (bulan) u.set("bulan", bulan);
              if (tahun) u.set("tahun", tahun);
              return (
                <Link key={k} role="tab" aria-selected={status === k} href={`/keuangan/tagihan?${u}`}
                  className={`inline-flex h-9 items-center rounded-full px-4 text-[13px] font-semibold transition ${status === k ? "bg-forest text-white shadow-sm" : "border border-line bg-white text-muted hover:text-ink"}`}>{l}</Link>
              );
            })}
          </div>
          {/* Filter Bar Ramping */}
          <div className="mb-4">
            <form className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[180px] flex-1">
                <Ikon
                  nama="cari"
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
                />
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Cari nama santri..."
                  className={`${input} pl-8.5`}
                />
              </div>
              <input type="hidden" name="status" value={status} />
              <select name="bulan" defaultValue={bulan ?? ""} className={`${input} !w-auto`}>
                <option value="">Semua bulan</option>
                {NAMA_BULAN.map((n, i) => (
                  <option key={n} value={i + 1}>
                    {n}
                  </option>
                ))}
              </select>
              <input
                name="tahun"
                defaultValue={tahun ?? ""}
                placeholder="Tahun"
                className={`${input} !w-20`}
              />
              <TombolKirim>Filter</TombolKirim>
            </form>
          </div>

          {/* Bar Metrik Tampil */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line/80 bg-surface-soft px-4 py-2 text-xs text-muted">
            <span>
              Menampilkan <b className="text-ink">{(data ?? []).length}</b> dari{" "}
              <b className="text-ink">{count ?? 0}</b> tagihan
            </span>
            <div className="flex items-center gap-4">
              <span>
                Total Tagihan: <b className="text-ink">{rupiah(totalNominal)}</b>
              </span>
              <span>
                Sisa Belum Terbayar: <b className="text-belum">{rupiah(totalSisa)}</b>
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(24,38,34,0.03)]">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-surface-soft/70 text-left text-xs font-medium text-muted">
                <tr>
                  <th className="px-5 py-3">Santri</th>
                  <th className="px-4 py-3">Rincian Tagihan</th>
                  <th className="px-4 py-3">Jatuh Tempo</th>
                  <th className="px-4 py-3 text-right">Sisa Tagihan</th>
                  <th className="px-5 py-3 text-right">Status & Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {(data ?? []).map((t) => {
                  const st = MAP_STATUS[t.status as string] ?? {
                    label: t.status,
                    varian: "netral" as const,
                  };
                  const lewat = t.status !== "lunas" && t.jatuh_tempo < hari;
                  return (
                    <tr key={t.id} className="group transition hover:bg-surface-soft/60">
                      <td className="px-5 py-3">
                        <Link
                          href={`/keuangan/tagihan/${t.id}`}
                          className="font-semibold text-ink group-hover:text-emerald hover:underline"
                        >
                          {peta.get(t.santri_id)?.nama ?? "-"}
                        </Link>
                        <div className="font-mono text-xs text-muted">
                          NIS {peta.get(t.santri_id)?.nis}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-ink">{t.judul}</div>
                        <div className="font-mono text-xs text-muted">{t.kode}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={lewat ? "font-semibold text-belum" : "text-muted"}>
                          {tanggal(t.jatuh_tempo)}
                        </span>
                        {lewat && (
                          <span className="ml-1.5 rounded bg-belum-bg px-1.5 py-0.5 text-[10px] font-semibold text-belum">
                            Terlambat
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-semibold text-ink">{rupiah(Number(t.sisa))}</div>
                        {Number(t.terbayar) > 0 && (
                          <div className="text-[11px] text-muted">
                            Terbayar {rupiah(Number(t.terbayar))}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Lencana varian={st.varian}>{st.label}</Lencana>
                          {t.status !== "lunas" && (
                            <a
                              href={`/keuangan/tagihan/${t.id}/wa`}
                              target="_blank"
                              rel="noreferrer"
                              title="Kirim pengingat WhatsApp ke wali"
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-white text-emerald transition hover:bg-emerald-pale"
                            >
                              <Ikon nama="wa" className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {(data ?? []).length === 0 && (
                  <tr>
                    <td colSpan={5}><Kosong judul="Tidak ada tagihan yang cocok" isi="Ubah filter, atau terbitkan tagihan bulan ini." /></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {boleh && (
          <Kartu className="sticky top-22">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-pale text-emerald">
                <Ikon nama="tagihan" className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-ink">Terbitkan tagihan</h2>
                <p className="text-xs text-muted">{aktif ?? 0} santri aktif</p>
              </div>
            </div>
            <p className="mb-4 text-xs text-muted">
              Tarif standar <b className="text-ink">{rupiah(Number(peng?.syahriyah_default ?? 0))}</b>. Yang sudah ditagih di periode ini dilewati.
            </p>
            <form action={terbitkanTagihan} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <Label>Bulan</Label>
                  <select name="bulan" defaultValue={bln} className={input}>
                    {NAMA_BULAN.map((n, i) => (
                      <option key={n} value={i + 1}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <Label>Tahun</Label>
                  <input name="tahun" type="number" defaultValue={thn} className={input} />
                </label>
              </div>
              <label className="block">
                <Label>Tanggal Jatuh Tempo</Label>
                <input
                  name="jatuh_tempo"
                  type="date"
                  defaultValue={`${hari.slice(0, 8)}10`}
                  required
                  className={input}
                />
              </label>
              <label className="block">
                <Label>Judul Tagihan (opsional)</Label>
                <input
                  name="judul"
                  placeholder={`Syahriyah ${NAMA_BULAN[bln - 1]} ${thn}`}
                  className={input}
                />
              </label>
              <label className="block">
                <Label>Nominal Khusus Seragam (opsional)</Label>
                <input
                  name="nominal"
                  type="number"
                  min={1}
                  placeholder="Kosongkan = tarif standar & keringanan"
                  className={input}
                />
              </label>
              <TombolKirim className="w-full">Terbitkan Tagihan Bulanan</TombolKirim>
            </form>
          </Kartu>
        )}
      </div>
    </>
  );
}

