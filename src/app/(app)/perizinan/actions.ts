"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bolehAksesModul, konteks } from "@/lib/konteks";
import { pesanGalat } from "@/lib/format";

const q = encodeURIComponent;

async function wajibAksesPerizinan() {
  const ctx = await konteks();
  if (!bolehAksesModul(ctx.peran, ctx.aksesModul, "perizinan")) {
    redirect(`/perizinan?galat=${q(pesanGalat("TIDAK_BERHAK"))}`);
  }
  return ctx;
}

function pesanDbPerizinan(err: { message?: string } | null): string {
  const msg = err?.message ?? "";
  if (/perizinan_santri|master_pelanggaran|catatan_pelanggaran|relation .* does not exist/i.test(msg)) {
    return "Tabel Perizinan & Keamanan belum dibuat di Supabase. Jalankan file supabase/migrations/0012_perizinan_keamanan.sql di SQL Editor Supabase.";
  }
  return pesanGalat(msg);
}

export async function catatIzinKeluar(form: FormData) {
  const { sb, pondokId } = await wajibAksesPerizinan();
  const santriId = String(form.get("santri_id") ?? "").trim();
  const jenisInput = String(form.get("jenis") ?? "pulang");
  const jenis = ["keluar", "pulang", "sakit", "libur"].includes(jenisInput)
    ? jenisInput
    : "pulang";
  const alasan = String(form.get("alasan") ?? "").trim();
  const penjemput = String(form.get("penjemput") ?? "").trim() || null;
  const waktuKeluarRaw = String(form.get("waktu_keluar") ?? "").trim();
  const batasKembaliRaw = String(form.get("batas_kembali") ?? "").trim();

  if (!santriId || !alasan || !batasKembaliRaw) {
    redirect(`/perizinan?galat=${q("Santri, alasan izin, dan batas waktu kembali wajib diisi.")}`);
  }

  const waktuKeluar = waktuKeluarRaw ? new Date(waktuKeluarRaw) : new Date();
  const batasKembali = new Date(batasKembaliRaw);

  if (isNaN(batasKembali.getTime()) || batasKembali <= waktuKeluar) {
    redirect(`/perizinan?galat=${q("Batas waktu kembali harus setelah waktu keluar.")}`);
  }

  const {
    data: { user },
  } = await sb.auth.getUser();

  const { error } = await sb.from("perizinan_santri").insert({
    pondok_id: pondokId,
    santri_id: santriId,
    jenis,
    alasan,
    penjemput,
    waktu_keluar: waktuKeluar.toISOString(),
    batas_kembali: batasKembali.toISOString(),
    status: "keluar",
    dicatat_oleh: user?.id ?? null,
  });

  if (error) redirect(`/perizinan?galat=${q(pesanDbPerizinan(error))}`);
  revalidatePath("/perizinan");
  revalidatePath("/perizinan/keterlambatan");
  redirect(`/perizinan?ok=${q("Izin keluar santri berhasil dicatat (status: Sedang di Luar).")}`);
}

export async function tandaiSantriKembali(form: FormData) {
  const { sb, pondokId } = await wajibAksesPerizinan();
  const id = String(form.get("id") ?? "");
  const waktuKembaliRaw = String(form.get("waktu_kembali") ?? "").trim();
  const tindakLanjut = String(form.get("tindak_lanjut") ?? "").trim() || null;

  const { data: izin, error: e1 } = await sb
    .from("perizinan_santri")
    .select("id, batas_kembali")
    .eq("id", id)
    .eq("pondok_id", pondokId)
    .maybeSingle();

  if (e1 || !izin) {
    redirect(`/perizinan?galat=${q(e1 ? pesanDbPerizinan(e1) : "Data izin tidak ditemukan.")}`);
  }

  const waktuKembali = waktuKembaliRaw ? new Date(waktuKembaliRaw) : new Date();
  const batas = new Date(izin.batas_kembali);
  const selisihMenit = Math.max(0, Math.round((waktuKembali.getTime() - batas.getTime()) / 60000));
  const terlambat = selisihMenit > 0;

  const { error } = await sb
    .from("perizinan_santri")
    .update({
      waktu_kembali: waktuKembali.toISOString(),
      status: terlambat ? "kembali_terlambat" : "kembali_tepat",
      menit_terlambat: selisihMenit,
      tindak_lanjut: tindakLanjut,
    })
    .eq("id", id)
    .eq("pondok_id", pondokId);

  if (error) redirect(`/perizinan?galat=${q(pesanDbPerizinan(error))}`);
  revalidatePath("/perizinan");
  revalidatePath("/perizinan/keterlambatan");
  redirect(
    `/perizinan?ok=${q(
      terlambat
        ? `Santri tercatat kembali (Terlambat ${ Math.floor(selisihMenit / 60) } jam ${ selisihMenit % 60 } menit). Masuk ke Laporan Keterlambatan.`
        : "Alhamdulillah, santri tercatat kembali tepat waktu."
    )}`
  );
}

export async function simpanTindakLanjutTerlambat(form: FormData) {
  const { sb, pondokId } = await wajibAksesPerizinan();
  const id = String(form.get("id") ?? "");
  const tindakLanjut = String(form.get("tindak_lanjut") ?? "").trim() || null;

  const { error } = await sb
    .from("perizinan_santri")
    .update({ tindak_lanjut: tindakLanjut })
    .eq("id", id)
    .eq("pondok_id", pondokId);

  if (error) redirect(`/perizinan/keterlambatan?galat=${q(pesanDbPerizinan(error))}`);
  revalidatePath("/perizinan/keterlambatan");
  redirect(`/perizinan/keterlambatan?ok=${q("Catatan pembinaan keterlambatan disimpan.")}`);
}

export async function hapusIzinSantri(form: FormData) {
  const { sb, pondokId } = await wajibAksesPerizinan();
  const id = String(form.get("id") ?? "");
  const { error } = await sb
    .from("perizinan_santri")
    .delete()
    .eq("id", id)
    .eq("pondok_id", pondokId);

  if (error) redirect(`/perizinan?galat=${q(pesanDbPerizinan(error))}`);
  revalidatePath("/perizinan");
  revalidatePath("/perizinan/keterlambatan");
  redirect(`/perizinan?ok=${q("Data perizinan dihapus.")}`);
}

export async function catatPelanggaranSantri(form: FormData) {
  const { sb, pondokId } = await wajibAksesPerizinan();
  const santriId = String(form.get("santri_id") ?? "").trim();
  const namaPelanggaran = String(form.get("nama_pelanggaran") ?? "").trim();
  const kategoriInput = String(form.get("kategori") ?? "ringan");
  const kategori = ["ringan", "sedang", "berat"].includes(kategoriInput)
    ? kategoriInput
    : "ringan";
  const poin = Math.max(0, Number(form.get("poin") ?? 5));
  const tanggal = String(form.get("tanggal") ?? "").trim() || new Date().toISOString().slice(0, 10);
  const tindakan = String(form.get("tindakan") ?? "").trim() || null;
  const catatan = String(form.get("catatan") ?? "").trim() || null;

  if (!santriId || !namaPelanggaran) {
    redirect(`/perizinan/pelanggaran?galat=${q("Santri dan jenis pelanggaran wajib diisi.")}`);
  }

  const {
    data: { user },
  } = await sb.auth.getUser();

  const { error } = await sb.from("catatan_pelanggaran").insert({
    pondok_id: pondokId,
    santri_id: santriId,
    nama_pelanggaran: namaPelanggaran,
    kategori,
    poin,
    tanggal,
    tindakan,
    catatan,
    dicatat_oleh: user?.id ?? null,
  });

  if (error) redirect(`/perizinan/pelanggaran?galat=${q(pesanDbPerizinan(error))}`);
  revalidatePath("/perizinan/pelanggaran");
  redirect(`/perizinan/pelanggaran?ok=${q("Catatan pelanggaran & pembinaan santri disimpan.")}`);
}

export async function hapusPelanggaranSantri(form: FormData) {
  const { sb, pondokId } = await wajibAksesPerizinan();
  const id = String(form.get("id") ?? "");
  const { error } = await sb
    .from("catatan_pelanggaran")
    .delete()
    .eq("id", id)
    .eq("pondok_id", pondokId);

  if (error) redirect(`/perizinan/pelanggaran?galat=${q(pesanDbPerizinan(error))}`);
  revalidatePath("/perizinan/pelanggaran");
  redirect(`/perizinan/pelanggaran?ok=${q("Catatan pelanggaran dihapus.")}`);
}
