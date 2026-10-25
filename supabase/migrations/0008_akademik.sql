-- =============================================================================
-- TSIQA — Modul Akademik (guru, mapel, jadwal, absensi, nilai, rapor) + akses Portal Guru.
-- Guru tidak membaca tabel secara langsung: semua lewat fungsi yang memeriksa kepemilikan jadwal.
-- Bergantung pada 0001–0007. Aman dijalankan ulang.
-- =============================================================================

update modul set tersedia = true where kode in ('akademik', 'portal_guru');

create table if not exists mapel (
  id         uuid primary key default gen_random_uuid(),
  pondok_id  uuid not null references pondok(id) on delete cascade,
  nama       text not null check (length(trim(nama)) > 0),
  created_at timestamptz not null default now(),
  unique (pondok_id, id), unique (pondok_id, nama)
);

create table if not exists guru (
  id         uuid primary key default gen_random_uuid(),
  pondok_id  uuid not null references pondok(id) on delete cascade,
  user_id    uuid references auth.users(id) on delete set null,
  nama       text not null check (length(trim(nama)) > 0),
  no_wa      text not null check (no_wa ~ '^62[0-9]{8,13}$'),
  aktif      boolean not null default true,
  created_at timestamptz not null default now(),
  unique (pondok_id, id), unique (pondok_id, no_wa)
);
create index if not exists idx_guru_user on guru(user_id);

create table if not exists undangan_guru (
  id           uuid primary key default gen_random_uuid(),
  pondok_id    uuid not null references pondok(id) on delete cascade,
  guru_id      uuid not null references guru(id) on delete cascade,
  no_wa        text not null,
  kode         text not null unique,
  kedaluwarsa  timestamptz not null default now() + interval '7 days',
  dipakai_pada timestamptz,
  created_at   timestamptz not null default now()
);

create table if not exists jadwal (
  id           uuid primary key default gen_random_uuid(),
  pondok_id    uuid not null references pondok(id) on delete cascade,
  kelas_id     uuid not null,
  mapel_id     uuid not null,
  guru_id      uuid not null,
  hari         smallint not null check (hari between 1 and 7),  -- 1 Senin … 7 Ahad
  jam_mulai    time not null,
  jam_selesai  time not null,
  created_at   timestamptz not null default now(),
  check (jam_mulai < jam_selesai),
  unique (pondok_id, id),
  foreign key (pondok_id, kelas_id) references kelas(pondok_id, id) on delete cascade,
  foreign key (pondok_id, mapel_id) references mapel(pondok_id, id) on delete cascade,
  foreign key (pondok_id, guru_id)  references guru(pondok_id, id)  on delete cascade
);
create index if not exists idx_jadwal_guru on jadwal(guru_id, hari);

-- Satu guru atau satu kelas tidak boleh berada di dua jadwal yang waktunya beririsan.
create or replace function jaga_jadwal_bentrok() returns trigger
language plpgsql as $$
begin
  if exists (
    select 1 from jadwal j
    where j.pondok_id = new.pondok_id and j.id <> new.id and j.hari = new.hari
      and (j.guru_id = new.guru_id or j.kelas_id = new.kelas_id)
      and j.jam_mulai < new.jam_selesai and new.jam_mulai < j.jam_selesai
  ) then raise exception 'JADWAL_BENTROK' using errcode = 'P0001'; end if;
  return new;
end $$;
drop trigger if exists trg_jadwal_bentrok on jadwal;
create trigger trg_jadwal_bentrok before insert or update on jadwal for each row execute function jaga_jadwal_bentrok();

create table if not exists absensi (
  id          uuid primary key default gen_random_uuid(),
  pondok_id   uuid not null references pondok(id) on delete cascade,
  jadwal_id   uuid not null,
  santri_id   uuid not null,
  tanggal     date not null,
  status      text not null check (status in ('hadir', 'izin', 'sakit', 'alpa')),
  dicatat_oleh uuid references auth.users(id),
  updated_at  timestamptz not null default now(),
  unique (jadwal_id, tanggal, santri_id),
  foreign key (pondok_id, jadwal_id) references jadwal(pondok_id, id) on delete cascade,
  foreign key (pondok_id, santri_id) references santri(pondok_id, id) on delete cascade
);
create index if not exists idx_absensi_santri on absensi(santri_id, tanggal);

create table if not exists akademik_pengaturan (
  pondok_id   uuid primary key references pondok(id) on delete cascade,
  bobot_tugas int not null default 30 check (bobot_tugas between 0 and 100),
  bobot_uts   int not null default 30 check (bobot_uts between 0 and 100),
  bobot_uas   int not null default 40 check (bobot_uas between 0 and 100),
  kkm         int not null default 70 check (kkm between 0 and 100),
  check (bobot_tugas + bobot_uts + bobot_uas = 100)
);

create table if not exists nilai (
  id               uuid primary key default gen_random_uuid(),
  pondok_id        uuid not null references pondok(id) on delete cascade,
  santri_id        uuid not null,
  mapel_id         uuid not null,
  tahun_ajaran_id  uuid not null,
  jenis            text not null check (jenis in ('tugas', 'uts', 'uas')),
  nilai            numeric(5,2) not null check (nilai between 0 and 100),
  diisi_oleh       uuid references auth.users(id),
  updated_at       timestamptz not null default now(),
  unique (santri_id, mapel_id, tahun_ajaran_id, jenis),
  foreign key (pondok_id, santri_id)       references santri(pondok_id, id)       on delete cascade,
  foreign key (pondok_id, mapel_id)        references mapel(pondok_id, id)        on delete cascade,
  foreign key (pondok_id, tahun_ajaran_id) references tahun_ajaran(pondok_id, id) on delete cascade
);

create table if not exists rapor_catatan (
  id               uuid primary key default gen_random_uuid(),
  pondok_id        uuid not null references pondok(id) on delete cascade,
  santri_id        uuid not null,
  tahun_ajaran_id  uuid not null,
  catatan          text,
  dipublikasi      boolean not null default false,
  updated_at       timestamptz not null default now(),
  unique (santri_id, tahun_ajaran_id),
  foreign key (pondok_id, santri_id)       references santri(pondok_id, id)       on delete cascade,
  foreign key (pondok_id, tahun_ajaran_id) references tahun_ajaran(pondok_id, id) on delete cascade
);

-- ---- RLS: anggota pondok membaca; admin & staf TU menulis (modul aktif, langganan berlaku)
do $$ declare t text; begin
  foreach t in array array['mapel','guru','jadwal','absensi','akademik_pengaturan','nilai','rapor_catatan','undangan_guru'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists %I on %I', t || '_baca', t);
    execute format('create policy %I on %I for select to authenticated using (pondok_id in (select pondok_saya()))', t || '_baca', t);
    if t <> 'undangan_guru' then
      execute format('drop policy if exists %I on %I', t || '_tulis', t);
      execute format($f$create policy %I on %I for all to authenticated
        using (punya_peran(pondok_id, array['admin','staf_tu']::peran_pondok[]) and boleh_tulis(pondok_id) and punya_addon(pondok_id, 'akademik'))
        with check (punya_peran(pondok_id, array['admin','staf_tu']::peran_pondok[]) and boleh_tulis(pondok_id) and punya_addon(pondok_id, 'akademik'))$f$, t || '_tulis', t);
    end if;
  end loop;
end $$;

-- ---- Wali: membaca absensi, mapel, pengaturan, tahun ajaran; nilai hanya setelah rapor dipublikasi
drop policy if exists wali_absensi on absensi;
create policy wali_absensi on absensi for select to authenticated
  using (santri_id in (select santri_wali()) and punya_addon(pondok_id, 'akademik'));
drop policy if exists wali_mapel on mapel;
create policy wali_mapel on mapel for select to authenticated
  using (pondok_id in (select pondok_wali()) and punya_addon(pondok_id, 'akademik'));
drop policy if exists wali_akademik_pengaturan on akademik_pengaturan;
create policy wali_akademik_pengaturan on akademik_pengaturan for select to authenticated
  using (pondok_id in (select pondok_wali()));
drop policy if exists wali_tahun_ajaran on tahun_ajaran;
create policy wali_tahun_ajaran on tahun_ajaran for select to authenticated
  using (pondok_id in (select pondok_wali()));
drop policy if exists wali_rapor on rapor_catatan;
create policy wali_rapor on rapor_catatan for select to authenticated
  using (dipublikasi and santri_id in (select santri_wali()) and punya_addon(pondok_id, 'akademik'));
drop policy if exists wali_nilai on nilai;
create policy wali_nilai on nilai for select to authenticated
  using (santri_id in (select santri_wali()) and punya_addon(pondok_id, 'akademik')
         and exists (select 1 from rapor_catatan r where r.santri_id = nilai.santri_id
                       and r.tahun_ajaran_id = nilai.tahun_ajaran_id and r.dipublikasi));

grant select on mapel, guru, jadwal, absensi, akademik_pengaturan, nilai, rapor_catatan, undangan_guru to authenticated;
grant insert, update, delete on mapel, guru, jadwal, absensi, akademik_pengaturan, nilai, rapor_catatan to authenticated;

-- -----------------------------------------------------------------------------
-- Akun guru: tautan dari nomor WhatsApp, sama seperti wali (app_metadata hanya bisa diisi server).
-- -----------------------------------------------------------------------------
create or replace function buat_undangan_guru(p_guru uuid) returns text
language plpgsql security definer set search_path = public, pg_temp as $$
declare g guru; v_kode text;
begin
  select * into g from guru where id = p_guru;
  if not found then raise exception 'GURU_TIDAK_DITEMUKAN' using errcode = 'P0002'; end if;
  if not punya_peran(g.pondok_id, array['admin','staf_tu']::peran_pondok[]) then raise exception 'TIDAK_BERHAK' using errcode = '42501'; end if;
  if not boleh_tulis(g.pondok_id) then raise exception 'LANGGANAN_BERAKHIR' using errcode = 'P0001'; end if;
  if not punya_addon(g.pondok_id, 'portal_guru') then raise exception 'MODUL_TIDAK_AKTIF' using errcode = 'P0001'; end if;
  v_kode := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  insert into undangan_guru (pondok_id, guru_id, no_wa, kode) values (g.pondok_id, g.id, g.no_wa, v_kode);
  return v_kode;
end $$;

create or replace function tautkan_guru() returns int
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_no text; n int;
begin
  if auth.uid() is null then return 0; end if;
  if (auth.jwt() -> 'app_metadata' ->> 'peran') is distinct from 'guru' then return 0; end if;
  v_no := auth.jwt() -> 'app_metadata' ->> 'no_wa';
  if v_no is null or v_no !~ '^62[0-9]{8,13}$' then return 0; end if;
  update guru set user_id = auth.uid() where no_wa = v_no and aktif and user_id is null and punya_addon(pondok_id, 'portal_guru');
  get diagnostics n = row_count;
  return n;
end $$;

create or replace function guru_saya() returns setof uuid
language sql stable security definer set search_path = public, pg_temp as $$
  select g.id from guru g
  where g.user_id = auth.uid() and g.aktif
    and punya_addon(g.pondok_id, 'akademik') and punya_addon(g.pondok_id, 'portal_guru')
$$;

create or replace function _tanggal_wib() returns date language sql stable as $$ select (now() at time zone 'Asia/Jakarta')::date $$;

create or replace function jadwal_guru()
returns table (id uuid, pondok text, hari smallint, jam_mulai time, jam_selesai time, kelas text, mapel text, jumlah_santri bigint)
language sql stable security definer set search_path = public, pg_temp as $$
  select j.id, p.nama, j.hari, j.jam_mulai, j.jam_selesai, k.nama, m.nama,
         (select count(*) from santri s where s.pondok_id = j.pondok_id and s.status = 'aktif'
            and (s.kelas_diniyah_id = j.kelas_id or s.kelas_formal_id = j.kelas_id))
    from jadwal j
    join pondok p on p.id = j.pondok_id
    join kelas k on k.id = j.kelas_id
    join mapel m on m.id = j.mapel_id
   where j.guru_id in (select guru_saya())
   order by j.hari, j.jam_mulai
$$;

create or replace function _jadwal_milik_guru(p_jadwal uuid) returns jadwal
language plpgsql stable security definer set search_path = public, pg_temp as $$
declare j jadwal;
begin
  select * into j from jadwal where id = p_jadwal and guru_id in (select guru_saya());
  if not found then raise exception 'TIDAK_BERHAK' using errcode = '42501'; end if;
  return j;
end $$;

create or replace function roster_jadwal(p_jadwal uuid, p_tanggal date)
returns table (santri_id uuid, nis text, nama text, status text)
language plpgsql stable security definer set search_path = public, pg_temp as $$
declare j jadwal;
begin
  j := _jadwal_milik_guru(p_jadwal);
  return query
    select s.id, s.nis, s.nama, a.status
      from santri s
      left join absensi a on a.santri_id = s.id and a.jadwal_id = j.id and a.tanggal = p_tanggal
     where s.pondok_id = j.pondok_id and s.status = 'aktif'
       and (s.kelas_diniyah_id = j.kelas_id or s.kelas_formal_id = j.kelas_id)
     order by s.nama;
end $$;

-- p_data: [{"santri_id": "...", "status": "hadir|izin|sakit|alpa"}, ...]
create or replace function simpan_absensi(p_jadwal uuid, p_tanggal date, p_data jsonb) returns int
language plpgsql security definer set search_path = public, pg_temp as $$
declare j jadwal; n int;
begin
  j := _jadwal_milik_guru(p_jadwal);
  if not boleh_tulis(j.pondok_id) then raise exception 'LANGGANAN_BERAKHIR' using errcode = 'P0001'; end if;
  if p_tanggal > _tanggal_wib() or p_tanggal < _tanggal_wib() - 14 then raise exception 'TANGGAL_TIDAK_VALID' using errcode = 'P0001'; end if;
  insert into absensi (pondok_id, jadwal_id, santri_id, tanggal, status, dicatat_oleh)
  select j.pondok_id, j.id, s.id, p_tanggal, x.status, auth.uid()
    from jsonb_to_recordset(p_data) as x(santri_id uuid, status text)
    join santri s on s.id = x.santri_id and s.pondok_id = j.pondok_id and s.status = 'aktif'
     and (s.kelas_diniyah_id = j.kelas_id or s.kelas_formal_id = j.kelas_id)
   where x.status in ('hadir', 'izin', 'sakit', 'alpa')
  on conflict (jadwal_id, tanggal, santri_id)
  do update set status = excluded.status, dicatat_oleh = excluded.dicatat_oleh, updated_at = now();
  get diagnostics n = row_count;
  return n;
end $$;

create or replace function roster_nilai(p_jadwal uuid, p_jenis text)
returns table (santri_id uuid, nis text, nama text, nilai numeric)
language plpgsql stable security definer set search_path = public, pg_temp as $$
declare j jadwal; v_ta uuid;
begin
  j := _jadwal_milik_guru(p_jadwal);
  select id into v_ta from tahun_ajaran where pondok_id = j.pondok_id and aktif;
  if v_ta is null then raise exception 'TAHUN_AJARAN_BELUM_AKTIF' using errcode = 'P0001'; end if;
  return query
    select s.id, s.nis, s.nama, n.nilai
      from santri s
      left join nilai n on n.santri_id = s.id and n.mapel_id = j.mapel_id and n.tahun_ajaran_id = v_ta and n.jenis = p_jenis
     where s.pondok_id = j.pondok_id and s.status = 'aktif'
       and (s.kelas_diniyah_id = j.kelas_id or s.kelas_formal_id = j.kelas_id)
     order by s.nama;
end $$;

-- p_data: [{"santri_id": "...", "nilai": 85}, ...]; nilai kosong dilewati.
create or replace function simpan_nilai(p_jadwal uuid, p_jenis text, p_data jsonb) returns int
language plpgsql security definer set search_path = public, pg_temp as $$
declare j jadwal; v_ta uuid; n int;
begin
  j := _jadwal_milik_guru(p_jadwal);
  if p_jenis not in ('tugas', 'uts', 'uas') then raise exception 'JENIS_TIDAK_VALID' using errcode = 'P0001'; end if;
  if not boleh_tulis(j.pondok_id) then raise exception 'LANGGANAN_BERAKHIR' using errcode = 'P0001'; end if;
  select id into v_ta from tahun_ajaran where pondok_id = j.pondok_id and aktif;
  if v_ta is null then raise exception 'TAHUN_AJARAN_BELUM_AKTIF' using errcode = 'P0001'; end if;
  insert into nilai (pondok_id, santri_id, mapel_id, tahun_ajaran_id, jenis, nilai, diisi_oleh)
  select j.pondok_id, s.id, j.mapel_id, v_ta, p_jenis, x.nilai, auth.uid()
    from jsonb_to_recordset(p_data) as x(santri_id uuid, nilai numeric)
    join santri s on s.id = x.santri_id and s.pondok_id = j.pondok_id and s.status = 'aktif'
     and (s.kelas_diniyah_id = j.kelas_id or s.kelas_formal_id = j.kelas_id)
   where x.nilai is not null and x.nilai between 0 and 100
  on conflict (santri_id, mapel_id, tahun_ajaran_id, jenis)
  do update set nilai = excluded.nilai, diisi_oleh = excluded.diisi_oleh, updated_at = now();
  get diagnostics n = row_count;
  return n;
end $$;

revoke all on function buat_undangan_guru(uuid), tautkan_guru(), guru_saya(), jadwal_guru(), _jadwal_milik_guru(uuid),
  roster_jadwal(uuid, date), simpan_absensi(uuid, date, jsonb), roster_nilai(uuid, text), simpan_nilai(uuid, text, jsonb), _tanggal_wib()
  from public, anon, authenticated;
grant execute on function buat_undangan_guru(uuid), tautkan_guru(), guru_saya(), jadwal_guru(),
  roster_jadwal(uuid, date), simpan_absensi(uuid, date, jsonb), roster_nilai(uuid, text), simpan_nilai(uuid, text, jsonb)
  to authenticated;
