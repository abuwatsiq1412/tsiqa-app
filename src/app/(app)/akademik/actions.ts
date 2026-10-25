"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { konteks } from "@/lib/konteks";
import { nomorWA, pesanGalat } from "@/lib/format";

const q = encodeURIComponent;
const ke = (path: string, k: "ok" | "galat", v: string) => redirect(`${path}?${k}=${q(v)}`);

export async function tambahMapel(form: FormData) {
  const { sb, pondokId } = await konteks();
  const nama = String(form.get("nama") ?? "").trim();
  if (!nama) ke("/akademik/mapel", "galat", "Nama mata pelajaran wajib diisi.");
  const { error } = await sb.from("mapel").insert({ pondok_id: pondokId, nama });
  if (error) ke("/akademik/mapel", "galat", error.code === "23505" ? "Mata pelajaran itu sudah ada." : pesanGalat(error.message));
  ke("/akademik/mapel", "ok", "Mata pelajaran ditambahkan.");
}

export async function hapusMapel(form: FormData) {
  const { sb } = await konteks();
  const { error } = await sb.from("mapel").delete().eq("id", String(form.get("id")));
  ke("/akademik/mapel", error ? "galat" : "ok", error ? pesanGalat(error.message) : "Mata pelajaran dihapus.");
}

export async function tambahGuru(form: FormData) {
  const { sb, pondokId } = await konteks();
  const p = z.object({ nama: z.string().trim().min(1, "Nama guru wajib diisi"), no_wa: z.string().transform(nomorWA).pipe(z.string().regex(/^62[0-9]{8,13}$/, "Nomor WhatsApp belum valid")) })
    .safeParse({ nama: form.get("nama"), no_wa: form.get("no_wa") });
  if (!p.success) ke("/akademik/guru", "galat", p.error.issues[0].message);
  const { error } = await sb.from("guru").insert({ pondok_id: pondokId, ...p.data! });
  if (error) ke("/akademik/guru", "galat", error.code === "23505" ? "Nomor WhatsApp itu sudah terdaftar sebagai guru." : pesanGalat(error.message));
  ke("/akademik/guru", "ok", "Guru ditambahkan.");
}

export async function ubahStatusGuru(form: FormData) {
  const { sb } = await konteks();
  await sb.from("guru").update({ aktif: form.get("aktif") === "1" }).eq("id", String(form.get("id")));
  redirect("/akademik/guru");
}

export async function undangGuru(form: FormData) {
  const { sb, pondokId } = await konteks();
  const id = String(form.get("id"));
  const { data: kode, error } = await sb.rpc("buat_undangan_guru", { p_guru: id });
  if (error) ke("/akademik/guru", "galat", pesanGalat(error.message));
  const [{ data: g }, { data: p }] = await Promise.all([
    sb.from("guru").select("nama, no_wa").eq("id", id).single(),
    sb.from("pondok").select("nama").eq("id", pondokId).single(),
  ]);
  const situs = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const pesan = `Assalamu'alaikum ${g?.nama}. ${p?.nama} mengundang Anda memakai TSIQA Guru untuk jadwal, absensi dan nilai. Buka tautan ini untuk membuat kata sandi (berlaku 7 hari):\n${situs}/guru/aktivasi?k=${kode}`;
  redirect(`https://wa.me/${g?.no_wa}?text=${q(pesan)}`);
}

export async function tambahJadwal(form: FormData) {
  const { sb, pondokId } = await konteks();
  const p = z.object({
    kelas_id: z.string().uuid("Pilih kelas"), mapel_id: z.string().uuid("Pilih mata pelajaran"), guru_id: z.string().uuid("Pilih guru"),
    hari: z.coerce.number().int().min(1).max(7), jam_mulai: z.string().regex(/^\d{2}:\d{2}$/, "Jam mulai belum valid"), jam_selesai: z.string().regex(/^\d{2}:\d{2}$/, "Jam selesai belum valid"),
  }).safeParse(Object.fromEntries(form.entries()));
  if (!p.success) ke("/akademik/jadwal", "galat", p.error.issues[0].message);
  if (p.data!.jam_mulai >= p.data!.jam_selesai) ke("/akademik/jadwal", "galat", "Jam selesai harus setelah jam mulai.");
  const { error } = await sb.from("jadwal").insert({ pondok_id: pondokId, ...p.data! });
  if (error) ke("/akademik/jadwal", "galat", error.message.includes("JADWAL_BENTROK") ? "Jadwal bentrok: guru atau kelas sudah terpakai di jam itu." : pesanGalat(error.message));
  ke("/akademik/jadwal", "ok", "Jadwal ditambahkan.");
}

export async function hapusJadwal(form: FormData) {
  const { sb } = await konteks();
  const { error } = await sb.from("jadwal").delete().eq("id", String(form.get("id")));
  ke("/akademik/jadwal", error ? "galat" : "ok", error ? pesanGalat(error.message) : "Jadwal dihapus.");
}

export async function simpanBobot(form: FormData) {
  const { sb, pondokId } = await konteks();
  const v = ["bobot_tugas", "bobot_uts", "bobot_uas", "kkm"].map((k) => Math.round(Number(form.get(k))));
  if (v.some((x) => !Number.isFinite(x) || x < 0 || x > 100)) ke("/akademik/nilai", "galat", "Isi angka 0–100.");
  if (v[0] + v[1] + v[2] !== 100) ke("/akademik/nilai", "galat", "Jumlah bobot tugas, UTS dan UAS harus 100.");
  const { error } = await sb.from("akademik_pengaturan").upsert({ pondok_id: pondokId, bobot_tugas: v[0], bobot_uts: v[1], bobot_uas: v[2], kkm: v[3] });
  ke("/akademik/nilai", error ? "galat" : "ok", error ? pesanGalat(error.message) : "Pengaturan nilai disimpan.");
}

export async function publikasiRapor(form: FormData) {
  const { sb, pondokId } = await konteks();
  const kelas = String(form.get("kelas"));
  const buka = form.get("buka") === "1";
  const { data: ta } = await sb.from("tahun_ajaran").select("id").eq("aktif", true).maybeSingle();
  if (!ta) ke(`/akademik/nilai?kelas=${kelas}`, "galat", pesanGalat("TAHUN_AJARAN_BELUM_AKTIF"));
  const { data: santri } = await sb.from("santri").select("id").eq("status", "aktif").or(`kelas_diniyah_id.eq.${kelas},kelas_formal_id.eq.${kelas}`);
  const baris = (santri ?? []).map((s) => ({ pondok_id: pondokId, santri_id: s.id, tahun_ajaran_id: ta!.id, dipublikasi: buka, updated_at: new Date().toISOString() }));
  if (baris.length) {
    const { error } = await sb.from("rapor_catatan").upsert(baris, { onConflict: "santri_id,tahun_ajaran_id" });
    if (error) ke(`/akademik/nilai?kelas=${kelas}`, "galat", pesanGalat(error.message));
  }
  ke(`/akademik/nilai?kelas=${kelas}`, "ok", buka ? "Rapor dibuka untuk wali." : "Rapor ditutup dari wali.");
}

export async function simpanCatatan(form: FormData) {
  const { sb, pondokId } = await konteks();
  const santri = String(form.get("santri")), kelas = String(form.get("kelas"));
  const { data: ta } = await sb.from("tahun_ajaran").select("id").eq("aktif", true).maybeSingle();
  if (!ta) ke(`/akademik/nilai?kelas=${kelas}`, "galat", pesanGalat("TAHUN_AJARAN_BELUM_AKTIF"));
  const { error } = await sb.from("rapor_catatan").upsert(
    { pondok_id: pondokId, santri_id: santri, tahun_ajaran_id: ta!.id, catatan: String(form.get("catatan") ?? "").slice(0, 500) || null, updated_at: new Date().toISOString() },
    { onConflict: "santri_id,tahun_ajaran_id" });
  ke(`/akademik/nilai?kelas=${kelas}`, error ? "galat" : "ok", error ? pesanGalat(error.message) : "Catatan disimpan.");
}
