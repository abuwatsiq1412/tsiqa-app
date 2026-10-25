import type { Metadata, Viewport } from "next";
import { DaftarSW } from "@/components-wali";

export const metadata: Metadata = {
  title: { default: "TSIQA Wali", template: "%s · TSIQA Wali" },
  description: "Pantau tagihan ananda dari HP.",
  manifest: "/wali/manifest.webmanifest",
  appleWebApp: { capable: true, title: "TSIQA Wali", statusBarStyle: "black-translucent" },
  icons: { icon: "/logo-tsiqa.svg", apple: "/logo-tsiqa.png" },
};
export const viewport: Viewport = { themeColor: "#263b35", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function WaliLayout({ children }: { children: React.ReactNode }) {
  return (<><DaftarSW />{children}</>);
}
