import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { waLink } from "@/app/_lib/pricing";
import { Kartu, Label, input, tombol, tombolSekunder, Ikon } from "@/components-ui";

async function kirim(form: FormData) {
  "use server";
  const sb = await supabaseServer();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  // Hasil sengaja tidak dibedakan agar orang luar tidak bisa menebak email yang terdaftar.
  await sb.auth.resetPasswordForEmail(String(form.get("email")).trim(), { redirectTo: `${site}/auth/konfirmasi` });
  redirect("/lupa-sandi?terkirim=1");
}

const WA_RESET = waLink(
  "Assalamu’alaikum Admin TSIQA, saya pengurus pondok ingin meminta bantuan atur ulang kata sandi akun saya."
);

export default async function LupaSandi({ searchParams }: { searchParams: Promise<{ terkirim?: string }> }) {
  const { terkirim } = await searchParams;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ivory px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-2.5 shadow-[0_4px_16px_rgba(24,38,34,0.08)] border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-tsiqa.svg" alt="TSIQA" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Lupa kata sandi</h1>
          <p className="mt-1 text-xs text-muted">Atur ulang lewat email atau dibantu langsung oleh Admin TSIQA.</p>
        </div>
        <Kartu className="space-y-4">
          {terkirim ? (
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-pale text-emerald">
                <Ikon.Centang className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-ink">Cek email Anda</p>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Jika email terdaftar, tautan untuk mengatur ulang kata sandi sudah dikirim. Bila belum masuk, hubungi Admin TSIQA lewat WhatsApp di bawah.
              </p>
            </div>
          ) : (
            <form action={kirim} className="space-y-4">
              <div>
                <Label>Email Akun Pondok</Label>
                <input name="email" type="email" required autoComplete="email" placeholder="nama@pesantren.id" className={input} />
              </div>
              <button className={`${tombol} w-full`}>Kirim tautan ke email</button>
            </form>
          )}

          <div className="border-t border-line pt-4">
            <p className="mb-2.5 text-center text-xs text-muted">
              Lebih cepat: minta reset sandi langsung ke Admin TSIQA
            </p>
            <a
              href={WA_RESET}
              target="_blank"
              rel="noopener noreferrer"
              className={`${tombolSekunder} w-full justify-center`}
            >
              Hubungi Admin via WhatsApp
            </a>
          </div>
        </Kartu>
        <div className="mt-6 text-center text-xs text-muted">
          <Link href="/masuk" className="font-semibold text-emerald hover:underline">Kembali ke halaman masuk</Link>
        </div>
      </div>
    </main>
  );
}
