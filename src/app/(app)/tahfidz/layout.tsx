import { daftarModul, modulAktif } from "@/lib/modul";
import { bolehAksesModul, konteks } from "@/lib/konteks";
import { ModulBelumAktif } from "@/components-modul";
import { Kosong } from "@/components-ui";

export default async function TahfidzLayout({ children }: { children: React.ReactNode }) {
  const [{ peran, aksesModul }, daftar] = await Promise.all([konteks(), daftarModul()]);
  if (!modulAktif(daftar, "tahfidz")) {
    return <ModulBelumAktif nama="Tahfidz & Muroja'ah" />;
  }
  if (!bolehAksesModul(peran, aksesModul, "tahfidz")) {
    return (
      <Kosong
        judul="Akses Terbatas"
        isi="Akun Anda belum diberi izin mengakses modul Tahfidz & Muroja'ah. Hubungi Admin Utama pondok."
      />
    );
  }
  return <>{children}</>;
}
