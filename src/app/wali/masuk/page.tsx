import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { emailWali, nomorValid } from "@/lib/akun-wali";
import { Bintang } from "@/components-wali-ikon";

async function masuk(form: FormData) {
  "use server";
  const no = nomorValid(String(form.get("wa") ?? ""));
  const sandi = String(form.get("sandi") ?? "");
  if (!no || !sandi) redirect("/wali/masuk?galat=1");
  const sb = await supabaseServer();
  const { error } = await sb.auth.signInWithPassword({ email: emailWali(no), password: sandi });
  if (error) redirect("/wali/masuk?galat=1");
  await sb.rpc("tautkan_wali"); // anak yang ditambahkan pondok belakangan ikut tertaut
  redirect("/wali");
}

const PESAN: Record<string, string> = {
  "1": "Nomor atau kata sandi belum cocok.",
  "2": "Akun ini belum terhubung ke santri. Minta tautan undangan ke pondok.",
  "3": "Tautan undangan sudah dipakai. Silakan masuk dengan kata sandi Anda.",
};

export default async function MasukWali({ searchParams }: { searchParams: Promise<{ galat?: string; wa?: string }> }) {
  const { galat, wa } = await searchParams;
  return (
    <main className="relative min-h-screen bg-ivory text-ink">
      <div className="relative h-[300px] overflow-hidden bg-forest">
        <Bintang className="pointer-events-none absolute -right-24 -top-16 h-[340px] w-[340px] opacity-30" />
        <div className="relative mx-auto max-w-md px-7 pt-16">
          <span className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-white/95 p-2.5 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-tsiqa.svg" alt="TSIQA" className="h-full w-full object-contain" />
          </span>
          <h1 className="mt-6 text-[32px] font-extrabold leading-tight tracking-tight text-white">TSIQA Wali</h1>
          <p className="mt-2.5 max-w-[260px] text-[15px] leading-relaxed text-white/80">Pantau tagihan ananda dari HP.</p>
        </div>
      </div>

      <div className="relative -mt-7 mx-auto min-h-[calc(100vh-272px)] max-w-md rounded-t-[28px] bg-white px-6 pb-10 pt-7 shadow-[0_-8px_24px_rgba(24,38,34,0.08)]">
        <h2 className="text-[22px] font-extrabold tracking-tight">Masuk</h2>
        {galat && PESAN[galat] && (
          <p role="alert" className="mt-3 rounded-xl bg-belum-bg px-4 py-3 text-[13px] font-medium text-belum">{PESAN[galat]}</p>
        )}
        <form action={masuk} className="mt-5 flex flex-col gap-4">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-muted">Nomor WhatsApp</span>
            <span className="flex h-[52px] items-center overflow-hidden rounded-[14px] border border-line bg-white focus-within:border-emerald focus-within:ring-2 focus-within:ring-emerald/20">
              <span className="flex h-full items-center border-r border-line bg-surface-soft px-3.5 text-[15px] font-bold">+62</span>
              <input name="wa" type="tel" inputMode="numeric" autoComplete="tel-national" required placeholder="812 3456 7890"
                defaultValue={wa} className="h-full min-w-0 flex-1 bg-transparent px-3.5 text-base outline-none" />
            </span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-muted">Kata sandi</span>
            <input name="sandi" type="password" autoComplete="current-password" required placeholder="Kata sandi"
              className="h-[52px] w-full rounded-[14px] border border-line bg-white px-4 text-base outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/20" />
          </label>
          <button className="tekan h-[54px] cursor-pointer rounded-2xl bg-emerald text-base font-bold text-white shadow-[0_6px_14px_rgba(15,118,110,0.28)]">Masuk</button>
        </form>

        <div className="mt-4 flex gap-3 rounded-2xl bg-gold-pale/70 p-3.5">
          <span className="text-[13px] leading-relaxed text-gold-ink">
            Belum punya akun? Minta tautan undangan ke pondok lewat WhatsApp. Lupa kata sandi? Hubungi pondok atau TSIQA.
          </span>
        </div>
      </div>
    </main>
  );
}
