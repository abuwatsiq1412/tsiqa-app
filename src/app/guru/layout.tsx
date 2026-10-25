import type { Metadata, Viewport } from "next";
export const metadata: Metadata = { title: { default: "TSIQA Guru", template: "%s · TSIQA Guru" }, icons: { icon: "/wali-icon-192.png" } };
export const viewport: Viewport = { themeColor: "#263b35", width: "device-width", initialScale: 1 };
export default function GuruLayout({ children }: { children: React.ReactNode }) { return children; }
