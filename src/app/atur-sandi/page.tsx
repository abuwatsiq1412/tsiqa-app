import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { Kartu, Label, input, tombol, PesanNotifikasi, Ikon } from "@/components-ui";

async function simpan(form: FormData) {
  "use server";
  const sandi = String(form.get("sandi"));
  if (sandi.length < 8) redirect("/atur-sandi?galat=1");
  const sb = await supabaseServer();
  const { error } = await sb.auth.updateUser({ password: sandi });
  redirect(error ? "/atur-sandi?galat=1" : "/hari-ini");
}

export default async function AturSandi({
  searchParams,
}: {
  searchParams: Promise<{ galat?: string }>;
}) {
  const { galat } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ivory px-4 py-12">
      <div className="w-full max-w-sm">
        {/* TSIQA Brand Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-2.5 shadow-[0_4px_16px_rgba(24,38,34,0.08)] border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-tsiqa.svg" alt="TSIQA" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Perbarui Kata Sandi</h1>
          <p className="mt-1 text-xs text-muted">
            Tentukan kata sandi baru untuk menjaga keamanan akun Anda.
          </p>
        </div>

        {galat && (
          <div className="mb-4">
            <PesanNotifikasi
              tipe="error"
              pesan="Kata sandi belum dapat disimpan. Pastikan panjangnya minimal 8 karakter."
            />
          </div>
        )}

        <Kartu className="shadow-[0_4px_20px_rgba(24,38,34,0.04)]">
          <form action={simpan} className="space-y-4">
            <div>
              <Label>Kata Sandi Baru (Min. 8 Karakter)</Label>
              <input
                name="sandi"
                type="password"
                minLength={8}
                required
                placeholder="••••••••"
                className={input}
              />
            </div>
            <button className={`${tombol} w-full`}>
              <Ikon.Centang className="h-4 w-4" />
              Simpan Kata Sandi
            </button>
          </form>
        </Kartu>
      </div>
    </main>
  );
}

