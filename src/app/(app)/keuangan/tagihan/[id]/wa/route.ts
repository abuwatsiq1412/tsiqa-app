import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { linkWaTagihan } from "@/modules/keuangan/wa";

// Membuka WhatsApp dengan pesan tagihan siap kirim, lalu mencatat waktu pengingat.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new NextResponse("Tidak ditemukan", { status: 404 });
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/masuk", req.url));

  const { data: t } = await sb.from("tagihan").select("*").eq("id", id).maybeSingle();
  if (!t) return new NextResponse("Tidak ditemukan", { status: 404 });
  const [{ data: s }, { data: p }, { data: k }] = await Promise.all([
    sb.from("santri").select("nama, nis, nama_wali, no_wa_wali").eq("id", t.santri_id).single(),
    sb.from("pondok").select("nama, nama_bendahara").eq("id", t.pondok_id).single(),
    sb.from("keuangan_pengaturan").select("rekening_resmi").maybeSingle(),
  ]);
  if (!s || !p) return new NextResponse("Tidak ditemukan", { status: 404 });

  // Hanya admin/bendahara yang boleh menulis tagihan; bagi staf TU pencatatan ini diabaikan.
  await sb.from("tagihan").update({ wa_terakhir: new Date().toISOString() }).eq("id", id);

  return NextResponse.redirect(linkWaTagihan({
    namaWali: s.nama_wali, namaSantri: s.nama, nis: s.nis, noWa: s.no_wa_wali, namaPondok: p.nama, namaBendahara: p.nama_bendahara,
    rekening: k?.rekening_resmi, judul: t.judul, kode: t.kode, nominal: Number(t.nominal), terbayar: Number(t.terbayar), jatuhTempo: t.jatuh_tempo,
  }));
}
