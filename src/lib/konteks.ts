import { cache } from "react";
import { redirect } from "next/navigation";
import { tujuanSetelahLogin } from "@/lib/arah";
import { supabaseServer } from "@/lib/supabase/server";
import type { Peran } from "@/lib/db-types";

export const DAFTAR_AKSES_MODUL: { kode: string; label: string; ket: string }[] = [
  { kode: "core", label: "Core (Santri, Kamar & Kelas)", ket: "Data induk santri, kamar asrama, kelas, dan penempatan." },
  { kode: "keuangan", label: "Keuangan & Syahriah", ket: "Tagihan bulanan, terima bayar, kwitansi, keringanan, dan laporan kas." },
  { kode: "akademik", label: "Akademik & E-Rapor", ket: "Guru, mata pelajaran, jadwal, absensi, dan nilai rapor." },
  { kode: "tahfidz", label: "Tahfidz & Muroja'ah", ket: "Halaqah, absen & setoran harian (tambah/ulang hafalan), dan kenaikan juz." },
  { kode: "portal_wali", label: "Portal Wali Santri", ket: "Kelola akun dan tautan undangan WhatsApp wali santri." },
  { kode: "perizinan", label: "Keamanan & Perizinan", ket: "Ketertiban asrama dan izin keluar/pulang santri." },
  { kode: "website", label: "Website Pondok (CMS)", ket: "Kelola profil, berita, pengumuman, galeri, dan unit di website publik." },
];

export function bawaanAksesPeran(peran: string, akses?: string[] | null): string[] {
  if (peran === "admin") return DAFTAR_AKSES_MODUL.map((m) => m.kode);
  if (Array.isArray(akses) && akses.length > 0) return akses;
  if (peran === "bendahara") return ["core", "keuangan", "portal_wali"];
  return ["core", "akademik", "portal_wali"];
}

export function bolehAksesModul(peran: string, akses: string[] | null | undefined, kode: string): boolean {
  if (peran === "admin") return true;
  return bawaanAksesPeran(peran, akses).includes(kode);
}

/** Pondok, peran, & daftar modul yang boleh diakses pengguna yang sedang masuk. */
export const konteks = cache(async function konteks() {
  const sb = await supabaseServer();
  const { data } = await sb.from("anggota_pondok").select("*").eq("aktif", true).limit(1).maybeSingle();
  if (!data) {
    const { data: { user } } = await sb.auth.getUser();
    redirect(user ? await tujuanSetelahLogin(sb, user.id) : "/masuk");
  }
  const peran = data.peran as Peran;
  const aksesModul = bawaanAksesPeran(peran, (data as { akses_modul?: string[] | null }).akses_modul);
  return { sb, pondokId: data.pondok_id as string, peran, nama: data.nama as string, aksesModul };
});
