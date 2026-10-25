import Link from "next/link";
import { Kartu } from "@/components-ui";

/** Ditampilkan saat sebuah halaman modul dibuka padahal modulnya belum aktif. */
export function ModulBelumAktif({ nama }: { nama: string }) {
  return (
    <Kartu className="max-w-lg">
      <h1 className="mb-2 text-lg font-bold">{nama} belum aktif</h1>
      <p className="mb-4 text-sm text-muted">Fitur ini adalah modul tambahan. Anda dapat mengaktifkannya sesuai kebutuhan pondok.</p>
      <Link href="/modul" className="text-sm font-semibold text-emerald">Lihat daftar modul</Link>
    </Kartu>
  );
}
