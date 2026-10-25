-- =============================================================================
-- TSIQA — Inti (Core): multi-pondok, peran, keamanan baris, langganan, data induk
-- Postgres 15+ / Supabase. Semua nominal rupiah disimpan sebagai BIGINT (tanpa sen).
-- Nilai status/kategori memakai teks huruf kecil; tampilan (kapital, Indonesia)
-- diurus aplikasi.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. TIPE & UTILITAS
-- -----------------------------------------------------------------------------
create type peran_pondok as enum ('admin', 'bendahara', 'staf_tu');

create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- -----------------------------------------------------------------------------
-- 1. PONDOK (tenant) & ANGGOTA
-- -----------------------------------------------------------------------------
create table pondok (
  id                 uuid primary key default gen_random_uuid(),
  kode               text not null unique check (kode ~ '^[a-z0-9-]{3,40}$'),
  nama               text not null,
  nspp               text,
  alamat             text,
  kota               text,
  telepon            text,
  email              text,
  nama_pimpinan      text,
  nama_bendahara     text,
  logo_url           text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create trigger trg_pondok_upd before update on pondok
  for each row execute function set_updated_at();

create table anggota_pondok (
  id          uuid primary key default gen_random_uuid(),
  pondok_id   uuid not null references pondok(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  peran       peran_pondok not null,
  nama        text not null,
  aktif       boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (pondok_id, user_id)
);
create index idx_anggota_user on anggota_pondok(user_id) where aktif;

-- Tim TSIQA sendiri (konsol admin platform)
create table staf_tsiqa (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- -----------------------------------------------------------------------------
-- 2. LANGGANAN & ADD-ON
-- -----------------------------------------------------------------------------
create table langganan (
  pondok_id      uuid primary key references pondok(id) on delete cascade,
  status         text not null default 'percobaan'
                 check (status in ('percobaan', 'aktif', 'berhenti')),
  siklus         text not null default 'bulanan'
                 check (siklus in ('bulanan', 'tahunan', 'percobaan')),
  kuota_santri   int  not null default 100 check (kuota_santri > 0),
  mulai          date not null default current_date,
  berakhir       date not null,
  updated_at     timestamptz not null default now()
);
create trigger trg_langganan_upd before update on langganan
  for each row execute function set_updated_at();

-- Katalog modul (Core selalu aktif dan tidak ada di sini).
create table modul (
  kode            text primary key,
  nama            text not null,
  kategori        text not null,
  harga_bulanan   bigint not null check (harga_bulanan >= 0),   -- rupiah per bulan
  tersedia        boolean not null default false,               -- false = "Menyusul"
  urutan          int not null default 0
);
insert into modul (kode, nama, kategori, harga_bulanan, tersedia, urutan) values
  ('keuangan',      'Keuangan',                    'Keuangan',   30000, true,  1),
  ('wa_gateway',    'WhatsApp Gateway',            'Komunikasi', 30000, false, 2),
  ('akademik',      'Akademik & E-Rapor',          'Akademik',   25000, false, 3),
  ('portal_guru',   'Portal Guru & Asatidz',       'Portal',     25000, false, 4),
  ('portal_wali',   'Portal Wali Santri',          'Portal',     30000, false, 5),
  ('perizinan',     'Perizinan & Keamanan Asrama', 'Ketertiban', 20000, false, 6),
  ('tahfidz',       'Tahfidz & Muroja''ah',        'Keagamaan',  25000, false, 7),
  ('ppdb',          'PPDB / PSB Online',           'Penerimaan', 20000, false, 8);

create table addon_pondok (
  pondok_id  uuid not null references pondok(id) on delete cascade,
  kode       text not null references modul(kode),
  aktif      boolean not null default true,
  sejak      date not null default current_date,
  primary key (pondok_id, kode)
);

-- -----------------------------------------------------------------------------
-- 3. FUNGSI PENJAGA AKSES (dipakai kebijakan RLS)
--    SECURITY DEFINER agar tidak berputar ke RLS tabel anggota sendiri.
-- -----------------------------------------------------------------------------
create or replace function pondok_saya() returns setof uuid
language sql stable security definer set search_path = public, pg_temp as $$
  select pondok_id from anggota_pondok where user_id = auth.uid() and aktif
$$;

create or replace function punya_peran(p_pondok uuid, p_peran peran_pondok[]) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1 from anggota_pondok
    where pondok_id = p_pondok and user_id = auth.uid() and aktif and peran = any (p_peran)
  )
$$;

create or replace function adalah_staf_tsiqa() returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (select 1 from staf_tsiqa where user_id = auth.uid())
$$;

-- Masa tenggang 7 hari setelah langganan berakhir; sesudahnya data hanya bisa dibaca.
create or replace function boleh_tulis(p_pondok uuid) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1 from langganan
    where pondok_id = p_pondok
      and status <> 'berhenti'
      and berakhir + 7 >= current_date
  )
$$;

-- Modul aktif? Core (santri, asrama, kelas, pengguna) tidak memerlukan modul.
create or replace function punya_addon(p_pondok uuid, p_kode text) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1 from addon_pondok where pondok_id = p_pondok and kode = p_kode and aktif
  )
$$;

-- -----------------------------------------------------------------------------
-- 4. DATA INDUK
--    Kunci komposit (pondok_id, id) memastikan relasi tidak bisa menyeberang
--    ke pondok lain walaupun aplikasi salah mengirim id.
-- -----------------------------------------------------------------------------
create table tahun_ajaran (
  id          uuid primary key default gen_random_uuid(),
  pondok_id   uuid not null references pondok(id) on delete cascade,
  nama        text not null,                       -- "2026/2027"
  semester    text not null check (semester in ('ganjil', 'genap')),
  aktif       boolean not null default false,
  mulai       date,
  selesai     date,
  created_at  timestamptz not null default now(),
  unique (pondok_id, id),
  unique (pondok_id, nama, semester)
);
create unique index uq_tahun_ajaran_aktif on tahun_ajaran(pondok_id) where aktif;

create table kamar (
  id          uuid primary key default gen_random_uuid(),
  pondok_id   uuid not null references pondok(id) on delete cascade,
  kode        text not null,
  nama        text not null,
  komplek     text,
  jenis       text not null check (jenis in ('putra', 'putri')),
  musyrif     text,
  kapasitas   int not null default 20 check (kapasitas > 0),
  created_at  timestamptz not null default now(),
  unique (pondok_id, id),
  unique (pondok_id, kode)
);

create table kelas (
  id          uuid primary key default gen_random_uuid(),
  pondok_id   uuid not null references pondok(id) on delete cascade,
  kode        text not null,
  nama        text not null,
  jenis       text not null check (jenis in ('diniyah', 'formal')),
  tingkat     text,
  wali_kelas  text,
  created_at  timestamptz not null default now(),
  unique (pondok_id, id),
  unique (pondok_id, kode)
);

create table santri (
  id                 uuid primary key default gen_random_uuid(),
  pondok_id          uuid not null references pondok(id) on delete cascade,
  nis                text not null,
  nik                text,
  nama               text not null,
  panggilan          text,
  jenis_kelamin      char(1) not null check (jenis_kelamin in ('L', 'P')),
  tempat_lahir       text,
  tanggal_lahir      date,
  tahun_masuk        int not null default extract(year from current_date)::int,
  tempat_tinggal     text not null default 'mukim' check (tempat_tinggal in ('mukim', 'kalong')),
  nama_ayah          text,
  nama_ibu           text,
  nama_wali          text not null,
  hubungan_wali      text default 'ayah',
  no_wa_wali         text not null check (no_wa_wali ~ '^62[0-9]{8,13}$'),
  alamat_asal        text,
  kota_asal          text,
  kamar_id           uuid,
  kelas_diniyah_id   uuid,
  kelas_formal_id    uuid,
  status             text not null default 'aktif'
                     check (status in ('aktif', 'alumni', 'boyong', 'skorsing')),
  catatan            text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (pondok_id, id),
  unique (pondok_id, nis),
  foreign key (pondok_id, kamar_id)         references kamar(pondok_id, id)  on delete set null (kamar_id),
  foreign key (pondok_id, kelas_diniyah_id) references kelas(pondok_id, id) on delete set null (kelas_diniyah_id),
  foreign key (pondok_id, kelas_formal_id)  references kelas(pondok_id, id) on delete set null (kelas_formal_id)
);
create trigger trg_santri_upd before update on santri
  for each row execute function set_updated_at();
create index idx_santri_status on santri(pondok_id, status);
create index idx_santri_nama   on santri(pondok_id, lower(nama));

create table riwayat_penempatan (
  id                uuid primary key default gen_random_uuid(),
  pondok_id         uuid not null references pondok(id) on delete cascade,
  santri_id         uuid not null,
  tahun_ajaran_id   uuid not null,
  kamar_id          uuid,
  kelas_diniyah_id  uuid,
  kelas_formal_id   uuid,
  keterangan        text,
  tanggal           date not null default current_date,
  created_at        timestamptz not null default now(),
  foreign key (pondok_id, santri_id)       references santri(pondok_id, id)       on delete cascade,
  foreign key (pondok_id, tahun_ajaran_id) references tahun_ajaran(pondok_id, id) on delete cascade,
  foreign key (pondok_id, kamar_id)        references kamar(pondok_id, id)        on delete set null (kamar_id),
  foreign key (pondok_id, kelas_diniyah_id) references kelas(pondok_id, id)       on delete set null (kelas_diniyah_id),
  foreign key (pondok_id, kelas_formal_id)  references kelas(pondok_id, id)       on delete set null (kelas_formal_id)
);

-- Batas kuota santri aktif sesuai langganan.
create or replace function jaga_kuota_santri() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_kuota int; v_aktif int;
begin
  if new.status <> 'aktif' then return new; end if;
  if tg_op = 'UPDATE' and old.status = 'aktif' then return new; end if;

  select kuota_santri into v_kuota from langganan where pondok_id = new.pondok_id;
  if v_kuota is null then
    raise exception 'LANGGANAN_TIDAK_ADA' using errcode = 'P0001';
  end if;
  select count(*) into v_aktif from santri
   where pondok_id = new.pondok_id and status = 'aktif' and id <> new.id;
  if v_aktif + 1 > v_kuota then
    raise exception 'KUOTA_SANTRI_PENUH' using errcode = 'P0001',
      detail = format('kuota %s, aktif %s', v_kuota, v_aktif);
  end if;
  return new;
end $$;
create trigger trg_santri_kuota before insert or update of status on santri
  for each row execute function jaga_kuota_santri();

-- -----------------------------------------------------------------------------
-- 6. JEJAK AUDIT
-- -----------------------------------------------------------------------------
create table jejak_audit (
  id         bigint generated always as identity primary key,
  pondok_id  uuid not null,
  user_id    uuid,
  aksi       text not null,           -- insert | update | delete
  tabel      text not null,
  baris_id   uuid,
  sebelum    jsonb,
  sesudah    jsonb,
  waktu      timestamptz not null default now()
);
create index idx_audit_pondok on jejak_audit(pondok_id, waktu desc);

create or replace function catat_audit() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare r record;
begin
  r := coalesce(new, old);
  insert into jejak_audit (pondok_id, user_id, aksi, tabel, baris_id, sebelum, sesudah)
  values (r.pondok_id, auth.uid(), lower(tg_op), tg_table_name, r.id,
          case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
          case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end);
  return null;
end $$;
create trigger trg_audit_santri     after insert or update or delete on santri     for each row execute function catat_audit();

-- -----------------------------------------------------------------------------
-- 7. FUNGSI APLIKASI (INTI)
-- -----------------------------------------------------------------------------

-- Pendaftaran pondok baru: pembuat otomatis menjadi admin.
create or replace function buat_pondok(
  p_nama text, p_kode text, p_nama_pengguna text, p_hari_percobaan int default 14
) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'BELUM_MASUK' using errcode = '42501'; end if;
  insert into pondok (nama, kode) values (p_nama, p_kode) returning id into v_id;
  insert into anggota_pondok (pondok_id, user_id, peran, nama)
    values (v_id, auth.uid(), 'admin', p_nama_pengguna);
  insert into langganan (pondok_id, status, siklus, berakhir)
    values (v_id, 'percobaan', 'percobaan', current_date + p_hari_percobaan);
  -- Masa percobaan: semua modul yang sudah tersedia ikut aktif agar bisa dicoba.
  insert into addon_pondok (pondok_id, kode) select v_id, kode from modul where tersedia;
  return v_id;
end $$;

-- -----------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------
alter table pondok             enable row level security;
alter table anggota_pondok     enable row level security;
alter table staf_tsiqa         enable row level security;
alter table langganan          enable row level security;
alter table addon_pondok       enable row level security;
alter table modul              enable row level security;
alter table tahun_ajaran       enable row level security;
alter table kamar              enable row level security;
alter table kelas              enable row level security;
alter table santri             enable row level security;
alter table riwayat_penempatan enable row level security;
alter table jejak_audit        enable row level security;

-- Pondok & anggota
create policy pondok_baca  on pondok for select to authenticated
  using (id in (select pondok_saya()) or adalah_staf_tsiqa());
create policy pondok_ubah  on pondok for update to authenticated
  using (punya_peran(id, array['admin']::peran_pondok[]) and boleh_tulis(id))
  with check (punya_peran(id, array['admin']::peran_pondok[]));

create policy anggota_baca on anggota_pondok for select to authenticated
  using (pondok_id in (select pondok_saya()) or adalah_staf_tsiqa());
create policy anggota_kelola on anggota_pondok for all to authenticated
  using (punya_peran(pondok_id, array['admin']::peran_pondok[]))
  with check (punya_peran(pondok_id, array['admin']::peran_pondok[]));

-- Langganan & add-on: pondok hanya membaca; perubahan lewat konsol TSIQA.
create policy langganan_baca on langganan for select to authenticated
  using (pondok_id in (select pondok_saya()) or adalah_staf_tsiqa());
create policy langganan_kelola on langganan for all to authenticated
  using (adalah_staf_tsiqa()) with check (adalah_staf_tsiqa());
create policy modul_baca on modul for select to authenticated using (true);
create policy modul_kelola on modul for all to authenticated
  using (adalah_staf_tsiqa()) with check (adalah_staf_tsiqa());
create policy addon_baca on addon_pondok for select to authenticated
  using (pondok_id in (select pondok_saya()) or adalah_staf_tsiqa());
create policy addon_kelola on addon_pondok for all to authenticated
  using (adalah_staf_tsiqa()) with check (adalah_staf_tsiqa());

create policy tsiqa_baca on staf_tsiqa for select to authenticated using (user_id = auth.uid());

-- Data induk: semua anggota membaca; admin & staf TU menulis.
do $$
declare t text;
begin
  foreach t in array array['tahun_ajaran', 'kamar', 'kelas', 'santri', 'riwayat_penempatan'] loop
    execute format($f$create policy %1$s_baca on %1$I for select to authenticated
                      using (pondok_id in (select pondok_saya()))$f$, t);
    execute format($f$create policy %1$s_tulis on %1$I for all to authenticated
                      using (punya_peran(pondok_id, array['admin','staf_tu']::peran_pondok[]) and boleh_tulis(pondok_id))
                      with check (punya_peran(pondok_id, array['admin','staf_tu']::peran_pondok[]) and boleh_tulis(pondok_id))$f$, t);
  end loop;
end $$;

-- Audit: hanya admin pondok yang boleh melihat.
create policy audit_baca on jejak_audit for select to authenticated
  using (punya_peran(pondok_id, array['admin']::peran_pondok[]));

-- -----------------------------------------------------------------------------
-- 9. HAK AKSES
-- -----------------------------------------------------------------------------
revoke all on all tables    in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;

grant select on all tables in schema public to authenticated;
grant insert, update on anggota_pondok to authenticated;  -- tidak ada hapus: nonaktifkan saja
grant insert, update, delete on
  tahun_ajaran, kamar, kelas, santri, riwayat_penempatan
  to authenticated;
grant update on pondok to authenticated;
grant insert, update, delete on modul to authenticated;  -- dibatasi RLS: staf TSIQA saja
grant insert, update, delete on langganan, addon_pondok to authenticated;  -- dibatasi RLS: staf TSIQA saja

grant execute on function
  pondok_saya(), punya_peran(uuid, peran_pondok[]), adalah_staf_tsiqa(),
  boleh_tulis(uuid), punya_addon(uuid, text),
  buat_pondok(text, text, text, int)
  to authenticated;

-- -----------------------------------------------------------------------------
-- 10. PENGGUNA & PENEMPATAN
-- -----------------------------------------------------------------------------

-- Pondok tidak boleh kehilangan admin terakhirnya.
create or replace function jaga_admin_terakhir() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if old.peran = 'admin' and old.aktif and (not new.aktif or new.peran <> 'admin') then
    if not exists (select 1 from anggota_pondok
                    where pondok_id = old.pondok_id and peran = 'admin' and aktif and id <> old.id) then
      raise exception 'ADMIN_TERAKHIR' using errcode = 'P0001';
    end if;
  end if;
  return new;
end $$;
create trigger trg_admin_terakhir before update on anggota_pondok
  for each row execute function jaga_admin_terakhir();

-- Mengganti tahun ajaran aktif secara atomik (hanya satu yang boleh aktif).
create or replace function aktifkan_tahun_ajaran(p_id uuid) returns void
language plpgsql set search_path = public, pg_temp as $$
declare v_pondok uuid;
begin
  select pondok_id into v_pondok from tahun_ajaran where id = p_id;
  if v_pondok is null then raise exception 'TAHUN_AJARAN_TIDAK_DITEMUKAN' using errcode = 'P0002'; end if;
  update tahun_ajaran set aktif = false where pondok_id = v_pondok and aktif and id <> p_id;
  update tahun_ajaran set aktif = true where id = p_id;
end $$;

-- Pindah kamar / naik kelas untuk banyak santri sekaligus + catat riwayat.
-- Argumen null = tidak diubah. Berjalan sebagai pemanggil, jadi RLS tetap berlaku.
create or replace function tempatkan_santri(
  p_ids uuid[], p_kamar uuid default null, p_diniyah uuid default null,
  p_formal uuid default null, p_keterangan text default null
) returns int
language plpgsql set search_path = public, pg_temp as $$
declare v_n int;
begin
  if p_kamar is null and p_diniyah is null and p_formal is null then
    raise exception 'TUJUAN_KOSONG' using errcode = 'P0001';
  end if;
  if not exists (select 1 from tahun_ajaran where aktif) then
    raise exception 'TAHUN_AJARAN_BELUM_AKTIF' using errcode = 'P0001';
  end if;

  with u as (
    update santri s set
      kamar_id         = coalesce(p_kamar, s.kamar_id),
      kelas_diniyah_id = coalesce(p_diniyah, s.kelas_diniyah_id),
      kelas_formal_id  = coalesce(p_formal, s.kelas_formal_id)
    where s.id = any (p_ids)
    returning s.pondok_id, s.id, s.kamar_id, s.kelas_diniyah_id, s.kelas_formal_id
  ), r as (
    insert into riwayat_penempatan (pondok_id, santri_id, tahun_ajaran_id, kamar_id,
                                    kelas_diniyah_id, kelas_formal_id, keterangan)
    select u.pondok_id, u.id, ta.id, u.kamar_id, u.kelas_diniyah_id, u.kelas_formal_id, p_keterangan
      from u join tahun_ajaran ta on ta.pondok_id = u.pondok_id and ta.aktif
    returning 1
  )
  select count(*) into v_n from u;
  return v_n;
end $$;

revoke all on function jaga_admin_terakhir(), aktifkan_tahun_ajaran(uuid),
  tempatkan_santri(uuid[], uuid, uuid, uuid, text) from public, anon, authenticated;
grant execute on function aktifkan_tahun_ajaran(uuid), tempatkan_santri(uuid[], uuid, uuid, uuid, text) to authenticated;

-- -----------------------------------------------------------------------------
-- 11. KONSOL TSIQA (khusus staf TSIQA)
-- -----------------------------------------------------------------------------

-- Ringkasan semua pondok. Hanya angka agregat: staf TSIQA tidak membaca data santri.
create or replace function konsol_ringkasan()
returns table (
  pondok_id uuid, nama text, kode text, dibuat timestamptz,
  status text, siklus text, kuota_santri int, berakhir date,
  santri_aktif bigint, pengguna bigint, modul text[]
)
language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  if not adalah_staf_tsiqa() then raise exception 'TIDAK_BERHAK' using errcode = '42501'; end if;
  return query
    select p.id, p.nama, p.kode, p.created_at,
           l.status, l.siklus, l.kuota_santri, l.berakhir,
           (select count(*) from santri s where s.pondok_id = p.id and s.status = 'aktif'),
           (select count(*) from anggota_pondok a where a.pondok_id = p.id and a.aktif),
           coalesce((select array_agg(o.kode order by o.kode) from addon_pondok o where o.pondok_id = p.id and o.aktif), '{}')
      from pondok p left join langganan l on l.pondok_id = p.id
     order by p.created_at desc;
end $$;

-- Catatan pembayaran langganan pondok ke TSIQA.
create table pembayaran_langganan (
  id               uuid primary key default gen_random_uuid(),
  pondok_id        uuid not null references pondok(id) on delete cascade,
  tanggal          date not null default current_date,
  jumlah           bigint not null check (jumlah >= 0),
  bulan            int not null check (bulan between 1 and 36),
  berakhir_sebelum date,
  berakhir_baru    date not null,
  catatan          text,
  dicatat_oleh     uuid references auth.users(id),
  created_at       timestamptz not null default now()
);
create index idx_bayar_langganan on pembayaran_langganan(pondok_id, tanggal desc);
alter table pembayaran_langganan enable row level security;
create policy bayar_langganan_staf on pembayaran_langganan for select to authenticated
  using (adalah_staf_tsiqa() or punya_peran(pondok_id, array['admin']::peran_pondok[]));

-- Perpanjang langganan: berlaku dari hari ini atau dari tanggal berakhir bila belum lewat.
create or replace function perpanjang_langganan(
  p_pondok uuid, p_bulan int, p_jumlah bigint, p_siklus text default null, p_catatan text default null
) returns date
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_lama date; v_baru date;
begin
  if not adalah_staf_tsiqa() then raise exception 'TIDAK_BERHAK' using errcode = '42501'; end if;
  if p_bulan is null or p_bulan < 1 or p_bulan > 36 then raise exception 'BULAN_TIDAK_VALID' using errcode = 'P0001'; end if;
  if p_siklus is not null and p_siklus not in ('bulanan', 'tahunan', 'percobaan') then
    raise exception 'SIKLUS_TIDAK_VALID' using errcode = 'P0001';
  end if;

  select berakhir into v_lama from langganan where pondok_id = p_pondok for update;
  if not found then raise exception 'LANGGANAN_TIDAK_ADA' using errcode = 'P0002'; end if;
  v_baru := (greatest(v_lama, current_date) + make_interval(months => p_bulan))::date;

  update langganan set berakhir = v_baru, status = 'aktif', siklus = coalesce(p_siklus, siklus)
   where pondok_id = p_pondok;
  insert into pembayaran_langganan (pondok_id, jumlah, bulan, berakhir_sebelum, berakhir_baru, catatan, dicatat_oleh)
  values (p_pondok, p_jumlah, p_bulan, v_lama, v_baru, p_catatan, auth.uid());
  return v_baru;
end $$;

-- Jejak perubahan langganan dan modul (terlihat oleh admin pondok yang bersangkutan).
create or replace function catat_audit_konsol() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare r record;
begin
  r := coalesce(new, old);
  insert into jejak_audit (pondok_id, user_id, aksi, tabel, baris_id, sebelum, sesudah)
  values (r.pondok_id, auth.uid(), lower(tg_op), tg_table_name, null,
          case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
          case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end);
  return null;
end $$;
create trigger trg_audit_langganan after update on langganan
  for each row execute function catat_audit_konsol();
create trigger trg_audit_addon after insert or update or delete on addon_pondok
  for each row execute function catat_audit_konsol();

revoke all on function konsol_ringkasan(), perpanjang_langganan(uuid, int, bigint, text, text),
  catat_audit_konsol() from public, anon, authenticated;
grant execute on function konsol_ringkasan(), perpanjang_langganan(uuid, int, bigint, text, text) to authenticated;
revoke all on pembayaran_langganan from anon, authenticated;
grant select on pembayaran_langganan to authenticated;
