import { daftarModul, modulAktif } from "@/lib/modul";
import { bolehAksesModul, konteks } from "@/lib/konteks";
import { ModulBelumAktif } from "@/components-modul";
import { Kosong } from "@/components-ui";

// Penjaga untuk seluruh halaman modul Keuangan. Penjaga sebenarnya tetap di database (RLS + fungsi).
export default async function KeuanganLayout({ children }: { children: React.ReactNode }) {
  const [{ peran, aksesModul }, daftar] = await Promise.all([konteks(), daftarModul()]);
  if (!modulAktif(daftar, "keuangan")) return <ModulBelumAktif nama="Keuangan" />;
  if (!bolehAksesModul(peran, aksesModul, "keuangan")) {
    return (
      <Kosong
        judul="Akses Terbatas"
        isi="Akun Anda belum diberi izin mengakses modul Keuangan & Syahriah. Hubungi Admin Utama pondok."
      />
    );
  }
  return <>{children}</>;
}

