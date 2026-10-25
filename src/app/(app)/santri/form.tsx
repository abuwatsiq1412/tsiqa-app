import { TombolKirim } from "@/components-form";
import Link from "next/link";
import { simpanSantri } from "./actions";
import { Kartu, Label, PesanNotifikasi, input, tombol, tombolSekunder } from "@/components-ui";

type Opsi = { id: string; nama: string };
type Nilai = Record<string, string | number | null | undefined>;

const F = ({
  nama,
  label,
  v,
  tipe = "text",
  wajib = false,
  placeholder,
}: {
  nama: string;
  label: string;
  v: Nilai;
  tipe?: string;
  wajib?: boolean;
  placeholder?: string;
}) => (
  <label className="block">
    <Label>
      {label}
      {wajib && <span className="ml-0.5 text-belum">*</span>}
    </Label>
    <input
      name={nama}
      type={tipe}
      required={wajib}
      placeholder={placeholder}
      defaultValue={v[nama] ?? ""}
      className={input}
    />
  </label>
);

const S = ({
  nama,
  label,
  v,
  opsi,
  kosong,
}: {
  nama: string;
  label: string;
  v: Nilai;
  opsi: { nilai: string; teks: string }[];
  kosong?: string;
}) => (
  <label className="block">
    <Label>{label}</Label>
    <select name={nama} defaultValue={String(v[nama] ?? "")} className={input}>
      {kosong !== undefined && <option value="">{kosong}</option>}
      {opsi.map((o) => (
        <option key={o.nilai} value={o.nilai}>
          {o.teks}
        </option>
      ))}
    </select>
  </label>
);

export function FormSantri({
  v = {},
  kamar,
  diniyah,
  formal,
  galat,
}: {
  v?: Nilai;
  kamar: Opsi[];
  diniyah: Opsi[];
  formal: Opsi[];
  galat?: string;
}) {
  const pilih = (l: Opsi[]) => l.map((x) => ({ nilai: x.id, teks: x.nama }));
  return (
    <form action={simpanSantri} className="max-w-4xl space-y-5">
      {v.id && <input type="hidden" name="id" value={String(v.id)} />}
      <PesanNotifikasi galat={galat} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Kartu className="space-y-4">
          <div className="border-b border-line pb-3">
            <h2 className="text-sm font-semibold text-ink">Identitas Santri</h2>
            <p className="text-xs text-muted">Data pokok dan status tempat tinggal santri</p>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <F nama="nis" label="Nomor Induk (NIS)" v={v} wajib placeholder="Mis. 2026001" />
            <F nama="panggilan" label="Nama panggilan" v={v} placeholder="Mis. Ahmad" />
            <div className="col-span-2">
              <F nama="nama" label="Nama lengkap" v={v} wajib placeholder="Sesuai akta / ijazah" />
            </div>
            <S
              nama="jenis_kelamin"
              label="Jenis kelamin"
              v={v}
              opsi={[
                { nilai: "L", teks: "Putra (Laki-laki)" },
                { nilai: "P", teks: "Putri (Perempuan)" },
              ]}
            />
            <S
              nama="tempat_tinggal"
              label="Kategori tinggal"
              v={v}
              opsi={[
                { nilai: "mukim", teks: "Mukim (Asrama)" },
                { nilai: "kalong", teks: "Kalong (Pulang-pergi)" },
              ]}
            />
            <F nama="tempat_lahir" label="Tempat lahir" v={v} />
            <F nama="tanggal_lahir" label="Tanggal lahir" v={v} tipe="date" />
            <div className="col-span-2">
              <S
                nama="status"
                label="Status keaktifan"
                v={v}
                opsi={[
                  { nilai: "aktif", teks: "Aktif" },
                  { nilai: "alumni", teks: "Alumni" },
                  { nilai: "boyong", teks: "Boyong / Pindah" },
                  { nilai: "skorsing", teks: "Skorsing" },
                ]}
              />
            </div>
          </div>
        </Kartu>

        <Kartu className="space-y-4">
          <div className="border-b border-line pb-3">
            <h2 className="text-sm font-semibold text-ink">Keluarga & Kontak Wali</h2>
            <p className="text-xs text-muted">Digunakan untuk pengiriman tagihan dan informasi via WhatsApp</p>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <F nama="nama_wali" label="Nama wali utama" v={v} wajib />
            <F nama="hubungan_wali" label="Hubungan wali" v={v} placeholder="ayah / ibu / paman" />
            <div className="col-span-2">
              <F
                nama="no_wa_wali"
                label="No. WhatsApp wali"
                v={v}
                wajib
                placeholder="0812xxxx atau 62812xxxx"
              />
            </div>
            <F nama="nama_ayah" label="Nama ayah" v={v} />
            <F nama="nama_ibu" label="Nama ibu" v={v} />
            <F nama="kota_asal" label="Kota asal" v={v} />
            <F nama="alamat_asal" label="Alamat lengkap" v={v} />
          </div>
        </Kartu>
      </div>

      <Kartu className="space-y-4">
        <div className="border-b border-line pb-3">
          <h2 className="text-sm font-semibold text-ink">Penempatan Kamar & Kelas</h2>
          <p className="text-xs text-muted">Penempatan saat ini untuk asrama, diniyah, dan pendidikan formal</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <S nama="kamar_id" label="Kamar asrama" v={v} opsi={pilih(kamar)} kosong="Belum ditempatkan" />
          <S
            nama="kelas_diniyah_id"
            label="Kelas diniyah"
            v={v}
            opsi={pilih(diniyah)}
            kosong="Belum ditempatkan"
          />
          <S
            nama="kelas_formal_id"
            label="Kelas formal"
            v={v}
            opsi={pilih(formal)}
            kosong="Belum ditempatkan"
          />
        </div>
        <label className="block">
          <Label>Catatan tambahan</Label>
          <textarea
            name="catatan"
            defaultValue={String(v.catatan ?? "")}
            placeholder="Catatan kesehatan, prestasi, atau keterangan khusus..."
            className={input}
            rows={2}
          />
        </label>
      </Kartu>

      <div className="flex items-center gap-3">
        <TombolKirim>Simpan Data Santri</TombolKirim>
        <Link href="/santri" className={tombolSekunder}>
          Batal
        </Link>
      </div>
    </form>
  );
}

