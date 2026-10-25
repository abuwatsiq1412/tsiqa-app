import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { daftarModul, modulAktif } from "@/lib/modul";
import { bolehAksesModul } from "@/lib/konteks";
import { adalahStaf } from "@/lib/staf";
import { MENU_MODUL } from "@/modules/registry";
import { KerangkaApp, type GrupMenu } from "@/components-shell";
import { Kartu, Lencana, tombol, tombolSekunder, Ikon } from "@/components-ui";
import { hariIni } from "@/lib/waktu";
import { tanggalHeader } from "@/lib/hijriah";
import { statusAkses } from "@/lib/harga";
import { tujuanSetelahLogin } from "@/lib/arah";
import { tanggal } from "@/lib/format";
import { waLink } from "@/app/_lib/pricing";

async function keluar() {
  "use server";
  const sb = await supabaseServer();
  await sb.auth.signOut();
  redirect("/masuk");
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const sb = await supabaseServer();
  // Semua query layout berjalan paralel.
  const [{ data: anggota }, staf, modul, { data: taAktif }, { data: lg }, { data: pg }] = await Promise.all([
    sb.from("anggota_pondok").select("*, pondok(nama, kode, kota, telepon, email)").eq("aktif", true).limit(1).maybeSingle(),
    adalahStaf(),
    daftarModul(),
    sb.from("tahun_ajaran").select("nama, semester").eq("aktif", true).maybeSingle(),
    sb.from("langganan").select("status, berakhir, siklus").maybeSingle(),
    sb.from("pondok").select("geser_hijriah").maybeSingle(), // tahan bila migrasi 0009 belum dijalankan
  ]);
  if (!anggota) {
    if (staf) redirect("/konsol");
    const { data: user } = await sb.auth.getUser();
    redirect(user.user ? await tujuanSetelahLogin(sb, user.user.id) : "/masuk");
  }

  const pondok = anggota.pondok as unknown as {
    nama: string;
    kode: string;
    kota?: string | null;
    telepon?: string | null;
    email?: string | null;
  } | null;

  const akses = statusAkses(
    lg?.status ?? null,
    lg?.berakhir ?? null,
    new Date(),
    (lg as { siklus?: string | null } | null)?.siklus ?? null
  );

  // Bila pendaftaran pondok baru masih menunggu verifikasi Admin TSIQA, tahan akses ke dashboard.
  if (akses === "menunggu" && !staf) {
    const pesanKonfirmasi = waLink(
      `Assalamu’alaikum Admin TSIQA, saya telah mendaftarkan pondok di TSIQA:\n\n` +
        `• Nama Pondok: ${pondok?.nama ?? "-"}\n` +
        `• Kode Pondok: ${pondok?.kode ?? "-"}\n` +
        `• Kota: ${pondok?.kota ?? "-"}\n` +
        `• Pengurus: ${anggota.nama}\n` +
        `• No. WA: ${pondok?.telepon ?? "-"}\n\n` +
        `Mohon bantuannya untuk verifikasi dan aktivasi akun pondok kami. Terima kasih.`
    );

    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-ivory px-4 py-12 text-ink">
        <div className="w-full max-w-md space-y-5">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-white p-2.5 shadow-[0_4px_16px_rgba(24,38,34,0.08)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-tsiqa.svg" alt="TSIQA" className="h-full w-full object-contain" />
            </div>
            <Lencana varian="cicilan">Menunggu Verifikasi Admin</Lencana>
            <h1 className="mt-2.5 text-2xl font-bold tracking-tight text-ink">
              Pendaftaran Pondok Diterima
            </h1>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">
              Demi keamanan dan kerapian layanan, setiap pendaftaran pondok baru diverifikasi terlebih dahulu oleh tim TSIQA sebelum ruang kerja diaktifkan.
            </p>
          </div>

          <Kartu className="space-y-4 shadow-[0_4px_20px_rgba(24,38,34,0.04)]">
            <div className="rounded-xl border border-line bg-surface-soft/60 p-3.5 text-xs space-y-2">
              <div className="flex justify-between gap-2">
                <span className="text-muted">Nama Pondok</span>
                <span className="font-semibold text-ink text-right">{pondok?.nama ?? "-"}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted">Kode Pondok</span>
                <span className="font-mono font-semibold text-ink">{pondok?.kode ?? "-"}</span>
              </div>
              {pondok?.kota && (
                <div className="flex justify-between gap-2">
                  <span className="text-muted">Kota / Kabupaten</span>
                  <span className="font-medium text-ink">{pondok.kota}</span>
                </div>
              )}
              <div className="flex justify-between gap-2">
                <span className="text-muted">Nama Pengurus</span>
                <span className="font-medium text-ink">{anggota.nama}</span>
              </div>
              {pondok?.telepon && (
                <div className="flex justify-between gap-2">
                  <span className="text-muted">No. WhatsApp</span>
                  <span className="font-mono font-medium text-ink">+{pondok.telepon}</span>
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              <a
                href={pesanKonfirmasi}
                target="_blank"
                rel="noopener noreferrer"
                className={`${tombol} w-full justify-center`}
              >
                <Ikon.Centang className="h-4 w-4" />
                Konfirmasi via WhatsApp ke Admin TSIQA
              </a>
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href={`/dokumen/langganan/${anggota.pondok_id}/invoice`}
                  className={`${tombolSekunder} w-full justify-center text-xs`}
                >
                  <Ikon.Kuitansi className="h-3.5 w-3.5" />
                  Surat Penawaran
                </Link>
                <Link
                  href={`/dokumen/langganan/${anggota.pondok_id}/sla`}
                  className={`${tombolSekunder} w-full justify-center text-xs`}
                >
                  <Ikon.Kunci className="h-3.5 w-3.5" />
                  Piagam SLA
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <Link href="/hari-ini" className={`${tombolSekunder} w-full justify-center`}>
                  Cek Status Lagi
                </Link>
                <form action={keluar}>
                  <button className={`${tombolSekunder} w-full justify-center`}>
                    Keluar Akun
                  </button>
                </form>
              </div>
            </div>
          </Kartu>

          <p className="text-center text-[11px] text-muted">
            Begitu tim TSIQA menyetujui pendaftaran Anda di Konsol, halaman ini otomatis terbuka ke Dashboard Pondok.
          </p>
        </div>
      </main>
    );
  }

  const sisa = lg?.berakhir
    ? Math.round((new Date(lg.berakhir).getTime() - new Date(hariIni()).getTime()) / 86_400_000)
    : null;
  const hubungi = {
    href: waLink(`Halo TSIQA, saya ingin memperpanjang langganan ${pondok?.nama ?? ""}.`),
    label: "Hubungi TSIQA",
  };
  const peringatan =
    akses === "tenggang"
      ? { tingkat: "waspada" as const, teks: `Langganan berakhir ${tanggal(lg!.berakhir)}. Masa tenggang berjalan, segera perpanjang.`, tautan: hubungi }
      : akses === "terkunci" || akses === "berhenti"
      ? { tingkat: "bahaya" as const, teks: "Langganan berakhir. Data tetap bisa dilihat dan diunduh, tetapi belum bisa diubah.", tautan: hubungi }
      : akses === "percobaan" && sisa !== null && sisa <= 3
      ? { tingkat: "waspada" as const, teks: `Masa percobaan tinggal ${Math.max(sisa, 0)} hari.`, tautan: hubungi }
      : akses === "aktif" && sisa !== null && sisa <= 7
      ? { tingkat: "info" as const, teks: `Langganan berakhir ${sisa} hari lagi.`, tautan: hubungi }
      : null;

  const peran = anggota.peran as string;
  const daftarAkses = (anggota as { akses_modul?: string[] | null }).akses_modul;
  const bolehCore = bolehAksesModul(peran, daftarAkses, "core");
  const bolehKeuangan = bolehAksesModul(peran, daftarAkses, "keuangan");
  const adaKeuangan = modulAktif(modul, "keuangan") && bolehKeuangan;

  const grupModul: GrupMenu[] = modul
    .filter((m) => m.aktif && bolehAksesModul(peran, daftarAkses, m.kode) && (MENU_MODUL[m.kode] ?? []).length > 0)
    .map((m) => ({ judul: m.nama, item: MENU_MODUL[m.kode], lipat: true }));

  const grup: GrupMenu[] = [
    {
      judul: "Utama",
      item: [
        { href: "/hari-ini", label: "Hari Ini", ikon: "hari-ini" },
        ...(bolehCore || bolehKeuangan ? [{ href: "/santri", label: "Santri", ikon: "santri" as const }] : []),
      ],
    },
  ];

  if (bolehCore) {
    grup.push({
      judul: "Asrama & Kelas",
      item: [
        { href: "/kamar", label: "Kamar", ikon: "kamar" },
        { href: "/kelas", label: "Kelas", ikon: "kelas" },
        { href: "/penempatan", label: "Penempatan", ikon: "penempatan" },
      ],
    });
  }

  grup.push(...grupModul);

  const itemSistem: GrupMenu["item"] = [
    ...(peran === "admin" || bolehKeuangan
      ? [{ href: "/modul", label: "Langganan", ikon: "modul" as const }]
      : []),
    ...(peran === "admin"
      ? [
          { href: "/pengguna", label: "Pengguna", ikon: "pengguna" as const },
          { href: "/pengaturan", label: "Pengaturan", ikon: "pengaturan" as const },
        ]
      : []),
  ];

  if (itemSistem.length > 0) {
    grup.push({ judul: "Sistem", item: itemSistem });
  }

  return (
    <KerangkaApp
      anggota={{ nama: anggota.nama, peran: anggota.peran }}
      pondok={pondok}
      taAktif={taAktif ? { nama: taAktif.nama, semester: taAktif.semester } : null}
      grup={grup}
      adaKeuangan={adaKeuangan}
      tanggal={tanggalHeader(Number((pg as { geser_hijriah?: number } | null)?.geser_hijriah ?? 0))}
      peringatan={peringatan}
      keluarAction={keluar}
    >
      {children}
    </KerangkaApp>
  );
}
