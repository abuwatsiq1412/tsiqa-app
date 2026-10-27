import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { konteks } from "@/lib/konteks";
import { hariIni } from "@/lib/waktu";
import { rupiah } from "@/lib/format";
import { AvatarInisial, BarProgres, HeaderHalaman, Ikon, Kartu, Kosong, tombol, tombolSekunder } from "@/components-ui";
import { daftarModul, modulAktif } from "@/lib/modul";
import { RingkasanKeuangan, PanelTagihanMendesak } from "@/modules/keuangan/widget";

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

  // Hal yang perlu dikerjakan hari ini (hanya yang benar-benar ada).
  const [{ count: menunggu }, { data: telat }] = await Promise.all([
    adaKeuangan && adaWali
      ? sb.from("konfirmasi_transfer").select("id", { count: "exact", head: true }).eq("status", "menunggu")
      : Promise.resolve({ count: 0 }),
    adaKeuangan
      ? sb.from("tagihan").select("sisa").neq("status", "lunas").lt("jatuh_tempo", hariIni()).limit(2000)
      : Promise.resolve({ data: [] as { sisa: number }[] }),
  ]);
  const jmlTelat = (telat ?? []).length;
  const nilaiTelat = (telat ?? []).reduce((a, t) => a + Number(t.sisa), 0);
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
    <>
      <div className="mb-7 flex flex-col gap-4 rounded-xl border border-line/70 bg-surface p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
            Assalamu&apos;alaikum, {nama}
          </h1>
          <p className="mt-1 text-xs text-muted sm:text-sm">
            {tugas.length === 0
              ? "Semua agenda operasional hari ini sudah beres."
              : `Ada ${tugas.length} hal yang perlu diperhatikan hari ini.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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

      <section className="mb-7">
        <h2 className="mb-2.5 text-sm font-semibold text-ink">Perlu dikerjakan</h2>
        <Kartu className="!p-0 overflow-hidden">
          {tugas.length === 0 ? (
            <Kosong judul="Tidak ada yang mendesak" isi="Tagihan, bukti transfer, dan penempatan santri sudah beres." />
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
        </Kartu>
      </section>

      <h2 className="mb-2.5 text-sm font-semibold text-ink">Ringkasan</h2>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kartu>
          <span className="text-xs font-medium text-muted">Santri Aktif</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold tracking-tight text-ink tabular-nums sm:text-3xl">{totalSantri}</span>
            <span className="text-xs text-muted tabular-nums">/ {kuota} kuota</span>
          </div>
          <div className="mt-3">
            <BarProgres nilai={totalSantri} maks={kuota} />
          </div>
          <div className="mt-2 text-xs text-muted tabular-nums">
            {mukim} mukim · {kalong} kalong · {putra} putra · {putri} putri
          </div>
        </Kartu>

        <Kartu>
          <span className="text-xs font-medium text-muted">Hunian Asrama</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold tracking-tight text-ink tabular-nums sm:text-3xl">{terisiAsrama}</span>
            <span className="text-xs text-muted tabular-nums">/ {kapasitasAsrama || "-"} kasur</span>
          </div>
          <div className="mt-3">
            <BarProgres nilai={terisiAsrama} maks={kapasitasAsrama || 1} />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted tabular-nums">
            <span>{totalKamar} kamar · {jmlKelas ?? 0} kelas</span>
            <Link href="/kamar" className="font-medium text-emerald hover:underline">
              Kamar<Ikon nama="panah" className="ml-1 inline h-3 w-3 align-[-1px]" />
            </Link>
          </div>
        </Kartu>

        {adaKeuangan ? (
          <RingkasanKeuangan />
        ) : (
          <Kartu varian="mint" className="sm:col-span-2">
            <div className="flex h-full items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-ink">Modul Keuangan</div>
                <div className="mt-0.5 text-xs text-muted">Tagihan bulanan dan kasir pembayaran.</div>
              </div>
              <Link href="/modul" className={tombol}>Lihat</Link>
            </div>
          </Kartu>
        )}
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        {adaKeuangan && <PanelTagihanMendesak />}

        <Kartu className="!p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h2 className="text-sm font-semibold text-ink">Santri terbaru</h2>
            <Link href="/santri" className="text-xs font-medium text-emerald hover:underline">Semua<Ikon nama="panah" className="ml-1 inline h-3.5 w-3.5 align-[-2px]" /></Link>
          </div>
          <div className="divide-y divide-line text-sm">
            {(santriTerbaru ?? []).map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3 transition hover:bg-surface-soft/60">
                <AvatarInisial nama={s.nama} warna={s.jenis_kelamin === "L" ? "teal" : "mint"} />
                <div className="min-w-0">
                  <Link href={`/santri/${s.id}`} className="block truncate font-medium text-ink hover:text-emerald">
                    {s.nama}
                  </Link>
                  <div className="text-xs text-muted">
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
        </Kartu>
      </div>
    </>
  );
}
