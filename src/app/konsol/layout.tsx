import { redirect } from "next/navigation";
import { wajibStaf } from "@/lib/staf";
import { supabaseServer } from "@/lib/supabase/server";
import { tanggalHeader } from "@/lib/hijriah";
import { KerangkaApp, type GrupMenu } from "@/components-shell";

async function keluar() {
  "use server";
  const sb = await supabaseServer();
  await sb.auth.signOut();
  redirect("/masuk");
}

export default async function KonsolLayout({ children }: { children: React.ReactNode }) {
  const sb = await wajibStaf();
  const { data: { user } } = await sb.auth.getUser();

  const grup: GrupMenu[] = [
    {
      judul: "Platform",
      item: [
        {
          href: "/konsol",
          label: "Pondok Mitra",
          ikon: "kamar",
          persis: true,
          juga: ["/konsol/pondok"],
        },
        { href: "/konsol/modul", label: "Katalog & Harga", ikon: "modul" },
        { href: "/konsol/tim", label: "Tim TSIQA", ikon: "pengguna" },
      ],
    },
  ];

  return (
    <KerangkaApp
      mode="konsol"
      anggota={{ nama: user?.email ?? "Staf TSIQA", peran: "staf_tsiqa" }}
      grup={grup}
      tanggal={tanggalHeader()}
      keluarAction={keluar}
    >
      {children}
    </KerangkaApp>
  );
}
