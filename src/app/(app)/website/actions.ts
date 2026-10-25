"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bolehAksesModul, konteks } from "@/lib/konteks";
import { pesanGalat } from "@/lib/format";
import {
  DAFTAR_SEKSI_WEBSITE,
  type ProgramUnggulan,
  type SeksiWebsite,
  type TemaWebsite,
  type UnitPendidikan,
} from "@/lib/website";

const q = encodeURIComponent;

async function wajibAksesWebsite() {
  const ctx = await konteks();
  if (!bolehAksesModul(ctx.peran, ctx.aksesModul, "website")) {
    redirect(`/website?galat=${q(pesanGalat("TIDAK_BERHAK"))}`);
  }
  return ctx;
}

function pesanDbWebsite(err: { message?: string } | null): string {
  const msg = err?.message ?? "";
  if (/website_pengaturan|website_tulisan|website_galeri|relation .* does not exist/i.test(msg)) {
    return "Tabel Website belum dibuat di Supabase. Jalankan file supabase/migrations/0011_website_cms.sql di SQL Editor Supabase.";
  }
  return pesanGalat(msg);
}

export async function simpanTampilanWebsite(form: FormData) {
  const { sb, pondokId } = await wajibAksesWebsite();
  const temaInput = String(form.get("tema") ?? "zamrud");
  const tema: TemaWebsite = (
    ["zamrud", "emas", "samudra", "klasik"].includes(temaInput) ? temaInput : "zamrud"
  ) as TemaWebsite;

  const aktifPublik = form.get("aktif_publik") === "1";
  const dipilih = new Set(form.getAll("seksi").map(String));

  const seksiAktif = DAFTAR_SEKSI_WEBSITE.reduce((acc, s) => {
    acc[s.kode] = dipilih.has(s.kode);
    return acc;
  }, {} as SeksiWebsite);

  const { error } = await sb.from("website_pengaturan").upsert(
    {
      pondok_id: pondokId,
      aktif_publik: aktifPublik,
      tema,
      seksi_aktif: seksiAktif,
    },
    { onConflict: "pondok_id" }
  );

  if (error) redirect(`/website?galat=${q(pesanDbWebsite(error))}`);
  revalidatePath("/website");
  revalidatePath("/p", "layout");
  redirect(`/website?ok=${q("Pengaturan tampilan & seksi website disimpan.")}`);
}

export async function simpanProfilWebsite(form: FormData) {
  const { sb, pondokId } = await wajibAksesWebsite();
  const slogan = String(form.get("slogan") ?? "").trim();
  const subjudulHero = String(form.get("subjudul_hero") ?? "").trim();
  const tentangKami = String(form.get("tentang_kami") ?? "").trim();
  const visi = String(form.get("visi") ?? "").trim();
  const misi = String(form.get("misi") ?? "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const programUnggulan: ProgramUnggulan[] = [];
  for (let i = 0; i < 6; i++) {
    const judul = String(form.get(`prog_judul_${i}`) ?? "").trim();
    const deskripsi = String(form.get(`prog_ket_${i}`) ?? "").trim();
    if (judul) programUnggulan.push({ judul, deskripsi });
  }

  const unitPendidikan: UnitPendidikan[] = [];
  for (let i = 0; i < 6; i++) {
    const nama = String(form.get(`unit_nama_${i}`) ?? "").trim();
    const jenjang = String(form.get(`unit_jenjang_${i}`) ?? "").trim();
    const deskripsi = String(form.get(`unit_ket_${i}`) ?? "").trim();
    if (nama) unitPendidikan.push({ nama, jenjang: jenjang || " Reguler", deskripsi });
  }

  const { error } = await sb.from("website_pengaturan").upsert(
    {
      pondok_id: pondokId,
      slogan: slogan || "Mencetak Generasi Qur'ani & Berakhlak Mulia",
      subjudul_hero: subjudulHero,
      tentang_kami: tentangKami,
      visi,
      misi,
      program_unggulan: programUnggulan,
      unit_pendidikan: unitPendidikan,
    },
    { onConflict: "pondok_id" }
  );

  if (error) redirect(`/website/profil?galat=${q(pesanDbWebsite(error))}`);
  revalidatePath("/website/profil");
  revalidatePath("/p", "layout");
  redirect(`/website/profil?ok=${q("Profil, program unggulan, dan unit pendidikan disimpan.")}`);
}

export async function simpanPendaftaranWebsite(form: FormData) {
  const { sb, pondokId } = await wajibAksesWebsite();
  const psbBuka = form.get("psb_buka") === "1";
  const psbJudul = String(form.get("psb_judul") ?? "").trim();
  const psbGelombang = String(form.get("psb_gelombang") ?? "").trim();
  const psbBiaya = String(form.get("psb_biaya_ringkas") ?? "").trim();
  const psbTautan = String(form.get("psb_tautan_daftar") ?? "").trim() || null;
  const waAdmin = String(form.get("wa_admin_web") ?? "").replace(/\D/g, "") || null;
  const petaUrl = String(form.get("alamat_peta_url") ?? "").trim() || null;
  const igUrl = String(form.get("instagram_url") ?? "").trim() || null;
  const ytUrl = String(form.get("youtube_url") ?? "").trim() || null;

  const psbSyarat = String(form.get("psb_syarat") ?? "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const { error } = await sb.from("website_pengaturan").upsert(
    {
      pondok_id: pondokId,
      psb_buka: psbBuka,
      psb_judul: psbJudul || "Penerimaan Santri Baru",
      psb_gelombang: psbGelombang || "Gelombang I",
      psb_syarat: psbSyarat,
      psb_biaya_ringkas: psbBiaya,
      psb_tautan_daftar: psbTautan,
      wa_admin_web: waAdmin,
      alamat_peta_url: petaUrl,
      instagram_url: igUrl,
      youtube_url: ytUrl,
    },
    { onConflict: "pondok_id" }
  );

  if (error) redirect(`/website/pendaftaran?galat=${q(pesanDbWebsite(error))}`);
  revalidatePath("/website/pendaftaran");
  revalidatePath("/p", "layout");
  redirect(`/website/pendaftaran?ok=${q("Informasi pendaftaran (PSB) & kontak berhasil disimpan.")}`);
}

function buatSlug(judul: string): string {
  const dasar = judul
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const buntut = Math.random().toString(36).slice(2, 6);
  return `${dasar || "kabar"}-${buntut}`;
}

export async function tambahTulisanWebsite(form: FormData) {
  const { sb, pondokId } = await wajibAksesWebsite();
  const jenis = form.get("jenis") === "pengumuman" ? "pengumuman" : "berita";
  const judul = String(form.get("judul") ?? "").trim();
  const kategori = String(form.get("kategori") ?? "Kegiatan").trim() || "Kegiatan";
  const ringkasan = String(form.get("ringkasan") ?? "").trim() || null;
  const isi = String(form.get("isi") ?? "").trim();
  const gambarUrl = String(form.get("gambar_url") ?? "").trim() || null;
  const tanggal = String(form.get("tanggal") ?? "").trim() || new Date().toISOString().slice(0, 10);
  const penting = form.get("penting") === "1";

  if (!judul || !isi) {
    redirect(`/website/tulisan?galat=${q("Judul dan isi tulisan wajib diisi.")}`);
  }

  const { error } = await sb.from("website_tulisan").insert({
    pondok_id: pondokId,
    jenis,
    judul,
    slug: buatSlug(judul),
    kategori,
    ringkasan,
    isi,
    gambar_url: gambarUrl,
    penting,
    terbit: true,
    tanggal,
  });

  if (error) redirect(`/website/tulisan?galat=${q(pesanDbWebsite(error))}`);
  revalidatePath("/website/tulisan");
  revalidatePath("/p", "layout");
  redirect(`/website/tulisan?ok=${q(`${jenis === "pengumuman" ? "Pengumuman" : "Berita"} berhasil diterbitkan.`)}`);
}

export async function hapusTulisanWebsite(form: FormData) {
  const { sb, pondokId } = await wajibAksesWebsite();
  const id = String(form.get("id") ?? "");
  const { error } = await sb.from("website_tulisan").delete().eq("id", id).eq("pondok_id", pondokId);
  if (error) redirect(`/website/tulisan?galat=${q(pesanDbWebsite(error))}`);
  revalidatePath("/website/tulisan");
  revalidatePath("/p", "layout");
  redirect(`/website/tulisan?ok=${q("Tulisan dihapus.")}`);
}

export async function tambahGaleriWebsite(form: FormData) {
  const { sb, pondokId } = await wajibAksesWebsite();
  const judul = String(form.get("judul") ?? "").trim();
  const kategori = String(form.get("kategori") ?? "Kegiatan Santri").trim() || "Kegiatan Santri";
  const gambarUrl = String(form.get("gambar_url") ?? "").trim();
  const keterangan = String(form.get("keterangan") ?? "").trim() || null;

  if (!judul || !gambarUrl) {
    redirect(`/website/galeri?galat=${q("Judul dan tautan foto wajib diisi.")}`);
  }

  const { error } = await sb.from("website_galeri").insert({
    pondok_id: pondokId,
    judul,
    kategori,
    gambar_url: gambarUrl,
    keterangan,
  });

  if (error) redirect(`/website/galeri?galat=${q(pesanDbWebsite(error))}`);
  revalidatePath("/website/galeri");
  revalidatePath("/p", "layout");
  redirect(`/website/galeri?ok=${q("Foto dokumentasi ditambahkan ke galeri.")}`);
}

export async function hapusGaleriWebsite(form: FormData) {
  const { sb, pondokId } = await wajibAksesWebsite();
  const id = String(form.get("id") ?? "");
  const { error } = await sb.from("website_galeri").delete().eq("id", id).eq("pondok_id", pondokId);
  if (error) redirect(`/website/galeri?galat=${q(pesanDbWebsite(error))}`);
  revalidatePath("/website/galeri");
  revalidatePath("/p", "layout");
  redirect(`/website/galeri?ok=${q("Foto galeri dihapus.")}`);
}
