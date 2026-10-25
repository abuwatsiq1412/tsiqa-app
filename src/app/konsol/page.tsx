import Link from "next/link";
import { wajibStaf } from "@/lib/staf";
import { rupiah, tanggal } from "@/lib/format";
import { BULAN_BAYAR_TAHUNAN, perkiraanBulanan, statusAkses } from "@/lib/harga";
import { ambilSemuaKesepakatanHarga } from "@/lib/harga-kesepakatan";
import {
  Kartu,
  HeaderHalaman,
  Lencana,
  PesanNotifikasi,
  BarProgres,
  AvatarInisial,
  Ikon,
} from "@/components-ui";

const PETA_STATUS: Record<string, { label: string; varian: "lunas" | "cicilan" | "belum" | "netral" }> = {
  menunggu: { label: "Menunggu Verifikasi", varian: "cicilan" },
  aktif: { label: "Aktif", varian: "lunas" },
  percobaan: { label: "Percobaan", varian: "cicilan" },
  tenggang: { label: "Masa Tenggang", varian: "cicilan" },
  terkunci: { label: "Terkunci", varian: "belum" },
  berhenti: { label: "Berhenti", varian: "netral" },
};

interface Baris {
  pondok_id: string;
  nama: string;
  kode: string;
  status: string | null;
  siklus: string;
  kuota_santri: number | null;
  berakhir: string | null;
  santri_aktif: number;
  pengguna: number;
  modul: string[];
  akses: ReturnType<typeof statusAkses>;
  bulanan: number;
  hargaKhusus: boolean;
  sisaHari: number | null;
}

export default async function Konsol() {
  const sb = await wajibStaf();
  const [{ data: ringkas }, { data: katalog }, petaKesepakatan] = await Promise.all([
    sb.rpc("konsol_ringkasan"),
    sb.from("modul").select("kode, harga_bulanan"),
    ambilSemuaKesepakatanHarga(),
  ]);
  const harga = new Map((katalog ?? []).map((m) => [m.kode as string, Number(m.harga_bulanan)]));
  const baris: Baris[] = ((ringkas ?? []) as Omit<Baris, "akses" | "bulanan" | "hargaKhusus" | "sisaHari">[]).map((r) => {
    const akses = statusAkses(r.status, r.berakhir, new Date(), r.siklus);
    const modul = r.modul ?? [];
    const k = petaKesepakatan.get(r.pondok_id);
    const bulananStandar = perkiraanBulanan(Number(r.kuota_santri ?? 150), String(r.siklus), modul.map((kd) => harga.get(kd) ?? 0));
    const bulanan =
      k?.harga_khusus != null
        ? r.siklus === "tahunan"
          ? Math.round((k.harga_khusus * BULAN_BAYAR_TAHUNAN) / 12)
          : k.harga_khusus
        : bulananStandar;
    const sisaHari = r.berakhir ? Math.ceil((new Date(r.berakhir).getTime() - Date.now()) / 86_400_000) : null;
    return { ...r, modul, akses, bulanan, hargaKhusus: k?.harga_khusus != null, sisaHari };
  });

  const hitung = (f: (b: Baris) => boolean) => baris.filter(f).length;
  const mrr = baris.filter((b) => b.akses === "aktif" || b.akses === "tenggang").reduce((a, b) => a + b.bulanan, 0);
  const totalSantri = baris.reduce((a, b) => a + Number(b.santri_aktif || 0), 0);
  const menungguList = baris.filter((b) => b.akses === "menunggu");
  const segera = baris.filter((b) => ["aktif", "percobaan"].includes(b.akses) && b.sisaHari !== null && b.sisaHari <= 14);

  return (
    <div className="space-y-6">
      <HeaderHalaman
        judul="Pondok Mitra"
      />

      {menungguList.length > 0 && (
        <PesanNotifikasi
          tipe="peringatan"
          pesan={
            <span>
              <strong>{menungguList.length} pendaftaran pondok baru menunggu verifikasi Anda:</strong>{" "}
              {menungguList.map((b, i) => (
                <span key={b.pondok_id}>
                  {i > 0 && ", "}
                  <Link href={`/konsol/pondok/${b.pondok_id}`} className="font-bold underline hover:text-emerald">
                    {b.nama}
                  </Link>
                </span>
              ))}
              . Klik nama pondok untuk meninjau & mengaktifkan.
            </span>
          }
        />
      )}

      {/* Hero KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kartu varian="forest" className="relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-medium text-white/80">
            <span>Pendapatan / bulan</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-white">
              <Ikon.Koin className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-white">{rupiah(mrr)}</div>
          <div className="mt-1 text-xs text-white/70">
            Dari {hitung((b) => b.akses === "aktif" || b.akses === "tenggang")} pondok berbayar
          </div>
        </Kartu>

        <Kartu>
          <div className="flex items-center justify-between text-xs font-medium text-muted">
            <span>Total Pondok</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-surface-soft text-muted">
              <Ikon.Gedung className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-ink">{baris.length}</div>
          <div className="mt-1 text-xs text-muted">
            <span className="font-semibold text-emerald">{hitung((b) => b.akses === "aktif")} aktif</span> · {hitung((b) => b.akses === "percobaan")} percobaan · {menungguList.length} menunggu
          </div>
        </Kartu>

        <Kartu>
          <div className="flex items-center justify-between text-xs font-medium text-muted">
            <span>Menunggu Verifikasi</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-surface-soft text-muted">
              <Ikon.Kalender className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-ink">
            {menungguList.length}
          </div>
          <div className="mt-1 text-xs text-muted">
            {hitung((b) => b.akses === "percobaan")} sedang masa percobaan
          </div>
        </Kartu>

        <Kartu>
          <div className="flex items-center justify-between text-xs font-medium text-muted">
            <span>Total Santri Aktif</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-surface-soft text-muted">
              <Ikon.Santri className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-ink">
            {totalSantri.toLocaleString("id-ID")}
          </div>
          <div className="mt-1 text-xs text-muted">
            Di semua pondok
          </div>
        </Kartu>
      </div>

      {segera.length > 0 && (
        <PesanNotifikasi
          tipe="peringatan"
          pesan={
            <span>
              <strong>{segera.length} pondok akan berakhir dalam 14 hari:</strong>{" "}
              {segera.map((b) => b.nama).join(", ")}. 
            </span>
          }
        />
      )}

      {/* Directory Table */}
      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(24,38,34,0.03)]">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-sm font-semibold text-ink">Semua pondok</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-soft/60 text-xs font-medium text-muted">
              <tr>
                <th className="px-5 py-3">Pondok</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Jatuh Tempo</th>
                <th className="px-4 py-3">Santri / Kuota</th>
                <th className="px-4 py-3">Modul</th>
                <th className="px-5 py-3 text-right">Per bulan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {baris.map((b) => {
                const conf = PETA_STATUS[b.akses] ?? { label: b.akses, varian: "netral" };
                const kuota = Number(b.kuota_santri ?? 150);
                const santri = Number(b.santri_aktif ?? 0);
                const persen = Math.min(100, Math.round((santri / kuota) * 100));
                const hampirPenuh = persen >= 90;

                return (
                  <tr key={b.pondok_id} className="transition-colors hover:bg-emerald-pale/25">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <AvatarInisial nama={b.nama} ukuran="sm" />
                        <div>
                          <Link
                            href={`/konsol/pondok/${b.pondok_id}`}
                            className="font-medium text-ink hover:text-emerald hover:underline"
                          >
                            {b.nama}
                          </Link>
                          <div className="text-xs text-muted">
                            Kode: <span className="font-mono text-[11px] uppercase">{b.kode}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <Lencana varian={conf.varian}>{conf.label}</Lencana>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-muted">
                      {b.akses === "menunggu" ? (
                        <span className="font-medium text-cicilan">Belum diaktifkan</span>
                      ) : (
                        <>
                          <div>{tanggal(b.berakhir)}</div>
                          {b.sisaHari !== null && (
                            <div className={`text-[11px] ${b.sisaHari <= 14 ? "font-semibold text-cicilan" : "text-muted"}`}>
                              {b.sisaHari > 0 ? `${b.sisaHari} hari lagi` : "Sudah lewat"}
                            </div>
                          )}
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="w-36">
                        <div className="flex justify-between text-xs mb-1">
                          <span className={hampirPenuh ? "font-semibold text-belum" : "font-medium text-ink"}>
                            {santri} santri
                          </span>
                          <span className="text-muted">/ {kuota}</span>
                        </div>
                        <BarProgres nilai={santri} maks={kuota} varian={hampirPenuh ? "peringatan" : "emerald"} />
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {b.modul.map((m) => (
                          <span
                            key={m}
                            className="rounded bg-surface-soft px-1.5 py-0.5 text-[11px] font-medium text-ink"
                          >
                            {m}
                          </span>
                        ))}
                        {b.modul.length === 0 && <span className="text-xs text-muted">-</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-ink">
                      {rupiah(b.bulanan)}
                    </td>
                  </tr>
                );
              })}
              {baris.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-muted">
                    Belum ada pondok terdaftar dalam konsol.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
