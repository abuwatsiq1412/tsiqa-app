import ExcelJS from "exceljs";
import type { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { ambilKas, bacaRentang } from "@/modules/keuangan/laporan";
import { waktuLengkap } from "@/lib/waktu";

export async function GET(req: NextRequest) {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const { dari, sampai } = bacaRentang(req.nextUrl.searchParams.get("dari") ?? undefined, req.nextUrl.searchParams.get("sampai") ?? undefined);
  const baris = await ambilKas(sb, dari, sampai);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Kas");
  ws.columns = [
    { header: "Waktu", key: "waktu", width: 26 }, { header: "No. Kwitansi", key: "nomor", width: 18 }, { header: "Santri", key: "santri", width: 26 },
    { header: "NIS", key: "nis", width: 12 }, { header: "Tagihan", key: "tagihan", width: 30 }, { header: "Metode", key: "metode", width: 12 },
    { header: "Penerima", key: "penerima", width: 20 }, { header: "Nominal", key: "nominal", width: 16, style: { numFmt: '#,##0' } }, { header: "Status", key: "status", width: 30 },
  ];
  ws.getRow(1).font = { bold: true };
  ws.views = [{ state: "frozen", ySplit: 1 }];
  baris.forEach((b) => ws.addRow({ waktu: waktuLengkap(b.tanggal), nomor: b.nomor, santri: b.santri, nis: b.nis, tagihan: b.tagihan, metode: b.metode,
    penerima: b.penerima, nominal: b.nominal, status: b.batal ? `Dibatalkan: ${b.alasan ?? ""}` : "Sah" }));
  if (baris.length > 0) {
    const t = ws.addRow({ santri: "TOTAL (tanpa yang dibatalkan)", nominal: { formula: `SUMIF(I2:I${baris.length + 1},"Sah",H2:H${baris.length + 1})` } });
    t.font = { bold: true };
  }
  const buf = Buffer.from(await wb.xlsx.writeBuffer());
  return new Response(new Uint8Array(buf), { headers: {
    "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Content-Disposition": `attachment; filename="kas-${dari}${dari === sampai ? "" : `_sd_${sampai}`}.xlsx"`,
  } });
}
