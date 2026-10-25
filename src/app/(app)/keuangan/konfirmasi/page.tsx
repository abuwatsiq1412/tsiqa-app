import { TombolKirim } from "@/components-form";
import { konteks } from "@/lib/konteks";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { rupiah, tanggal } from "@/lib/format";
import { HeaderHalaman, Kartu, Lencana, PesanNotifikasi, input, tombol, tombolSekunder } from "@/components-ui";
import { prosesKonfirmasi } from "./actions";

export default async function Konfirmasi({ searchParams }: { searchParams: Promise<{ ok?: string; galat?: string }> }) {
  const { ok, galat } = await searchParams;
  const { sb, peran } = await konteks();
  const bisa = ["admin", "bendahara"].includes(peran);
  const { data: daftar } = await sb.from("konfirmasi_transfer")
    .select("id, tagihan_id, santri_id, nominal, tanggal_transfer, bukti_path, catatan, status, alasan_tolak, created_at")
    .order("created_at", { ascending: false }).limit(60);
  const rows = daftar ?? [];
  const [{ data: santri }, { data: tagihan }] = await Promise.all([
    sb.from("santri").select("id, nama, nis").in("id", [...new Set(rows.map((r) => r.santri_id as string))]),
    sb.from("tagihan").select("id, judul, sisa").in("id", [...new Set(rows.map((r) => r.tagihan_id as string))]),
  ]);
  const ns = new Map((santri ?? []).map((s) => [s.id as string, s]));
  const nt = new Map((tagihan ?? []).map((t) => [t.id as string, t]));

  // Tautan bukti berlaku 10 menit; dibuat hanya setelah peran admin/bendahara terbukti.
  const tautan = new Map<string, string>();
  if (bisa) {
    const admin = supabaseAdmin();
    await Promise.all(rows.filter((r) => r.bukti_path).map(async (r) => {
      const { data } = await admin.storage.from("bukti-transfer").createSignedUrl(r.bukti_path as string, 600);
      if (data?.signedUrl) tautan.set(r.id as string, data.signedUrl);
    }));
  }

  const menunggu = rows.filter((r) => r.status === "menunggu");
  const selesai = rows.filter((r) => r.status !== "menunggu").slice(0, 20);

  return (
    <>
      <HeaderHalaman kategori="Keuangan" judul="Konfirmasi Transfer" deskripsi="Cocokkan bukti dari wali dengan mutasi rekening, lalu terima atau tolak." />
      <PesanNotifikasi ok={ok} galat={galat} />

      <h2 className="mb-2.5 text-sm font-semibold text-ink">Menunggu dicek ({menunggu.length})</h2>
      {menunggu.length === 0 ? (
        <Kartu><p className="py-4 text-center text-sm text-muted">Tidak ada bukti transfer yang menunggu.</p></Kartu>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {menunggu.map((r) => {
            const s = ns.get(r.santri_id as string), t = nt.get(r.tagihan_id as string);
            return (
              <Kartu key={r.id as string}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{s?.nama ?? "Santri"}</div>
                    <div className="truncate text-xs text-muted">{t?.judul} · transfer {tanggal(r.tanggal_transfer as string)}</div>
                  </div>
                  <div className="text-right text-lg font-bold tracking-tight">{rupiah(Number(r.nominal))}</div>
                </div>
                {r.catatan && <p className="mt-2 text-xs text-muted">Catatan wali: {r.catatan}</p>}
                {tautan.get(r.id as string) && (
                  <a href={tautan.get(r.id as string)} target="_blank" rel="noopener noreferrer" className={`${tombolSekunder} mt-3`}>Lihat bukti transfer</a>
                )}
                {bisa ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                    <form action={prosesKonfirmasi}>
                      <input type="hidden" name="id" value={r.id as string} /><input type="hidden" name="keputusan" value="terima" />
                      <TombolKirim>Terima &amp; catat</TombolKirim>
                    </form>
                    <form action={prosesKonfirmasi} className="flex min-w-0 flex-1 gap-2">
                      <input type="hidden" name="id" value={r.id as string} /><input type="hidden" name="keputusan" value="tolak" />
                      <input name="alasan" required placeholder="Alasan penolakan" className={`${input} min-w-0 flex-1`} />
                      <button className={tombolSekunder}>Tolak</button>
                    </form>
                  </div>
                ) : <p className="mt-3 text-xs text-muted">Hanya admin dan bendahara yang dapat memproses.</p>}
              </Kartu>
            );
          })}
        </div>
      )}

      {selesai.length > 0 && (
        <>
          <h2 className="mb-2.5 mt-8 text-sm font-semibold text-ink">Terakhir diproses</h2>
          <Kartu className="overflow-hidden !p-0">
            <ul className="divide-y divide-line/70">
              {selesai.map((r) => (
                <li key={r.id as string} className="flex items-center gap-3 px-5 py-3 text-sm">
                  <span className="min-w-0 flex-1 truncate">{ns.get(r.santri_id as string)?.nama} · {nt.get(r.tagihan_id as string)?.judul}</span>
                  <span className="font-semibold">{rupiah(Number(r.nominal))}</span>
                  <Lencana varian={r.status === "diterima" ? "lunas" : "belum"}>{r.status === "diterima" ? "Diterima" : "Ditolak"}</Lencana>
                </li>
              ))}
            </ul>
          </Kartu>
        </>
      )}
    </>
  );
}
