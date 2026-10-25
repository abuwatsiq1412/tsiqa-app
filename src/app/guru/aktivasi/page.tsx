import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { emailGuru, samarkanNomor } from "@/lib/akun-wali";
import { Bintang } from "@/components-wali-ikon";

async function muatUndangan(kode: string) {
  if (!/^[a-f0-9]{64}$/.test(kode)) return { status: "tidak_valid" as const };
  const admin = supabaseAdmin();
  const { data: u } = await admin.from("undangan_guru").select("id, pondok_id, guru_id, no_wa, kedaluwarsa, dipakai_pada").eq("kode", kode).maybeSingle();
  if (!u) return { status: "tidak_valid" as const };
  if (u.dipakai_pada) return { status: "dipakai" as const };
  if (new Date(u.kedaluwarsa) < new Date()) return { status: "kedaluwarsa" as const };
  const [{ data: g }, { data: p }] = await Promise.all([
    admin.from("guru").select("nama").eq("id", u.guru_id).maybeSingle(),
    admin.from("pondok").select("nama").eq("id", u.pondok_id).maybeSingle(),
  ]);
  return { status: "ok" as const, u, nama: (g?.nama as string) ?? "Guru", pondok: (p?.nama as string) ?? "Pondok" };
}

async function aktifkan(form: FormData) {
  "use server";
  const kode = String(form.get("kode") ?? "");
  const sandi = String(form.get("sandi") ?? ""), ulang = String(form.get("ulang") ?? "");
  const m = await muatUndangan(kode);
  if (m.status !== "ok") redirect(`/guru/aktivasi?k=${kode}`);
  if (sandi.length < 8) redirect(`/guru/aktivasi?k=${kode}&galat=1`);
  if (sandi !== ulang) redirect(`/guru/aktivasi?k=${kode}&galat=2`);
  const admin = supabaseAdmin();
  const no = m.u.no_wa as string;
  const { error } = await admin.auth.admin.createUser({ email: emailGuru(no), password: sandi, email_confirm: true, app_metadata: { peran: "guru", no_wa: no } });
  if (error && !/already|registered|exists/i.test(error.message)) redirect(`/guru/aktivasi?k=${kode}&galat=1`);
  await admin.from("undangan_guru").update({ dipakai_pada: new Date().toISOString() }).eq("id", m.u.id);
  if (error) redirect(`/guru/masuk?galat=3&wa=${no}`);
  const sb = await supabaseServer();
  const { error: e2 } = await sb.auth.signInWithPassword({ email: emailGuru(no), password: sandi });
  if (e2) redirect(`/guru/masuk?wa=${no}`);
  await sb.rpc("tautkan_guru");
  redirect("/guru");
}

const PESAN: Record<string, string> = { "1": "Kata sandi minimal 8 karakter.", "2": "Kedua kata sandi belum sama." };

export default async function AktivasiGuru({ searchParams }: { searchParams: Promise<{ k?: string; galat?: string }> }) {
  const { k = "", galat } = await searchParams;
  const m = await muatUndangan(k);
  return (
    <main className="min-h-screen bg-ivory text-ink">
      <div className="relative h-[230px] overflow-hidden bg-forest">
        <Bintang className="pointer-events-none absolute -right-24 -top-16 h-[320px] w-[320px] opacity-30" />
        <div className="relative mx-auto max-w-md px-7 pt-14">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4f9f7] p-2 shadow-sm border border-emerald/25">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-tsiqa.svg" alt="TSIQA" className="h-full w-full object-contain" />
          </div>
          <h1 className="mt-5 text-[26px] font-extrabold leading-tight tracking-tight text-white">{m.status === "ok" ? `Selamat datang, ${m.nama}` : "TSIQA Guru"}</h1>
          {m.status === "ok" && <p className="mt-1.5 text-[15px] text-white/80">{m.pondok}</p>}
        </div>
      </div>
      <div className="relative -mt-7 mx-auto min-h-[calc(100vh-202px)] max-w-md rounded-t-[28px] bg-white px-6 pb-10 pt-7 shadow-[0_-8px_24px_rgba(24,38,34,0.08)]">
        {m.status === "ok" ? (
          <>
            <h2 className="text-xl font-extrabold tracking-tight">Buat kata sandi</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">Anda masuk dengan nomor WhatsApp {samarkanNomor(m.u.no_wa as string)} dan kata sandi ini.</p>
            {galat && PESAN[galat] && <p role="alert" className="mt-3 rounded-xl bg-belum-bg px-4 py-3 text-[13px] font-medium text-belum">{PESAN[galat]}</p>}
            <form action={aktifkan} className="mt-5 flex flex-col gap-4">
              <input type="hidden" name="kode" value={k} />
              <input name="sandi" type="password" minLength={8} required placeholder="Kata sandi (min. 8 karakter)" autoComplete="new-password" className="h-[52px] rounded-[14px] border border-line px-4 text-base outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/20" />
              <input name="ulang" type="password" minLength={8} required placeholder="Ulangi kata sandi" autoComplete="new-password" className="h-[52px] rounded-[14px] border border-line px-4 text-base outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/20" />
              <button className="tekan h-[54px] cursor-pointer rounded-2xl bg-emerald text-base font-bold text-white">Aktifkan akun</button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-xl font-extrabold tracking-tight">{m.status === "dipakai" ? "Tautan sudah dipakai" : m.status === "kedaluwarsa" ? "Tautan sudah kedaluwarsa" : "Tautan tidak dikenali"}</h2>
            <p className="mt-2 text-sm text-muted">{m.status === "dipakai" ? "Silakan masuk dengan nomor WhatsApp dan kata sandi Anda." : "Minta tautan undangan baru kepada pondok."}</p>
            <Link href="/guru/masuk" className="tekan mt-5 flex h-[50px] items-center justify-center rounded-2xl bg-emerald text-[15px] font-bold text-white">Ke halaman masuk</Link>
          </>
        )}
      </div>
    </main>
  );
}
