-- =============================================================================
-- TSIQA — Modul PORTAL WALI (kode modul: 'portal_wali')
-- Bergantung pada Inti (0001) dan modul Keuangan (0002): wali melihat tagihan
-- dan pembayaran anaknya.
-- =============================================================================

-- Akun wali (Portal Wali): satu akun masuk bisa terhubung ke beberapa santri.
create table wali_akun (
  id          uuid primary key default gen_random_uuid(),
  pondok_id   uuid not null references pondok(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  santri_id   uuid not null,
  created_at  timestamptz not null default now(),
  foreign key (pondok_id, santri_id) references santri(pondok_id, id) on delete cascade,
  unique (user_id, santri_id)
);

create or replace function santri_wali() returns setof uuid
language sql stable security definer set search_path = public, pg_temp as $$
  select w.santri_id from wali_akun w
  where w.user_id = auth.uid() and punya_addon(w.pondok_id, 'portal_wali')
$$;

alter table wali_akun enable row level security;

-- Wali (Portal Wali): hanya membaca data anaknya.
create policy wali_baca_sendiri on wali_akun for select to authenticated using (user_id = auth.uid());
create policy wali_santri    on santri    for select to authenticated using (id in (select santri_wali()));
create policy wali_tagihan   on tagihan   for select to authenticated using (santri_id in (select santri_wali()));
create policy wali_pembayaran on pembayaran for select to authenticated using (santri_id in (select santri_wali()));

revoke all on wali_akun from anon, authenticated;
revoke all on function santri_wali() from public, anon, authenticated;
grant select on wali_akun to authenticated;
grant execute on function santri_wali() to authenticated;
