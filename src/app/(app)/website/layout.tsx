import { daftarModul, modulAktif } from "@/lib/modul";
import { bolehAksesModul, konteks } from "@/lib/konteks";
import { ModulBelumAktif } from "@/components-modul";
import { Kosong } from "@/components-ui";

export default async function WebsiteLayout({ children }: { children: React.ReactNode }) {
  const [{ peran, aksesModul }, daftar] = await Promise.all([konteks(), daftarModul()]);
  if (!modulAktif(daftar, "website")) return <ModulBelumAktif nama="Website Pondok (CMS)" />;
  if (!bolehAksesModul(peran, aksesModul, "website")) {
    return (
      <Kosong
        judul="Akses Terbatas"
        isi="Akun Anda belum diberi izin mengelola Website Pondok (CMS). Hubungi Admin Utama pondok."
      />
    );
  }
  return <>{children}</>;
}
