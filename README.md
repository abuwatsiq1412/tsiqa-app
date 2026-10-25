# TSIQA (aplikasi)

SaaS administrasi dan syahriyah pesantren. Next.js 15 (App Router) + Supabase. 

## Isi
- **Konsol TSIQA** (`/konsol`, khusus staf): daftar pondok + ringkasan, langganan, kuota, modul aktif, catat pembayaran & perpanjang, katalog modul.
- **Core:** santri (impor/ekspor Excel), kamar, kelas, penempatan massal, tahun ajaran, pengguna dan peran, pengaturan pondok.
- **Modul:** katalog 8 modul; baru **Keuangan** yang dibangun: tagihan (terbit bulanan massal, pengingat WhatsApp manual), terima pembayaran, kwitansi (A4 dan struk 80mm), pembatalan, laporan kas + ekspor Excel, keringanan santri, pengaturan syahriyah dan rekening. Lainnya tampil "Menyusul".
- `supabase/migrations/`: **0001_inti** (Core, berdiri sendiri), **0002_modul_keuangan**, **0003_modul_portal_wali** (bergantung pada Keuangan). Inti tidak mengenal tabel modul. Jalankan berurutan.
- Kode modul: `src/modules/<modul>/` (logika dan komponen), `src/app/(app)/<modul>/` (halaman, dijaga satu `layout.tsx`), menu didaftarkan di `src/modules/registry.ts`.
- `supabase/tests/`: uji database (`npm run db:uji`, butuh binary Postgres 15+). `tests/*.test.ts`: uji impor Excel, rumus harga, dan logika keuangan (`npx tsx tests/keuangan.test.ts`).

## Memasang
1. Buat project Supabase. Jalankan berkas di `supabase/migrations/` berurutan (0001 sampai 0005) di SQL Editor.
2. Salin `.env.example` menjadi `.env.local`, isi URL, anon key, service role key, dan `NEXT_PUBLIC_SITE_URL`.
3. Supabase → Authentication → Email Templates: ubah tautan **Invite user** dan **Confirm signup** menjadi
   `{{ .SiteURL }}/auth/konfirmasi?token_hash={{ .TokenHash }}&type=invite` (untuk konfirmasi pendaftaran: `type=signup&next=/mulai`).
4. `npm install` lalu `npm run dev`.
   Tambahkan juga untuk **Reset password**: `{{ .SiteURL }}/auth/konfirmasi?token_hash={{ .TokenHash }}&type=recovery` (dipakai halaman Lupa sandi).
5. Membuat staf TSIQA: daftar dulu lewat aplikasi, lalu jalankan `insert into staf_tsiqa values ('<id pengguna>');` (id ada di Authentication → Users). Staf otomatis diarahkan ke `/konsol` setelah masuk.

## Alur masuk
Satu halaman masuk (`/masuk`). Tujuan ditentukan satu fungsi, `src/lib/arah.ts`: staf TSIQA ke `/konsol`, anggota pondok ke `/hari-ini`, akun tanpa pondok ke `/mulai`. Konsol dan aplikasi pondok memakai satu kerangka (`src/components-shell.tsx`) dengan dua tampilan.
Harga: satu sumber logika di `src/lib/harga.ts`; harga dan ketersediaan modul diatur di Konsol → Katalog & Harga.

## Aturan inti
- Pembayaran hanya lewat `catat_pembayaran` / `batalkan_pembayaran`; tidak ada hapus/ubah langsung.
- Kunci service role hanya dipakai di server, setelah peran pemanggil diperiksa.

## Portal Wali, Portal Guru & Akademik

**Migrasi tambahan** (jalankan berurutan di SQL Editor setelah 0001–0003): `0004`, `0005`, `0006`, `0007`, `0008`.

**Akun tanpa email/SMS.** Wali dan guru masuk dengan nomor WhatsApp + kata sandi (email sintetis `<62nomor>@wali.tsiqa.id` / `@guru.tsiqa.id`, tidak dikirimi apa pun). Pondok mengirim tautan undangan 1-klik lewat WhatsApp dari menu *Wali Santri* / *Akademik → Guru*. Tanda peran disimpan di `app_metadata` (hanya bisa ditulis server). Pendaftaran umum menolak domain-domain itu.

**Alamat:** `/wali` (PWA, bisa dipasang di layar utama), `/guru`, `/wali-santri` dan `/keuangan/konfirmasi` (sisi pondok), `/akademik/*` (admin).

**Notifikasi push.** Buat kunci sekali: `npx web-push generate-vapid-keys`, lalu isi `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (lihat `.env.example`). Tanpa kunci, aplikasi tetap jalan; hanya notifikasi yang nonaktif.

**Bukti transfer** disimpan di bucket privat `bukti-transfer` (dibuat oleh 0006). Bendahara melihatnya lewat tautan bertanda tangan 10 menit.

**Migrasi 0009** menambah pengaturan "Penyesuaian tanggal Hijriah" (header menampilkan tanggal Masehi dan Hijriah).

**Uji database:** `bash supabase/tests/jalankan.sh` (butuh Postgres 15+ lokal).
