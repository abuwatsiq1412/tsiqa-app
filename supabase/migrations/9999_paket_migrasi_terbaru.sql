-- =============================================================================
-- TSIQA — PAKET MIGRASI GABUNGAN (0010 s/d 0013)
-- Mencakup:
--   0010: Hak Akses Pengurus Per-Modul (akses_modul text[])
--   0011: Modul Website Pondok (CMS Fleksibel)
--   0012: Modul Keamanan & Perizinan Asrama + Laporan Keterlambatan
--   0013: Modul Tahfidz & Muroja'ah Al-Qur'an (Simpel & Cepat)
--   + Sinkronisasi status tersedia untuk modul Akademik, Portal Guru, Portal Wali
-- Aman dijalankan ulang (Idempotent) di SQL Editor Supabase.
-- =============================================================================

-- 0. Pastikan seluruh modul yang sudah dibangun berstatus tersedia = true
update modul
   set tersedia = true
 where kode in ('keuangan', 'akademik', 'portal_guru', 'portal_wali', 'perizinan', 'tahfidz');

insert into modul (kode, nama, kategori, harga_bulanan, tersedia, urutan) values
  ('website', 'Website Pondok (CMS)', 'Publikasi', 25000, true, 11)
on conflict (kode) do update set tersedia = true;

-- =============================================================================
-- 0010 — HAK AKSES PENGURUS PER MODUL
-- =============================================================================
alter table anggota_pondok
  add column if not exists akses_modul text[] not null default array['core']::text[];

-- =============================================================================
-- 0011 — MODUL WEBSITE PONDOK (CMS FLEKSIBEL)
-- =============================================================================
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

-- =============================================================================
-- 0012 — MODUL KEAMANAN & PERIZINAN ASRAMA
-- =============================================================================
create table if not exists perizinan_santri (
  id                  uuid primary key default gen_random_uuid(),
  pondok_id           uuid not null references pondok(id) on delete cascade,
  santri_id           uuid not null,
  jenis               text not null default 'pulang'
                      check (jenis in ('keluar', 'pulang', 'sakit', 'libur')),
  alasan              text not null check (length(trim(alasan)) > 0),
  penjemput           text,
  waktu_keluar        timestamptz not null default now(),
  batas_kembali       timestamptz not null,
  waktu_kembali       timestamptz,
  status              text not null default 'keluar'
                      check (status in ('keluar', 'kembali_tepat', 'kembali_terlambat')),
  menit_terlambat     int not null default 0 check (menit_terlambat >= 0),
  tindak_lanjut       text,
  dicatat_oleh        uuid references auth.users(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  foreign key (pondok_id, santri_id) references santri(pondok_id, id) on delete cascade
);
create index if not exists idx_perizinan_pondok_status on perizinan_santri(pondok_id, status, batas_kembali desc);
create index if not exists idx_perizinan_santri on perizinan_santri(santri_id, waktu_keluar desc);

drop trigger if exists trg_perizinan_upd on perizinan_santri;
create trigger trg_perizinan_upd before update on perizinan_santri
  for each row execute function set_updated_at();

create table if not exists master_pelanggaran (
  id          uuid primary key default gen_random_uuid(),
  pondok_id   uuid not null references pondok(id) on delete cascade,
  nama        text not null check (length(trim(nama)) > 0),
  kategori    text not null default 'ringan'
              check (kategori in ('ringan', 'sedang', 'berat')),
  poin        int not null default 5 check (poin > 0),
  created_at  timestamptz not null default now(),
  unique (pondok_id, id),
  unique (pondok_id, nama)
);

create table if not exists catatan_pelanggaran (
  id               uuid primary key default gen_random_uuid(),
  pondok_id        uuid not null references pondok(id) on delete cascade,
  santri_id        uuid not null,
  pelanggaran_id   uuid,
  nama_pelanggaran text not null,
  kategori         text not null default 'ringan'
                   check (kategori in ('ringan', 'sedang', 'berat')),
  poin             int not null default 5 check (poin >= 0),
  tanggal          date not null default current_date,
  tindakan         text,
  catatan          text,
  dicatat_oleh     uuid references auth.users(id),
  created_at       timestamptz not null default now(),
  foreign key (pondok_id, santri_id) references santri(pondok_id, id) on delete cascade
);
create index if not exists idx_catatan_pelanggaran_pondok on catatan_pelanggaran(pondok_id, tanggal desc);
create index if not exists idx_catatan_pelanggaran_santri on catatan_pelanggaran(santri_id, tanggal desc);

alter table perizinan_santri    enable row level security;
alter table master_pelanggaran  enable row level security;
alter table catatan_pelanggaran enable row level security;

drop policy if exists perizinan_santri_all on perizinan_santri;
create policy perizinan_santri_all on perizinan_santri
  for all to authenticated
  using (pondok_id in (select pondok_saya()))
  with check (pondok_id in (select pondok_saya()) and boleh_tulis(pondok_id));

drop policy if exists master_pelanggaran_all on master_pelanggaran;
create policy master_pelanggaran_all on master_pelanggaran
  for all to authenticated
  using (pondok_id in (select pondok_saya()))
  with check (pondok_id in (select pondok_saya()) and boleh_tulis(pondok_id));

drop policy if exists catatan_pelanggaran_all on catatan_pelanggaran;
create policy catatan_pelanggaran_all on catatan_pelanggaran
  for all to authenticated
  using (pondok_id in (select pondok_saya()))
  with check (pondok_id in (select pondok_saya()) and boleh_tulis(pondok_id));

drop policy if exists wali_perizinan_santri on perizinan_santri;
create policy wali_perizinan_santri on perizinan_santri
  for select to authenticated
  using (santri_id in (select santri_wali()));

-- =============================================================================
-- 0013 — MODUL TAHFIDZ & MUROJA'AH AL-QUR'AN
-- =============================================================================
create table if not exists tahfidz_halaqah (
  id          uuid primary key default gen_random_uuid(),
  pondok_id   uuid not null references pondok(id) on delete cascade,
  nama        text not null check (length(trim(nama)) > 0),
  pengampu    text,
  target      text,
  created_at  timestamptz not null default now(),
  unique (pondok_id, id),
  unique (pondok_id, nama)
);

create table if not exists tahfidz_anggota (
  pondok_id   uuid not null references pondok(id) on delete cascade,
  santri_id   uuid not null,
  halaqah_id  uuid not null,
  created_at  timestamptz not null default now(),
  primary key (pondok_id, santri_id),
  foreign key (pondok_id, santri_id)  references santri(pondok_id, id)          on delete cascade,
  foreign key (pondok_id, halaqah_id) references tahfidz_halaqah(pondok_id, id) on delete cascade
);
create index if not exists idx_tahfidz_anggota_halaqah on tahfidz_anggota(pondok_id, halaqah_id);

create table if not exists tahfidz_setoran (
  id              uuid primary key default gen_random_uuid(),
  pondok_id       uuid not null references pondok(id) on delete cascade,
  santri_id       uuid not null,
  tanggal         date not null default current_date,
  status          text not null default 'hadir'
                  check (status in ('hadir', 'izin', 'sakit', 'alpa')),
  tambah_hafalan  text,
  ulang_hafalan   text,
  dicatat_oleh    uuid references auth.users(id),
  updated_at      timestamptz not null default now(),
  unique (pondok_id, santri_id, tanggal),
  foreign key (pondok_id, santri_id) references santri(pondok_id, id) on delete cascade
);
create index if not exists idx_tahfidz_setoran_tanggal on tahfidz_setoran(pondok_id, tanggal desc);
create index if not exists idx_tahfidz_setoran_santri  on tahfidz_setoran(santri_id, tanggal desc);

create table if not exists tahfidz_juz (
  id          uuid primary key default gen_random_uuid(),
  pondok_id   uuid not null references pondok(id) on delete cascade,
  santri_id   uuid not null,
  juz         smallint not null check (juz between 1 and 30),
  tanggal     date not null default current_date,
  penguji     text,
  catatan     text,
  created_at  timestamptz not null default now(),
  unique (pondok_id, santri_id, juz),
  foreign key (pondok_id, santri_id) references santri(pondok_id, id) on delete cascade
);
create index if not exists idx_tahfidz_juz_santri on tahfidz_juz(pondok_id, santri_id, juz);

alter table tahfidz_halaqah enable row level security;
alter table tahfidz_anggota enable row level security;
alter table tahfidz_setoran enable row level security;
alter table tahfidz_juz     enable row level security;

drop policy if exists tahfidz_halaqah_all on tahfidz_halaqah;
create policy tahfidz_halaqah_all on tahfidz_halaqah
  for all to authenticated
  using (pondok_id in (select pondok_saya()))
  with check (pondok_id in (select pondok_saya()) and boleh_tulis(pondok_id));

drop policy if exists tahfidz_anggota_all on tahfidz_anggota;
create policy tahfidz_anggota_all on tahfidz_anggota
  for all to authenticated
  using (pondok_id in (select pondok_saya()))
  with check (pondok_id in (select pondok_saya()) and boleh_tulis(pondok_id));

drop policy if exists tahfidz_setoran_all on tahfidz_setoran;
create policy tahfidz_setoran_all on tahfidz_setoran
  for all to authenticated
  using (pondok_id in (select pondok_saya()))
  with check (pondok_id in (select pondok_saya()) and boleh_tulis(pondok_id));

drop policy if exists tahfidz_juz_all on tahfidz_juz;
create policy tahfidz_juz_all on tahfidz_juz
  for all to authenticated
  using (pondok_id in (select pondok_saya()))
  with check (pondok_id in (select pondok_saya()) and boleh_tulis(pondok_id));

drop policy if exists wali_tahfidz_setoran on tahfidz_setoran;
create policy wali_tahfidz_setoran on tahfidz_setoran
  for select to authenticated
  using (santri_id in (select santri_wali()));

drop policy if exists wali_tahfidz_juz on tahfidz_juz;
create policy wali_tahfidz_juz on tahfidz_juz
  for select to authenticated
  using (santri_id in (select santri_wali()));

grant select, insert, update, delete on
  website_pengaturan, website_tulisan, website_galeri,
  perizinan_santri, master_pelanggaran, catatan_pelanggaran,
  tahfidz_halaqah, tahfidz_anggota, tahfidz_setoran, tahfidz_juz
to authenticated;
