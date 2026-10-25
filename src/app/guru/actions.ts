"use server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { pesanGalat } from "@/lib/format";

export async function keluarGuru() {
  const sb = await supabaseServer();
  await sb.auth.signOut();
  redirect("/guru/masuk");
}

export interface HasilSimpan { ok: boolean; galat?: string; n?: number }

/** Dipanggil dari HP (juga saat antrean offline dikirim ulang). Kepemilikan jadwal diperiksa di database. */
export async function simpanAbsensiGuru(jadwal: string, tanggal: string, data: { santri_id: string; status: string }[]): Promise<HasilSimpan> {
  const sb = await supabaseServer();
  const { data: n, error } = await sb.rpc("simpan_absensi", { p_jadwal: jadwal, p_tanggal: tanggal, p_data: data });
  return error ? { ok: false, galat: pesanGalat(error.message) } : { ok: true, n: Number(n) };
}

export async function simpanNilaiGuru(form: FormData) {
  const sb = await supabaseServer();
  const jadwal = String(form.get("jadwal")), jenis = String(form.get("jenis"));
  const data = [...form.entries()].filter(([k, v]) => k.startsWith("n_") && String(v).trim() !== "")
    .map(([k, v]) => ({ santri_id: k.slice(2), nilai: Number(String(v).replace(",", ".")) }));
  const balik = `/guru/nilai/${jadwal}?j=${jenis}`;
  if (data.some((d) => !Number.isFinite(d.nilai) || d.nilai < 0 || d.nilai > 100)) redirect(`${balik}&galat=${encodeURIComponent("Nilai harus 0–100.")}`);
  const { error } = await sb.rpc("simpan_nilai", { p_jadwal: jadwal, p_jenis: jenis, p_data: data });
  redirect(error ? `${balik}&galat=${encodeURIComponent(pesanGalat(error.message))}` : `${balik}&ok=1`);
}
