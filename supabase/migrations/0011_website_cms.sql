-- =============================================================================
-- TSIQA — Modul Website Pondok (CMS Fleksibel):
-- Pengaturan seksi (on/off), preset tema warna, profil, unit pendidikan,
-- berita/artikel, pengumuman, galeri kegiatan, dan informasi pendaftaran (PSB).
-- Aman dijalankan ulang.
-- =============================================================================

insert into modul (kode, nama, kategori, harga_bulanan, tersedia, urutan) values
  ('website', 'Website Pondok (CMS)', 'Publikasi', 25000, true, 11)
on conflict (kode) do update set tersedia = true;

-- 1. Pengaturan Utama, Seksi Aktif, & Konten Profil/Pendaftaran per Pondok
create table if not exists website_pengaturan (
  pondok_id          uuid primary key references pondok(id) on delete cascade,
  aktif_publik       boolean not null default true,
  tema               text not null default 'zamrud'
                     check (tema in ('zamrud', 'emas', 'samudra', 'klasik')),
  slogan             text not null default 'Mencetak Generasi Qur''ani, Berakhlak Mulia & Berwawasan Luas',
  subjudul_hero      text not null default 'Pendidikan Islam terpadu yang memadukan khazanah kitab kuning (turats), tahfidzul Qur''an, dan pendidikan formal berkualitas.',
  tentang_kami       text not null default 'Pondok pesantren kami berkomitmen membina santri melalui keseimbangan ilmu syar''i, adab keseharian, serta kecakapan hidup masa depan di lingkungan asrama yang aman dan kondusif.',
  visi               text not null default 'Menjadi lembaga pendidikan Islam rujukan yang melahirkan ulama, huffazh, dan pemimpin umat berakhlak karimah.',
  misi               text[] not null default array[
    'Menyelenggarakan kajian kitab kuning dan tahfidzul Qur''an secara bersanad dan berjenjang.',
    'Membiasakan adab Islami, kedisiplinan, dan kemandirian santri di lingkungan asrama.',
    'Mengintegrasikan kurikulum diniyah dan pendidikan formal yang unggul.'
  ]::text[],
  program_unggulan   jsonb not null default '[
    {"judul": "Tahfidzul Qur''an", "deskripsi": "Program setoran dan muroja''ah harian terbimbing bersama muhaffizh bersanad."},
    {"judul": "Madrasah Diniyah & Kitab Kuning", "deskripsi": "Kajian nahwu, sharaf, fiqih, aqidah, dan akhlak berjenjang dari dasar hingga mahir."},
    {"judul": "Bina Bahasa Arab & Inggris", "deskripsi": "Pembiasaan percakapan harian dwibahasa dan latihan khitobah (pidato)."}
  ]'::jsonb,
  unit_pendidikan    jsonb not null default '[
    {"nama": "SMP / MTs Pesantren", "jenjang": "Setara SLTP", "deskripsi": "Kurikulum nasional terpadu dengan kepesantrenan dan tahfidz."},
    {"nama": "SMA / MA Pesantren", "jenjang": "Setara SLTA", "deskripsi": "Pendalaman ilmu keislaman, sains, dan persiapan perguruan tinggi."},
    {"nama": "Madrasah Diniyah Takmiliyah", "jenjang": "Ula · Wustha · Ulya", "deskripsi": "Kurikulum kitab kuning salafiyah berjenjang."}
  ]'::jsonb,
  seksi_aktif        jsonb not null default '{
    "profil": true,
    "statistik": true,
    "program": true,
    "unit": true,
    "berita": true,
    "pengumuman": true,
    "galeri": true,
    "pendaftaran": true,
    "kontak": true
  }'::jsonb,
  psb_buka           boolean not null default true,
  psb_judul          text not null default 'Penerimaan Santri Baru Tahun Ajaran Baru',
  psb_gelombang      text not null default 'Gelombang I · Pendaftaran Dibuka',
  psb_syarat         text[] not null default array[
    'Mengisi formulir pendaftaran dan menyerahkan pas foto terbaru.',
    'Fotokopi Kartu Keluarga (KK) dan Akta Kelahiran.',
    'Fotokopi rapor atau ijazah jenjang pendidikan sebelumnya.',
    'Mengikuti tes baca Al-Qur''an dan wawancara wali santri.'
  ]::text[],
  psb_biaya_ringkas  text not null default 'Hubungi panitia PSB melalui WhatsApp untuk rincian infaq masuk dan syahriah bulanan.',
  psb_tautan_daftar  text,
  wa_admin_web       text,
  alamat_peta_url    text,
  instagram_url      text,
  youtube_url        text,
  updated_at         timestamptz not null default now()
);

drop trigger if exists trg_web_pengaturan_upd on website_pengaturan;
create trigger trg_web_pengaturan_upd before update on website_pengaturan
  for each row execute function set_updated_at();

-- 2. Berita, Pengumuman & Artikel Pondok
create table if not exists website_tulisan (
  id            uuid primary key default gen_random_uuid(),
  pondok_id     uuid not null references pondok(id) on delete cascade,
  jenis         text not null default 'berita' check (jenis in ('berita', 'pengumuman')),
  judul         text not null check (length(trim(judul)) > 0),
  slug          text not null,
  ringkasan     text,
  isi           text not null,
  kategori      text not null default 'Kegiatan',
  gambar_url    text,
  penting       boolean not null default false,
  terbit        boolean not null default true,
  tanggal       date not null default current_date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (pondok_id, slug)
);
create index if not exists idx_web_tulisan_pondok on website_tulisan(pondok_id, jenis, terbit, tanggal desc);

drop trigger if exists trg_web_tulisan_upd on website_tulisan;
create trigger trg_web_tulisan_upd before update on website_tulisan
  for each row execute function set_updated_at();

-- 3. Galeri Foto & Dokumentasi Pondok
create table if not exists website_galeri (
  id            uuid primary key default gen_random_uuid(),
  pondok_id     uuid not null references pondok(id) on delete cascade,
  judul         text not null check (length(trim(judul)) > 0),
  kategori      text not null default 'Kegiatan Santri',
  gambar_url    text not null check (length(trim(gambar_url)) > 0),
  keterangan    text,
  urutan        int not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists idx_web_galeri_pondok on website_galeri(pondok_id, urutan, created_at desc);

-- 4. RLS (Row-Level Security)
alter table website_pengaturan enable row level security;
alter table website_tulisan    enable row level security;
alter table website_galeri     enable row level security;

drop policy if exists web_pengaturan_all on website_pengaturan;
create policy web_pengaturan_all on website_pengaturan
  for all to authenticated
  using (pondok_id in (select pondok_saya()))
  with check (pondok_id in (select pondok_saya()) and boleh_tulis(pondok_id));

drop policy if exists web_tulisan_all on website_tulisan;
create policy web_tulisan_all on website_tulisan
  for all to authenticated
  using (pondok_id in (select pondok_saya()))
  with check (pondok_id in (select pondok_saya()) and boleh_tulis(pondok_id));

drop policy if exists web_galeri_all on website_galeri;
create policy web_galeri_all on website_galeri
  for all to authenticated
  using (pondok_id in (select pondok_saya()))
  with check (pondok_id in (select pondok_saya()) and boleh_tulis(pondok_id));
