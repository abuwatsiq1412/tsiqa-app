import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { adalahStaf } from "@/lib/staf";
import {
  BULAN_BAYAR_TAHUNAN,
  hargaCore,
  hitungDiskonModul,
  statusAkses,
} from "@/lib/harga";
import { ambilKesepakatanHarga } from "@/lib/harga-kesepakatan";

export async function muatDataDokumenLangganan(pondokId: string) {
  if (!/^[0-9a-f-]{36}$/.test(pondokId)) notFound();

  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/masuk");

  const staf = await adalahStaf();
  if (!staf) {
    const { data: anggota } = await sb
      .from("anggota_pondok")
      .select("id")
      .eq("pondok_id", pondokId)
      .eq("user_id", user.id)
      .eq("aktif", true)
      .maybeSingle();
    if (!anggota) notFound();
  }

  const db = process.env.SUPABASE_SERVICE_ROLE_KEY ? supabaseAdmin() : sb;

  const [
    { data: pondok },
    { data: langganan },
    { data: katalog },
    { data: addon },
    { data: adminPondok },
    kesepakatan,
  ] = await Promise.all([
    db.from("pondok").select("*").eq("id", pondokId).maybeSingle(),
    db.from("langganan").select("*").eq("pondok_id", pondokId).maybeSingle(),
    db.from("modul").select("*").order("urutan"),
    db.from("addon_pondok").select("kode, aktif").eq("pondok_id", pondokId),
    db
      .from("anggota_pondok")
      .select("nama, peran")
      .eq("pondok_id", pondokId)
      .eq("aktif", true)
      .order("created_at")
      .limit(1)
      .maybeSingle(),
    ambilKesepakatanHarga(pondokId),
  ]);

  if (!pondok) notFound();

  const daftarKatalog = [...(katalog ?? [])];
  if (!daftarKatalog.some((m) => m.kode === "website")) {
    daftarKatalog.push({
      kode: "website",
      nama: "Website Pondok (CMS)",
      kategori: "Publikasi",
      harga_bulanan: 25000,
      tersedia: true,
      urutan: 11,
    });
  }

  const aktifKode = new Set(
    (addon ?? []).filter((a) => a.aktif).map((a) => String(a.kode))
  );
  const modulAktif = daftarKatalog.filter((m) => aktifKode.has(String(m.kode)));

  const kuota = Number(langganan?.kuota_santri ?? 150);
  const biayaCore = hargaCore(kuota);
  const diskon = hitungDiskonModul(
    modulAktif.map((m) => Number(m.harga_bulanan))
  );
  const bulananStandar = biayaCore + diskon.totalSetelahDiskon;
  const bulananEfektif = kesepakatan.harga_khusus ?? bulananStandar;
  const tahunanEfektif = bulananEfektif * BULAN_BAYAR_TAHUNAN;
  const hematTahunan = bulananEfektif * (12 - BULAN_BAYAR_TAHUNAN);
  const akses = statusAkses(
    langganan?.status ?? null,
    langganan?.berakhir ?? null,
    new Date(),
    langganan?.siklus ?? null
  );

  return {
    staf,
    pondok,
    langganan,
    modulAktif,
    adminNama: (adminPondok?.nama as string | undefined) ?? "Pengurus Pondok",
    kuota,
    biayaCore,
    diskon,
    bulananStandar,
    bulananEfektif,
    tahunanEfektif,
    hematTahunan,
    kesepakatan,
    akses,
  };
}
