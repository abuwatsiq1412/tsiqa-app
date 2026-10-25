"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hariIni } from "@/lib/waktu";
import { kabarkanPengurus } from "@/lib/push";

const TIPE = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const EKS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "application/pdf": "pdf" };

export async function kirimKonfirmasi(form: FormData) {
  const a = String(form.get("a") ?? "");
  const tagihanId = String(form.get("tagihan") ?? "");
  const balik = (q: string) => `/wali/tagihan?a=${a}&${q}`;

  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/wali/masuk");

  const nominal = Math.floor(Number(form.get("nominal")));
  const tanggal = String(form.get("tanggal") ?? "");
  const berkas = form.get("bukti");
  if (!nominal || nominal <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(tanggal) || tanggal > hariIni()) redirect(balik("galat=nominal"));
  if (!(berkas instanceof File) || berkas.size === 0) redirect(balik("galat=bukti"));
  if (!TIPE.includes(berkas.type) || berkas.size > 5 * 1024 * 1024) redirect(balik("galat=berkas"));

  // Tagihan harus milik anak wali ini (RLS membatasi; kita baca lewat sesi pengguna).
  const { data: t } = await sb.from("tagihan").select("id, pondok_id, santri_id, sisa, judul").eq("id", tagihanId).maybeSingle();
  if (!t || t.santri_id !== a) redirect(balik("galat=tagihan"));
  if (nominal > Number(t.sisa)) redirect(balik("galat=nominal"));

  // Unggah memakai service role ke bucket privat, setelah kepemilikan di atas terbukti.
  const path = `${t.pondok_id}/${t.santri_id}/${crypto.randomUUID()}.${EKS[berkas.type]}`;
  const admin = supabaseAdmin();
  const up = await admin.storage.from("bukti-transfer").upload(path, Buffer.from(await berkas.arrayBuffer()), { contentType: berkas.type });
  if (up.error) redirect(balik("galat=unggah"));

  const { error } = await sb.from("konfirmasi_transfer").insert({
    pondok_id: t.pondok_id, tagihan_id: t.id, santri_id: t.santri_id, wali_user_id: user.id,
    nominal, tanggal_transfer: tanggal, bukti_path: path,
    catatan: String(form.get("catatan") ?? "").trim().slice(0, 200) || null,
  });
  if (error) {
    await admin.storage.from("bukti-transfer").remove([path]);
    redirect(balik(error.code === "23505" ? "galat=menunggu" : "galat=ditolak"));
  }
  await kabarkanPengurus(t.pondok_id as string, {
    judul: "Konfirmasi transfer baru", isi: `Ada bukti transfer untuk ${t.judul} menunggu dicek.`, url: "/keuangan/konfirmasi",
  });
  redirect(balik("ok=1"));
}

export async function simpanPush(s: { endpoint: string; p256dh: string; auth: string }) {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user || !s.endpoint.startsWith("https://")) return;
  await sb.from("push_langganan").upsert({ user_id: user.id, endpoint: s.endpoint, p256dh: s.p256dh, auth: s.auth }, { onConflict: "endpoint" });
}

export async function hapusPush(endpoint: string) {
  const sb = await supabaseServer();
  await sb.from("push_langganan").delete().eq("endpoint", endpoint);
}

export async function keluarWali() {
  const sb = await supabaseServer();
  await sb.auth.signOut();
  redirect("/wali/masuk");
}

export async function gantiSandiWali(form: FormData) {
  const sandi = String(form.get("sandi") ?? "");
  const ulang = String(form.get("ulang") ?? "");
  if (sandi.length < 8) redirect("/wali/akun?galat=1");
  if (sandi !== ulang) redirect("/wali/akun?galat=2");
  const sb = await supabaseServer();
  const { error } = await sb.auth.updateUser({ password: sandi });
  redirect(error ? "/wali/akun?galat=3" : "/wali/akun?ok=1");
}

