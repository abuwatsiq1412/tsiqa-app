import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { Kartu, Ikon, Lencana } from "@/components-ui";
import { rupiah, tanggal } from "@/lib/format";
import { awalHari, hariIni } from "@/lib/waktu";

/** Angka keuangan untuk halaman Hari Ini & Keuangan */
export async function RingkasanKeuangan() {
  const sb = await supabaseServer();
  const [{ data: bayar }, { data: tagihan }] = await Promise.all([
    sb
      .from("pembayaran")
      .select("nominal")
      .is("dibatalkan_pada", null)
      .gte("tanggal", awalHari(hariIni())),
    sb.from("tagihan").select("nominal, terbayar").neq("status", "lunas"),
  ]);
  const kas = (bayar ?? []).reduce((a, b) => a + Number(b.nominal), 0);
  const jmlTransaksi = (bayar ?? []).length;
  const belum = (tagihan ?? []).reduce((a, b) => a + Number(b.nominal) - Number(b.terbayar), 0);
  const jmlTagihan = (tagihan ?? []).length;

  return (
    <>
      <Kartu>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted">Kas masuk hari ini</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-pale text-emerald">
            <Ikon nama="kasir" className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-2 text-2xl font-bold tracking-tight text-ink">{rupiah(kas)}</div>
        <div className="mt-2 flex items-center justify-between text-xs text-muted">
          <span>{jmlTransaksi} transaksi</span>
          <Link href="/keuangan/laporan" className="font-medium text-emerald hover:underline">
            Laporan<Ikon nama="panah" className="ml-1 inline h-3.5 w-3.5 align-[-2px]" />
          </Link>
        </div>
      </Kartu>

      <Kartu>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted">Belum lunas</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-soft text-emerald">
            <Ikon nama="tagihan" className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-2 text-2xl font-bold tracking-tight text-ink">{rupiah(belum)}</div>
        <div className="mt-2 flex items-center justify-between text-xs text-muted">
          <span>{jmlTagihan} tagihan</span>
          <Link href="/keuangan/tagihan" className="font-medium text-emerald hover:underline">
            Kelola<Ikon nama="panah" className="ml-1 inline h-3.5 w-3.5 align-[-2px]" />
          </Link>
        </div>
      </Kartu>
    </>
  );
}

/** Panel daftar tagihan yang mendekati/lewat jatuh tempo untuk dashboard Hari Ini. */
export async function PanelTagihanMendesak() {
  const sb = await supabaseServer();
  const hari = hariIni();
  const { data: daftar } = await sb
    .from("tagihan")
    .select("id, santri_id, kode, judul, sisa, jatuh_tempo, status")
    .neq("status", "lunas")
    .order("jatuh_tempo", { ascending: true })
    .limit(5);

  const ids = [...new Set((daftar ?? []).map((t) => t.santri_id as string))];
  const { data: nama } = ids.length
    ? await sb.from("santri").select("id, nama, nis").in("id", ids)
    : { data: [] };
  const peta = new Map((nama ?? []).map((s) => [s.id as string, s]));

  return (
    <Kartu className="!p-0 overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h2 className="text-sm font-semibold text-ink">Perlu ditagih</h2>
        <Link href="/keuangan/tagihan" className="text-xs font-medium text-emerald hover:underline">
          Semua<Ikon nama="panah" className="ml-1 inline h-3.5 w-3.5 align-[-2px]" />
        </Link>
      </div>
      <div className="divide-y divide-line text-sm">
        {(daftar ?? []).map((t) => {
          const lewat = t.jatuh_tempo < hari;
          const s = peta.get(t.santri_id);
          return (
            <div
              key={t.id}
              className="flex items-center justify-between gap-4 px-5 py-3 transition hover:bg-surface-soft/60"
            >
              <div className="min-w-0">
                <Link
                  href={`/keuangan/tagihan/${t.id}`}
                  className="font-medium text-ink hover:text-emerald"
                >
                  {s?.nama ?? "Santri"}
                </Link>
                <div className="text-xs text-muted">
                  {t.judul} · <span className="font-mono text-[11px]">{t.kode}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-right">
                <div>
                  <div className="font-semibold text-ink">{rupiah(Number(t.sisa))}</div>
                  <div className={`text-[11px] ${lewat ? "font-medium text-belum" : "text-muted"}`}>
                    {tanggal(t.jatuh_tempo)}
                  </div>
                </div>
                {(lewat || t.status === "cicilan") && (
                  <Lencana varian={lewat ? "belum" : "cicilan"}>{lewat ? "Terlambat" : "Cicilan"}</Lencana>
                )}
              </div>
            </div>
          );
        })}
        {(daftar ?? []).length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-muted">
            Tidak ada tunggakan.
          </div>
        )}
      </div>
    </Kartu>
  );
}
