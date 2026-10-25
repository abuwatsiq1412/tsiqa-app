import { daftarModul, modulAktif } from "@/lib/modul";
import { ModulBelumAktif } from "@/components-modul";

export default async function WaliSantriLayout({ children }: { children: React.ReactNode }) {
  if (!modulAktif(await daftarModul(), "portal_wali")) return <ModulBelumAktif nama="Portal Wali" />;
  return <>{children}</>;
}
