-- =============================================================================
-- TSIQA — Portal Wali lengkap: undangan, hak baca wali, konfirmasi transfer, push.
-- Bergantung pada 0001–0003 (Inti, Keuangan, Portal Wali dasar). Aman dijalankan ulang.
-- =============================================================================

-- Modul Portal Wali kini tersedia untuk diaktifkan.
update modul set tersedia = true where kode = 'portal_wali';

-- -----------------------------------------------------------------------------
-- 1. Undangan wali (tautan aktivasi dikirim lewat WhatsApp oleh pengurus)
-- -----------------------------------------------------------------------------
create table if not exists undangan_wali (
  id            uuid primary key default gen_random_uuid(),
  pondok_id     uuid not null references pondok(id) on delete cascade,
  santri_id     uuid not null,
  no_wa         text not null,
  kode          text not null unique,
  dibuat_oleh   uuid references auth.users(id),
  kedaluwarsa   timestamptz not null default now() + interval '7 days',
  dipakai_pada  timestamptz,
  created_at    timestamptz not null default now(),
  foreign key (pondok_id, santri_id) references santri(pondok_id, id) on delete cascade
);
create index if not exists idx_undangan_wali on undangan_wali(pondok_id, no_wa);
alter table undangan_wali enable row level security;

drop policy if exists undangan_wali_baca on undangan_wali;
create policy undangan_wali_baca on undangan_wali for select to authenticated
  using (punya_peran(pondok_id, array['admin','staf_tu']::peran_pondok[]));

create or replace function buat_undangan_wali(p_santri uuid) returns text
language plpgsql security definer set search_path = public, pg_temp as $$
declare s santri; v_kode text;
begin
  select * into s from santri where id = p_santri;
  if not found then raise exception 'SANTRI_TIDAK_DITEMUKAN' using errcode = 'P0002'; end if;
  if not punya_peran(s.pondok_id, array['admin','staf_tu']::peran_pondok[]) then
    raise exception 'TIDAK_BERHAK' using errcode = '42501';
  end if;
  if not boleh_tulis(s.pondok_id) then raise exception 'LANGGANAN_BERAKHIR' using errcode = 'P0001'; end if;
  if not punya_addon(s.pondok_id, 'portal_wali') then raise exception 'MODUL_TIDAK_AKTIF' using errcode = 'P0001'; end if;

  v_kode := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  insert into undangan_wali (pondok_id, santri_id, no_wa, kode, dibuat_oleh)
  values (s.pondok_id, s.id, s.no_wa_wali, v_kode, auth.uid());
  return v_kode;
end $$;

-- Pengurus melihat akun wali di pondoknya (untuk status "sudah masuk").
drop policy if exists wali_akun_pengurus on wali_akun;
create policy wali_akun_pengurus on wali_akun for select to authenticated
  using (punya_peran(pondok_id, array['admin','staf_tu']::peran_pondok[]));

-- -----------------------------------------------------------------------------
-- 2. Hak baca wali (hanya baca, hanya data anaknya / pondoknya)
-- -----------------------------------------------------------------------------
create or replace function pondok_wali() returns setof uuid
language sql stable security definer set search_path = public, pg_temp as $$
  select w.pondok_id from wali_akun w
  where w.user_id = auth.uid() and punya_addon(w.pondok_id, 'portal_wali')
$$;

drop policy if exists wali_pondok on pondok;
create policy wali_pondok on pondok for select to authenticated
  using (id in (select pondok_wali()));

drop policy if exists wali_kamar on kamar;
create policy wali_kamar on kamar for select to authenticated
  using (id in (select kamar_id from santri where id in (select santri_wali()) and kamar_id is not null));

drop policy if exists wali_kelas on kelas;
create policy wali_kelas on kelas for select to authenticated
  using (id in (select kelas_diniyah_id from santri where id in (select santri_wali()) and kelas_diniyah_id is not null)
      or id in (select kelas_formal_id   from santri where id in (select santri_wali()) and kelas_formal_id   is not null));

drop policy if exists wali_keuangan_pengaturan on keuangan_pengaturan;
create policy wali_keuangan_pengaturan on keuangan_pengaturan for select to authenticated
  using (pondok_id in (select pondok_wali()));

-- -----------------------------------------------------------------------------
-- 3. Konfirmasi transfer (wali unggah bukti, bendahara memverifikasi)
-- -----------------------------------------------------------------------------
create table if not exists konfirmasi_transfer (
  id                uuid primary key default gen_random_uuid(),
  pondok_id         uuid not null references pondok(id) on delete cascade,
  tagihan_id        uuid not null,
  santri_id         uuid not null,
  wali_user_id      uuid not null references auth.users(id),
  nominal           bigint not null check (nominal > 0),
  tanggal_transfer  date not null,
  bukti_path        text,
  catatan           text,
  status            text not null default 'menunggu' check (status in ('menunggu', 'diterima', 'ditolak')),
  alasan_tolak      text,
  pembayaran_id     uuid references pembayaran(id),
  diproses_oleh     uuid references auth.users(id),
  diproses_pada     timestamptz,
  created_at        timestamptz not null default now(),
  foreign key (pondok_id, tagihan_id) references tagihan(pondok_id, id) on delete cascade,
  foreign key (pondok_id, santri_id)  references santri(pondok_id, id)  on delete cascade
);
create index if not exists idx_konfirmasi_pondok on konfirmasi_transfer(pondok_id, status, created_at desc);
-- Satu konfirmasi yang menunggu per tagihan.
create unique index if not exists uq_konfirmasi_menunggu on konfirmasi_transfer(tagihan_id) where status = 'menunggu';
alter table konfirmasi_transfer enable row level security;

drop policy if exists konfirmasi_wali_baca on konfirmasi_transfer;
create policy konfirmasi_wali_baca on konfirmasi_transfer for select to authenticated
  using (wali_user_id = auth.uid());

drop policy if exists konfirmasi_wali_buat on konfirmasi_transfer;
create policy konfirmasi_wali_buat on konfirmasi_transfer for insert to authenticated
  with check (
    wali_user_id = auth.uid()
    and status = 'menunggu'
    and pondok_id in (select pondok_wali())
    and santri_id in (select santri_wali())
    and punya_addon(pondok_id, 'keuangan')
    and boleh_tulis(pondok_id)
    and exists (select 1 from tagihan t
                 where t.id = tagihan_id and t.pondok_id = konfirmasi_transfer.pondok_id
                   and t.santri_id = konfirmasi_transfer.santri_id and t.status <> 'lunas')
  );

drop policy if exists konfirmasi_pengurus_baca on konfirmasi_transfer;
create policy konfirmasi_pengurus_baca on konfirmasi_transfer for select to authenticated
  using (punya_peran(pondok_id, array['admin','bendahara']::peran_pondok[]));

-- Terima (membuat pembayaran + kwitansi lewat catat_pembayaran) atau tolak, dalam satu langkah.
create or replace function proses_konfirmasi(p_id uuid, p_terima boolean, p_alasan text default null)
returns konfirmasi_transfer
language plpgsql security definer set search_path = public, pg_temp as $$
declare k konfirmasi_transfer; pay pembayaran;
begin
  select * into k from konfirmasi_transfer where id = p_id for update;
  if not found then raise exception 'KONFIRMASI_TIDAK_DITEMUKAN' using errcode = 'P0002'; end if;
  if not punya_peran(k.pondok_id, array['admin','bendahara']::peran_pondok[]) then
    raise exception 'TIDAK_BERHAK' using errcode = '42501';
  end if;
  if k.status <> 'menunggu' then raise exception 'SUDAH_DIPROSES' using errcode = 'P0001'; end if;

  if p_terima then
    select * into pay from catat_pembayaran(
      k.tagihan_id, k.nominal, 'transfer', null, 'Konfirmasi transfer wali',
      (k.tanggal_transfer::timestamp at time zone 'Asia/Jakarta'), 'KT-' || k.id::text);
    update konfirmasi_transfer set status = 'diterima', pembayaran_id = pay.id,
           diproses_oleh = auth.uid(), diproses_pada = now()
     where id = p_id returning * into k;
  else
    if coalesce(trim(p_alasan), '') = '' then raise exception 'ALASAN_WAJIB' using errcode = 'P0001'; end if;
    update konfirmasi_transfer set status = 'ditolak', alasan_tolak = p_alasan,
           diproses_oleh = auth.uid(), diproses_pada = now()
     where id = p_id returning * into k;
  end if;
  return k;
end $$;

-- -----------------------------------------------------------------------------
-- 4. Langganan notifikasi push
-- -----------------------------------------------------------------------------
create table if not exists push_langganan (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz not null default now()
);
alter table push_langganan enable row level security;
drop policy if exists push_milik_sendiri on push_langganan;
create policy push_milik_sendiri on push_langganan for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 5. Bucket bukti transfer (privat). Diabaikan bila skema storage tidak ada (uji lokal).
-- -----------------------------------------------------------------------------
do $$ begin
  insert into storage.buckets (id, name, public) values ('bukti-transfer', 'bukti-transfer', false)
  on conflict (id) do nothing;
exception when undefined_table or invalid_schema_name then null;
end $$;

-- -----------------------------------------------------------------------------
-- 6. Hak akses
-- -----------------------------------------------------------------------------
revoke all on undangan_wali, konfirmasi_transfer, push_langganan from anon, authenticated;
revoke all on function buat_undangan_wali(uuid), proses_konfirmasi(uuid, boolean, text), pondok_wali()
  from public, anon, authenticated;

grant select on undangan_wali to authenticated;
grant select, insert on konfirmasi_transfer to authenticated;
grant select, insert, delete on push_langganan to authenticated;
grant execute on function buat_undangan_wali(uuid), proses_konfirmasi(uuid, boolean, text), pondok_wali()
  to authenticated;
