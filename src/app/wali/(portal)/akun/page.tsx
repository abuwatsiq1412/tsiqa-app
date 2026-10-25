import { muatWali, pilihAnak, dataAnak, inisial } from "@/lib/wali";
import { tampilNomor } from "@/lib/akun-wali";
import { PushToggle, PasangAplikasi, TombolKeluar } from "@/components-wali";
import { IkonW } from "@/components-wali-ikon";
import { simpanPush, hapusPush, keluarWali, gantiSandiWali } from "../../actions";

export const metadata = { title: "Akun" };
const PESAN: Record<string, string> = { "1": "Kata sandi minimal 8 karakter.", "2": "Kedua kata sandi belum sama.", "3": "Kata sandi belum dapat disimpan." };

export default async function Akun({ searchParams }: { searchParams: Promise<{ a?: string; galat?: string; ok?: string }> }) {
  const { a, galat, ok } = await searchParams;
  const { sb, user, anak } = await muatWali();
  const aktif = pilihAnak(anak, a);
  const no = String((user.app_metadata as { no_wa?: string })?.no_wa ?? "");
  const d = aktif ? await dataAnak(sb, aktif) : null;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-extrabold tracking-tight">Akun</h1>

      <section className="flex items-center gap-3.5 rounded-2xl border border-line bg-white p-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-pale text-base font-bold text-emerald">{inisial(aktif?.nama ?? "W")}</span>
        <span>
          <span className="block text-[15px] font-bold">Wali {aktif ? aktif.nama : ""}</span>
          <span className="block text-xs text-muted">{no ? `WhatsApp ${tampilNomor(no)}` : ""}{d?.pondok ? ` · ${d.pondok.nama}` : ""}</span>
        </span>
      </section>

      {anak.length > 1 && (
        <section className="rounded-2xl border border-line bg-white p-4">
          <h2 className="text-sm font-extrabold">Ananda</h2>
          <ul className="mt-2 divide-y divide-line/70 text-sm">{anak.map((x) => <li key={x.id} className="flex justify-between py-2"><span className="font-semibold">{x.nama}</span><span className="text-muted">{x.nis}</span></li>)}</ul>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-line bg-white">
        <PushToggle kunci={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null} simpan={simpanPush} hapus={hapusPush} />
        <PasangAplikasi />
        {d?.pondok?.telepon && (
          <a href={`https://wa.me/${d.pondok.telepon.replace(/\D/g, "").replace(/^0/, "62")}`} target="_blank" rel="noopener" className="tekan flex items-center gap-3 px-4 py-3.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-soft text-emerald"><IkonW n="wa" /></span>
            <span className="flex-1"><span className="block text-sm font-semibold">Hubungi pondok</span><span className="block text-xs text-muted">Lewat WhatsApp</span></span>
            <IkonW n="kanan" className="h-4 w-4 text-muted" />
          </a>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-white p-4">
        <h2 className="text-sm font-extrabold">Ganti kata sandi</h2>
        {ok && <p role="status" className="mt-2 rounded-xl bg-emerald-pale px-3.5 py-2.5 text-[13px] font-semibold text-emerald">Kata sandi diperbarui.</p>}
        {galat && PESAN[galat] && <p role="alert" className="mt-2 rounded-xl bg-belum-bg px-3.5 py-2.5 text-[13px] font-medium text-belum">{PESAN[galat]}</p>}
        <form action={gantiSandiWali} className="mt-3 flex flex-col gap-3">
          <input name="sandi" type="password" minLength={8} required placeholder="Kata sandi baru" autoComplete="new-password" className="h-[50px] rounded-[14px] border border-line px-4 text-base outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/20" />
          <input name="ulang" type="password" minLength={8} required placeholder="Ulangi kata sandi" autoComplete="new-password" className="h-[50px] rounded-[14px] border border-line px-4 text-base outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/20" />
          <button className="tekan h-12 cursor-pointer rounded-[14px] bg-forest text-sm font-bold text-white">Simpan</button>
        </form>
      </section>

      <TombolKeluar aksi={keluarWali} />
    </div>
  );
}
