import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { Kartu, Label, input, tombol, PesanNotifikasi, Ikon } from "@/components-ui";
import { emailWali, nomorValid } from "@/lib/akun-wali";
import { tujuanSetelahLogin } from "@/lib/arah";
import { SakelarTema } from "@/components-tema";

async function masuk(form: FormData) {
  "use server";
  const sb = await supabaseServer();
  // Wali boleh mengetik nomor WhatsApp di sini juga.
  const masukan = String(form.get("email")).trim();
  const no = masukan.includes("@") ? null : nomorValid(masukan);
  const { data, error } = await sb.auth.signInWithPassword({
    email: no ? emailWali(no) : masukan,
    password: String(form.get("password")),
  });
  if (error || !data.user) redirect("/masuk?galat=1");
  if (no) await sb.rpc("tautkan_wali");
  redirect(await tujuanSetelahLogin(sb, data.user.id));
}

export default async function Masuk({
  searchParams,
}: {
  searchParams: Promise<{ galat?: string }>;
}) {
  const { galat } = await searchParams;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-ivory px-4 py-12">
      <div className="absolute right-4 top-4">
        <SakelarTema />
      </div>
      <div className="w-full max-w-sm">
        {/* TSIQA Brand Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f4f9f7] p-2.5 shadow-[0_4px_16px_rgba(24,38,34,0.08)] border border-emerald/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-tsiqa.svg" alt="TSIQA" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Masuk ke TSIQA</h1>
          <p className="mt-1 text-xs text-muted">
            Administrasi pesantren
          </p>
        </div>

        {galat && (
          <div className="mb-4">
            <PesanNotifikasi
              tipe="error"
              pesan="Email atau kata sandi salah."
            />
          </div>
        )}

        <Kartu className="shadow-[0_4px_20px_rgba(24,38,34,0.04)]">
          <form action={masuk} className="space-y-4">
            <div>
              <Label>Email atau nomor WhatsApp</Label>
              <input
                name="email"
                type="text"
                required
                placeholder="nama@pesantren.id"
                autoComplete="username"
                className={input}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium tracking-wide text-muted">Kata sandi</span>
                <Link href="/lupa-sandi" className="text-xs font-medium text-emerald hover:underline">Lupa?</Link>
              </div>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                autoComplete="current-password"
                className={input}
              />
            </div>
            <button className={`${tombol} w-full`}>
              <Ikon.Kunci className="h-4 w-4" />
              Masuk
            </button>
          </form>
        </Kartu>

        <div className="mt-6 text-center text-xs text-muted">
          Belum punya akun?{" "}
          <Link href="/daftar" className="font-semibold text-emerald hover:underline">
            Daftar
          </Link>
        </div>
      </div>
    </main>
  );
}

