import { Suspense } from "react";
import { muatWali } from "@/lib/wali";
import { NavBawah } from "@/components-wali";

export default async function PortalWali({ children }: { children: React.ReactNode }) {
  await muatWali(); // memastikan sesi wali & tautan anak; hasilnya dipakai ulang oleh halaman
  return (
    <div className="min-h-screen bg-ivory text-ink">
      <div className="mx-auto max-w-md px-5 pb-28 pt-5">{children}</div>
      <Suspense><NavBawah /></Suspense>
    </div>
  );
}
