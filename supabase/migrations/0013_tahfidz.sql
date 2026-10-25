-- =============================================================================
-- TSIQA — Modul Tahfidz & Muroja'ah (Simpel & Cepat):
-- 1. Kelompok Halaqah (pembagian santri per ustadz/muhaffizh)
-- 2. Setoran & Absen Harian (kehadiran + tambah hafalan + ulang hafalan)
-- 3. Kenaikan / Kelulusan Juz (rekap juz yang telah lulus diujikan)
-- Aman dijalankan ulang.
-- =============================================================================

update modul set tersedia = true where kode = 'tahfidz';

-- 1. Kelompok Halaqah Tahfidz
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

-- 2. Anggota Santri dalam Halaqah (1 santri masuk di 1 halaqah tahfidz)
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

-- 3. Setoran & Absen Harian (1 baris per santri per tanggal)
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

-- 4. Kenaikan / Kelulusan Juz Santri (Juz 1 s/d 30)
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

-- 5. RLS (Row-Level Security)
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

-- Akses baca Portal Wali Santri (hanya untuk anaknya sendiri)
drop policy if exists wali_tahfidz_setoran on tahfidz_setoran;
create policy wali_tahfidz_setoran on tahfidz_setoran
  for select to authenticated
  using (santri_id in (select santri_wali()));

drop policy if exists wali_tahfidz_juz on tahfidz_juz;
create policy wali_tahfidz_juz on tahfidz_juz
  for select to authenticated
  using (santri_id in (select santri_wali()));

