import { daftarModul, modulAktif } from "@/lib/modul";
import { bolehAksesModul, konteks } from "@/lib/konteks";
import { ModulBelumAktif } from "@/components-modul";
import { Kosong } from "@/components-ui";

export default async function PerizinanLayout({ children }: { children: React.ReactNode }) {
  const [{ peran, aksesModul }, daftar] = await Promise.all([konteks(), daftarModul()]);
  if (!modulAktif(daftar, "perizinan")) {
    return <ModulBelumAktif nama="Perizinan & Keamanan Asrama" />;
  }
  if (!bolehAksesModul(peran, aksesModul, "perizinan")) {
    return (
      <Kosong
        judul="Akses Terbatas"
        isi="Akun Anda belum diberi izin mengakses modul Keamanan & Perizinan Asrama. Hubungi Admin Utama pondok."
      />
    );
  }
  return <>{children}</>;
}
