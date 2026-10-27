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
  tombol,
  tombolSekunder,
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
  const tugas: { n: number; judul: string; ket: string; href: string; aksi: string; nada: "emas" | "merah" | "hijau" }[] = [
    ...(menunggu ? [{ n: menunggu, judul: "Bukti transfer menunggu dicek", ket: "Dikirim wali lewat aplikasi", href: "/keuangan/konfirmasi", aksi: "Periksa", nada: "emas" as const }] : []),
    ...(jmlTelat ? [{ n: jmlTelat, judul: "Tagihan lewat jatuh tempo", ket: `Total ${rupiah(nilaiTelat)}`, href: "/keuangan/tagihan", aksi: "Lihat", nada: "merah" as const }] : []),
    ...(tanpaKamar ? [{ n: tanpaKamar, judul: "Santri mukim belum punya kamar", ket: "Tempatkan di kamar", href: "/penempatan", aksi: "Tempatkan", nada: "hijau" as const }] : []),
  ];

  const warna = {
    emas: "border border-amber-200/80 bg-amber-50/80 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300",
    merah: "border border-red-200/80 bg-red-50/80 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300",
    hijau: "border border-emerald/20 bg-emerald-pale/60 text-emerald",
  };

  return (
    <div className="space-y-6">
      {/* Kartu Sambutan & Aksi Cepat (shadcn/ui style with Warm Stone tone) */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-muted">
              <span>Administrasi Pesantren</span>
              <span>·</span>
              <span className="font-semibold text-emerald">TSIQA Cloud</span>
            </div>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Assalamu&apos;alaikum, {nama}
            </h1>
            <p className="mt-1 text-xs text-muted sm:text-sm">
              {tugas.length === 0
                ? "Semua agenda operasional hari ini sudah beres."
                : `Ada ${tugas.length} hal yang perlu diperhatikan hari ini.`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {adaKeuangan && (
              <Link href="/keuangan/pembayaran" className={tombol}>
                <Ikon nama="kasir" className="h-3.5 w-3.5" />
                Terima Pembayaran
              </Link>
            )}
            <Link href="/santri/baru" className={tombolSekunder}>
              <Ikon nama="tambah" className="h-3.5 w-3.5" />
              Tambah Santri
            </Link>
          </div>
        </div>
      </Card>

      {/* Panel Terpadu: Ringkasan Operasional (Precision Segmented Instrument Grid) */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-1 border-b border-line bg-surface-soft/60 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-ink">Ringkasan Operasional</h2>
            <p className="text-xs text-muted">Kondisi santri, asrama, dan arus kas berjalan</p>
          </div>
          <span className="text-[11px] font-medium text-muted">
            Data Langsung
          </span>
        </div>

        <div className="grid grid-cols-1 divide-y divide-line sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
          {/* Kolom 1: Santri Aktif */}
          <div className="flex flex-col justify-between p-5">
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-muted">
                <span>Santri Aktif</span>
                <Ikon nama="santri" className="h-4 w-4 text-muted/60" />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-semibold tracking-tight text-ink tabular-nums sm:text-3xl">
                  {totalSantri}
                </span>
                <span className="text-xs text-muted tabular-nums">/ {kuota} kuota</span>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              <BarProgres nilai={totalSantri} maks={kuota} />
              <p className="text-[11px] text-muted tabular-nums">
                {mukim} mukim · {kalong} kalong · {putra} putra · {putri} putri
              </p>
            </div>
          </div>

          {/* Kolom 2: Hunian Asrama */}
          <div className="flex flex-col justify-between p-5">
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-muted">
                <span>Hunian Asrama</span>
                <Ikon nama="kamar" className="h-4 w-4 text-muted/60" />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-semibold tracking-tight text-ink tabular-nums sm:text-3xl">
                  {terisiAsrama}
                </span>
                <span className="text-xs text-muted tabular-nums">/ {kapasitasAsrama || "-"} kasur</span>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              <BarProgres nilai={terisiAsrama} maks={kapasitasAsrama || 1} />
              <div className="flex items-center justify-between text-[11px] text-muted tabular-nums">
                <span>{totalKamar} kamar · {jmlKelas ?? 0} kelas</span>
                <Link href="/kamar" className="font-medium text-emerald hover:underline">
                  Kamar &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Kolom 3: Kas Masuk Hari Ini */}
          <div className="flex flex-col justify-between p-5">
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-muted">
                <span>Kas Masuk Hari Ini</span>
                <Ikon nama="kasir" className="h-4 w-4 text-muted/60" />
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-ink tabular-nums sm:text-3xl">
                {adaKeuangan ? rupiah(kasHariIni) : "—"}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-muted tabular-nums">
              <span>{adaKeuangan ? `${jmlTransaksi} transaksi tercatat` : "Modul belum aktif"}</span>
              {adaKeuangan ? (
                <Link href="/keuangan/laporan" className="font-medium text-emerald hover:underline">
                  Laporan &rarr;
                </Link>
              ) : (
                <Link href="/modul" className="font-medium text-emerald hover:underline">
                  Lihat Modul &rarr;
                </Link>
              )}
            </div>
          </div>

          {/* Kolom 4: Tagihan Tertunda */}
          <div className="flex flex-col justify-between p-5">
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-muted">
                <span>Tagihan Belum Lunas</span>
                <Ikon nama="tagihan" className="h-4 w-4 text-muted/60" />
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-ink tabular-nums sm:text-3xl">
                {adaKeuangan ? rupiah(totalBelumLunas) : "—"}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-muted tabular-nums">
              <span>{adaKeuangan ? `${jmlTagihanBelum} tagihan berjalan` : "Modul belum aktif"}</span>
              {adaKeuangan && (
                <Link href="/keuangan/tagihan" className="font-medium text-emerald hover:underline">
                  Kelola &rarr;
                </Link>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Agenda Mendesak ("Perlu Dikerjakan") */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-line bg-surface-soft/60 px-5 py-3.5">
          <div>
            <h2 className="text-sm font-semibold text-ink">Perlu Dikerjakan</h2>
            <p className="text-xs text-muted">Tindak lanjut administrasi santri dan keuangan</p>
          </div>
          <span className="rounded-md border border-line bg-surface px-2 py-0.5 text-xs font-medium text-muted tabular-nums">
            {tugas.length} hal
          </span>
        </div>
        {tugas.length === 0 ? (
          <div className="p-6">
            <Kosong judul="Tidak ada yang mendesak" isi="Tagihan, bukti transfer, dan penempatan santri sudah beres." />
          </div>
        ) : (
          <ul className="divide-y divide-line/70">
            {tugas.map((x) => (
              <li key={x.href}>
                <Link href={x.href} className="flex items-center gap-3.5 px-4 py-3.5 transition hover:bg-surface-soft/60 sm:px-5">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold tabular-nums ${warna[x.nada]}`}>
                    {x.n}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-ink">{x.judul}</span>
                    <span className="block text-xs text-muted">{x.ket}</span>
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald">
                    {x.aksi}
                    <Ikon nama="panah" className="h-3 w-3" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Grid 2-Kolom: Panel Tagihan Mendesak & Santri Terbaru */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        {adaKeuangan && <PanelTagihanMendesak />}

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line bg-surface-soft/60 px-5 py-3.5">
            <div>
              <h2 className="text-sm font-semibold text-ink">Santri Terbaru</h2>
              <p className="text-xs text-muted">Data pendaftaran santri aktif terkini</p>
            </div>
            <Link href="/santri" className="text-xs font-medium text-emerald hover:underline">
              Semua Santri &rarr;
            </Link>
          </div>
          <div className="divide-y divide-line text-sm">
            {(santriTerbaru ?? []).map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3 transition hover:bg-surface-soft/60">
                <AvatarInisial nama={s.nama} warna={s.jenis_kelamin === "L" ? "teal" : "mint"} />
                <div className="min-w-0 flex-1">
                  <Link href={`/santri/${s.id}`} className="block truncate font-medium text-ink hover:text-emerald">
                    {s.nama}
                  </Link>
                  <div className="text-xs text-muted tabular-nums">
                    {s.nis}{s.kota_asal ? ` · ${s.kota_asal}` : ""} · {s.tempat_tinggal === "mukim" ? "Mukim" : "Kalong"}
                  </div>
                </div>
              </div>
            ))}
            {(santriTerbaru ?? []).length === 0 && (
              <div className="px-5 py-10 text-center">
                <p className="text-sm font-medium text-ink">Belum ada santri</p>
                <p className="mt-1 text-xs text-muted">Mulai dengan impor dari Excel.</p>
                <Link href="/santri/impor" className={`${tombolSekunder} mt-4`}>Impor Excel</Link>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
