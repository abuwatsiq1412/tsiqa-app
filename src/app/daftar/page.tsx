import Link from "next/link";
import { redirect } from "next/navigation";
import { adalahEmailSistem } from "@/lib/akun-wali";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { Kartu, Label, input, tombol, PesanNotifikasi, Ikon } from "@/components-ui";

async function daftar(form: FormData) {
  "use server";
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || password.length < 8 || adalahEmailSistem(email)) {
    redirect("/daftar?galat=1");
  }

  const sb = await supabaseServer();

  // Gunakan admin client agar tidak mengirim email verifikasi bawaan Supabase;
  // verifikasi dilakukan langsung oleh Admin TSIQA melalui Konsol & WhatsApp.
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = supabaseAdmin();
    const { error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createErr) {
      if (/already|registered|exists/i.test(createErr.message)) {
        redirect("/daftar?galat=terdaftar");
      }
      redirect("/daftar?galat=1");
    }
    const { error: signErr } = await sb.auth.signInWithPassword({ email, password });
    if (signErr) redirect("/masuk");
    redirect("/mulai");
  }

  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) redirect("/daftar?galat=1");
  redirect(data.session ? "/mulai" : "/daftar?cek=1");
}

export default async function Daftar({
  searchParams,
}: {
  searchParams: Promise<{ galat?: string; cek?: string }>;
}) {
  const { galat, cek } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ivory px-4 py-12">
      <div className="w-full max-w-sm">
        {/* TSIQA Brand Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-2.5 shadow-[0_4px_16px_rgba(24,38,34,0.08)] border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-tsiqa.svg" alt="TSIQA" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Daftarkan Pondok Anda</h1>
          <p className="mt-1 text-xs text-muted">
            Langkah 1 dari 2 · Buat akun pengurus utama pondok
          </p>
        </div>

        {cek ? (
          <Kartu className="shadow-[0_4px_20px_rgba(24,38,34,0.04)] text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-pale text-emerald">
              <Ikon.Centang className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-semibold text-ink">Cek Email Anda</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Buka tautan aktivasi yang kami kirim ke email Anda untuk melanjutkan.
            </p>
            <div className="mt-4 border-t border-line pt-3">
              <Link href="/masuk" className="text-xs font-semibold text-emerald hover:underline">
                Ke halaman masuk
              </Link>
            </div>
          </Kartu>
        ) : (
          <>
            {galat && (
              <div className="mb-4">
                <PesanNotifikasi
                  tipe="error"
                  pesan={
                    galat === "terdaftar"
                      ? "Email ini sudah terdaftar. Silakan langsung masuk ke akun Anda."
                      : "Pendaftaran gagal. Periksa format email dan pastikan kata sandi minimal 8 karakter."
                  }
                />
              </div>
            )}
            <Kartu className="shadow-[0_4px_20px_rgba(24,38,34,0.04)]">
              <form action={daftar} className="space-y-4">
                <div>
                  <Label>Email Pengurus / Pondok</Label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="admin@pesantren.id"
                    autoComplete="email"
                    className={input}
                  />
                </div>
                <div>
                  <Label>Kata sandi</Label>
                  <input
                    name="password"
                    type="password"
                    minLength={8}
                    required
                    placeholder="Minimal 8 karakter"
                    autoComplete="new-password"
                    className={input}
                  />
                </div>
                <button className={`${tombol} w-full`}>
                  <Ikon.Centang className="h-4 w-4" />
                  Lanjut Isi Data Pondok
                </button>
              </form>
            </Kartu>
          </>
        )}

        <div className="mt-6 text-center text-xs text-muted">
          Sudah memiliki akun?{" "}
          <Link href="/masuk" className="font-semibold text-emerald hover:underline">
            Masuk
          </Link>
        </div>
      </div>
    </main>
  );
}
