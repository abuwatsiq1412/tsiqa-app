import { TombolKirim } from "@/components-form";
import Link from "next/link";
import { konteks } from "@/lib/konteks";
import { HeaderHalaman, Kartu, Label, PesanNotifikasi, input, tombol, tombolSekunder, Ikon } from "@/components-ui";
import { simpanPengaturanKeuangan } from "./actions";

export default async function PengaturanKeuangan({
  searchParams,
}: {
  searchParams: Promise<{ galat?: string; ok?: string }>;
}) {
  const { galat, ok } = await searchParams;
  const { sb, peran } = await konteks();
  const { data } = await sb
    .from("keuangan_pengaturan")
    .select("syahriyah_default, rekening_resmi")
    .maybeSingle();
  const boleh = peran === "admin" || peran === "bendahara";
  return (
    <>
      <HeaderHalaman
        judul="Pengaturan Keuangan"
        aksi={
          <Link href="/keuangan" className={tombolSekunder}>
            <Ikon nama="panah-kiri" className="mr-1 inline h-3.5 w-3.5 align-[-2px]" />Kembali
          </Link>
        }
      />

      <PesanNotifikasi
        ok={ok ? "Pengaturan keuangan berhasil disimpan." : undefined}
        galat={galat}
      />

      <Kartu className="max-w-xl">
        <form action={simpanPengaturanKeuangan} className="space-y-4">
          <label className="block">
            <Label>Tarif Syahriyah Standar per Bulan (Rp)</Label>
            <input
              name="syahriyah_default"
              type="number"
              min={0}
              defaultValue={Number(data?.syahriyah_default ?? 0)}
              disabled={!boleh}
              className={input}
            />
          </label>
          <label className="block">
            <Label>Rekening Resmi Pondok</Label>
            <input
              name="rekening_resmi"
              defaultValue={data?.rekening_resmi ?? ""}
              placeholder="Mis. BSI 7123456789 a.n. Yayasan Pondok Pesantren..."
              disabled={!boleh}
              className={input}
            />
          </label>
          <p className="text-xs text-muted">
            Tarif standar dipakai saat menerbitkan tagihan, kecuali santri yang punya keringanan. Rekening tampil di pesan WhatsApp ke wali.
          </p>
          {boleh && <TombolKirim>Simpan</TombolKirim>}
        </form>
      </Kartu>
    </>
  );
}

