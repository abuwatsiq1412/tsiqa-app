import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { emailWali, samarkanNomor } from "@/lib/akun-wali";
import { namaPendek } from "@/lib/wali";
import { Bintang } from "@/components-wali-ikon";

/** Memuat undangan yang masih berlaku. Kode panjang acak berfungsi sebagai rahasia. */
async function muatUndangan(kode: string) {
  if (!/^[a-f0-9]{64}$/.test(kode)) return { status: "tidak_valid" as const };
  const admin = supabaseAdmin();
  const { data: u } = await admin.from("undangan_wali").select("id, pondok_id, santri_id, no_wa, kedaluwarsa, dipakai_pada").eq("kode", kode).maybeSingle();
  if (!u) return { status: "tidak_valid" as const };
  if (u.dipakai_pada) return { status: "dipakai" as const, no: u.no_wa as string };
  if (new Date(u.kedaluwarsa) < new Date()) return { status: "kedaluwarsa" as const };
  const [{ data: s }, { data: p }] = await Promise.all([
    admin.from("santri").select("nama, panggilan").eq("id", u.santri_id).maybeSingle(),
    admin.from("pondok").select("nama").eq("id", u.pondok_id).maybeSingle(),
  ]);
  return { status: "ok" as const, u, santri: s as { nama: string; panggilan: string | null } | null, pondok: (p as { nama: string } | null)?.nama ?? "Pondok" };
}

async function aktifkan(form: FormData) {
  "use server";
  const kode = String(form.get("kode") ?? "");
  const sandi = String(form.get("sandi") ?? "");
  const ulang = String(form.get("ulang") ?? "");
  const m = await muatUndangan(kode);
  if (m.status !== "ok") redirect(`/wali/aktivasi?k=${kode}`);
  if (sandi.length < 8) redirect(`/wali/aktivasi?k=${kode}&galat=1`);
  if (sandi !== ulang) redirect(`/wali/aktivasi?k=${kode}&galat=2`);

  const admin = supabaseAdmin();
  const no = m.u.no_wa as string;
  const { error } = await admin.auth.admin.createUser({
    email: emailWali(no), password: sandi, email_confirm: true,
    app_metadata: { peran: "wali", no_wa: no }, // hanya service role yang bisa menulis ini
  });
  if (error && !/already|registered|exists/i.test(error.message)) redirect(`/wali/aktivasi?k=${kode}&galat=1`);
  if (error) {
    // Nomor ini sudah punya akun (mis. wali dari beberapa anak): cukup masuk, tautan anak ditambah otomatis.
    await admin.from("undangan_wali").update({ dipakai_pada: new Date().toISOString() }).eq("id", m.u.id);
    redirect(`/wali/masuk?galat=3&wa=${no}`);
  }
  await admin.from("undangan_wali").update({ dipakai_pada: new Date().toISOString() }).eq("id", m.u.id);

  const sb = await supabaseServer();
  const { error: e2 } = await sb.auth.signInWithPassword({ email: emailWali(no), password: sandi });
  if (e2) redirect(`/wali/masuk?wa=${no}`);
  await sb.rpc("tautkan_wali");
  redirect("/wali");
}

const PESAN: Record<string, string> = { "1": "Kata sandi minimal 8 karakter.", "2": "Kedua kata sandi belum sama." };

export default async function Aktivasi({ searchParams }: { searchParams: Promise<{ k?: string; galat?: string }> }) {
  const { k = "", galat } = await searchParams;
  const m = await muatUndangan(k);
  const bukaMasuk = (
    <Link href="/wali/masuk" className="tekan mt-5 flex h-[50px] items-center justify-center rounded-2xl bg-emerald text-[15px] font-bold text-white">Ke halaman masuk</Link>
  );

  return (
    <main className="relative min-h-screen bg-ivory text-ink">
      <div className="relative h-[250px] overflow-hidden bg-forest">
        <Bintang className="pointer-events-none absolute -right-24 -top-16 h-[320px] w-[320px] opacity-30" />
        <div className="relative mx-auto max-w-md px-7 pt-14">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/95 p-2 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-tsiqa.svg" alt="TSIQA" className="h-full w-full object-contain" />
          </span>
          <h1 className="mt-5 text-[28px] font-extrabold leading-tight tracking-tight text-white">
            {m.status === "ok" ? `Selamat datang, wali ${namaPendek(m.santri ?? { nama: "santri", panggilan: null })}` : "TSIQA Wali"}
          </h1>
          {m.status === "ok" && <p className="mt-2 text-[15px] text-white/80">{m.pondok}</p>}
        </div>
      </div>

      <div className="relative -mt-7 mx-auto min-h-[calc(100vh-222px)] max-w-md rounded-t-[28px] bg-white px-6 pb-10 pt-7 shadow-[0_-8px_24px_rgba(24,38,34,0.08)]">
        {m.status === "ok" ? (
          <>
            <h2 className="text-xl font-extrabold tracking-tight">Buat kata sandi</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              Anda masuk dengan nomor WhatsApp {samarkanNomor(m.u.no_wa as string)} dan kata sandi ini.
            </p>
            {galat && PESAN[galat] && <p role="alert" className="mt-3 rounded-xl bg-belum-bg px-4 py-3 text-[13px] font-medium text-belum">{PESAN[galat]}</p>}
            <form action={aktifkan} className="mt-5 flex flex-col gap-4">
              <input type="hidden" name="kode" value={k} />
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-semibold text-muted">Kata sandi (minimal 8 karakter)</span>
                <input name="sandi" type="password" minLength={8} required autoComplete="new-password"
                  className="h-[52px] w-full rounded-[14px] border border-line bg-white px-4 text-base outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/20" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-semibold text-muted">Ulangi kata sandi</span>
                <input name="ulang" type="password" minLength={8} required autoComplete="new-password"
                  className="h-[52px] w-full rounded-[14px] border border-line bg-white px-4 text-base outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/20" />
              </label>
              <button className="tekan h-[54px] cursor-pointer rounded-2xl bg-emerald text-base font-bold text-white shadow-[0_6px_14px_rgba(15,118,110,0.28)]">Aktifkan akun</button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-xl font-extrabold tracking-tight">
              {m.status === "dipakai" ? "Tautan sudah dipakai" : m.status === "kedaluwarsa" ? "Tautan sudah kedaluwarsa" : "Tautan tidak dikenali"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {m.status === "dipakai" ? "Akun Anda sudah aktif. Silakan masuk dengan nomor WhatsApp dan kata sandi Anda." : "Minta tautan undangan baru kepada pondok lewat WhatsApp."}
            </p>
            {bukaMasuk}
          </>
        )}
      </div>
    </main>
  );
}
