import Link from "next/link";
import { notFound } from "next/navigation";
import { FormSantri } from "../form";
import { opsiPenempatan } from "@/lib/opsi";
import { konteks } from "@/lib/konteks";
import { HeaderHalaman, Lencana, tombolSekunder, Ikon } from "@/components-ui";

export default async function SantriUbah({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ galat?: string }>;
}) {
  const { id } = await params;
  const { galat } = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { sb } = await konteks();
  const { data } = await sb.from("santri").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const o = await opsiPenempatan();
  return (
    <>
      <HeaderHalaman
        kategori={`Profil Santri · NIS ${data.nis}`}
        judul={data.nama}
        aksi={
          <>
            <Lencana varian={data.status === "aktif" ? "lunas" : "netral"}>
              {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
            </Lencana>
            <Link href="/santri" className={tombolSekunder}>
              <Ikon nama="panah-kiri" className="mr-1 inline h-3.5 w-3.5 align-[-2px]" />Kembali
            </Link>
          </>
        }
      />
      <FormSantri v={data} {...o} galat={galat} />
    </>
  );
}

