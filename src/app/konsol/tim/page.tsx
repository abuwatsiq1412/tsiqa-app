import { wajibStaf } from "@/lib/staf";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AvatarInisial, HeaderHalaman, Kartu, Label, PesanNotifikasi, input, tombol } from "@/components-ui";
import { tambahStaf, hapusStaf } from "./actions";

export default async function Tim({ searchParams }: { searchParams: Promise<{ ok?: string; galat?: string }> }) {
  const { ok, galat } = await searchParams;
  const sb = await wajibStaf();
  const { data: { user: saya } } = await sb.auth.getUser();

  // RLS hanya mengizinkan staf membaca barisnya sendiri, jadi daftar tim dibaca lewat service role
  // (aman: wajibStaf sudah memastikan pemanggil staf TSIQA).
  const admin = supabaseAdmin();
  const { data: baris } = await admin.from("staf_tsiqa").select("user_id");
  const tim = await Promise.all(
    (baris ?? []).map(async (b) => {
      const { data } = await admin.auth.admin.getUserById(b.user_id as string);
      return { id: b.user_id as string, email: data.user?.email ?? "(tanpa email)" };
    }),
  );

  return (
    <>
      <HeaderHalaman judul="Tim TSIQA" deskripsi="Akun yang bisa masuk ke Konsol." />
      <PesanNotifikasi ok={ok} galat={galat} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_340px]">
        <Kartu className="!p-0 overflow-hidden">
          <ul className="divide-y divide-line">
            {tim.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="flex min-w-0 items-center gap-3">
                  <AvatarInisial nama={t.email} warna="amber" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-ink">{t.email}</div>
                    {t.id === saya?.id && <div className="text-xs text-muted">Anda</div>}
                  </div>
                </div>
                {t.id !== saya?.id && (
                  <form action={hapusStaf}>
                    <input type="hidden" name="id" value={t.id} />
                    <button className="cursor-pointer text-xs font-medium text-belum hover:underline">Cabut akses</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </Kartu>

        <Kartu>
          <h2 className="mb-3 text-sm font-semibold text-ink">Tambah anggota</h2>
          <form action={tambahStaf} className="space-y-3">
            <label className="block">
              <Label>Email</Label>
              <input name="email" type="email" required placeholder="nama@tsiqa.id" className={input} />
            </label>
            <button className={`${tombol} w-full`}>Tambah</button>
            <p className="text-xs text-muted">Jika belum punya akun, undangan dikirim ke email tersebut.</p>
          </form>
        </Kartu>
      </div>
    </>
  );
}
