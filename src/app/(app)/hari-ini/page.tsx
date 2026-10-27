import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { konteks } from "@/lib/konteks";
import { awalHari, hariIni } from "@/lib/waktu";
import { rupiah } from "@/lib/format";
import {
  AvatarInisial,
  BarProgres,
  Card,
  Ikon,
  Kosong,
  Lencana,
} from "@/components-ui";
import { daftarModul, modulAktif } from "@/lib/modul";
import { PanelTagihanMendesak } from "@/modules/keuangan/widget";

export default async function HariIni() {
  const sb = await supabaseServer();
  const { nama } = await konteks();
  const [
    modul,
    { data: santriAktif },
    { data: kamar },
    { count: jmlKelas },
    { data: langganan },
    { data: santriTerbaru },
  ] = await Promise.all([
    daftarModul(),
    sb.from("santri").select("jenis_kelamin, tempat_tinggal, kamar_id").eq("status", "aktif"),
    sb.from("kamar").select("id, kapasitas"),
    sb.from("kelas").select("id", { count: "exact", head: true }),
    sb.from("langganan").select("kuota_santri, status, berakhir").maybeSingle(),
    sb
      .from("santri")
      .select("id, nis, nama, jenis_kelamin, tempat_tinggal, kota_asal")
      .eq("status", "aktif")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const daftarSantri = santriAktif ?? [];
  const totalSantri = daftarSantri.length;
  const mukim = daftarSantri.filter((s) => s.tempat_tinggal === "mukim").length;
  const kalong = totalSantri - mukim;
  const putra = daftarSantri.filter((s) => s.jenis_kelamin === "L").length;
  const putri = totalSantri - putra;

  const totalKamar = (kamar ?? []).length;
  const kapasitasAsrama = (kamar ?? []).reduce((a, k) => a + Number(k.kapasitas), 0);
  const terisiAsrama = daftarSantri.filter((s) => s.kamar_id).length;
  const kuota = langganan?.kuota_santri ?? 100;
  const adaKeuangan = modulAktif(modul, "keuangan");
  const adaWali = modulAktif(modul, "portal_wali");

  // Hal yang perlu dikerjakan hari ini & ringkasan kas keuangan
  const [
    { count: menunggu },
    { data: telat },
    { data: bayarHariIni },
    { data: tagihanBelum },
  ] = await Promise.all([
    adaKeuangan && adaWali
      ? sb.from("konfirmasi_transfer").select("id", { count: "exact", head: true }).eq("status", "menunggu")
      : Promise.resolve({ count: 0 }),
    adaKeuangan
      ? sb.from("tagihan").select("sisa").neq("status", "lunas").lt("jatuh_tempo", hariIni()).limit(2000)
      : Promise.resolve({ data: [] as { sisa: number }[] }),
    adaKeuangan
      ? sb.from("pembayaran").select("nominal").is("dibatalkan_pada", null).gte("tanggal", awalHari(hariIni()))
      : Promise.resolve({ data: [] as { nominal: number }[] }),
    adaKeuangan
      ? sb.from("tagihan").select("nominal, terbayar").neq("status", "lunas")
      : Promise.resolve({ data: [] as { nominal: number; terbayar: number }[] }),
  ]);

  const jmlTelat = (telat ?? []).length;
  const nilaiTelat = (telat ?? []).reduce((a, t) => a + Number(t.sisa), 0);
  const kasHariIni = (bayarHariIni ?? []).reduce((a, b) => a + Number(b.nominal), 0);
  const jmlTransaksi = (bayarHariIni ?? []).length;
  const totalBelumLunas = (tagihanBelum ?? []).reduce((a, b) => a + Number(b.nominal) - Number(b.terbayar), 0);
  const jmlTagihanBelum = (tagihanBelum ?? []).length;

  const tanpaKamar = daftarSantri.filter((x) => x.tempat_tinggal === "mukim" && !x.kamar_id).length;
  const tugas: { n: number; judul: string; ket: string; href: string; aksi: string; nada: "gold" | "merah" | "hijau" }[] = [
    ...(menunggu ? [{ n: menunggu, judul: "Bukti transfer menunggu dicek", ket: "Dikirim wali santri lewat aplikasi", href: "/keuangan/konfirmasi", aksi: "Periksa", nada: "gold" as const }] : []),
    ...(jmlTelat ? [{ n: jmlTelat, judul: "Tagihan lewat jatuh tempo", ket: `Total ${rupiah(nilaiTelat)}`, href: "/keuangan/tagihan", aksi: "Lihat", nada: "merah" as const }] : []),
    ...(tanpaKamar ? [{ n: tanpaKamar, judul: "Santri mukim belum punya kamar", ket: "Tempatkan di kamar asrama", href: "/penempatan", aksi: "Tempatkan", nada: "hijau" as const }] : []),
  ];

  const warna = {
    gold: "border border-gold/30 bg-gold-pale text-gold-ink",
    merah: "border border-red-200/80 bg-red-50/80 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300",
    hijau: "border border-emerald/20 bg-emerald-pale/60 text-emerald",
  };

  return (
    <div className="space-y-6">
      {/* Kartu Sambutan & Aksi Cepat (Adopsi Ritme Landing Page: Eyebrow + Tracking Rapat + Tombol Kapsul) */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-xs font-semibold text-emerald tracking-wide sm:text-[13px]">
              ADMINISTRASI PESANTREN · TSIQA
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-ink sm:text-3xl">
              Assalamu&apos;alaikum, {nama}
            </h1>
            <p className="mt-1.5 text-xs text-muted leading-relaxed sm:text-sm">
              {tugas.length === 0
                ? "Semua agenda operasional santri dan keuangan hari ini sudah rapi dan terkendali."
                : `Ada ${tugas.length} hal yang perlu tindak lanjut hari ini.`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {adaKeuangan && (
              <Link
                href="/keuangan/pembayaran"
                className="group inline-flex h-9 sm:h-10 items-center justify-center gap-2 rounded-full bg-emerald px-4 text-xs sm:text-[13.5px] font-semibold text-white no-underline shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-hover hover:shadow-[0_12px_24px_-10px_rgba(15,118,110,0.6)] active:scale-[0.98]"
              >
                <Ikon nama="kasir" className="h-3.5 w-3.5" />
                <span>Terima Pembayaran</span>
              </Link>
            )}
            <Link
              href="/santri/baru"
              className="inline-flex h-9 sm:h-10 items-center justify-center gap-2 rounded-full border border-line bg-surface px-4 text-xs sm:text-[13.5px] font-semibold text-ink no-underline transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald/40 hover:bg-surface-soft active:scale-[0.98]"
            >
              <Ikon nama="tambah" className="h-3.5 w-3.5" />
              <span>Tambah Santri</span>
            </Link>
          </div>
        </div>
      </Card>

      {/* Panel Terpadu: Ringkasan Operasional (Card-in-Card Depth & Tabular Hero Numbers) */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-1.5 border-b border-line bg-surface-soft/60 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold tracking-[-0.015em] text-ink">Ringkasan Operasional</h2>
            <p className="text-xs text-muted">Kondisi santri, asrama, dan arus kas berjalan</p>
          </div>
          <Lencana varian="mint" titik={true}>Data Langsung</Lencana>
        </div>

        <div className="grid grid-cols-1 divide-y divide-line sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
          {/* Kolom 1: Santri Aktif */}
          <div className="flex flex-col justify-between p-5 transition-colors hover:bg-surface-soft/40">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-muted">
                <span>Santri Aktif</span>
                <Ikon nama="santri" className="h-4 w-4 text-muted/60" />
              </div>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <span className="text-3xl font-bold tracking-[-0.03em] text-ink tabular-nums sm:text-4xl">
                  {totalSantri}
                </span>
                <span className="text-xs font-medium text-muted tabular-nums sm:text-sm">/ {kuota} kuota</span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <BarProgres nilai={totalSantri} maks={kuota} />
              <p className="text-[11px] text-muted tabular-nums">
                {mukim} mukim · {kalong} kalong · {putra} putra · {putri} putri
              </p>
            </div>
          </div>

          {/* Kolom 2: Hunian Asrama */}
          <div className="flex flex-col justify-between p-5 transition-colors hover:bg-surface-soft/40">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-muted">
                <span>Hunian Asrama</span>
                <Ikon nama="kamar" className="h-4 w-4 text-muted/60" />
              </div>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <span className="text-3xl font-bold tracking-[-0.03em] text-ink tabular-nums sm:text-4xl">
                  {terisiAsrama}
                </span>
                <span className="text-xs font-medium text-muted tabular-nums sm:text-sm">/ {kapasitasAsrama || "-"} kasur</span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <BarProgres nilai={terisiAsrama} maks={kapasitasAsrama || 1} />
              <div className="flex items-center justify-between text-[11px] text-muted tabular-nums">
                <span>{totalKamar} kamar · {jmlKelas ?? 0} kelas</span>
                <Link
                  href="/kamar"
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold text-emerald hover:bg-emerald-pale/60 transition"
                >
                  Kamar &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Kolom 3: Kas Masuk Hari Ini */}
          <div className="flex flex-col justify-between p-5 transition-colors hover:bg-surface-soft/40">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-muted">
                <span>Kas Masuk Hari Ini</span>
                <Ikon nama="kasir" className="h-4 w-4 text-muted/60" />
              </div>
              <div className="mt-2.5 text-3xl font-bold tracking-[-0.03em] text-ink tabular-nums sm:text-4xl">
                {adaKeuangan ? rupiah(kasHariIni) : "—"}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-[11px] text-muted tabular-nums">
              <span>{adaKeuangan ? `${jmlTransaksi} transaksi tercatat` : "Modul belum aktif"}</span>
              {adaKeuangan ? (
                <Link
                  href="/keuangan/laporan"
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold text-emerald hover:bg-emerald-pale/60 transition"
                >
                  Laporan &rarr;
                </Link>
              ) : (
                <Link
                  href="/modul"
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold text-emerald hover:bg-emerald-pale/60 transition"
                >
                  Lihat Modul &rarr;
                </Link>
              )}
            </div>
          </div>

          {/* Kolom 4: Tagihan Tertunda */}
          <div className="flex flex-col justify-between p-5 transition-colors hover:bg-surface-soft/40">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-muted">
                <span>Tagihan Belum Lunas</span>
                <Ikon nama="tagihan" className="h-4 w-4 text-muted/60" />
              </div>
              <div className="mt-2.5 text-3xl font-bold tracking-[-0.03em] text-ink tabular-nums sm:text-4xl">
                {adaKeuangan ? rupiah(totalBelumLunas) : "—"}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-[11px] text-muted tabular-nums">
              <span>{adaKeuangan ? `${jmlTagihanBelum} tagihan berjalan` : "Modul belum aktif"}</span>
              {adaKeuangan && (
                <Link
                  href="/keuangan/tagihan"
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold text-emerald hover:bg-emerald-pale/60 transition"
                >
                  Kelola &rarr;
                </Link>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Agenda Mendesak ("Perlu Dikerjakan" - Card-in-Card Depth ala Hero Mock Landing Page) */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-line bg-surface-soft/60 px-5 py-3.5">
          <div>
            <h2 className="text-sm font-semibold tracking-[-0.015em] text-ink">Perlu Dikerjakan</h2>
            <p className="text-xs text-muted">Tindak lanjut administrasi santri dan keuangan pondok</p>
          </div>
          <Lencana varian="netral" titik={false}>
            {tugas.length} hal
          </Lencana>
        </div>
        {tugas.length === 0 ? (
          <div className="p-6">
            <Kosong judul="Semua agenda beres" isi="Tagihan, bukti transfer, dan penempatan santri sudah selesai ditindaklanjuti." />
          </div>
        ) : (
          <div className="p-4 sm:p-5">
            <div className="grid gap-2.5 sm:gap-3">
              {tugas.map((x) => (
                <Link
                  key={x.href}
                  href={x.href}
                  className="group flex flex-col gap-3 rounded-xl border border-line bg-surface p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald/40 hover:bg-surface-soft/50 hover:shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold tabular-nums shadow-xs ${warna[x.nada]}`}
                    >
                      {x.n}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold tracking-tight text-ink group-hover:text-emerald transition-colors">
                        {x.judul}
                      </p>
                      <p className="truncate text-xs text-muted">{x.ket}</p>
                    </div>
                  </div>
                  <span className="inline-flex self-start sm:self-center items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-ink group-hover:border-emerald/40 group-hover:bg-emerald-pale/40 group-hover:text-emerald transition-all">
                    <span>{x.aksi}</span>
                    <Ikon nama="panah" className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Grid 2-Kolom: Panel Tagihan Mendesak & Santri Terbaru */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        {adaKeuangan && <PanelTagihanMendesak />}

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line bg-surface-soft/60 px-5 py-3.5">
            <div>
              <h2 className="text-sm font-semibold tracking-[-0.015em] text-ink">Santri Terbaru</h2>
              <p className="text-xs text-muted">Data pendaftaran santri aktif terkini</p>
            </div>
            <Link href="/santri" className="text-xs font-semibold text-emerald hover:underline">
              Semua Santri &rarr;
            </Link>
          </div>
          <div className="divide-y divide-line/70 text-sm">
            {(santriTerbaru ?? []).map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 px-5 py-3 transition hover:bg-surface-soft/60">
                <div className="flex items-center gap-3 min-w-0">
                  <AvatarInisial nama={s.nama} warna={s.jenis_kelamin === "L" ? "teal" : "mint"} />
                  <div className="min-w-0">
                    <Link href={`/santri/${s.id}`} className="block truncate font-semibold text-ink hover:text-emerald tracking-tight">
                      {s.nama}
                    </Link>
                    <div className="text-xs text-muted tabular-nums">
                      {s.nis}{s.kota_asal ? ` · ${s.kota_asal}` : ""}
                    </div>
                  </div>
                </div>
                <Lencana varian="netral" titik={false}>
                  {s.tempat_tinggal === "mukim" ? "Mukim" : "Kalong"}
                </Lencana>
              </div>
            ))}
            {(santriTerbaru ?? []).length === 0 && (
              <div className="px-5 py-10 text-center">
                <p className="text-sm font-semibold text-ink">Belum ada santri</p>
                <p className="mt-1 text-xs text-muted">Mulai dengan mengimpor data santri dari file Excel.</p>
                <Link
                  href="/santri/impor"
                  className="inline-flex mt-4 h-9 items-center justify-center gap-2 rounded-full border border-line bg-surface px-4 text-xs font-semibold text-ink transition hover:bg-surface-soft hover:border-emerald/40"
                >
                  Impor Excel
                </Link>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
