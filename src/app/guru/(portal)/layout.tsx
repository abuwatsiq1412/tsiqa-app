import { muatGuru } from "@/lib/guru";
import { SinkronAntrean } from "@/components-guru";
import { keluarGuru } from "../actions";
import Link from "next/link";

export default async function PortalGuru({ children }: { children: React.ReactNode }) {
  await muatGuru();
  return (
    <div className="min-h-screen bg-ivory text-ink">
      <header className="bg-forest text-white">
        <div className="mx-auto flex h-14 max-w-md items-center justify-between px-5">
          <Link href="/guru" className="flex items-center gap-2.5 font-extrabold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f4f9f7] p-1 border border-emerald/25">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-tsiqa.svg" alt="TSIQA" className="h-full w-full object-contain" />
            </span>
            TSIQA Guru
          </Link>
          <form action={keluarGuru}><button className="h-11 cursor-pointer px-2 text-[13px] font-semibold text-white/80">Keluar</button></form>
        </div>
      </header>
      <SinkronAntrean />
      <div className="mx-auto max-w-md px-5 pb-16 pt-5">{children}</div>
    </div>
  );
}
