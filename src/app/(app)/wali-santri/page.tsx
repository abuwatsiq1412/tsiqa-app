import { redirect } from "next/navigation";
import { konteks } from "@/lib/konteks";
import { pesanGalat, nomorWA } from "@/lib/format";
import { tampilNomor } from "@/lib/akun-wali";
import { HeaderHalaman, Kartu, Lencana, PesanNotifikasi, Ikon, tombol, tombolSekunder } from "@/components-ui";

async function undang(form: FormData) {
  "use server";
  const { sb, pondokId, peran } = await konteks();
  if (!["admin", "staf_tu"].includes(peran)) redirect("/wali-santri?galat=" + encodeURIComponent(pesanGalat("TIDAK_BERHAK")));
  const santriId = String(form.get("santri") ?? "");
  const { data: kode, error } = await sb.rpc("buat_undangan_wali", { p_santri: santriId });
  if (error) redirect("/wali-santri?galat=" + encodeURIComponent(pesanGalat(error.message)));
  const [{ data: s }, { data: p }] = await Promise.all([
    sb.from("santri").select("nama_wali, no_wa_wali").eq("id", santriId).single(),
    sb.from("pondok").select("nama").eq("id", pondokId).single(),
  ]);
  const situs = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const pesan = `Assalamu'alaikum ${s?.nama_wali ?? "Bapak/Ibu"}. ${p?.nama ?? "Pondok"} mengundang Anda memantau tagihan ananda lewat aplikasi TSIQA Wali. Buka tautan ini untuk membuat kata sandi (berlaku 7 hari):\n${situs}/wali/aktivasi?k=${kode}`;
  redirect(`https://wa.me/${nomorWA(String(s?.no_wa_wali))}?text=${encodeURIComponent(pesan)}`);
}

export default async function WaliSantri({ searchParams }: { searchParams: Promise<{ galat?: string }> }) {
  const { galat } = await searchParams;
  const { sb, peran } = await konteks();
  const bisaUndang = ["admin", "staf_tu"].includes(peran);
  const [{ data: santri }, { data: akun }, { data: undangan }] = await Promise.all([
    sb.from("santri").select("id, nama, nama_wali, no_wa_wali").eq("status", "aktif").order("nama").limit(2000),
    sb.from("wali_akun").select("santri_id").limit(5000),
    sb.from("undangan_wali").select("no_wa, kedaluwarsa, dipakai_pada").order("created_at", { ascending: false }).limit(5000),
  ]);

  const tertaut = new Set((akun ?? []).map((a) => a.santri_id as string));
  const sekarang = Date.now();
  const diundang = new Set((undangan ?? []).filter((u) => !u.dipakai_pada && new Date(u.kedaluwarsa).getTime() > sekarang).map((u) => u.no_wa as string));

  // Satu baris per nomor WhatsApp: satu wali bisa punya beberapa anak.
  const peta = new Map<string, { nama: string; no: string; anak: { id: string; nama: string }[]; aktif: boolean }>();
  for (const s of santri ?? []) {
    const no = s.no_wa_wali as string;
    const g = peta.get(no) ?? { nama: s.nama_wali as string, no, anak: [], aktif: false };
    g.anak.push({ id: s.id as string, nama: s.nama as string });
    if (tertaut.has(s.id as string)) g.aktif = true;
    peta.set(no, g);
  }
  const daftar = [...peta.values()].sort((a, b) => Number(a.aktif) - Number(b.aktif) || a.nama.localeCompare(b.nama));
  const nAktif = daftar.filter((g) => g.aktif).length;

  return (
    <>
      <HeaderHalaman kategori="Portal Wali" judul="Wali Santri"
        deskripsi={`${nAktif} dari ${daftar.length} wali sudah memakai aplikasi. Kirim undangan lewat WhatsApp, wali tinggal membuat kata sandi.`} />
      <PesanNotifikasi galat={galat} />
      <Kartu className="overflow-hidden !p-0">
        {daftar.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">Belum ada santri aktif.</p>
        ) : (
          <ul className="divide-y divide-line/70">
            {daftar.map((g) => (
              <li key={g.no} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-ink">{g.nama}</div>
                  <div className="truncate text-xs text-muted">{tampilNomor(g.no)} · {g.anak.map((x) => x.nama).join(", ")}</div>
                </div>
                {g.aktif ? <Lencana varian="lunas">Sudah masuk</Lencana>
                  : diundang.has(g.no) ? <Lencana varian="cicilan">Undangan terkirim</Lencana>
                  : <Lencana varian="netral">Belum diundang</Lencana>}
                {bisaUndang && !g.aktif && (
                  <form action={undang}>
                    <input type="hidden" name="santri" value={g.anak[0].id} />
                    <button className={diundang.has(g.no) ? tombolSekunder : tombol}>
                      <Ikon nama="wa" className="h-4 w-4" />{diundang.has(g.no) ? "Kirim ulang" : "Undang"}
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </Kartu>
    </>
  );
}
