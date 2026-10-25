"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bolehAksesModul, konteks } from "@/lib/konteks";
import { pesanGalat } from "@/lib/format";

const q = encodeURIComponent;

async function wajibAksesTahfidz() {
  const ctx = await konteks();
  if (!bolehAksesModul(ctx.peran, ctx.aksesModul, "tahfidz")) {
    redirect(`/tahfidz?galat=${q(pesanGalat("TIDAK_BERHAK"))}`);
  }
  return ctx;
}

function pesanDbTahfidz(err: { message?: string } | null): string {
  const msg = err?.message ?? "";
  if (/tahfidz_halaqah|tahfidz_anggota|tahfidz_setoran|tahfidz_juz|relation .* does not exist/i.test(msg)) {
    return "Tabel Tahfidz belum dibuat di Supabase. Jalankan file supabase/migrations/0013_tahfidz.sql di SQL Editor Supabase.";
  }
  return pesanGalat(msg);
}

export async function simpanSetoranMassal(form: FormData) {
  const { sb, pondokId } = await wajibAksesTahfidz();
  const tanggal = String(form.get("tanggal") ?? "").trim() || new Date().toISOString().slice(0, 10);
  const halaqahId = String(form.get("halaqah_id") ?? "").trim();
  const daftarSantriId = form.getAll("santri_id").map(String).filter(Boolean);

  if (daftarSantriId.length === 0) {
    redirect(`/tahfidz?halaqah=${q(halaqahId)}&tanggal=${q(tanggal)}&galat=${q("Tidak ada santri untuk disimpan.")}`);
  }

  const {
    data: { user },
  } = await sb.auth.getUser();

  const baris = daftarSantriId.map((santriId) => {
    const statusRaw = String(form.get(`status_${santriId}`) ?? "hadir");
    const status = ["hadir", "izin", "sakit", "alpa"].includes(statusRaw) ? statusRaw : "hadir";
    const tambah = String(form.get(`tambah_${santriId}`) ?? "").trim() || null;
    const ulang = String(form.get(`ulang_${santriId}`) ?? "").trim() || null;

    // Bila tambah atau ulang hafalan diisi, otomatis pastikan status hadir
    const statusFinal = tambah || ulang ? "hadir" : status;

    return {
      pondok_id: pondokId,
      santri_id: santriId,
      tanggal,
      status: statusFinal,
      tambah_hafalan: tambah,
      ulang_hafalan: ulang,
      dicatat_oleh: user?.id ?? null,
    };
  });

  const { error } = await sb.from("tahfidz_setoran").upsert(baris, {
    onConflict: "pondok_id,santri_id,tanggal",
  });

  if (error) {
    redirect(`/tahfidz?halaqah=${q(halaqahId)}&tanggal=${q(tanggal)}&galat=${q(pesanDbTahfidz(error))}`);
  }

  revalidatePath("/tahfidz");
  redirect(
    `/tahfidz?halaqah=${q(halaqahId)}&tanggal=${q(tanggal)}&ok=${q(
      `Absensi & setoran hafalan (${baris.length} santri) berhasil disimpan.`
    )}`
  );
}

export async function catatKenaikanJuz(form: FormData) {
  const { sb, pondokId } = await wajibAksesTahfidz();
  const santriId = String(form.get("santri_id") ?? "").trim();
  const juz = Number(form.get("juz") ?? 0);
  const tanggal = String(form.get("tanggal") ?? "").trim() || new Date().toISOString().slice(0, 10);
  const penguji = String(form.get("penguji") ?? "").trim() || null;
  const catatan = String(form.get("catatan") ?? "").trim() || null;

  if (!santriId || juz < 1 || juz > 30) {
    redirect(`/tahfidz/juz?galat=${q("Pilih santri dan nomor Juz (1–30) yang valid.")}`);
  }

  const { error } = await sb.from("tahfidz_juz").upsert(
    {
      pondok_id: pondokId,
      santri_id: santriId,
      juz,
      tanggal,
      penguji,
      catatan,
    },
    { onConflict: "pondok_id,santri_id,juz" }
  );

  if (error) redirect(`/tahfidz/juz?galat=${q(pesanDbTahfidz(error))}`);
  revalidatePath("/tahfidz/juz");
  redirect(`/tahfidz/juz?ok=${q(`Alhamdulillah, kelulusan Juz ${juz} berhasil dicatat.`)}`);
}

export async function hapusKenaikanJuz(form: FormData) {
  const { sb, pondokId } = await wajibAksesTahfidz();
  const id = String(form.get("id") ?? "");
  const { error } = await sb.from("tahfidz_juz").delete().eq("id", id).eq("pondok_id", pondokId);
  if (error) redirect(`/tahfidz/juz?galat=${q(pesanDbTahfidz(error))}`);
  revalidatePath("/tahfidz/juz");
  redirect(`/tahfidz/juz?ok=${q("Catatan juz dihapus.")}`);
}

export async function tambahHalaqah(form: FormData) {
  const { sb, pondokId } = await wajibAksesTahfidz();
  const nama = String(form.get("nama") ?? "").trim();
  const pengampu = String(form.get("pengampu") ?? "").trim() || null;
  const target = String(form.get("target") ?? "").trim() || null;

  if (!nama) redirect(`/tahfidz/halaqah?galat=${q("Nama kelompok halaqah wajib diisi.")}`);

  const { error } = await sb.from("tahfidz_halaqah").insert({
    pondok_id: pondokId,
    nama,
    pengampu,
    target,
  });

  if (error) redirect(`/tahfidz/halaqah?galat=${q(pesanDbTahfidz(error))}`);
  revalidatePath("/tahfidz/halaqah");
  revalidatePath("/tahfidz");
  redirect(`/tahfidz/halaqah?ok=${q(`Halaqah "${nama}" berhasil dibuat.`)}`);
}

export async function hapusHalaqah(form: FormData) {
  const { sb, pondokId } = await wajibAksesTahfidz();
  const id = String(form.get("id") ?? "");
  const { error } = await sb.from("tahfidz_halaqah").delete().eq("id", id).eq("pondok_id", pondokId);
  if (error) redirect(`/tahfidz/halaqah?galat=${q(pesanDbTahfidz(error))}`);
  revalidatePath("/tahfidz/halaqah");
  revalidatePath("/tahfidz");
  redirect(`/tahfidz/halaqah?ok=${q("Kelompok halaqah dihapus.")}`);
}

export async function aturAnggotaHalaqah(form: FormData) {
  const { sb, pondokId } = await wajibAksesTahfidz();
  const halaqahId = String(form.get("halaqah_id") ?? "").trim();
  const daftarSantri = form.getAll("santri_id").map(String).filter(Boolean);

  if (!halaqahId || daftarSantri.length === 0) {
    redirect(`/tahfidz/halaqah?galat=${q("Pilih halaqah tujuan dan minimal satu santri.")}`);
  }

  const baris = daftarSantri.map((santriId) => ({
    pondok_id: pondokId,
    santri_id: santriId,
    halaqah_id: halaqahId,
  }));

  const { error } = await sb.from("tahfidz_anggota").upsert(baris, {
    onConflict: "pondok_id,santri_id",
  });

  if (error) redirect(`/tahfidz/halaqah?galat=${q(pesanDbTahfidz(error))}`);
  revalidatePath("/tahfidz/halaqah");
  revalidatePath("/tahfidz");
  redirect(`/tahfidz/halaqah?ok=${q(`${baris.length} santri ditempatkan ke halaqah.`)}`);
}
