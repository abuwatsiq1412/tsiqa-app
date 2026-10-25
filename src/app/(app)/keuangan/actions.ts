"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { konteks } from "@/lib/konteks";
import { pesanGalat } from "@/lib/format";
import { NAMA_BULAN } from "@/lib/waktu";
import { kabarkanWali, kabarkanWaliPondok } from "@/lib/push";

const q = encodeURIComponent;
/** Hanya izinkan kembali ke halaman keuangan di aplikasi ini. */
const balikAman = (v: FormDataEntryValue | null, cadangan: string) => (typeof v === "string" && /^\/keuangan(\/[a-z0-9-]+)*$/.test(v) ? v : cadangan);
const sambung = (path: string, kunci: string, nilai: string) => `${path}${path.includes("?") ? "&" : "?"}${kunci}=${q(nilai)}`;

export async function catatBayar(form: FormData) {
  const { sb } = await konteks();
  const balik = balikAman(form.get("balik"), "/keuangan/pembayaran");
  const p = z.object({
    tagihan: z.string().uuid("Pilih tagihan"), nominal: z.coerce.number().int().positive("Nominal belum valid"),
    metode: z.enum(["tunai", "transfer", "qris"]),
  }).safeParse({ tagihan: form.get("tagihan"), nominal: form.get("nominal"), metode: form.get("metode") });
  if (!p.success) redirect(sambung(balik, "galat", p.error.issues[0].message));

  const { data, error } = await sb.rpc("catat_pembayaran", { p_tagihan: p.data.tagihan, p_nominal: p.data.nominal, p_metode: p.data.metode });
  if (error) redirect(sambung(balik, "galat", pesanGalat(error.message)));
  const b = data as { id: string; santri_id: string; nominal: number };
  await kabarkanWali([b.santri_id], { judul: "Pembayaran diterima", isi: `Pembayaran Rp${Number(b.nominal).toLocaleString("id-ID")} sudah tercatat.`, url: "/wali/riwayat" });
  redirect(`/keuangan/kwitansi/${b.id}?baru=1`);
}

export async function batalkanBayar(form: FormData) {
  const { sb } = await konteks();
  const balik = balikAman(form.get("balik"), "/keuangan/laporan");
  const { error } = await sb.rpc("batalkan_pembayaran", { p_id: String(form.get("id")), p_alasan: String(form.get("alasan") ?? "") });
  redirect(error ? sambung(balik, "galat", pesanGalat(error.message)) : sambung(balik, "ok", "Pembayaran dibatalkan."));
}

export async function terbitkanTagihan(form: FormData) {
  const { sb, pondokId } = await konteks();
  const p = z.object({
    bulan: z.coerce.number().int().min(1).max(12), tahun: z.coerce.number().int().min(2020).max(2100),
    jatuh_tempo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal jatuh tempo belum valid"),
    judul: z.string().trim().optional(),
    nominal: z.preprocess((v) => (v === "" || v == null ? undefined : Number(v)), z.number().int().min(1, "Nominal belum valid").optional()),
  }).safeParse(Object.fromEntries(form.entries()));
  if (!p.success) redirect(`/keuangan/tagihan?galat=${q(p.error.issues[0].message)}`);

  if (p.data.nominal === undefined) {
    const { data } = await sb.from("keuangan_pengaturan").select("syahriyah_default").maybeSingle();
    if (!data || Number(data.syahriyah_default) <= 0) redirect(`/keuangan/tagihan?galat=${q("Isi syahriyah standar di Pengaturan keuangan lebih dahulu, atau isi nominal pada form ini.")}`);
  }
  const judul = p.data.judul || `Syahriyah ${NAMA_BULAN[p.data.bulan - 1]} ${p.data.tahun}`;
  const { data, error } = await sb.rpc("terbitkan_tagihan_massal", {
    p_pondok: pondokId, p_judul: judul, p_bulan: p.data.bulan, p_tahun: p.data.tahun, p_jatuh_tempo: p.data.jatuh_tempo,
    p_nominal: p.data.nominal ?? null,
  });
  if (error) redirect(`/keuangan/tagihan?galat=${q(pesanGalat(error.message))}`);
  const n = Number(data);
  if (n > 0) await kabarkanWaliPondok(pondokId, { judul: "Tagihan baru", isi: judul, url: "/wali/tagihan" });
  redirect(`/keuangan/tagihan?ok=${q(n === 0 ? "Semua santri aktif sudah memiliki tagihan untuk bulan itu." : `${n} tagihan diterbitkan: ${judul}.`)}`);
}

