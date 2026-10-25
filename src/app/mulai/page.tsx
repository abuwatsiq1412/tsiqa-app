import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { tujuanSetelahLogin } from "@/lib/arah";
import { adalahStaf } from "@/lib/staf";
import { nomorWA } from "@/lib/format";
import { Kartu, Label, input, tombol, PesanNotifikasi, Ikon } from "@/components-ui";

async function buat(form: FormData) {
  "use server";
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/masuk");

  const nama = String(form.get("nama") ?? "").trim();
  const kode = String(form.get("kode") ?? "").toLowerCase().trim();
  const pengguna = String(form.get("pengguna") ?? "").trim();
  const namaPimpinan = String(form.get("nama_pimpinan") ?? "").trim();
  const kota = String(form.get("kota") ?? "").trim();
  const waRaw = String(form.get("telepon") ?? "").trim();
  const telepon = nomorWA(waRaw);

  if (!/^62[0-9]{8,13}$/.test(telepon)) {
    redirect("/mulai?galat=wa");
  }

  const { data: pondokId, error } = await sb.rpc("buat_pondok", {
    p_nama: nama,
    p_kode: kode,
    p_nama_pengguna: pengguna,
  });
  if (error || !pondokId) redirect("/mulai?galat=1");

  const staf = await adalahStaf();
  const db = process.env.SUPABASE_SERVICE_ROLE_KEY ? supabaseAdmin() : sb;

  // Simpan kota, nama pimpinan/pengasuh, nomor WA pengurus, dan email pada data pondok
  await db
    .from("pondok")
    .update({
      kota: kota || null,
      nama_pimpinan: namaPimpinan || null,
      telepon,
      email: user.email ?? null,
    })
    .eq("id", pondokId);

  // Jika bukan staf internal TSIQA, set status awal sebagai Menunggu Verifikasi Admin
  // (status = 'berhenti' & siklus = 'percobaan', kuota dasar 150 santri)
  if (!staf) {
    await db
      .from("langganan")
      .update({
        status: "berhenti",
        siklus: "percobaan",
        kuota_santri: 150,
      })
      .eq("pondok_id", pondokId);
  }

  redirect("/hari-ini");
}

export default async function Mulai({
  searchParams,
}: {
  searchParams: Promise<{ galat?: string }>;
}) {
  const sb = await supabaseServer();
  const { data: ada } = await sb.from("anggota_pondok").select("id").limit(1);
  if (ada?.length) redirect("/hari-ini");
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/masuk");
  const tujuan = await tujuanSetelahLogin(sb, user.id);
  if (tujuan !== "/mulai") redirect(tujuan);

  const { galat } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ivory px-4 py-12">
      <div className="w-full max-w-md">
        {/* TSIQA Brand Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-2.5 shadow-[0_4px_16px_rgba(24,38,34,0.08)] border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-tsiqa.svg" alt="TSIQA" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Profil Pondok & Penanggung Jawab</h1>
          <p className="mt-1 text-xs text-muted">
            Langkah 2 dari 2 · Data ini digunakan untuk verifikasi & penerbitan dokumen layanan resmi
          </p>
        </div>

        {galat && (
          <div className="mb-4">
            <PesanNotifikasi
              tipe="error"
              pesan={
                galat === "wa"
                  ? "Nomor WhatsApp belum sesuai format (contoh: 081234567890)."
                  : "Kode pondok sudah dipakai atau formatnya belum sesuai (huruf kecil, angka, tanda hubung, minimal 3 karakter)."
              }
            />
          </div>
        )}

        <Kartu className="shadow-[0_4px_20px_rgba(24,38,34,0.04)]">
          <form action={buat} className="space-y-4">
            <div>
              <Label>Nama Pondok Pesantren</Label>
              <input
                name="nama"
                required
                placeholder="Contoh: Pondok Pesantren Al-Hikmah"
                className={input}
              />
            </div>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <Label>Kode Pondok (URL)</Label>
                <input
                  name="kode"
                  required
                  pattern="[a-z0-9-]{3,40}"
                  placeholder="al-hikmah-bogor"
                  className={`${input} font-mono`}
                />
                <span className="mt-1 block text-[11px] text-muted">
                  Huruf kecil & tanda hubung.
                </span>
              </div>
              <div>
                <Label>Kota / Kabupaten</Label>
                <input
                  name="kota"
                  required
                  placeholder="Contoh: Kab. Bogor"
                  className={input}
                />
              </div>
            </div>
            <div>
              <Label>Nama Pimpinan / Pengasuh Pondok</Label>
              <input
                name="nama_pimpinan"
                required
                placeholder="Contoh: KH. Abdullah Syukri, M.A."
                className={input}
              />
            </div>
            <div>
              <Label>Nama Lengkap Anda (Admin / Pengurus Pendaftar)</Label>
              <input
                name="pengguna"
                required
                placeholder="Contoh: Ust. Ahmad Fauzi, Lc."
                className={input}
              />
            </div>
            <div>
              <Label>Nomor WhatsApp Pengurus Aktif</Label>
              <input
                name="telepon"
                type="tel"
                required
                placeholder="Contoh: 081234567890"
                className={input}
              />
              <span className="mt-1 block text-[11px] text-muted">
                Digunakan tim TSIQA untuk mengonfirmasi aktivasi akun pondok Anda.
              </span>
            </div>
            <button className={`${tombol} w-full mt-2`}>
              <Ikon.Centang className="h-4 w-4" />
              Ajukan Pendaftaran Pondok
            </button>
          </form>
        </Kartu>

        <p className="mt-4 text-center text-xs text-muted">
          Setelah diajukan, Anda dapat mengunduh Surat Penawaran Resmi & Lembar Kesepakatan Layanan (SLA).
        </p>
      </div>
    </main>
  );
}
