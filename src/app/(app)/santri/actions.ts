"use server";
import { redirect } from "next/navigation";
import { konteks } from "@/lib/konteks";
import { santriSchema, pesanZod } from "@/lib/santri-schema";
import { bacaExcel } from "@/lib/impor-santri";
import { pesanGalat } from "@/lib/format";

const q = (s: string) => encodeURIComponent(s);

export async function simpanSantri(form: FormData) {
  const { sb, pondokId } = await konteks();
  const id = String(form.get("id") ?? "");
  const mentah = Object.fromEntries([...form.entries()].filter(([k]) => k !== "id"));
  const p = santriSchema.safeParse(mentah);
  const balik = id ? `/santri/${id}` : "/santri/baru";
  if (!p.success) redirect(`${balik}?galat=${q(pesanZod(p.error))}`);

  const baris = { ...p.data, kamar_id: p.data.kamar_id ?? null, kelas_diniyah_id: p.data.kelas_diniyah_id ?? null,
    kelas_formal_id: p.data.kelas_formal_id ?? null };
  const { error } = id
    ? await sb.from("santri").update(baris).eq("id", id)
    : await sb.from("santri").insert({ ...baris, pondok_id: pondokId });
  if (error) {
    const dobel = error.code === "23505" ? "NIS sudah dipakai santri lain." : pesanGalat(error.message);
    redirect(`${balik}?galat=${q(dobel)}`);
  }
  redirect("/santri?ok=1");
}

export async function imporSantri(form: FormData) {
  const { sb, pondokId } = await konteks();
  const berkas = form.get("berkas");
  if (!(berkas instanceof File) || berkas.size === 0) redirect(`/santri/impor?galat=${q("Pilih berkas Excel terlebih dahulu.")}`);
  if (berkas.size > 5_000_000) redirect(`/santri/impor?galat=${q("Ukuran berkas maksimal 5 MB.")}`);

  const [{ data: kamar }, { data: kelas }, { data: ada }] = await Promise.all([
    sb.from("kamar").select("id, kode"),
    sb.from("kelas").select("id, kode, jenis"),
    sb.from("santri").select("nis"),
  ]);
  const peta = {
    kamar: new Map((kamar ?? []).map((k) => [k.kode.toLowerCase(), k.id as string])),
    diniyah: new Map((kelas ?? []).filter((k) => k.jenis === "diniyah").map((k) => [k.kode.toLowerCase(), k.id as string])),
    formal: new Map((kelas ?? []).filter((k) => k.jenis === "formal").map((k) => [k.kode.toLowerCase(), k.id as string])),
  };

  let hasil;
  try { hasil = await bacaExcel(Buffer.from(await berkas.arrayBuffer()), peta, new Set((ada ?? []).map((a) => a.nis))); }
  catch { redirect(`/santri/impor?galat=${q("Berkas tidak dapat dibaca. Gunakan template Excel (.xlsx) dari TSIQA.")}`); }

  if (hasil.baris.length > 0) {
    const { error } = await sb.from("santri").insert(
      hasil.baris.map((b) => ({ ...b.data, pondok_id: pondokId, kamar_id: b.data.kamar_id ?? null,
        kelas_diniyah_id: b.data.kelas_diniyah_id ?? null, kelas_formal_id: b.data.kelas_formal_id ?? null })),
    );
    if (error) redirect(`/santri/impor?galat=${q(pesanGalat(error.message))}`);
  }
  const rincian = hasil.galat.slice(0, 15).map((g) => `Baris ${g.nomor}: ${g.pesan}`).join("\n");
  redirect(`/santri/impor?masuk=${hasil.baris.length}&lewat=${hasil.galat.length}&rincian=${q(rincian)}`);
}
