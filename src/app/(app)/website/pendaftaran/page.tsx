import Link from "next/link";
import { TombolKirim } from "@/components-form";
import {
  HeaderHalaman,
  Ikon,
  Kartu,
  Label,
  PesanNotifikasi,
  input,
  tombolSekunder,
} from "@/components-ui";
import { konteks } from "@/lib/konteks";
import { normalisasiPengaturanWebsite } from "@/lib/website";
import { simpanPendaftaranWebsite } from "../actions";

export default async function WebsitePendaftaranPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; galat?: string }>;
}) {
  const { ok, galat } = await searchParams;
  const { sb, pondokId } = await konteks();

  const [{ data: pondok }, { data: rawWeb }] = await Promise.all([
    sb.from("pondok").select("nama, kode, telepon, alamat, kota, email").eq("id", pondokId).maybeSingle(),
    sb.from("website_pengaturan").select("*").eq("pondok_id", pondokId).maybeSingle(),
  ]);

  const namaPondok = pondok?.nama ?? "Pondok Pesantren";
  const cfg = normalisasiPengaturanWebsite(
    pondokId,
    namaPondok,
    rawWeb as Record<string, unknown> | null
  );

  return (
    <div className="space-y-6">
      <HeaderHalaman
        kategori="Website Pondok (CMS)"
        judul="Info Pendaftaran (PSB) & Kontak"
        deskripsi="Atur pengumuman Penerimaan Santri Baru, syarat berkas, rincian infaq, serta kontak resmi pondok."
        aksi={
          pondok?.kode ? (
            <Link href={`/p/${pondok.kode}#pendaftaran`} target="_blank" className={tombolSekunder}>
              <Ikon nama="gedung" className="h-4 w-4 text-emerald" />
              Lihat Seksi PSB
            </Link>
          ) : null
        }
      />

      <PesanNotifikasi ok={ok} galat={galat} />

      <form action={simpanPendaftaranWebsite} className="space-y-6">
        <Kartu className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
            <div>
              <h2 className="text-base font-bold text-ink">
                1. Penerimaan Santri Baru (PSB / PPDB)
              </h2>
              <p className="text-xs text-muted">
                Informasi ini ditampilkan di bagian Pendaftaran pada website pondok.
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface-soft px-3.5 py-2 text-xs font-semibold text-ink">
              <input
                type="checkbox"
                name="psb_buka"
                value="1"
                defaultChecked={cfg.psb_buka}
                className="h-4 w-4 rounded accent-emerald"
              />
              Status Pendaftaran Dibuka
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <Label>Judul Seksi Pendaftaran</Label>
              <input
                name="psb_judul"
                defaultValue={cfg.psb_judul}
                placeholder="Penerimaan Santri Baru Tahun Ajaran 2026/2027"
                className={input}
              />
            </label>

            <label className="block">
              <Label>Label Gelombang / Jadwal</Label>
              <input
                name="psb_gelombang"
                defaultValue={cfg.psb_gelombang}
                placeholder="Gelombang I · Januari s/d Mei"
                className={input}
              />
            </label>
          </div>

          <label className="block">
            <Label>Persyaratan Pendaftaran (Satu baris = satu syarat)</Label>
            <textarea
              name="psb_syarat"
              rows={4}
              defaultValue={cfg.psb_syarat.join("\n")}
              className={input}
            />
          </label>

          <label className="block">
            <Label>Keterangan Infaq Masuk & Syahriah Bulanan</Label>
            <textarea
              name="psb_biaya_ringkas"
              rows={2}
              defaultValue={cfg.psb_biaya_ringkas}
              className={input}
            />
          </label>

          <label className="block">
            <Label>Tautan Formulir Pendaftaran Eksternal / Google Form (Opsional)</Label>
            <input
              name="psb_tautan_daftar"
              type="url"
              defaultValue={cfg.psb_tautan_daftar ?? ""}
              placeholder="Kosongkan bila ingin tombol daftar langsung mengarah ke WhatsApp Panitia"
              className={input}
            />
          </label>
        </Kartu>

        <Kartu className="space-y-4">
          <div className="border-b border-line pb-3">
            <h2 className="text-base font-bold text-ink">2. Kontak Panitia & Media Sosial</h2>
            <p className="text-xs text-muted">
              Alamat utama pondok ({pondok?.alamat || pondok?.kota || "diatur di menu Pengaturan"}) otomatis disertakan di bagian bawah website.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <Label>Nomor WhatsApp Admin / Panitia PSB (Format 628...)</Label>
              <input
                name="wa_admin_web"
                defaultValue={cfg.wa_admin_web ?? pondok?.telepon ?? ""}
                placeholder="6281234567890"
                className={input}
              />
            </label>

            <label className="block">
              <Label>Tautan Google Maps Lokasi Pondok (Opsional)</Label>
              <input
                name="alamat_peta_url"
                type="url"
                defaultValue={cfg.alamat_peta_url ?? ""}
                placeholder="https://maps.app.goo.gl/..."
                className={input}
              />
            </label>

            <label className="block">
              <Label>Tautan Instagram Pondok (Opsional)</Label>
              <input
                name="instagram_url"
                type="url"
                defaultValue={cfg.instagram_url ?? ""}
                placeholder="https://instagram.com/pondok..."
                className={input}
              />
            </label>

            <label className="block">
              <Label>Tautan YouTube Pondok (Opsional)</Label>
              <input
                name="youtube_url"
                type="url"
                defaultValue={cfg.youtube_url ?? ""}
                placeholder="https://youtube.com/@pondok..."
                className={input}
              />
            </label>
          </div>

          <div className="flex justify-end border-t border-line pt-4">
            <TombolKirim>Simpan Info PSB & Kontak</TombolKirim>
          </div>
        </Kartu>
      </form>
    </div>
  );
}
