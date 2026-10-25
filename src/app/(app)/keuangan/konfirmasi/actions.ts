"use server";
import { redirect } from "next/navigation";
import { konteks } from "@/lib/konteks";
import { pesanGalat } from "@/lib/format";
import { kabarkanWali } from "@/lib/push";

const q = encodeURIComponent;

export async function prosesKonfirmasi(form: FormData) {
  const { sb } = await konteks();
  const id = String(form.get("id") ?? "");
  const terima = form.get("keputusan") === "terima";
  const alasan = String(form.get("alasan") ?? "").trim();
  const { data, error } = await sb.rpc("proses_konfirmasi", { p_id: id, p_terima: terima, p_alasan: terima ? null : alasan });
  if (error) redirect(`/keuangan/konfirmasi?galat=${q(pesanGalat(error.message))}`);
  const k = data as { santri_id: string; nominal: number };
  await kabarkanWali([k.santri_id], terima
    ? { judul: "Pembayaran diterima", isi: `Transfer Rp${Number(k.nominal).toLocaleString("id-ID")} sudah dicek bendahara.`, url: "/wali/riwayat" }
    : { judul: "Konfirmasi ditolak", isi: alasan || "Silakan kirim ulang bukti transfer.", url: "/wali/tagihan" });
  redirect(`/keuangan/konfirmasi?ok=${q(terima ? "Pembayaran dicatat dan kwitansi terbit." : "Konfirmasi ditolak, wali diberi kabar.")}`);
}
