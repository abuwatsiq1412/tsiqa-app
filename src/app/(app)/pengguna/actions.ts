"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { DAFTAR_AKSES_MODUL, konteks } from "@/lib/konteks";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { pesanGalat } from "@/lib/format";
import { pesanZod } from "@/lib/santri-schema";

const q = encodeURIComponent;
const KODE_MODUL_SAH = new Set(DAFTAR_AKSES_MODUL.map((m) => m.kode));

const skema = z.object({
  email: z.string().trim().toLowerCase().email("Email belum valid"),
  nama: z.string().trim().min(1, "Nama wajib diisi"),
  tingkat: z.enum(["admin", "pengurus"]).default("pengurus"),
});

function saringModul(form: FormData, tingkat: "admin" | "pengurus"): string[] {
  if (tingkat === "admin") return DAFTAR_AKSES_MODUL.map((m) => m.kode);
  const dipilih = form
    .getAll("akses_modul")
    .map(String)
    .filter((k) => KODE_MODUL_SAH.has(k));
  return dipilih.length > 0 ? dipilih : ["core"];
}

export async function undangPengguna(form: FormData) {
  const { sb, pondokId, peran } = await konteks();
  // Kunci service role melewati RLS, jadi peran pemanggil WAJIB diperiksa di sini.
  if (peran !== "admin") redirect(`/pengguna?galat=${q(pesanGalat("TIDAK_BERHAK"))}`);

  const p = skema.safeParse({
    email: form.get("email"),
    nama: form.get("nama"),
    tingkat: form.get("tingkat") ?? "pengurus",
  });
  if (!p.success) redirect(`/pengguna?galat=${q(pesanZod(p.error))}`);

  const aksesModul = saringModul(form, p.data.tingkat);
  const peranDb =
    p.data.tingkat === "admin"
      ? "admin"
      : aksesModul.includes("keuangan")
      ? "bendahara"
      : "staf_tu";

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { data, error } = await supabaseAdmin().auth.admin.inviteUserByEmail(p.data.email, {
    redirectTo: `${site}/auth/konfirmasi`,
  });
  if (error || !data.user) {
    const sudah = /already|registered|exists/i.test(error?.message ?? "");
    redirect(
      `/pengguna?galat=${q(
        sudah
          ? "Email ini sudah terdaftar di TSIQA. Hubungi kami untuk menautkannya ke pondok Anda."
          : "Undangan belum dapat dikirim."
      )}`
    );
  }

  let { error: e2 } = await sb.from("anggota_pondok").insert({
    pondok_id: pondokId,
    user_id: data.user.id,
    peran: peranDb,
    nama: p.data.nama,
    akses_modul: aksesModul,
  });
  // Fallback bila migrasi 0010_peran_pengurus.sql belum dijalankan di database
  if (e2 && /akses_modul/i.test(e2.message)) {
    const retry = await sb.from("anggota_pondok").insert({
      pondok_id: pondokId,
      user_id: data.user.id,
      peran: peranDb,
      nama: p.data.nama,
    });
    e2 = retry.error;
  }
  if (e2) redirect(`/pengguna?galat=${q(pesanGalat(e2.message))}`);
  redirect(`/pengguna?ok=${q(`Undangan dikirim ke ${p.data.email}.`)}`);
}

export async function ubahPengguna(form: FormData) {
  const { sb, peran } = await konteks();
  if (peran !== "admin") redirect(`/pengguna?galat=${q(pesanGalat("TIDAK_BERHAK"))}`);
  const id = String(form.get("id"));
  const aksi = String(form.get("aksi"));

  if (aksi === "nonaktif" || aksi === "aktif") {
    const { error } = await sb
      .from("anggota_pondok")
      .update({ aktif: aksi === "aktif" })
      .eq("id", id);
    redirect(
      error ? `/pengguna?galat=${q(pesanGalat(error.message))}` : "/pengguna?ok=Status%20pengurus%20diperbarui."
    );
  }

  if (aksi === "akses") {
    const tingkat = form.get("tingkat") === "admin" ? "admin" : "pengurus";
    const aksesModul = saringModul(form, tingkat);
    const peranDb =
      tingkat === "admin"
        ? "admin"
        : aksesModul.includes("keuangan")
        ? "bendahara"
        : "staf_tu";

    let { error } = await sb
      .from("anggota_pondok")
      .update({ peran: peranDb, akses_modul: aksesModul })
      .eq("id", id);

    if (error && /akses_modul/i.test(error.message)) {
      const retry = await sb.from("anggota_pondok").update({ peran: peranDb }).eq("id", id);
      error = retry.error;
    }
    redirect(
      error
        ? `/pengguna?galat=${q(pesanGalat(error.message))}`
        : "/pengguna?ok=Hak%20akses%20modul%20berhasil%20disimpan."
    );
  }

  redirect(`/pengguna?galat=${q("Perubahan belum valid.")}`);
}

