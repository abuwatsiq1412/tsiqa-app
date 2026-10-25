"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { wajibStaf } from "@/lib/staf";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { pesanGalat } from "@/lib/format";
import { pesanZod } from "@/lib/santri-schema";

const q = encodeURIComponent;
const uuid = z.string().uuid();

export async function setujuiPondok(form: FormData) {
  const sb = await wajibStaf();
  const id = uuid.parse(String(form.get("id")));
  const hari = Math.max(1, Math.min(90, Number(form.get("hari") ?? 14)));
  const berakhir = new Date(Date.now() + hari * 86_400_000).toISOString().slice(0, 10);

  const { error } = await sb
    .from("langganan")
    .update({
      status: "percobaan",
      siklus: "percobaan",
      berakhir,
    })
    .eq("pondok_id", id);

  redirect(
    `/konsol/pondok/${id}?${
      error
        ? `galat=${q(pesanGalat(error.message))}`
        : `ok=${q(`Pendaftaran pondok disetujui dan masa percobaan ${hari} hari diaktifkan.`)}`
    }`
  );
}

export async function resetSandiPengurus(form: FormData) {
  const sb = await wajibStaf();
  const id = uuid.parse(String(form.get("id")));
  const userId = uuid.parse(String(form.get("user_id")));
  const sandiBaru = String(form.get("sandi_baru") ?? "").trim();

  if (sandiBaru.length < 8) {
    redirect(`/konsol/pondok/${id}?galat=${q("Kata sandi baru minimal 8 karakter.")}`);
  }

  // Pastikan user benar-benar terdaftar sebagai anggota pondok ini
  const { data: anggota } = await sb
    .from("anggota_pondok")
    .select("nama")
    .eq("pondok_id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (!anggota) {
    redirect(`/konsol/pondok/${id}?galat=${q("Pengguna tidak ditemukan pada pondok ini.")}`);
  }

  const admin = supabaseAdmin();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    password: sandiBaru,
    email_confirm: true,
  });

  redirect(
    `/konsol/pondok/${id}?${
      error
        ? `galat=${q(pesanGalat(error.message))}`
        : `ok=${q(`Kata sandi untuk ${anggota.nama} berhasil diatur ulang.`)}`
    }`
  );
}

export async function ubahLangganan(form: FormData) {
  const sb = await wajibStaf();
  const id = uuid.parse(String(form.get("id")));
  const statusRaw = String(form.get("status"));

  if (statusRaw === "menunggu") {
    const { error } = await sb
      .from("langganan")
      .update({ status: "berhenti", siklus: "percobaan" })
      .eq("pondok_id", id);
    redirect(
      `/konsol/pondok/${id}?${
        error ? `galat=${q(pesanGalat(error.message))}` : `ok=${q("Status diubah ke Menunggu Verifikasi.")}`
      }`
    );
  }

  const p = z.object({
    status: z.enum(["percobaan", "aktif", "berhenti"]),
    siklus: z.enum(["bulanan", "tahunan", "percobaan"]),
    kuota_santri: z.coerce.number().int().min(1).max(5000),
    berakhir: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal berakhir belum valid"),
  }).safeParse(Object.fromEntries(form.entries()));
  if (!p.success) redirect(`/konsol/pondok/${id}?galat=${q(pesanZod(p.error))}`);
  const { error } = await sb.from("langganan").update(p.data).eq("pondok_id", id);
  redirect(`/konsol/pondok/${id}?${error ? `galat=${q(pesanGalat(error.message))}` : "ok=Langganan tersimpan."}`);
}

export async function aturModul(form: FormData) {
  const sb = await wajibStaf();
  const id = uuid.parse(String(form.get("id")));
  const kode = String(form.get("kode"));
  const aktif = String(form.get("aktif")) === "1";
  const modulSiap = new Set(["keuangan", "akademik", "portal_guru", "portal_wali", "perizinan", "tahfidz", "website"]);
  if (kode === "website") {
    await sb.from("modul").upsert(
      { kode: "website", nama: "Website Pondok (CMS)", kategori: "Publikasi", harga_bulanan: 25000, tersedia: true, urutan: 11 },
      { onConflict: "kode" }
    );
  } else if (modulSiap.has(kode)) {
    await sb.from("modul").update({ tersedia: true }).eq("kode", kode);
  }
  if (aktif && !modulSiap.has(kode)) {
    const { data } = await sb.from("modul").select("tersedia").eq("kode", kode).maybeSingle();
    if (!data?.tersedia) redirect(`/konsol/pondok/${id}?galat=${q("Modul ini belum tersedia, belum bisa diaktifkan.")}`);
  }
  const { error } = await sb.from("addon_pondok").upsert({ pondok_id: id, kode, aktif }, { onConflict: "pondok_id,kode" });
  redirect(`/konsol/pondok/${id}?${error ? `galat=${q(pesanGalat(error.message))}` : `ok=${q(aktif ? "Modul diaktifkan." : "Modul dimatikan.")}`}`);
}

export async function perpanjang(form: FormData) {
  const sb = await wajibStaf();
  const id = uuid.parse(String(form.get("id")));
  const p = z.object({
    bulan: z.coerce.number().int().min(1).max(36),
    jumlah: z.coerce.number().int().min(0),
    siklus: z.enum(["bulanan", "tahunan", "percobaan"]),
    catatan: z.string().trim().optional(),
  }).safeParse(Object.fromEntries(form.entries()));
  if (!p.success) redirect(`/konsol/pondok/${id}?galat=${q(pesanZod(p.error))}`);
  const { error } = await sb.rpc("perpanjang_langganan", {
    p_pondok: id, p_bulan: p.data.bulan, p_jumlah: p.data.jumlah, p_siklus: p.data.siklus, p_catatan: p.data.catatan || null,
  });
  redirect(`/konsol/pondok/${id}?${error ? `galat=${q(pesanGalat(error.message))}` : "ok=Langganan diperpanjang dan pembayaran dicatat."}`);
}

export async function simpanHargaKhusus(form: FormData) {
  const sb = await wajibStaf();
  const id = uuid.parse(String(form.get("id")));
  const {
    data: { user },
  } = await sb.auth.getUser();
  const rawHarga = String(form.get("harga_khusus") ?? "").replace(/[^0-9]/g, "");
  const hargaKhusus = rawHarga.length > 0 ? Math.max(0, Number(rawHarga)) : null;
  const catatanHarga = String(form.get("catatan_harga") ?? "").trim() || null;

  const { simpanKesepakatanHarga } = await import("@/lib/harga-kesepakatan");
  await simpanKesepakatanHarga(
    id,
    hargaKhusus,
    catatanHarga,
    user?.id ?? null
  );

  redirect(
    `/konsol/pondok/${id}?ok=${q(
      hargaKhusus !== null
        ? "Harga kesepakatan khusus disimpan dan diterapkan ke Surat Penawaran & Invoice."
        : "Harga dikembalikan ke perhitungan tarif standar."
    )}`
  );
}

