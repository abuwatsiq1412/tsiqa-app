import ExcelJS from "exceljs";
import type { NextRequest } from "next/server";
import { konteks } from "@/lib/konteks";

export async function GET(req: NextRequest) {
  const { sb, pondokId, peran, nama } = await konteks();
  if (peran !== "admin") {
    return new Response("Hanya Admin Utama pondok yang berhak mengunduh backup penuh.", {
      status: 403,
    });
  }

  const format = req.nextUrl.searchParams.get("format") === "json" ? "json" : "xlsx";

  // Semua query dikunci ganda: RLS Supabase + filter eksplisit .eq("pondok_id", pondokId)
  const [
    { data: pondok },
    { data: tahunAjaran },
    { data: kamar },
    { data: kelas },
    { data: santri },
    { data: tagihan },
    { data: pembayaran },
    { data: keringanan },
    { data: guru },
    { data: mapel },
    { data: jadwal },
    { data: nilai },
  ] = await Promise.all([
    sb.from("pondok").select("*").eq("id", pondokId).maybeSingle(),
    sb.from("tahun_ajaran").select("*").eq("pondok_id", pondokId).order("nama", { ascending: false }),
    sb.from("kamar").select("*").eq("pondok_id", pondokId).order("kode"),
    sb.from("kelas").select("*").eq("pondok_id", pondokId).order("kode"),
    sb.from("santri").select("*").eq("pondok_id", pondokId).order("nama").limit(10000),
    sb.from("tagihan").select("*").eq("pondok_id", pondokId).order("created_at", { ascending: false }).limit(20000),
    sb.from("pembayaran").select("*").eq("pondok_id", pondokId).order("tanggal", { ascending: false }).limit(20000),
    sb.from("keringanan").select("*").eq("pondok_id", pondokId),
    sb.from("guru").select("*").eq("pondok_id", pondokId).order("nama"),
    sb.from("mapel").select("*").eq("pondok_id", pondokId).order("nama"),
    sb.from("jadwal").select("*").eq("pondok_id", pondokId).order("hari").order("jam_mulai"),
    sb.from("nilai").select("*").eq("pondok_id", pondokId).limit(30000),
  ]);

  const kodePondok = pondok?.kode ?? "pondok";
  const tgl = new Date().toISOString().slice(0, 10);

  if (format === "json") {
    const arsipJson = {
      meta: {
        generator: "TSIQA Pondok Backup System",
        diunduh_pada: new Date().toISOString(),
        diunduh_oleh: nama,
        pondok_id: pondokId,
        kode_pondok: kodePondok,
        nama_pondok: pondok?.nama ?? "",
      },
      pondok,
      tahun_ajaran: tahunAjaran ?? [],
      kamar: kamar ?? [],
      kelas: kelas ?? [],
      santri: santri ?? [],
      keuangan: {
        tagihan: tagihan ?? [],
        pembayaran: pembayaran ?? [],
        keringanan: keringanan ?? [],
      },
      akademik: {
        guru: guru ?? [],
        mapel: mapel ?? [],
        jadwal: jadwal ?? [],
        nilai: nilai ?? [],
      },
    };

    return new Response(JSON.stringify(arsipJson, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="backup-tsiqa-${kodePondok}-${tgl}.json"`,
      },
    });
  }

  // Format Excel Multi-Sheet (.xlsx)
  const petaKamar = new Map<string, string>((kamar ?? []).map((k) => [k.id, k.nama]));
  const petaKelas = new Map<string, string>((kelas ?? []).map((k) => [k.id, k.nama]));
  const petaSantri = new Map<string, { nis: string; nama: string }>(
    (santri ?? []).map((s) => [s.id, { nis: s.nis, nama: s.nama }])
  );
  const petaMapel = new Map<string, string>((mapel ?? []).map((m) => [m.id, m.nama]));
  const petaTa = new Map<string, string>(
    (tahunAjaran ?? []).map((t) => [t.id, `${t.nama} (${t.semester})`])
  );

  const wb = new ExcelJS.Workbook();
  wb.creator = "TSIQA";
  wb.created = new Date();

  // 1. Sheet Info Backup
  const wsInfo = wb.addWorksheet("Info Backup");
  wsInfo.columns = [
    { header: "Keterangan", key: "k", width: 28 },
    { header: "Nilai", key: "v", width: 45 },
  ];
  wsInfo.getRow(1).font = { bold: true };
  [
    ["Nama Pondok", pondok?.nama ?? "-"],
    ["Kode Pondok", kodePondok],
    ["NSPP", pondok?.nspp ?? "-"],
    ["Kota", pondok?.kota ?? "-"],
    ["Tanggal Unduh Backup", new Date().toLocaleString("id-ID")],
    ["Diunduh Oleh", `${nama} (Admin Utama)`],
    ["Jumlah Santri", String((santri ?? []).length)],
    ["Jumlah Kamar", String((kamar ?? []).length)],
    ["Jumlah Kelas", String((kelas ?? []).length)],
    ["Jumlah Data Tagihan", String((tagihan ?? []).length)],
    ["Jumlah Transaksi Pembayaran", String((pembayaran ?? []).length)],
  ].forEach(([k, v]) => wsInfo.addRow({ k, v }));

  // 2. Sheet Santri
  const wsSantri = wb.addWorksheet("Santri");
  wsSantri.columns = [
    { header: "NIS", key: "nis", width: 14 },
    { header: "NIK", key: "nik", width: 18 },
    { header: "Nama Lengkap", key: "nama", width: 28 },
    { header: "L/P", key: "jenis_kelamin", width: 6 },
    { header: "Status", key: "status", width: 12 },
    { header: "Mukim/Kalong", key: "tempat_tinggal", width: 14 },
    { header: "Tahun Masuk", key: "tahun_masuk", width: 12 },
    { header: "Tempat Lahir", key: "tempat_lahir", width: 16 },
    { header: "Tanggal Lahir", key: "tanggal_lahir", width: 14 },
    { header: "Kamar Asrama", key: "kamar", width: 20 },
    { header: "Kelas Diniyah", key: "diniyah", width: 20 },
    { header: "Kelas Formal", key: "formal", width: 20 },
    { header: "Nama Ayah", key: "nama_ayah", width: 22 },
    { header: "Nama Ibu", key: "nama_ibu", width: 22 },
    { header: "Nama Wali", key: "nama_wali", width: 22 },
    { header: "No. WA Wali", key: "no_wa_wali", width: 18 },
    { header: "Kota Asal", key: "kota_asal", width: 16 },
    { header: "Alamat Asal", key: "alamat_asal", width: 32 },
  ];
  wsSantri.getRow(1).font = { bold: true };
  wsSantri.views = [{ state: "frozen", ySplit: 1 }];
  (santri ?? []).forEach((s) =>
    wsSantri.addRow({
      ...s,
      kamar: petaKamar.get(s.kamar_id) ?? "",
      diniyah: petaKelas.get(s.kelas_diniyah_id) ?? "",
      formal: petaKelas.get(s.kelas_formal_id) ?? "",
    })
  );

  // 3. Sheet Kamar & Kelas
  const wsKamarKelas = wb.addWorksheet("Kamar & Kelas");
  wsKamarKelas.columns = [
    { header: "Kategori", key: "kat", width: 14 },
    { header: "Kode", key: "kode", width: 14 },
    { header: "Nama", key: "nama", width: 26 },
    { header: "Jenis / Tingkat", key: "jenis", width: 18 },
    { header: "Musyrif / Wali Kelas", key: "pj", width: 24 },
    { header: "Kapasitas", key: "kapasitas", width: 12 },
  ];
  wsKamarKelas.getRow(1).font = { bold: true };
  (kamar ?? []).forEach((k) =>
    wsKamarKelas.addRow({
      kat: "Kamar Asrama",
      kode: k.kode,
      nama: k.nama,
      jenis: `${k.jenis}${k.komplek ? ` (${k.komplek})` : ""}`,
      pj: k.musyrif ?? "",
      kapasitas: k.kapasitas,
    })
  );
  (kelas ?? []).forEach((k) =>
    wsKamarKelas.addRow({
      kat: "Kelas",
      kode: k.kode,
      nama: k.nama,
      jenis: `${k.jenis}${k.tingkat ? ` · ${k.tingkat}` : ""}`,
      pj: k.wali_kelas ?? "",
      kapasitas: "",
    })
  );

  // 4. Sheet Tagihan
  const wsTagihan = wb.addWorksheet("Tagihan");
  wsTagihan.columns = [
    { header: "NIS", key: "nis", width: 14 },
    { header: "Nama Santri", key: "santri", width: 26 },
    { header: "Judul / Periode", key: "judul", width: 28 },
    { header: "Bulan", key: "bulan", width: 12 },
    { header: "Nominal Tagihan", key: "nominal", width: 18, style: { numFmt: "#,##0" } },
    { header: "Potongan", key: "potongan", width: 16, style: { numFmt: "#,##0" } },
    { header: "Sudah Dibayar", key: "terbayar", width: 18, style: { numFmt: "#,##0" } },
    { header: "Status", key: "status", width: 14 },
    { header: "Jatuh Tempo", key: "jatuh_tempo", width: 14 },
  ];
  wsTagihan.getRow(1).font = { bold: true };
  wsTagihan.views = [{ state: "frozen", ySplit: 1 }];
  (tagihan ?? []).forEach((t) => {
    const info = petaSantri.get(t.santri_id);
    wsTagihan.addRow({
      nis: info?.nis ?? "",
      santri: info?.nama ?? "",
      judul: t.judul ?? t.keterangan ?? "Tagihan",
      bulan: t.periode ?? t.bulan ?? "",
      nominal: Number(t.nominal ?? 0),
      potongan: Number(t.potongan ?? 0),
      terbayar: Number(t.terbayar ?? 0),
      status: t.status ?? "",
      jatuh_tempo: t.jatuh_tempo ?? "",
    });
  });

  // 5. Sheet Pembayaran (Buku Kas)
  const wsBayar = wb.addWorksheet("Pembayaran");
  wsBayar.columns = [
    { header: "Tanggal", key: "tanggal", width: 20 },
    { header: "No. Kwitansi", key: "nomor", width: 18 },
    { header: "NIS", key: "nis", width: 14 },
    { header: "Nama Santri", key: "santri", width: 26 },
    { header: "Metode", key: "metode", width: 14 },
    { header: "Nominal (Rp)", key: "nominal", width: 18, style: { numFmt: "#,##0" } },
    { header: "Status", key: "status", width: 16 },
    { header: "Catatan / Alasan Batal", key: "catatan", width: 28 },
  ];
  wsBayar.getRow(1).font = { bold: true };
  wsBayar.views = [{ state: "frozen", ySplit: 1 }];
  (pembayaran ?? []).forEach((b) => {
    const info = petaSantri.get(b.santri_id);
    wsBayar.addRow({
      tanggal: b.tanggal ? new Date(b.tanggal).toISOString().slice(0, 19).replace("T", " ") : "",
      nomor: b.nomor_kwitansi ?? b.nomor ?? "",
      nis: info?.nis ?? "",
      santri: info?.nama ?? "",
      metode: b.metode ?? "",
      nominal: Number(b.nominal ?? b.jumlah ?? 0),
      status: b.dibatalkan_pada ? "Dibatalkan" : "Sah",
      catatan: b.alasan_batal ?? b.catatan ?? "",
    });
  });

  // 6. Sheet Akademik & Nilai
  const wsNilai = wb.addWorksheet("Nilai Akademik");
  wsNilai.columns = [
    { header: "Tahun Ajaran", key: "ta", width: 22 },
    { header: "NIS", key: "nis", width: 14 },
    { header: "Nama Santri", key: "santri", width: 26 },
    { header: "Mata Pelajaran", key: "mapel", width: 24 },
    { header: "Jenis Ujian", key: "jenis", width: 14 },
    { header: "Nilai", key: "nilai", width: 10 },
  ];
  wsNilai.getRow(1).font = { bold: true };
  wsNilai.views = [{ state: "frozen", ySplit: 1 }];
  (nilai ?? []).forEach((n) => {
    const info = petaSantri.get(n.santri_id);
    wsNilai.addRow({
      ta: petaTa.get(n.tahun_ajaran_id) ?? "",
      nis: info?.nis ?? "",
      santri: info?.nama ?? "",
      mapel: petaMapel.get(n.mapel_id) ?? "",
      jenis: String(n.jenis ?? "").toUpperCase(),
      nilai: Number(n.nilai ?? 0),
    });
  });

  const buf = Buffer.from(await wb.xlsx.writeBuffer());
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="backup-lengkap-${kodePondok}-${tgl}.xlsx"`,
    },
  });
}
