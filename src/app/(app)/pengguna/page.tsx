import { TombolKirim } from "@/components-form";
import { bawaanAksesPeran, DAFTAR_AKSES_MODUL, konteks } from "@/lib/konteks";
import {
  AvatarInisial,
  HeaderHalaman,
  Kartu,
  Label,
  Lencana,
  PesanNotifikasi,
  input,
} from "@/components-ui";
import { undangPengguna, ubahPengguna } from "./actions";

interface BarisAnggota {
  id: string;
  nama: string;
  peran: string;
  aktif: boolean;
  akses_modul?: string[] | null;
}

export default async function Pengguna({
  searchParams,
}: {
  searchParams: Promise<{ galat?: string; ok?: string }>;
}) {
  const { galat, ok } = await searchParams;
  const { sb, peran } = await konteks();
  const { data } = await sb
    .from("anggota_pondok")
    .select("*")
    .order("created_at");
  const daftarAnggota = (data ?? []) as BarisAnggota[];
  const admin = peran === "admin";

  return (
    <>
      <HeaderHalaman
        judul="Pengguna & Hak Akses Modul"
        deskripsi="Atur modul mana saja yang boleh diakses oleh setiap pengurus pondok."
      />

      <PesanNotifikasi ok={ok} galat={galat} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {daftarAnggota.map((a) => {
            const adalahAdmin = a.peran === "admin";
            const modulAktif = bawaanAksesPeran(a.peran, a.akses_modul);

            return (
              <Kartu
                key={a.id}
                className={a.aktif ? "" : "opacity-65"}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-3.5">
                  <div className="flex items-center gap-3">
                    <AvatarInisial
                      nama={a.nama}
                      warna={adalahAdmin ? "forest" : "teal"}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink">{a.nama}</span>
                        <Lencana varian={a.aktif ? "lunas" : "netral"}>
                          {a.aktif ? "Aktif" : "Nonaktif"}
                        </Lencana>
                      </div>
                      <div className="mt-0.5 text-xs text-muted">
                        {adalahAdmin
                          ? "Admin Utama · Akses penuh seluruh modul & pengaturan"
                          : `Pengurus Modul · ${modulAktif.length} modul diizinkan`}
                      </div>
                    </div>
                  </div>

                  {admin && (
                    <form action={ubahPengguna}>
                      <input type="hidden" name="id" value={a.id} />
                      <input
                        type="hidden"
                        name="aksi"
                        value={a.aktif ? "nonaktif" : "aktif"}
                      />
                      <button className="cursor-pointer rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-muted transition hover:border-belum/40 hover:text-belum">
                        {a.aktif ? "Nonaktifkan" : "Aktifkan kembali"}
                      </button>
                    </form>
                  )}
                </div>

                {admin && a.aktif ? (
                  <form action={ubahPengguna} className="mt-3.5 space-y-3">
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="aksi" value="akses" />

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-muted">
                        Tingkat Peran:
                      </span>
                      <div className="flex items-center gap-3 text-xs">
                        <label className="inline-flex cursor-pointer items-center gap-1.5 font-medium text-ink">
                          <input
                            type="radio"
                            name="tingkat"
                            value="pengurus"
                            defaultChecked={!adalahAdmin}
                            className="accent-emerald"
                          />
                          Pengurus Modul (Pilih di bawah)
                        </label>
                        <label className="inline-flex cursor-pointer items-center gap-1.5 font-medium text-ink">
                          <input
                            type="radio"
                            name="tingkat"
                            value="admin"
                            defaultChecked={adalahAdmin}
                            className="accent-emerald"
                          />
                          Admin Utama (Semua Modul)
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {DAFTAR_AKSES_MODUL.map((m) => {
                        const dicentang = adalahAdmin || modulAktif.includes(m.kode);
                        return (
                          <label
                            key={m.kode}
                            className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-surface-soft/50 p-2.5 transition hover:border-emerald/40"
                          >
                            <input
                              type="checkbox"
                              name="akses_modul"
                              value={m.kode}
                              defaultChecked={dicentang}
                              className="mt-0.5 h-4 w-4 rounded accent-emerald"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-ink">
                                {m.label}
                              </div>
                              <div className="text-[11px] leading-snug text-muted">
                                {m.ket}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    <div className="flex justify-end pt-1">
                      <button className="cursor-pointer rounded-lg bg-emerald-pale px-3.5 py-1.5 text-xs font-semibold text-emerald transition hover:bg-emerald hover:text-on-brand">
                        Simpan Hak Akses
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {DAFTAR_AKSES_MODUL.filter(
                      (m) => adalahAdmin || modulAktif.includes(m.kode)
                    ).map((m) => (
                      <Lencana key={m.kode} varian="mint" titik={false}>
                        {m.label}
                      </Lencana>
                    ))}
                  </div>
                )}
              </Kartu>
            );
          })}
        </div>

        {admin && (
          <Kartu>
            <h2 className="mb-1 text-base font-semibold text-ink">
              Undang Pengurus Baru
            </h2>
            <p className="mb-4 text-xs text-muted">
              Tautan aktivasi dikirim ke email pengurus dan langsung mengikuti modul yang dicentang.
            </p>
            <form action={undangPengguna} className="space-y-3.5">
              <label className="block">
                <Label>Nama Lengkap *</Label>
                <input
                  name="nama"
                  placeholder="Ust. Fulan"
                  required
                  className={input}
                />
              </label>
              <label className="block">
                <Label>Alamat Email *</Label>
                <input
                  name="email"
                  type="email"
                  placeholder="pengurus@pondok.id"
                  required
                  className={input}
                />
              </label>
              <label className="block">
                <Label>Tingkat Peran</Label>
                <select name="tingkat" defaultValue="pengurus" className={input}>
                  <option value="pengurus">Pengurus Modul (Sesuai Centang)</option>
                  <option value="admin">Admin Utama (Akses Penuh)</option>
                </select>
              </label>

              <div>
                <Label>Modul yang Diizinkan</Label>
                <div className="mt-1.5 space-y-1.5">
                  {DAFTAR_AKSES_MODUL.map((m) => (
                    <label
                      key={m.kode}
                      className="flex cursor-pointer items-start gap-2 rounded-lg border border-line bg-surface-soft/50 px-2.5 py-2 text-xs transition hover:border-emerald/40"
                    >
                      <input
                        type="checkbox"
                        name="akses_modul"
                        value={m.kode}
                        defaultChecked={m.kode === "core"}
                        className="mt-0.5 h-3.5 w-3.5 rounded accent-emerald"
                      />
                      <div>
                        <div className="font-semibold text-ink">{m.label}</div>
                        <div className="text-[11px] text-muted">{m.ket}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <TombolKirim className="w-full">Kirim Undangan Email</TombolKirim>
            </form>
          </Kartu>
        )}
      </div>
    </>
  );
}


