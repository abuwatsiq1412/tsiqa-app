import { cache } from "react";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { hariIni } from "@/lib/waktu";

export type Sb = Awaited<ReturnType<typeof supabaseServer>>;

export interface AnakWali {
  id: string; pondok_id: string; nama: string; panggilan: string | null; nis: string;
  jenis_kelamin: string; kamar_id: string | null; kelas_diniyah_id: string | null; status: string;
}

export const inisial = (nama: string) =>
  nama.trim().split(/\s+/).slice(0, 2).map((k) => k[0]?.toUpperCase() ?? "").join("") || "S";

export const namaPendek = (a: { nama: string; panggilan: string | null }) => a.panggilan || a.nama.split(/\s+/)[0];

/** Akun wali + anak-anaknya. Satu kali per permintaan (dipakai layout dan halaman). */
export const muatWali = cache(async () => {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/wali/masuk");
  const { data: tautan } = await sb.from("wali_akun").select("santri_id").eq("user_id", user.id);
  if (!tautan?.length) redirect("/wali/masuk?galat=2");
  const { data } = await sb
    .from("santri")
    .select("id, pondok_id, nama, panggilan, nis, jenis_kelamin, kamar_id, kelas_diniyah_id, status")
    .in("id", tautan.map((t) => t.santri_id as string))
    .in("status", ["aktif", "skorsing"])
    .order("nama");
  return { sb, user, anak: (data ?? []) as AnakWali[] };
});

export function pilihAnak(anak: AnakWali[], a?: string) {
  return anak.find((x) => x.id === a) ?? anak[0] ?? null;
}

/** Tautan internal yang membawa pilihan anak. */
export const tautan = (path: string, anakId: string, ekstra = "") =>
  `${path}?a=${anakId}${ekstra ? `&${ekstra}` : ""}`;

export type StatusT = "lunas" | "terlambat" | "cicilan" | "belum" | "menunggu";

export function statusTagihan(
  t: { nominal: number; terbayar: number; jatuh_tempo: string },
  menunggu = false,
): StatusT {
  if (Number(t.terbayar) >= Number(t.nominal)) return "lunas";
  if (menunggu) return "menunggu";
  if (t.jatuh_tempo < hariIni()) return "terlambat";
  return Number(t.terbayar) > 0 ? "cicilan" : "belum";
}

export const GAYA: Record<StatusT, { label: string; chip: string; teks: string }> = {
  lunas: { label: "Lunas", chip: "bg-lunas-bg text-lunas", teks: "text-lunas" },
  cicilan: { label: "Cicilan", chip: "bg-cicilan-bg text-cicilan", teks: "text-cicilan" },
  belum: { label: "Belum bayar", chip: "bg-surface-soft text-muted", teks: "text-muted" },
  terlambat: { label: "Terlambat", chip: "bg-belum-bg text-belum", teks: "text-belum" },
  menunggu: { label: "Menunggu verifikasi", chip: "bg-gold-pale text-gold-ink", teks: "text-gold-ink" },
};

export async function dataAnak(sb: Sb, a: AnakWali) {
  const [t, p, k, kamar, kelas, pondok, peng, juz, setoran, izin] = await Promise.all([
    sb.from("tagihan")
      .select("id, kode, judul, nominal, terbayar, sisa, jatuh_tempo, status, created_at")
      .eq("santri_id", a.id).order("jatuh_tempo", { ascending: false }),
    sb.from("pembayaran")
      .select("id, tagihan_id, nominal, tanggal, metode, nomor_kwitansi")
      .eq("santri_id", a.id).is("dibatalkan_pada", null).order("tanggal", { ascending: false }),
    sb.from("konfirmasi_transfer")
      .select("id, tagihan_id, nominal, status, alasan_tolak, created_at, diproses_pada")
      .eq("santri_id", a.id).order("created_at", { ascending: false }),
    a.kamar_id ? sb.from("kamar").select("nama").eq("id", a.kamar_id).maybeSingle() : Promise.resolve({ data: null }),
    a.kelas_diniyah_id ? sb.from("kelas").select("nama").eq("id", a.kelas_diniyah_id).maybeSingle() : Promise.resolve({ data: null }),
    sb.from("pondok").select("nama, alamat, kota, telepon").eq("id", a.pondok_id).maybeSingle(),
    sb.from("keuangan_pengaturan").select("rekening_resmi").eq("pondok_id", a.pondok_id).maybeSingle(),
    sb.from("tahfidz_juz").select("juz, tanggal").eq("santri_id", a.id).order("juz"),
    sb.from("tahfidz_setoran")
      .select("tanggal, status, tambah_hafalan, ulang_hafalan")
      .eq("santri_id", a.id)
      .order("tanggal", { ascending: false })
      .limit(5),
    sb.from("perizinan_santri")
      .select("id, jenis, alasan, waktu_keluar, batas_kembali, waktu_kembali, status, menit_terlambat")
      .eq("santri_id", a.id)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);
  const tagihan = (t.data ?? []).map((x) => ({ ...x, nominal: Number(x.nominal), terbayar: Number(x.terbayar), sisa: Number(x.sisa) }));
  const konfirmasi = (k.data ?? []).map((x) => ({ ...x, nominal: Number(x.nominal) }));
  const menunggu = new Set(konfirmasi.filter((x) => x.status === "menunggu").map((x) => x.tagihan_id as string));
  return {
    tagihan,
    bayar: (p.data ?? []).map((x) => ({ ...x, nominal: Number(x.nominal) })),
    konfirmasi,
    menunggu,
    kamar: (kamar.data as { nama: string } | null)?.nama ?? null,
    kelas: (kelas.data as { nama: string } | null)?.nama ?? null,
    pondok: pondok.data as { nama: string; alamat: string | null; kota: string | null; telepon: string | null } | null,
    rekening: (peng.data as { rekening_resmi: string | null } | null)?.rekening_resmi ?? null,
    totalSisa: tagihan.reduce((s, x) => s + Math.max(0, x.sisa), 0),
    tahfidzJuz: (juz.data ?? []) as { juz: number; tanggal: string }[],
    tahfidzSetoran: (setoran.data ?? []) as {
      tanggal: string;
      status: string;
      tambah_hafalan: string | null;
      ulang_hafalan: string | null;
    }[],
    perizinan: (izin.data ?? []) as {
      id: string;
      jenis: string;
      alasan: string;
      waktu_keluar: string;
      batas_kembali: string;
      waktu_kembali: string | null;
      status: string;
      menit_terlambat: number;
    }[],
  };
}

