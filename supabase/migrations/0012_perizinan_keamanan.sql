-- =============================================================================
-- TSIQA — Modul Keamanan & Perizinan Asrama (Qismul Amni):
-- 1. Izin Keluar / Pulang / Liburan & Pencatatan Keterlambatan Kembali
-- 2. Master Pelanggaran & Buku Disiplin / Poin Pelanggaran Santri
-- Aman dijalankan ulang.
-- =============================================================================

update modul set tersedia = true where kode = 'perizinan';

-- 1. Tabel Perizinan & Kedatangan Santri (Izin Sebentar, Pulang, Berobat, Libur Pondok)
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

-- 2. Master Jenis Pelanggaran & Poin
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

-- 3. Riwayat Pelanggaran & Pembinaan (Ta'zir) Santri
create table if not exists catatan_pelanggaran (
  id              uuid primary key default gen_random_uuid(),
  pondok_id       uuid not null references pondok(id) on delete cascade,
  santri_id       uuid not null,
  pelanggaran_id  uuid,
  nama_pelanggaran text not null,
  kategori        text not null default 'ringan'
                  check (kategori in ('ringan', 'sedang', 'berat')),
  poin            int not null default 5 check (poin >= 0),
  tanggal         date not null default current_date,
  tindakan        text,
  catatan         text,
  dicatat_oleh    uuid references auth.users(id),
  created_at      timestamptz not null default now(),
  foreign key (pondok_id, santri_id) references santri(pondok_id, id) on delete cascade
);
create index if not exists idx_catatan_pelanggaran_pondok on catatan_pelanggaran(pondok_id, tanggal desc);
create index if not exists idx_catatan_pelanggaran_santri on catatan_pelanggaran(santri_id, tanggal desc);

-- 4. RLS (Row-Level Security)
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

-- Akses baca Portal Wali Santri (hanya untuk anaknya sendiri)
drop policy if exists wali_perizinan_santri on perizinan_santri;
create policy wali_perizinan_santri on perizinan_santri
  for select to authenticated
  using (santri_id in (select santri_wali()));

