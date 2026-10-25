import { konteks } from "@/lib/konteks";

export async function opsiPenempatan() {
  const { sb } = await konteks();
  const [{ data: kamar }, { data: kelas }] = await Promise.all([
    sb.from("kamar").select("id, nama").order("nama"),
    sb.from("kelas").select("id, nama, jenis").order("nama"),
  ]);
  return {
    kamar: (kamar ?? []).map((k) => ({ id: k.id as string, nama: k.nama as string })),
    diniyah: (kelas ?? []).filter((k) => k.jenis === "diniyah").map((k) => ({ id: k.id as string, nama: k.nama as string })),
    formal: (kelas ?? []).filter((k) => k.jenis === "formal").map((k) => ({ id: k.id as string, nama: k.nama as string })),
  };
}
