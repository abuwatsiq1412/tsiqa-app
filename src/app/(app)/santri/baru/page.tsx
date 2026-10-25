import { FormSantri } from "../form";
import { opsiPenempatan } from "@/lib/opsi";
import { HeaderHalaman } from "@/components-ui";

export default async function SantriBaru({ searchParams }: { searchParams: Promise<{ galat?: string }> }) {
  const { galat } = await searchParams;
  const o = await opsiPenempatan();
  return (
    <>
      <HeaderHalaman
        judul="Tambah Santri Baru"
      />
      <FormSantri {...o} galat={galat} />
    </>
  );
}

