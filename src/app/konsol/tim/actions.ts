"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { wajibStaf } from "@/lib/staf";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { pesanGalat } from "@/lib/format";

const q = encodeURIComponent;

async function cariPengguna(admin: SupabaseClient, email: string) {
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return null;
    const u = data.users.find((x) => x.email?.toLowerCase() === email);
    if (u) return u;
    if (data.users.length < 200) break;
  }
  return null;
}

/** Kunci service role melewati RLS, jadi pemanggil WAJIB staf TSIQA (wajibStaf) sebelum apa pun. */
export async function tambahStaf(form: FormData) {
  await wajibStaf();
  const p = z.string().trim().toLowerCase().email().safeParse(String(form.get("email")));
  if (!p.success) redirect(`/konsol/tim?galat=${q("Email belum valid.")}`);
  const email = p.data;

  const admin = supabaseAdmin();
  let user = await cariPengguna(admin, email);
  if (!user) {
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo: `${site}/auth/konfirmasi` });
    if (error || !data.user) redirect(`/konsol/tim?galat=${q("Undangan belum dapat dikirim.")}`);
    user = data.user;
  }
  const { error } = await admin.from("staf_tsiqa").upsert({ user_id: user.id }, { onConflict: "user_id" });
  redirect(`/konsol/tim?${error ? `galat=${q(pesanGalat(error.message))}` : `ok=${q(`${email} ditambahkan sebagai tim TSIQA.`)}`}`);
}

export async function hapusStaf(form: FormData) {
  const sb = await wajibStaf();
  const { data: { user } } = await sb.auth.getUser();
  const id = z.string().uuid().safeParse(String(form.get("id")));
  if (!id.success) redirect(`/konsol/tim?galat=${q("Data tidak valid.")}`);
  if (id.data === user?.id) redirect(`/konsol/tim?galat=${q("Anda tidak bisa mencabut akses akun sendiri.")}`);

  const admin = supabaseAdmin();
  const { count } = await admin.from("staf_tsiqa").select("user_id", { count: "exact", head: true });
  if ((count ?? 0) <= 1) redirect(`/konsol/tim?galat=${q("Tim harus memiliki setidaknya satu anggota.")}`);
  const { error } = await admin.from("staf_tsiqa").delete().eq("user_id", id.data);
  redirect(`/konsol/tim?${error ? `galat=${q(pesanGalat(error.message))}` : `ok=${q("Akses dicabut.")}`}`);
}
