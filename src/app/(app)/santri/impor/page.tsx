import Link from "next/link";
import { imporSantri } from "../actions";
import { HeaderHalaman, Ikon, Kartu, PesanNotifikasi, tombol, tombolSekunder } from "@/components-ui";

export default async function Impor({
  searchParams,
}: {
  searchParams: Promise<{ galat?: string; masuk?: string; lewat?: string; rincian?: string }>;
}) {
  const { galat, masuk, lewat, rincian } = await searchParams;
  return (
    <>
      <HeaderHalaman
        judul="Impor Santri dari Excel"
        aksi={
          <Link href="/santri" className={tombolSekunder}>
            <Ikon nama="panah-kiri" className="mr-1 inline h-3.5 w-3.5 align-[-2px]" />Kembali
          </Link>
        }
      />

      <PesanNotifikasi galat={galat} />

      {masuk !== undefined && (
        <Kartu varian="mint" className="mb-6 max-w-2xl">
          <div className="flex items-center gap-2 font-semibold text-emerald">
            <Ikon nama="cek" className="h-4 w-4" />
            <span>
              {masuk} santri berhasil diimpor
              {Number(lewat) > 0 ? `, ${lewat} baris dilewati.` : "."}
            </span>
          </div>
          {rincian && (
            <pre className="mt-3 rounded-lg border border-line bg-white p-3 font-mono text-xs text-ink whitespace-pre-wrap">
              {rincian}
            </pre>
          )}
        </Kartu>
      )}

      <div className="grid max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
        <Kartu className="flex flex-col justify-between space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">1. Unduh Template</h2>
            <p className="mt-1 text-xs text-muted">
              Format kolom standar Excel (.xlsx) untuk data santri.
            </p>
          </div>
          <div>
            <a href="/santri/template" className={tombolSekunder}>
              <Ikon nama="unduh" className="h-3.5 w-3.5 text-emerald" />
              <span>Unduh Template</span>
            </a>
          </div>
        </Kartu>

        <Kartu className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">2. Unggah File</h2>
            <p className="mt-1 text-xs text-muted">
              Pilih file Excel yang sudah diisi data santri.
            </p>
          </div>
          <form action={imporSantri} className="space-y-3">
            <input
              type="file"
              name="berkas"
              accept=".xlsx"
              required
              className="block w-full rounded-lg border border-dashed border-line bg-surface-soft px-3 py-2.5 text-xs text-muted file:mr-3 file:rounded-md file:border-0 file:bg-emerald-pale file:px-3 file:py-1 file:text-xs file:font-semibold file:text-emerald"
            />
            <button className={`${tombol} w-full`}>
              <Ikon nama="unggah" className="h-4 w-4" />
              <span>Mulai Impor Data</span>
            </button>
          </form>
        </Kartu>
      </div>
    </>
  );
}

