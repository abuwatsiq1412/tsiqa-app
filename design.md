# TSIQA Design System

> **Tenang seperti serambi masjid. Rapi seperti kitab. Hangat seperti rumah.**

Dokumen ini adalah sumber kebenaran desain untuk dua produk yang berbagi satu sistem token:

| Produk | Pengguna | Perangkat utama | Karakter |
|---|---|---|---|
| **TSIQA Admin** (SaaS) | Admin, bendahara, musyrif, ustadz | Desktop & tablet | Padat, efisien, profesional |
| **TSIQA Wali** (PWA) | Orang tua santri | Android & iPhone | Lega, hangat, menenangkan |

Fondasi: **Next.js + Tailwind v4** (`@theme` di `globals.css`).

---

## 1. Filosofi

Tiga gagasan yang menuntun setiap keputusan:

1. **Quiet Minimalism**: ruang kosong adalah fitur. Tidak ada elemen yang berteriak. Satu layar, satu keputusan utama.
2. **Soft Modern**: sudut membulat, bayangan tipis berwarna hijau-tinta (bukan abu-abu mati), gerak pelan.
3. **Academic Tech**: tipografi bersih, angka sejajar (`tabular-nums`), terasa seperti buku catatan akademik yang dirapikan teknologi.

**Aturan emas:** emas hanya untuk hal yang *benar-benar* istimewa (garansi, pencapaian hafalan, kwitansi). Jika semua hal berkilau, tidak ada yang berkilau.

**Prinsip untuk Wali:** orang tua membuka aplikasi untuk menjawab tiga pertanyaan. *"Anak saya baik-baik saja?"*, *"Apa yang harus saya bayar?"*, *"Ada kabar apa dari pondok?"* Desain harus menjawabnya dalam 3 detik pertama, tanpa perlu menggulir.

---

## 2. Warna

### 2.1 Palet inti

| Token | Hex | Pakai untuk |
|---|---|---|
| `brand` (emerald) | `#0f766e` | Tombol utama, tautan, fokus, item aktif |
| `brand-hover` | `#0d645d` | Hover & pressed tombol utama |
| `brand-pale` | `#ddf4ec` | Latar lencana, sorotan lembut, item terpilih |
| `forest` | `#263b35` | Sidebar, hero gelap, tab bar aktif, footer |
| `forest-light` | `#314b44` | Permukaan di atas forest |
| `ink` | `#182622` | Teks utama |
| `muted` | `#5b6b65` | Teks sekunder, label, placeholder |
| `ivory` | `#f8faf9` | Latar halaman |
| `surface-soft` | `#f1f5f3` | Latar kartu bersarang, baris zebra, input |
| `line` | `#e2e8e5` | Garis tepi, pemisah |
| `white` | `#ffffff` | Permukaan kartu |

### 2.2 Aksen emas (terbatas)

| Token | Hex | Pakai untuk |
|---|---|---|
| `gold` | `#b7791f` | Ikon & garis dekoratif **saja** |
| `gold-ink` | `#7a4f0b` | **Teks** emas (kontras aman) |
| `gold-soft` | `#f1dba0` | Garis tepi kartu istimewa |
| `gold-pale` | `#fbf3dd` | Latar kartu garansi / pencapaian |

> `gold` di atas putih hanya ±3.6:1. Jangan dipakai untuk teks kecil. Pakai `gold-ink`.

### 2.3 Status keuangan

| Status | Teks | Latar | Makna |
|---|---|---|---|
| **Lunas** | `#0f766e` | `#ddf4ec` | Selesai, tenang |
| **Cicilan** | `#92400e` | `#fef3c7` | Berjalan, perlu perhatian ringan |
| **Belum** | `#b91c1c` | `#fee2e2` | Perlu tindakan |

### 2.4 Status kehadiran (baru)

| Status | Teks | Latar |
|---|---|---|
| **Hadir** | `#0f766e` | `#ddf4ec` |
| **Izin** | `#1d4ed8` | `#dbeafe` |
| **Sakit** | `#92400e` | `#fef3c7` |
| **Alpa** | `#b91c1c` | `#fee2e2` |

### 2.5 Aturan penggunaan warna

- Status **tidak boleh** hanya dibedakan lewat warna. Selalu sertakan **ikon + teks** (✓ Lunas, ◐ Cicilan, ! Belum). Ini penting untuk pengguna buta warna dan layar bercahaya matahari.
- Maksimal **satu** tombol berwarna `brand` penuh per layar (aksi utama).
- Merah dipakai hemat. Tagihan belum dibayar adalah informasi, bukan hukuman. Nada kata-katanya juga harus lembut (lihat bagian 11).
- Rasio 60 / 30 / 10: 60% ivory & putih, 30% forest & ink, 10% brand + status + emas.

### 2.6 White-label per pondok (multi-tenant)

Tiap pondok bisa punya warna sendiri dengan menimpa **satu variabel** pada elemen akar:

```html
<html style="--brand: #1d4ed8; --brand-hover: #1e40af; --brand-pale: #dbeafe;">
```

Semua komponen memakai `var(--brand)`, bukan nilai hex. Admin pondok cukup memilih warna dari 6 preset yang sudah lolos uji kontras, tidak ada pemilih warna bebas, supaya tampilan tidak rusak.

---

## 3. Tipografi

**Font utama:** Plus Jakarta Sans (400, 500, 600, 700, 800)
**Font Arab:** Noto Naskh Arabic (400, 600) untuk nama santri, ayat, dan hafalan
**Angka:** selalu `tabular-nums` (sudah global)

### Skala

| Peran | Ukuran / Tinggi baris | Berat | Catatan |
|---|---|---|---|
| Display | 40 / 44 | 800 | Hanya hero landing, letter-spacing −0.02em |
| H1 | 28 / 34 | 700 | Judul halaman (Wali: 24 / 30) |
| H2 | 20 / 28 | 700 | Judul seksi |
| H3 | 16 / 24 | 600 | Judul kartu |
| Body | 15 / 24 | 400 | Teks isi (Wali: 16 / 26) |
| Small | 13 / 20 | 500 | Label, metadata |
| Micro | 11 / 16 | 600 | Lencana, huruf kapital, letter-spacing +0.06em |
| Angka besar | 32 / 36 | 800 | Nominal tagihan, statistik |

### Aturan

- **Input selalu 16px atau lebih** di perangkat sentuh. Di bawah itu, iOS Safari otomatis memperbesar halaman.
- Teks Arab diberi `line-height` 1.9 dan ukuran +2px dari teks Latin di sampingnya, karena aksara Arab terlihat lebih kecil pada ukuran yang sama.
- Nominal rupiah: `Rp 1.250.000` (titik ribuan, spasi setelah Rp, tanpa desimal). Satuan `Rp` ukurannya lebih kecil dan berwarna `muted` agar angka yang menonjol.
- Panjang baris isi maksimal ±65 karakter.

---

## 4. Spasi, Radius, Bayangan

### Spasi (kelipatan 4px)

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 56 · 80`

- Jarak antar-seksi: **32px** (Wali) / **40px** (Admin)
- Padding kartu: **16px** (Wali) / **20px** (Admin)
- Gutter halaman HP: **20px**

### Radius

| Token | Nilai | Pakai |
|---|---|---|
| `radius-sm` | 8px | Lencana, input kecil |
| `radius-md` | 10px | Tombol, input (Admin) |
| `radius-lg` | 14px | Kartu |
| `radius-xl` | 20px | Kartu Wali, lembar bawah (sudut atas) |
| `radius-full` | 9999px | Chip, avatar, tombol bulat |

### Bayangan (berwarna tinta hijau, bukan hitam)

| Token | Nilai | Pakai |
|---|---|---|
| `shadow-xs` | `0 1px 2px rgba(24,38,34,.06)` | Input, kartu diam |
| `shadow-sm` | `0 4px 12px -4px rgba(24,38,34,.10)` | Kartu |
| `shadow-md` | `0 12px 28px -12px rgba(24,38,34,.22)` | Dropdown, popover |
| `shadow-lg` | `0 22px 44px -24px rgba(24,38,34,.38)` | Kartu terangkat (`.lift`) |
| `shadow-sheet` | `0 -12px 40px -12px rgba(24,38,34,.25)` | Lembar bawah |

### Lapisan (z-index)

`base 0 · sticky 10 · tabbar 20 · dropdown 30 · overlay 40 · sheet 50 · toast 60`

---

## 5. Gerak

Gerak itu *pelan, pendek, bermakna*. Kurva utama: `cubic-bezier(0.22, 1, 0.36, 1)` (keluar halus).

| Nama | Durasi | Pakai |
|---|---|---|
| `animate-rise` | 700ms | Masuk hero, **sekali saja** |
| `animate-swap` | 350ms | Pergantian tab, angka kwitansi |
| `animate-naik` | 300ms | Lembar bawah muncul |
| `animate-pudar` | 200ms | Latar gelap (overlay) |
| `.tekan` | 120ms | Umpan balik sentuh (skala 0.97) |
| `.lift` | 300ms | Kartu terangkat, **hanya** perangkat berkursor |
| `animate-floaty` | 6s | Dekorasi hero, tidak untuk elemen fungsional |

**Wajib:** semua dibungkus `prefers-reduced-motion`. Tidak ada informasi yang hanya tersampaikan lewat animasi.

---

## 6. Ikon & Ilustrasi

- Ikon garis (*stroke*) 1.75px, sudut membulat, ukuran 20px (Admin) / 24px (Wali). Rekomendasi: **Lucide**.
- Ikon di dalam lencana: 14px.
- Motif dekoratif: pola geometris Islami **sangat halus** (opasitas 4–6%), hanya di hero, kwitansi, dan keadaan kosong. Tidak pernah di belakang teks isi.
- Ilustrasi keadaan kosong: bentuk sederhana satu-dua warna (emerald + gold-soft), bukan ilustrasi ramai.
- Foto santri: lingkaran (avatar) atau persegi bulat `radius-lg`. Jika belum ada foto, tampilkan inisial di atas `brand-pale`.

---

## 7. Komponen

### 7.1 Tombol

| Varian | Tampilan | Pakai |
|---|---|---|
| **Primary** | Latar `brand`, teks putih | Satu aksi utama per layar |
| **Secondary** | Putih, tepi `line`, teks `ink` | Aksi pendamping |
| **Ghost** | Tanpa latar, teks `brand` | Aksi tersier, tautan |
| **Danger** | Latar `belum-bg`, teks `belum` | Hapus, batalkan |
| **Gold** | Latar `gold-pale`, tepi `gold-soft`, teks `gold-ink` | Khusus unduh kwitansi / klaim garansi |

Tinggi: Admin **36 / 40px**, Wali **52px** (lebar penuh untuk aksi utama).
Keadaan wajib: default, hover, `:active` (tekan), `:focus-visible`, disabled, *loading* (spinner + teks tetap).

### 7.2 Lencana status

Bentuk pil, tinggi 24px, ikon 14px + teks Micro. Contoh: `✓ Lunas`, `◐ Cicilan`, `! Belum`.

### 7.3 Kartu santri

Foto bulat 56px · Nama (H3) · *NIS · Kelas · Kamar* (Small, `muted`) · lencana status di kanan atas.
Pada Wali: kartu lebar penuh, `radius-xl`, latar gradasi halus `forest → forest-light` dengan teks gading, agar terasa seperti "kartu identitas".

### 7.4 Kartu tagihan

Judul tagihan · jatuh tempo (Small) · **nominal besar** (angka 32px) · lencana · tombol *Bayar*. Ketuk kartu membuka lembar bawah berisi rincian.

### 7.5 Kwitansi

Kartu putih bertepi `gold-soft` dengan pola halus di sudut. Tersusun: logo pondok → "Bukti Pembayaran" → nomor → tabel rincian → total (angka besar) → stempel **LUNAS** miring −6° berwarna `brand` opasitas 14%. Angka berganti dengan `animate-swap`.

### 7.6 Lembar bawah (bottom sheet)

`radius-xl` di sudut atas, pegangan 36×4px di tengah atas, latar gelap `forest` 50% di belakang (`animate-pudar`). Tinggi maksimal 90% layar. Bisa ditutup dengan: tarik ke bawah, ketuk latar, tombol Esc / tombol kembali Android. Padding bawah memakai `safe-area`.

### 7.7 Tab bar bawah (Wali)

5 item: **Beranda · Tagihan · Perkembangan · Kabar · Akun**
Tinggi 64px + safe-area. Item aktif: ikon `brand` + label tebal + titik kecil di atas. Lencana angka (merah) untuk tagihan belum dibayar dan kabar baru. Ketuk → `.tekan`. Target sentuh ≥ 48px.

### 7.8 Sidebar (Admin)

Lebar 256px (terlipat 72px), latar `forest`, teks gading 80%. Item aktif: latar `rgba(255,255,255,.08)` + garis kiri 3px `gold-soft`. Bagian bawah: pemilih tahun ajaran dan profil pengguna.

### 7.9 Tabel data (Admin)

Header menempel (`sticky`), huruf Micro kapital `muted`. Baris tinggi 48px, hover `surface-soft`, baris terpilih `brand-pale`. Kolom angka rata kanan. Bilah aksi massal muncul di atas saat ada baris terpilih. Di bawah 768px, tabel berubah menjadi daftar kartu.

### 7.10 Formulir

Label di atas input (bukan *floating*). Input: tinggi 44px (Wali 52px), tepi `line`, fokus: cincin `brand` 2px. Galat: tepi `belum` + pesan dengan ikon di bawahnya, bukan hanya warna merah. Bantuan (*helper text*) di bawah dalam `muted`.

### 7.11 Keadaan khusus (jangan dilewatkan)

- **Skeleton**: blok `surface-soft` dengan kilau pelan; bentuknya meniru konten asli.
- **Kosong**: ilustrasi kecil + kalimat ramah + satu tombol. Contoh: *"Belum ada tagihan bulan ini. Alhamdulillah."*
- **Galat**: jelaskan apa yang terjadi + apa yang bisa dilakukan + tombol *Coba lagi*.
- **Offline**: pita tipis di atas: *"Anda sedang offline. Menampilkan data terakhir (24 Okt, 13.10)."*
- **Toast**: muncul di atas tab bar / pojok kanan bawah, 4 detik, bisa ditutup.

---

## 8. Layar: Portal Wali (HP, 360–430px)

### Beranda
1. Sapaan: *"Assalamu'alaikum, Bapak Ahmad"* + tanggal Hijriah kecil di bawahnya.
2. **Pemilih anak** (chip melingkar, hanya jika > 1 anak).
3. **Kartu santri** gelap (forest) dengan avatar, nama (+ nama Arab), kelas, kamar.
4. **Hari ini**: 3 mini-kartu (Kehadiran · Setoran hafalan · Kesehatan).
5. **Tagihan aktif**: satu kartu menonjol dengan nominal dan tombol *Bayar*.
6. **Kabar terbaru**: 2 pengumuman teratas.

### Tagihan
Ringkasan atas (total belum dibayar, angka besar) → filter chip (Semua · Belum · Cicilan · Lunas) → daftar tagihan → ketuk untuk lembar bawah (rincian, metode bayar, riwayat, unduh kwitansi dengan tombol Gold).

### Perkembangan
Segmen tab: **Kehadiran · Hafalan · Nilai · Catatan**. Kehadiran berupa kalender bulanan berwarna. Hafalan berupa bilah juz + daftar setoran. Catatan musyrif seperti utas pesan.

### Kabar
Pengumuman (dengan label *Penting*), jadwal kunjungan, dan formulir **izin pulang** (3 langkah, satu per layar).

### Akun
Profil wali, ganti anak, pengaturan notifikasi, bantuan (WhatsApp admin), keluar.

---

## 9. Layar: Panel Admin (Desktop ≥ 1024px)

**Kerangka:** sidebar kiri · header atas (pencarian `⌘K`, notifikasi, profil) · konten maks 1280px.

| Halaman | Isi utama |
|---|---|
| **Dashboard** | 4 kartu statistik (santri aktif, tagihan jatuh tempo, kehadiran hari ini, pemasukan bulan ini) · grafik pemasukan 6 bulan · daftar perlu tindakan |
| **Data Santri** | Tabel + filter (kelas, kamar, status) + impor Excel · profil santri bertab (Biodata, Keluarga, Akademik, Keuangan, Kesehatan) |
| **Akademik & Hafalan** | Input massal setoran per halaqah, rekap nilai |
| **Keuangan** | Tagihan, pembayaran masuk, kwitansi, tunggakan, ekspor |
| **Perizinan & Kamar** | Persetujuan izin, denah kamar, mutasi |
| **Komunikasi** | Broadcast ke wali (pilih kelas / semua), riwayat |
| **Pengaturan** | Logo, warna brand (6 preset), tahun ajaran, peran pengguna |

**Command bar (`⌘K`)**: cari santri, buka halaman, atau jalankan aksi cepat ("Catat pembayaran"). Ini pembeda terbesar antara terasa "SaaS premium" dan "aplikasi sekolah biasa".

---

## 10. PWA

### Manifest

```json
{
  "name": "TSIQA Wali",
  "short_name": "TSIQA",
  "display": "standalone",
  "orientation": "portrait",
  "start_url": "/wali?source=pwa",
  "background_color": "#f8faf9",
  "theme_color": "#263b35",
  "icons": [
    { "src": "/icons/192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### Hal khusus iOS
- `apple-touch-icon` 180×180 (tanpa transparansi)
- `<meta name="apple-mobile-web-app-capable" content="yes">`
- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`
- Gambar splash per ukuran perangkat
- Notifikasi push hanya bekerja di iOS 16.4+ **setelah** aplikasi dipasang ke layar utama

### Pengalaman terasa native
- Tanpa efek sorot ketuk, tanpa seleksi teks pada elemen kontrol, tanpa *pull-to-refresh* bawaan browser (diganti versi sendiri)
- Pemasangan: banner halus setelah kunjungan ke-2. Di iPhone tampilkan panduan **Bagikan → Tambah ke Layar Utama** bergambar
- Offline: *service worker* menyimpan tagihan, profil, dan pengumuman terakhir; tampilkan penanda "terakhir diperbarui"
- Skeleton, bukan spinner layar penuh

---

## 11. Suara & Bahasa (microcopy)

Nada: **sopan, hangat, jelas, tidak menakut-nakuti.** Menyapa dengan salam. Menggunakan "Anda" atau "Bapak/Ibu".

| Hindari | Gunakan |
|---|---|
| "Anda menunggak!" | "Ada tagihan SPP Oktober yang menunggu." |
| "Error 500" | "Maaf, ada gangguan di pihak kami. Silakan coba lagi sebentar lagi." |
| "Data tidak ditemukan" | "Belum ada data. Kami akan kabari begitu tersedia." |
| "Pembayaran berhasil" | "Alhamdulillah, pembayaran diterima. Jazakumullah khairan." |

Tanggal: `24 Okt 2026` (+ Hijriah pada beranda Wali). Jam: format 24 jam, `13.17`.

---

## 12. Aksesibilitas (tidak bisa ditawar)

- Kontras teks ≥ **4.5:1** (isi), ≥ **3:1** (teks besar & komponen UI)
- Target sentuh ≥ **48×48px** di Wali, ≥ **36px** di Admin
- Fokus keyboard selalu terlihat (`outline: 2px solid brand`, offset 3px, sudah ada)
- Status = warna **+ ikon + teks**
- Semua gambar bermakna punya `alt`; ikon dekoratif `aria-hidden`
- Lembar bawah: jebak fokus, kembalikan fokus saat ditutup, `role="dialog"` + `aria-modal`
- Hormati `prefers-reduced-motion` dan ukuran teks sistem (pakai `rem`)
- Uji dengan pembaca layar (TalkBack / VoiceOver) pada alur Bayar

---

## 13. Tambahan untuk `globals.css`

Tempel ke berkas yang sudah ada. Tidak ada yang dihapus; semua nama lama tetap bekerja.

```css
@theme {
  /* Nama semantik (white-label). Nama lama tetap hidup sebagai alias. */
  --color-brand: var(--brand, #0f766e);
  --color-brand-hover: var(--brand-hover, #0d645d);
  --color-brand-pale: var(--brand-pale, #ddf4ec);

  /* Kehadiran */
  --color-hadir: #0f766e;   --color-hadir-bg: #ddf4ec;
  --color-izin: #1d4ed8;    --color-izin-bg: #dbeafe;
  --color-sakit: #92400e;   --color-sakit-bg: #fef3c7;
  --color-alpa: #b91c1c;    --color-alpa-bg: #fee2e2;

  /* Radius tambahan */
  --radius-sm: 8px;
  --radius-xl: 20px;

  /* Bayangan */
  --shadow-xs: 0 1px 2px rgba(24, 38, 34, 0.06);
  --shadow-sm: 0 4px 12px -4px rgba(24, 38, 34, 0.1);
  --shadow-md: 0 12px 28px -12px rgba(24, 38, 34, 0.22);
  --shadow-lg: 0 22px 44px -24px rgba(24, 38, 34, 0.38);
  --shadow-sheet: 0 -12px 40px -12px rgba(24, 38, 34, 0.25);

  /* Font Arab */
  --font-arab: "Noto Naskh Arabic", "Amiri", serif;
}

/* ---------- PWA: terasa seperti aplikasi native ---------- */
html {
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;
}
body {
  overscroll-behavior-y: none;
  text-rendering: optimizeLegibility;
}
button, [role="tab"], [role="button"] {
  touch-action: manipulation;       /* hilangkan jeda ketuk ganda */
  -webkit-user-select: none;
  user-select: none;
}

/* iOS zoom otomatis jika input < 16px */
input, select, textarea { font-size: max(16px, 1rem); }

/* ---------- Safe area (notch & home indicator) ---------- */
.safe-top    { padding-top: env(safe-area-inset-top); }
.safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
.tabbar {
  height: calc(64px + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
}
.sheet { padding-bottom: calc(1rem + env(safe-area-inset-bottom)); }

/* ---------- Arab ---------- */
.arab {
  font-family: var(--font-arab);
  direction: rtl;
  line-height: 1.9;
  font-size: 1.125em;
}

/* ---------- Teks & angka ---------- */
.angka-besar { font-size: 2rem; line-height: 2.25rem; font-weight: 800; letter-spacing: -0.02em; }
.label-mikro { font-size: 11px; line-height: 16px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }

/* ---------- Kartu emas (garansi, kwitansi, pencapaian) ---------- */
.kartu-emas {
  background: var(--color-gold-pale);
  border: 1px solid var(--color-gold-soft);
  color: var(--color-gold-ink);
}

/* ---------- Pola geometris sangat halus (dekorasi) ---------- */
.pola-halus {
  background-image:
    radial-gradient(circle at 1px 1px, rgba(15, 118, 110, 0.07) 1px, transparent 0);
  background-size: 22px 22px;
}

/* ---------- Skeleton ---------- */
@keyframes kilau {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, var(--color-surface-soft) 30%, var(--color-surface) 50%, var(--color-surface-soft) 70%);
  background-size: 200% 100%;
  border-radius: var(--radius-md);
  animation: kilau 1.6s linear infinite;
}
@media (prefers-reduced-motion: reduce) { .skeleton { animation: none; } }

/* ---------- Cetak kwitansi ---------- */
@media print {
  body { background: #fff; }
  .no-print { display: none !important; }
  .kartu-emas { box-shadow: none; }
}
```

---

## 14. Mode Terang & Gelap

Mode gelap bukan sekadar membalik warna. Ia punya palet sendiri yang tetap terasa "TSIQA": hijau-tinta, bukan hitam pekat. Wali sering membuka aplikasi di malam hari, jadi mode ini bagian rancangan inti.

### 14.1 Prinsip

1. **Latar hijau-tinta yang sangat gelap** (`#0e1613`), bukan `#000`. Hitam pekat membuat layar OLED terlihat "menggantung" dan menyilaukan saat bergulir.
2. **Kedalaman lewat kecerahan permukaan, bukan bayangan.** Makin tinggi elemen, makin terang permukaannya. Bayangan hampir tak terlihat di latar gelap.
3. **Brand dicerahkan.** Emerald `#0f766e` kontrasnya kurang di atas latar gelap, jadi naik ke `#2dd4bf`. Konsekuensinya, **teks di atas tombol utama berubah gelap** (`--color-on-brand`).
4. **Pasangan status dibalik.** Latar menjadi warna tembus pandang 14–16%, teks menjadi versi terang.
5. **Emas diredupkan.** `gold-pale` yang terang akan menyilaukan di malam hari. Di mode gelap ia menjadi tembaga transparan.
6. **Kwitansi tetap terang.** Kwitansi adalah dokumen (dicetak, diunduh, difoto), jadi tampil seperti selembar kertas ivory dengan tepi lembut, di kedua mode.

### 14.2 Palet

| Token | Terang | Gelap |
|---|---|---|
| `ivory` (latar halaman) | `#f8faf9` | `#0e1613` |
| `surface` (kartu) | `#ffffff` | `#16211d` |
| `surface-soft` | `#f1f5f3` | `#1d2b26` |
| `line` | `#e2e8e5` | `#2a3a34` |
| `ink` (teks utama) | `#182622` | `#e8efec` |
| `muted` | `#5b6b65` | `#9db0a9` |
| `forest` | `#263b35` | `#1b2e28` |
| `forest-light` | `#314b44` | `#24403a` |
| `brand` | `#0f766e` | `#2dd4bf` |
| `brand-hover` | `#0d645d` | `#5eead4` |
| `brand-pale` | `#ddf4ec` | `rgba(45,212,191,.14)` |
| `on-brand` (teks di atas brand) | `#ffffff` | `#06201c` |

**Status (teks / latar):**

| Status | Terang | Gelap |
|---|---|---|
| Lunas, Hadir | `#0f766e` / `#ddf4ec` | `#5eead4` / `rgba(45,212,191,.14)` |
| Cicilan, Sakit | `#92400e` / `#fef3c7` | `#fcd34d` / `rgba(245,158,11,.16)` |
| Belum, Alpa | `#b91c1c` / `#fee2e2` | `#fca5a5` / `rgba(239,68,68,.16)` |
| Izin | `#1d4ed8` / `#dbeafe` | `#93c5fd` / `rgba(96,165,250,.16)` |

**Emas:** `gold` `#e0b04c` · `gold-ink` `#f1dba0` · `gold-soft` `rgba(241,219,160,.30)` · `gold-pale` `rgba(183,121,31,.14)`

> Semua pasangan teks/latar di atas sudah dirancang ≥ 4.5:1. Tetap uji ulang setelah warna disesuaikan.

### 14.3 Cara kerja

Ada tiga pilihan untuk pengguna: **Terang · Gelap · Otomatis** (default Otomatis, mengikuti pengaturan HP/PC). Pilihannya ada di halaman **Akun** (Wali) dan menu profil (Admin), disimpan per perangkat.

- Tanpa JavaScript, mode mengikuti `prefers-color-scheme` (cadangan).
- Dengan JavaScript, atribut `data-theme="light|dark"` di `<html>` menentukan, dipasang **sebelum halaman digambar** agar tidak berkedip putih lalu gelap.
- `<meta name="theme-color">` ikut berganti supaya bilah status HP menyatu dengan layar. Berkas manifest tidak bisa berganti-ganti, jadi nilainya tetap `forest` sebagai cadangan.
- White-label: tiap preset warna pondok punya **pasangan terang dan gelap** yang sudah lolos kontras.

### 14.4 CSS siap tempel

Tailwind v4 menyusun utilitas dari `var(--color-...)`, jadi cukup **menimpa variabelnya**. Komponen tidak perlu diubah satu per satu.

```css
/* Token baru di mode terang (tambahkan ke @theme yang sudah ada) */
@theme {
  --color-surface: #ffffff;
  --color-on-brand: #ffffff;
}

/* Gelap: ikut sistem, kecuali pengguna memaksa terang */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
    --color-ivory: #0e1613;
    --color-surface: #16211d;
    --color-surface-soft: #1d2b26;
    --color-line: #2a3a34;
    --color-ink: #e8efec;
    --color-muted: #9db0a9;
    --color-forest: #1b2e28;
    --color-forest-light: #24403a;

    --brand: #2dd4bf;
    --brand-hover: #5eead4;
    --brand-pale: rgba(45, 212, 191, 0.14);
    --color-on-brand: #06201c;

    --color-lunas: #5eead4;   --color-lunas-bg: rgba(45, 212, 191, 0.14);
    --color-cicilan: #fcd34d; --color-cicilan-bg: rgba(245, 158, 11, 0.16);
    --color-belum: #fca5a5;   --color-belum-bg: rgba(239, 68, 68, 0.16);
    --color-hadir: #5eead4;   --color-hadir-bg: rgba(45, 212, 191, 0.14);
    --color-izin: #93c5fd;    --color-izin-bg: rgba(96, 165, 250, 0.16);
    --color-sakit: #fcd34d;   --color-sakit-bg: rgba(245, 158, 11, 0.16);
    --color-alpa: #fca5a5;    --color-alpa-bg: rgba(239, 68, 68, 0.16);

    --color-gold: #e0b04c;
    --color-gold-ink: #f1dba0;
    --color-gold-soft: rgba(241, 219, 160, 0.3);
    --color-gold-pale: rgba(183, 121, 31, 0.14);

    --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.4);
    --shadow-sm: 0 4px 12px -4px rgba(0, 0, 0, 0.5);
    --shadow-md: 0 12px 28px -12px rgba(0, 0, 0, 0.6);
    --shadow-lg: 0 22px 44px -24px rgba(0, 0, 0, 0.7);
    --shadow-sheet: 0 -12px 40px -12px rgba(0, 0, 0, 0.6);
  }
}

/* Gelap: dipaksa pengguna (isinya sama dengan blok di atas) */
:root[data-theme="dark"] {
  color-scheme: dark;
  --color-ivory: #0e1613;
  --color-surface: #16211d;
  --color-surface-soft: #1d2b26;
  --color-line: #2a3a34;
  --color-ink: #e8efec;
  --color-muted: #9db0a9;
  --color-forest: #1b2e28;
  --color-forest-light: #24403a;

  --brand: #2dd4bf;
  --brand-hover: #5eead4;
  --brand-pale: rgba(45, 212, 191, 0.14);
  --color-on-brand: #06201c;

  --color-lunas: #5eead4;   --color-lunas-bg: rgba(45, 212, 191, 0.14);
  --color-cicilan: #fcd34d; --color-cicilan-bg: rgba(245, 158, 11, 0.16);
  --color-belum: #fca5a5;   --color-belum-bg: rgba(239, 68, 68, 0.16);
  --color-hadir: #5eead4;   --color-hadir-bg: rgba(45, 212, 191, 0.14);
  --color-izin: #93c5fd;    --color-izin-bg: rgba(96, 165, 250, 0.16);
  --color-sakit: #fcd34d;   --color-sakit-bg: rgba(245, 158, 11, 0.16);
  --color-alpa: #fca5a5;    --color-alpa-bg: rgba(239, 68, 68, 0.16);

  --color-gold: #e0b04c;
  --color-gold-ink: #f1dba0;
  --color-gold-soft: rgba(241, 219, 160, 0.3);
  --color-gold-pale: rgba(183, 121, 31, 0.14);

  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-sm: 0 4px 12px -4px rgba(0, 0, 0, 0.5);
  --shadow-md: 0 12px 28px -12px rgba(0, 0, 0, 0.6);
  --shadow-lg: 0 22px 44px -24px rgba(0, 0, 0, 0.7);
  --shadow-sheet: 0 -12px 40px -12px rgba(0, 0, 0, 0.6);
}

/* Penyesuaian kecil khusus gelap */
:root[data-theme="dark"] ::-webkit-scrollbar-thumb { background: #3a4d46; }
:root[data-theme="dark"] ::-webkit-scrollbar-thumb:hover { background: #4f665d; }
:root[data-theme="dark"] .pola-halus {
  background-image: radial-gradient(circle at 1px 1px, rgba(45, 212, 191, 0.06) 1px, transparent 0);
}
:root[data-theme="dark"] img.foto { filter: brightness(0.92); }  /* foto tidak menyilaukan */

/* Kwitansi selalu terang (dokumen), di kedua mode */
.kwitansi {
  --color-surface: #ffffff;
  --color-ink: #182622;
  --color-muted: #5b6b65;
  --color-line: #e2e8e5;
  --color-gold-ink: #7a4f0b;
  --color-gold-pale: #fbf3dd;
  --color-gold-soft: #f1dba0;
  background: #fffdf8;
  color: var(--color-ink);
}
```

**Tombol utama** wajib memakai `--color-on-brand`, bukan `text-white`:

```css
.btn-primary { background: var(--color-brand); color: var(--color-on-brand); }
```

### 14.5 Skrip anti-berkedip (taruh di `<head>`, sebelum CSS)

```html
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#f8faf9" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0e1613" media="(prefers-color-scheme: dark)">
<script>
  (function () {
    try {
      var pilihan = localStorage.getItem("tema") || "otomatis"; // otomatis | terang | gelap
      var gelap = pilihan === "gelap" ||
        (pilihan === "otomatis" && matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.dataset.theme = gelap ? "dark" : "light";
    } catch (e) {}
  })();
</script>
```

Saat pengguna mengganti pilihan manual, simpan ke `localStorage("tema")`, perbarui `data-theme`, lalu ubah `<meta name="theme-color">`. Jika pilihannya Otomatis, dengarkan `matchMedia("(prefers-color-scheme: dark)")` agar mengikuti perubahan sistem saat aplikasi terbuka.

### 14.6 Aturan agar mode gelap tidak rusak

- **Dilarang** menulis hex langsung di komponen, atau memakai `bg-white`, `text-black`, `text-white` untuk permukaan dan teks isi. Pakai token: `bg-surface`, `text-ink`, `text-on-brand`.
- Kartu santri Wali (latar forest) di mode gelap diberi tepi `line` 1px agar terpisah dari latar halaman.
- Lembar bawah: permukaan `surface-soft` + overlay `rgba(0,0,0,.6)`, supaya jelas "terangkat" dari halaman.
- Gambar dan ilustrasi memakai token warna atau SVG `currentColor`, bukan hex tetap. Logo pondok wajib punya varian untuk latar gelap.
- Grafik: seri data memakai warna terang versi gelap, garis kisi `line`.
- Uji ulang kontras seluruh pasangan status dan alur Bayar di **kedua mode**.

---

## 15. Rencana Pembangunan

1. **Fondasi**: perluasan `globals.css` (termasuk token terang & gelap) + halaman galeri komponen (`/styleguide`) dengan sakelar tema
2. **Portal Wali**: Beranda, Tagihan, lembar bawah rincian, dalam bingkai HP
3. **Panel Admin**: kerangka (sidebar, header, `⌘K`), Dashboard, Data Santri
4. **PWA**: manifest, service worker, mode offline, banner pasang
5. **Fase 2**: tema warna per pondok (pasangan terang & gelap), antarmuka bahasa Arab

---

## 16. Daftar Periksa Sebelum Rilis

- [ ] Semua teks lolos kontras 4.5:1
- [ ] Tidak ada input < 16px di HP
- [ ] Tab bar tidak tertimpa home indicator iPhone
- [ ] Status selalu punya ikon + teks
- [ ] Setiap layar punya keadaan: memuat, kosong, galat, offline
- [ ] Hanya satu tombol utama per layar
- [ ] Emas muncul < 10% area layar
- [ ] Animasi mati saat `prefers-reduced-motion`
- [ ] Mode terang, gelap, dan otomatis berfungsi; tidak ada kilatan putih saat membuka di mode gelap
- [ ] Tidak ada hex, `bg-white`, atau `text-white` tertanam di komponen (semua lewat token)
- [ ] Kontras ≥ 4.5:1 lolos di **kedua** mode, termasuk lencana status dan tombol utama
- [ ] Kwitansi tetap terang dan terbaca saat dicetak dari mode gelap
- [ ] Alur Bayar bisa diselesaikan hanya dengan pembaca layar
- [ ] Uji di Android (Chrome) **dan** iPhone (Safari) yang sudah dipasang ke layar utama

---

## 17. Standar Implementasi Produksi Terkini (`D:\TSIQA\tsiqa-app`)

1. **Aset Logo Resmi Tunggal**:
   - Seluruh halaman aplikasi wajib menggunakan `/logo-tsiqa.svg` (simbol) dan `/tulisan-tsiqa.svg` (wordmark) yang berada di `public/`.
   - Di atas latar gelap (`bg-forest` atau mode malam), simbol `/logo-tsiqa.svg` ditempatkan di dalam wadah berlatar terang lembut (`bg-[#f4f9f7] border border-emerald/25`) agar warna asli logo selalu tajam dan kontras.
   - Dilarang menggunakan placeholder kotak huruf `"T"` lama di bagian mana pun (termasuk Portal Guru, Portal Wali PWA, dan Favicon).
2. **Isolasi Mode Malam (`PenjagaTemaRoute`)**:
   - Mode Malam (`data-theme="dark"`) **hanya** diterapkan pada halaman kerja internal: **Dashboard Pondok (`/(app)`)** dan **Konsol Master TSIQA (`/konsol`)**.
   - Seluruh halaman publik, autentikasi, dan dokumen cetak (`/`, `/mulai`, `/privasi`, `/masuk`, `/daftar`, `/lupa-sandi`, `/atur-sandi`, `/dokumen/...`, `/p/[kode]`, `/wali/masuk`, `/guru/masuk`) dikunci selalu dalam **Mode Terang (`data-theme="light"`)**.
3. **Skala Responsif Layar HP di Landing Page (`/`)**:
   - Untuk menjaga keterbacaan di layar HP (`360px–430px`), ukuran font dan jarak seksi menggunakan skala bertingkat:
     - Hero `h1`: `text-[22px] sm:text-4xl lg:text-[44px]`
     - Judul Seksi `h2`: `text-[19px] sm:text-2xl lg:text-[30px]`
     - Padding Seksi: `py-10 sm:py-14 md:py-20` dengan wadah `px-4 sm:px-8`
     - Kartu Pembeda: Grid 2 kolom ringkas di HP (`grid-cols-2 lg:grid-cols-3`)
     - Kalkulator Harga (`Pricing`): Menampilkan **4 Paket** (`Perintis`, `Administrasi`, `Terpadu`, `Lengkap`) dalam grid 2x2 dengan sakelar tahunan *Bayar 11 Bulan (Gratis 1 Bulan)*.
4. **UX Pendaftaran, Harga Kesepakatan Khusus & Dokumen Resmi Siap Cetak A4 (`/dokumen/langganan/[pondok_id]/...`)**:
   - Pendaftaran dibagi menjadi 2 langkah ringkas tanpa jeda verifikasi email Supabase: Langkah 1 (Email & Sandi di `/daftar`) $\rightarrow$ Langkah 2 (Nama Pondok, Kode URL, Kota/Kabupaten, Nama Pimpinan Pondok, Nama Pengurus, & No. WhatsApp di `/mulai`).
   - Sebelum disetujui Admin TSIQA di `/konsol`, pengurus yang masuk ke `/(app)` melihat layar **Menunggu Verifikasi Admin** dengan tombol konfirmasi 1-klik ke WhatsApp Admin TSIQA serta akses ke **Surat Penawaran & Invoice** dan **Piagam SLA**.
   - Di `/konsol/pondok/[id]` maupun `/modul`, tersedia 3 dokumen resmi berformat kertas A4 yang siap dicetak/disimpan sebagai PDF (`window.print()`):
     - **Surat Penawaran & Invoice (`/dokumen/langganan/[pondok_id]/invoice`)** (otomatis menyesuaikan apabila pondok memiliki *Harga Kesepakatan Khusus*).
     - **Piagam Kesepakatan Layanan & Garansi Tsiqah / SLA (`/dokumen/langganan/[pondok_id]/sla`)**.
     - **Kwitansi Pembayaran Lunas (`/dokumen/langganan/[pondok_id]/kwitansi/[bayar_id]`)** lengkap dengan ejaan *Terbilang Rupiah* dan cap **LUNAS TERVERIFIKASI**.


