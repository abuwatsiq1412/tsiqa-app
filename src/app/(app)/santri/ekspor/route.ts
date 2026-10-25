import ExcelJS from "exceljs";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const [{ data: santri }, { data: kamar }, { data: kelas }] = await Promise.all([
    sb.from("santri").select("*").order("nama").limit(10000),
    sb.from("kamar").select("id, nama"), sb.from("kelas").select("id, nama"),
  ]);
  const nm = new Map<string, string>([...(kamar ?? []), ...(kelas ?? [])].map((x) => [x.id, x.nama]));

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Santri");
  ws.columns = [
    ["NIS", "nis", 12], ["Nama Lengkap", "nama", 28], ["Jenis Kelamin", "jenis_kelamin", 14], ["Mukim/Kalong", "tempat_tinggal", 14],
    ["Status", "status", 10], ["Tanggal Lahir", "tanggal_lahir", 14], ["Nama Wali", "nama_wali", 24], ["No. WhatsApp Wali", "no_wa_wali", 18],
    ["Alamat Asal", "alamat_asal", 28], ["Kota Asal", "kota_asal", 16], ["Kamar", "kamar", 18], ["Kelas Diniyah", "diniyah", 18], ["Kelas Formal", "formal", 18],
  ].map(([header, key, width]) => ({ header: header as string, key: key as string, width: width as number }));
  ws.getRow(1).font = { bold: true };
  ws.views = [{ state: "frozen", ySplit: 1 }];
  (santri ?? []).forEach((s) => ws.addRow({
    ...s, no_wa_wali: s.no_wa_wali, kamar: nm.get(s.kamar_id) ?? "", diniyah: nm.get(s.kelas_diniyah_id) ?? "", formal: nm.get(s.kelas_formal_id) ?? "",
  }));

  const buf = Buffer.from(await wb.xlsx.writeBuffer());
  const tgl = new Date().toISOString().slice(0, 10);
  return new Response(new Uint8Array(buf), { headers: {
    "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Content-Disposition": `attachment; filename="data-santri-${tgl}.xlsx"`,
  } });
}
