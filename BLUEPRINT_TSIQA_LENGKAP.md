# 🕌 TSIQA — Master Blueprint, Design System & Architecture Handoff

> **Tujuan Dokumen Ini:**  
> Dokumen ini ditulis sebagai **Single Source of Truth (Blueprint & Handoff Lengkap)** untuk manusia maupun AI Engineer mana pun yang akan melanjutkan, memelihara, merevisi, atau me-*revamp* proyek **TSIQA**. Dengan membaca dokumen ini saja, seorang engineer atau AI dapat memahami **model bisnis, skema harga 4 paket, alur pendaftaran & verifikasi B2B, arsitektur database, sistem desain (UI/UX), struktur kode, keamanan RLS, hingga filosofi operasional pesantren** dari nol hingga kondisi terkini.

---

## 1. Visi Produk & Model Bisnis (3 Produk dalam 1 Codebase)

**TSIQA** adalah ekosistem perangkat lunak manajemen dan publikasi pondok pesantren modern di Indonesia. Seluruh lini produk dijalankan dari **satu codebase terpadu** (`D:\TSIQA\tsiqa-app`) berbasis **Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + Supabase (PostgreSQL + Auth + RLS)**:

1. **Produk 1 — TSIQA Cloud (Multi-Tenant SaaS)**:
   - Pondok berlangganan bulanan/tahunan berdasarkan **Kuota Santri (Core)** ditambah **Modul Add-on** yang bisa dinyalakan/dimatikan per pondok (`addon_pondok`).
   - Dikendalikan oleh tim internal TSIQA melalui **Konsol Master (`/konsol`)**.
2. **Produk 2 — Website Pondok (CMS Fleksibel)**:
   - Bisa dipesan **terpisah** (pondok hanya beli Website tanpa SaaS administrasi) maupun **digabung** sebagai modul di dalam SaaS.
   - Bila pondok hanya memesan Website: di `/konsol` hanya modul `website` yang diaktifkan, dan akun pengurusnya hanya diberi centang akses `website`. Saat login, sidebar pengurus tersebut hanya menampilkan menu CMS Website!
   - Halaman publiknya tayang di `/p/[kode-pondok]` (siap dihubungkan ke custom domain pondok).
3. **Produk 3 — Aplikasi Jual Putus (On-Premise / Standalone)**:
   - Codebase yang sama persis dapat di-deploy mandiri untuk satu pondok besar dengan mengaktifkan seluruh modul.

---

## 2. Skema Harga Resmi & 4 Paket Bundling (`src/app/_lib/pricing.ts` & `src/lib/harga.ts`)

- **TSIQA Core (Wajib)**:
  - **Rp59.000 / bulan** mencakup kapasitas hingga **150 santri aktif** (data alumni gratis, tidak memakan kuota).
  - Penambahan kuota: **+Rp15.000 / bulan** untuk setiap kelipatan **100 santri aktif**.
- **Diskon Bundling Modul Add-on** (dihitung dari subtotal modul tambahan):
  - Ambil **3–4 modul**: **Diskon 10%**.
  - Ambil **5 modul atau lebih**: **Diskon 15%**.
- **Diskon Langganan Tahunan**:
  - **Bayar 11 bulan** untuk masa aktif 12 bulan penuh (**Gratis 1 bulan penuh**, `BULAN_BAYAR_TAHUNAN = 11`).
- **Harga Kesepakatan Khusus (Custom Deal per Pondok)**:
  - Di halaman `/konsol/pondok/[id]`, Admin TSIQA dapat menetapkan **Nominal Bulanan Disepakati (`harga_khusus`)** beserta **Catatan Kesepakatan (`catatan_harga`)** (mis. untuk Pondok Perintis / Wakaf / Beasiswa). Harga khusus ini otomatis menggantikan rumus standar di Konsol, Dashboard Langganan Pondok (`/modul`), dan Surat Penawaran / Invoice Resmi.
- **Biaya Setup Data Awal (Opsional)**:
  - Input mandiri via template Excel: **Gratis (Rp0)**.
  - Dibantu tim TSIQA (migrasi data terima beres & bimbingan admin): **Rp1.000 / santri** (minimum charge **Rp150.000**).
- **Harga Modul Add-on Bulanan**:
  - `spp` (SPP, Kasir & Tabungan Santri): **Rp20.000**
  - `wa` (WhatsApp Auto-Bot Gateway): **Rp20.000**
  - `portal-wali` (Portal Wali Santri PWA): **Rp20.000**
  - `akademik` (Akademik & E-Rapor): **Rp30.000**
  - `portal-guru` (Portal Guru & Staf Pegawai): **Rp15.000**
  - `tahfidz` (Tahfidz & Muroja'ah Al-Qur'an): **Rp15.000**
  - `perizinan` (Perizinan & Keamanan Asrama): **Rp15.000**
  - `ppdb` (PPDB / PSB Online): **Rp10.000**
  - `kas-dapur` (Kas Operasional & Dapur): **Rp10.000**
  - `poskestren` (Poskestren / Kesehatan Santri): **Rp10.000**
  - `website` (Website Pondok CMS — di Konsol): **Rp25.000**
- **4 Paket Pilihan di Landing Page (`/`)**:
  1. **Perintis** (`Rp59.000/bln` · ≤150 santri): Core (Buku induk santri, kamar, kelas, alumni gratis, pengingat WA 1-klik, impor Excel).
  2. **Administrasi** (`Rp113.000/bln` · ≤150 santri): Core + SPP, WA Auto-Bot, Portal Wali (sudah termasuk diskon modul 10%).
  3. **Terpadu** (`Rp159.250/bln` · ≤200 santri · *Paling banyak dipilih*): Administrasi + Akademik & E-Rapor + Portal Guru & Staf (sudah termasuk diskon modul 15%).
  4. **Lengkap** (`Rp229.250/bln` · ≤350 santri): Seluruh 10 modul aktif (sudah termasuk diskon modul 15%).

---

## 3. Filosofi & Prinsip Kerja (WAJIB Dipatuhi AI / Developer)

1. **Bukan Aplikasi Sekolah Umum, Tapi Pesantren Nyata**:
   - Pesantren punya istilah, ritme, dan struktur unik: *Syahriah/SPP, Kamar Asrama & Musyrif, Kelas Diniyah & Formal, Kalender Hijriah dengan koreksi rukyat/isbat (`geser_hijriah`), Halaqah Tahfidz, Izin Pulang/Bermalam/Libur Pondok*.
   - Fitur harus **praktis dan cepat (1-layar)**, tidak boleh bertele-tele dengan birokrasi klik yang membuat ustadz/pengurus malas mengisi data.
2. **Alur Pendaftaran Pondok Baru Terverifikasi Admin & Dokumen Resmi B2B**:
   - Pendaftaran di `/daftar` membuat user terkonfirmasi (`email_confirm: true` via Service Role) sehingga pendaftar **tidak dikirimi email verifikasi berbahasa Inggris dari Supabase**, lalu langsung diarahkan ke `/mulai`.
   - Di `/mulai`, pengurus mengisi **Nama Pondok, Kode Pondok, Kota/Kabupaten, Nama Pimpinan / Pengasuh Pondok (`nama_pimpinan`), Nama Pengurus Admin, dan Nomor WhatsApp Aktif**.
   - Setelah submit `/mulai`, status langganan pondok diset ke **`menunggu`** (`status = 'berhenti'`, `siklus = 'percobaan'`).
   - Selama status masih `menunggu`, pengurus yang login ke `/(app)` ditahan di layar **"Pendaftaran Pondok Diterima — Menunggu Verifikasi Admin"** dengan tombol 1-klik **Konfirmasi via WhatsApp ke Admin TSIQA**, serta tombol unduh/cetak **Surat Penawaran & Invoice** dan **Piagam SLA**.
   - Admin TSIQA cukup membuka `/konsol/pondok/[id]` lalu klik tombol **"Setujui & Aktifkan (14 Hari)"** untuk membuka ruang kerja pondok tersebut.
   - **3 Dokumen Resmi Siap Cetak A4/PDF (`/dokumen/langganan/[pondok_id]/...`)**:
     1. **Surat Penawaran & Invoice (`/dokumen/langganan/[pondok_id]/invoice`)**: Berkop resmi TSIQA untuk bahan musyawarah pengurus dengan Kyai/Yayasan, memuat rincian Core + Modul Aktif (atau Harga Kesepakatan Khusus) serta perbandingan opsi Bulanan vs Tahunan (Bayar 11 Bulan, Gratis 1 Bulan).
     2. **Piagam Kesepakatan Layanan & Garansi Tsiqah / SLA (`/dokumen/langganan/[pondok_id]/sla`)**: Lembar pegangan resmi yayasan berisi jaminan 100% kepemilikan data pondok, Garansi 30 Hari Uang Kembali Utuh, dan perlindungan Masa Tenggang 7 Hari.
     3. **Kwitansi Pembayaran Lunas (`/dokumen/langganan/[pondok_id]/kwitansi/[bayar_id]`)**: Bukti pembayaran resmi dengan nominal angka, ejaan *Terbilang Rupiah*, masa aktif baru, dan stempel **LUNAS TERVERIFIKASI** untuk pembukuan bendahara yayasan.
3. **Bantuan Reset Kata Sandi Langsung dari Konsol (Tanpa Ketergantungan Email)**:
   - Di `/konsol/pondok/[id]`, tabel **Staf & Pengguna Pesantren** dilengkapi form **Reset Sandi** per pengguna (`admin.auth.admin.updateUserById`). Bila pengurus pondok lupa sandi dan menghubungi WhatsApp Admin TSIQA, Admin TSIQA dapat mengatur ulang sandinya dalam 5 detik.
4. **Privasi & Kedaulatan Data Pondok (Zero Snooping)**:
   - Tim Master Admin TSIQA (`/konsol`) **hanya** mengelola status lisensi, verifikasi pendaftaran, kuota santri, tagihan langganan, harga kesepakatan khusus, sakelar modul (`addon_pondok`), dan bantuan reset sandi akun pengurus.
   - Tidak ada tautan pintas dari `/konsol` untuk mengintip buku kas, nilai, atau data internal santri pondok. Kebijakan Row-Level Security (RLS) PostgreSQL mengunci penuh setiap baris data dengan `pondok_id in (select pondok_saya())`.
5. **Hak Akses Pengurus Berbasis Modul (Multi-Select Checkboxes)**:
   - Di halaman `/pengguna`, Admin Utama pondok (`peran = 'admin'`) memberikan hak akses kepada pengurus menggunakan **centang per-modul (`akses_modul: string[]`)**:
     - `core` (Santri, Kamar, Kelas, Penempatan)
     - `keuangan` (Tagihan, Terima Bayar, Kwitansi, Keringanan, Laporan Kas, Konfirmasi Transfer)
     - `akademik` (Guru, Mapel, Jadwal, Absensi, Nilai & E-Rapor)
     - `tahfidz` (Setoran & Absen Harian, Kenaikan Juz, Kelompok Halaqah)
     - `portal_wali` (Undangan & Akun Wali Santri)
     - `perizinan` (Pos Izin Keluar/Pulang/Libur, Laporan Keterlambatan, Buku Pelanggaran)
     - `website` (CMS Website Pondok: Tampilan & Seksi, Profil & Unit, Berita & Pengumuman, Galeri, Info PSB)
6. **Kedaulatan Backup Mandiri per Pondok**:
   - Setiap Admin Utama pondok dapat mengunduh seluruh arsip datanya sendiri kapan saja melalui `/pengaturan` dalam format **Excel Multi-Sheet (`.xlsx`)** maupun **JSON (`.json`)** melalui endpoint `/pengaturan/backup`. Query backup dikunci ganda dengan RLS + `.eq("pondok_id", pondokId)`.

---

## 4. Sistem Desain (Design System, Responsivitas HP & Tema)

Mengacu penuh pada dokumen [`D:\TSIQA\design.md`](file:///D:/TSIQA/design.md):
- **Gaya Visual**: *Quiet Minimalism + Soft Modern + Academic Tech*. Tenang, berwibawa, tipografi tajam (`Plus Jakarta Sans`), tanpa dekorasi berlebihan.
- **Responsivitas Mobile-First di Landing Page (`/`)**:
  - Dirancang agar proporsional di layar HP kecil (`360px–430px`): ukuran judul `h1` `22px` di HP (`sm:text-4xl lg:text-[44px]`), judul seksi `h2` `19px` di HP (`sm:text-2xl lg:text-[30px]`), kartu pembeda 2 kolom ringkas di HP, serta komponen simulasi `HeroMock`, `ProductTour`, dan `Pricing` yang ramping tanpa *overflow* horizontal.
- **Aturan Ketat Mode Malam (`PenjagaTemaRoute` di `src/components-tema.tsx`)**:
  - **Mode Malam HANYA aktif di dalam Dashboard Aplikasi Pondok (`/(app)`) dan Konsol TSIQA (`/konsol`)**.
  - Halaman publik dan dokumen cetak seperti **Landing Page TSIQA (`/`, `/mulai`, `/privasi`), Halaman Auth (`/masuk`, `/daftar`, `/lupa-sandi`, `/atur-sandi`), Dokumen Cetak (`/dokumen/...`), dan Website Publik Pondok (`/p/[kode]`)** **DIKUNCI SELALU MODE TERANG (`data-theme="light"`)** agar estetika landing page dan cetakan kertas A4 tidak rusak oleh preferensi dark mode dashboard.
- **Logo Resmi (Tanpa Logo Huruf "T" Lama)**:
  - Seluruh aplikasi (Landing Page, Dashboard Pondok, Konsol, Portal Guru, Portal Wali PWA, Dokumen Resmi, dan Favicon) menggunakan aset resmi `/logo-tsiqa.svg`, `/logo-tsiqa.png`, dan `/tulisan-tsiqa.svg` di `public/`. Seluruh logo placeholder huruf `"T"` lama telah dihapus dari folder aktif dan diarsipkan ke `D:\TSIQA\arsip\desain-dan-logo\logo-lama-huruf-T`.

---

## 5. Peta Direktori Workspace (`D:\TSIQA`)

```text
D:\TSIQA\
├── BLUEPRINT_TSIQA_LENGKAP.md      # Dokumen Blueprint & Handoff Utama ini
├── design.md                       # Panduan Design System TSIQA
├── arsip\                          # Seluruh backup, dokumen lama, & aset mentah
│   ├── backup-versi-lama\          # Arsip zip & folder versi terdahulu
│   ├── desain-dan-logo\            # Master logo resmi (.cdr/.svg/.png) & arsip logo lama
│   └── dokumen-dan-proposal\       # Proposal .docx & catatan rancangan awal
└── tsiqa-app\                      # SATU-SATUNYA CODEBASE AKTIF (Next.js 15 + Supabase)
    ├── public\
    │   ├── logo-tsiqa.svg          # Simbol logo resmi TSIQA (vektor)
    │   ├── logo-tsiqa.png          # Simbol logo resmi TSIQA (raster/PWA icon)
    │   ├── tulisan-tsiqa.svg       # Wordmark resmi TSIQA (vektor)
    │   └── tulisan-tsiqa.png       # Wordmark resmi TSIQA (raster)
    ├── supabase\
    │   └── migrations\             # Seluruh skema PostgreSQL + fungsi RPC + RLS
    │       ├── 0001_inti.sql       # Tabel pondok, anggota_pondok, langganan, modul, addon_pondok, tahun_ajaran, kamar, kelas, santri
    │       ├── 0002_modul_keuangan.sql
    │       ├── 0003_modul_portal_wali.sql
    │       ├── 0004_katalog_modul_lengkap.sql
    │       ├── 0005_batasi_pondok_per_akun.sql
    │       ├── 0006_portal_wali_lengkap.sql
    │       ├── 0007_wali_tautkan.sql
    │       ├── 0008_akademik.sql
    │       ├── 0009_geser_hijriah.sql
    │       ├── 0010_peran_pengurus.sql
    │       ├── 0011_website_cms.sql
    │       ├── 0012_perizinan_keamanan.sql
    │       ├── 0013_tahfidz.sql
    │       └── 9999_paket_migrasi_terbaru.sql # Gabungan 0010–0013 siap sekali Run di Supabase SQL Editor
    └── src\
        ├── components-ui.tsx       # Sistem komponen UI (Kartu, HeaderHalaman, Lencana, Ikon, input, tombol)
        ├── components-shell.tsx    # KerangkaApp (Sidebar responsif, Palet Perintah Ctrl+K, Header Hijriah, SakelarTema)
        ├── components-tema.tsx     # SakelarTema (Terang/Malam/Otomatis) + PenjagaTemaRoute
        ├── lib\
        │   ├── konteks.ts          # Fungsi konteks() pengguna aktif + DAFTAR_AKSES_MODUL + bolehAksesModul()
        │   ├── modul.ts            # Fungsi daftarModul() & modulAktif() (MODUL_SIAP)
        │   ├── website.ts          # Tipe, preset tema, daftar seksi on/off CMS Website Pondok
        │   ├── wali.ts             # Loader data Portal Wali (tagihan, pembayaran, rapor, tahfidz, perizinan)
        │   ├── harga.ts            # Kalkulator harga Core Rp59rb + diskon modul + BULAN_BAYAR_TAHUNAN = 11 + statusAkses()
        │   ├── harga-kesepakatan.ts# Penyimpanan & pembacaan Harga Kesepakatan Khusus per pondok + terbilangRupiah()
        │   ├── hijriah.ts          # Konversi kalender Hijriah Umm al-Qura + koreksi hari
        │   └── supabase\           # Client Supabase (server.ts, client.ts, admin.ts)
        └── app\
            ├── page.tsx            # Landing Page Pemasaran TSIQA (4 Paket + Tahunan 11 Bulan + Mobile-Friendly)
            ├── daftar\page.tsx     # Langkah 1 Pendaftaran Pondok (Auto-confirm tanpa email Supabase)
            ├── mulai\page.tsx      # Langkah 2 Pendaftaran Pondok (Nama, Kode, Kota, Pimpinan, Pengurus, No. WA -> Menunggu Verifikasi)
            ├── lupa-sandi\page.tsx # Reset sandi via email atau bantuan langsung WhatsApp Admin TSIQA
            ├── dokumen\langganan\[pondok_id]\ # Dokumen Resmi A4/PDF (invoice, sla, kwitansi/[bayar_id])
            ├── konsol\             # KONSOL MASTER ADMIN TSIQA (Verifikasi pondok, harga khusus, modul, pembayaran, reset sandi)
            ├── p\[kode]\page.tsx   # WEBSITE PUBLIK PONDOK (SSR dinamis berdasarkan pengaturan CMS pondok)
            ├── guru\               # PORTAL GURU / ASATIDZ
            ├── wali\               # PORTAL WALI SANTRI PWA
            └── (app)\              # DASHBOARD APLIKASI PONDOK
                ├── layout.tsx      # Gatekeeper verifikasi pondok baru + penyusun menu sidebar per modul & hak akses
                ├── hari-ini\       # Beranda ringkasan harian pondok
                ├── santri\, kamar\, kelas\, penempatan\
                ├── keuangan\       # Modul Keuangan & Syahriah
                ├── akademik\       # Modul Akademik & E-Rapor
                ├── tahfidz\        # Modul Tahfidz & Muroja'ah (/tahfidz, /tahfidz/juz, /tahfidz/halaqah)
                ├── perizinan\      # Modul Keamanan & Perizinan (/perizinan, /perizinan/keterlambatan, /perizinan/pelanggaran)
                ├── website\        # Modul CMS Website Pondok (/website, /profil, /tulisan, /galeri, /pendaftaran)
                ├── modul\          # Halaman Langganan Pondok + akses cetak Surat Penawaran, SLA, & Kwitansi Lunas
                ├── wali-santri\    # Kelola tautan undangan WA untuk akun Portal Wali Santri
                ├── pengguna\       # Kelola pengurus & centang hak akses per-modul
                └── pengaturan\     # Profil pondok, tahun ajaran, & endpoint /pengaturan/backup (.xlsx & .json)
```

---

## 6. Rincian Desain Fitur Modul Baru yang Telah Dibangun

### A. Modul Website Pondok (CMS Fleksibel) — `/website` & `/p/[kode]`
- **Konsep**: Setiap pondok memiliki kebutuhan seksi profil yang berbeda. Pengurus dapat menyalakan/mematikan **9 Seksi Halaman** menggunakan checkbox (`profil`, `statistik`, `program`, `unit`, `pengumuman`, `berita`, `galeri`, `pendaftaran`, `kontak`) serta memilih **4 Preset Tema Warna** (`zamrud`, `emas`, `samudra`, `klasik`).
- **Angka Statistik Otomatis**: Seksi statistik di `/p/[kode]` otomatis menghitung jumlah santri aktif, kamar, dan kelas dari database pondok secara *real-time*.

### B. Modul Keamanan & Perizinan Asrama — `/perizinan`
- **Diadaptasi dari pengalaman riil aplikasi pesantren (`sidalma`)**:
  - Saat santri meminta izin di pos keamanan (*Izin Pulang Bermalam, Izin Keluar Sebentar, Izin Berobat, atau Libur Resmi Pondok*), status langsung menjadi **`Sedang di Luar`** (tanpa birokrasi approval berlapis).
  - Tersedia tombol **WA Wali 1-Klik** untuk mengabarkan batas kembali santri kepada orang tua.
  - Saat santri tiba kembali di pos, petugas klik **"✓ Tandai Sudah Kembali"**. Sistem otomatis menghitung selisih menit/jam/hari dari `batas_kembali`.
  - **Kebijakan Fleksibel (Tanpa Denda Paksa)**: Keterlambatan tidak otomatis dikenai denda rupiah, melainkan masuk ke **Laporan Keterlambatan (`/perizinan/keterlambatan`)** dengan filter kategori (*Seusai Libur Pondok, Izin Pulang, Izin Keluar*) dan kolom **Catatan Kebijakan / Pembinaan Pondok**.
  - Dilengkapi **Buku Disiplin & Pelanggaran (`/perizinan/pelanggaran`)** untuk mencatat pelanggaran tata tertib (*Ringan / Sedang / Berat*) beserta poin dan tindak lanjut ta'zir.

### C. Modul Tahfidz & Muroja'ah Al-Qur'an — `/tahfidz`
- **Diadaptasi dari evaluasi aplikasi tahfidz (`mybusyro_v2` & SIM Tahfidz modern) dengan filosofi Ultra-Simpel**:
  - **1 Tabel Cepat (`/tahfidz`)**: Pilih Kelompok Halaqah & Tanggal $\rightarrow$ muncul daftar santri. Dalam satu baris hanya ada: **Kehadiran (`Hadir/Izin/Sakit/Alpa`)**, **Tambah Hafalan (Ziyadah)**, dan **Ulang Hafalan (Muroja'ah)** (tanpa kolom nilai kualitas yang membebani ustadz). Bila santri tidak menambah/mengulang hafalan hari itu, cukup dikosongkan.
  - **Kenaikan Juz (`/tahfidz/juz`)**: Mencatat kelulusan Juz (`1` s/d `30`) per santri dan menampilkan rekap lencana Juz yang telah dikuasai beserta totalnya.
  - **Kelompok Halaqah (`/tahfidz/halaqah`)**: Mengelompokkan santri per ustadz/muhaffizh pengampu.
  - **Terhubung ke Portal Wali (`/wali`)**: Wali santri otomatis melihat lencana Juz Lulus dan 5 setoran terakhir anaknya di beranda `/wali`.

---

## 7. Daftar Backlog / Pengembangan Selanjutnya (Next Roadmap)

1. **Modul PPDB / PSB Online (`/ppdb` + `/p/[kode]/daftar`)**:
   - Calon wali santri mengisi formulir pendaftaran langsung di website pondok (`/p/[kode]/daftar`) $\rightarrow$ data masuk ke `/ppdb` di dashboard pondok $\rightarrow$ panitia klik *"Terima jadi Santri Aktif"* untuk memindahkan data pendaftar langsung ke tabel `santri`.
2. **Modul Tahfidz Mutun Ilmiah (Custom Add-on Khusus Pondok Salaf)**:
   - Modul terpisah dari Tahfidz Al-Qur'an (tidak ditampilkan di penawaran umum, hanya diaktifkan dari `/konsol` bila ada pondok yang meminta) untuk mencatat setoran kitab/matan (*Jurumiyah, Imrithi, Alfiyah, Aqidatul Awam*).
3. **Modul Tabungan / Uang Saku Santri**:
   - Pencatatan mutasi setor & tarik uang saku santri di pondok.
4. **Modul Poskestren & Kas Operasional/Dapur**:
   - Rekam kesehatan santri & buku kas pengeluaran operasional dapur pondok.

---

## 8. Panduan Perintah Teknis (Developer Cheat Sheet)

- **Lokasi Proyek**: `D:\TSIQA\tsiqa-app`
- **Menjalankan Server Development**:
  ```bash
  npm --prefix "D:\TSIQA\tsiqa-app" run dev
  ```
- **Menjalankan Pemeriksaan Tipe (TypeScript Check — Wajib 0 Error)**:
  ```bash
  npm --prefix "D:\TSIQA\tsiqa-app" run typecheck
  ```
- **Menjalankan Migrasi Database Baru**:
  Buka **Supabase Dashboard $\rightarrow$ SQL Editor**, lalu jalankan isi file:
  `D:\TSIQA\tsiqa-app\supabase\migrations\9999_paket_migrasi_terbaru.sql`
