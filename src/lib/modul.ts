import { cache } from "react";
import { supabaseServer } from "@/lib/supabase/server";

export interface Modul { kode: string; nama: string; kategori: string; harga_bulanan: number; tersedia: boolean; aktif: boolean }

const MODUL_SIAP = new Set(["keuangan", "akademik", "portal_guru", "portal_wali", "perizinan", "tahfidz", "website"]);

/** Katalog modul + status aktif untuk pondok pengguna saat ini. Core tidak termasuk (selalu aktif). */
export const daftarModul = cache(async function daftarModul(): Promise<Modul[]> {
  const sb = await supabaseServer();
  const [{ data: katalog }, { data: aktif }] = await Promise.all([
    sb.from("modul").select("kode, nama, kategori, harga_bulanan, tersedia").order("urutan"),
    sb.from("addon_pondok").select("kode").eq("aktif", true),
  ]);
  const hidup = new Set((aktif ?? []).map((a) => a.kode));
  const daftar = (katalog ?? []).map((m) => ({
    ...m,
    harga_bulanan: Number(m.harga_bulanan),
    tersedia: MODUL_SIAP.has(m.kode) ? true : m.tersedia,
    aktif: hidup.has(m.kode),
  }));
  // Pastikan modul Website Pondok (CMS) selalu muncul di katalog sekalipun migrasi 0011 belum dijalankan
  if (!daftar.some((m) => m.kode === "website")) {
    daftar.push({
      kode: "website",
      nama: "Website Pondok (CMS)",
      kategori: "Publikasi",
      harga_bulanan: 25000,
      tersedia: true,
      aktif: hidup.has("website"),
    });
  }
  return daftar;
});

export const modulAktif = (daftar: Modul[], kode: string) => daftar.some((m) => m.kode === kode && m.aktif);

