import { daftarModul, modulAktif } from "@/lib/modul";
import { bolehAksesModul, konteks } from "@/lib/konteks";
import { ModulBelumAktif } from "@/components-modul";
import { Kosong } from "@/components-ui";

export default async function AkademikLayout({ children }: { children: React.ReactNode }) {
  const [{ peran, aksesModul }, daftar] = await Promise.all([konteks(), daftarModul()]);
  if (!modulAktif(daftar, "akademik")) return <ModulBelumAktif nama="Akademik" />;
  if (!bolehAksesModul(peran, aksesModul, "akademik")) {
    return (
      <Kosong
        judul="Akses Terbatas"
        isi="Akun Anda belum diberi izin mengakses modul Akademik & E-Rapor. Hubungi Admin Utama pondok."
      />
    );
  }
  return <>{children}</>;
}

