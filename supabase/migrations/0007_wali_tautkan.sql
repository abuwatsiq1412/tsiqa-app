-- =============================================================================
-- TSIQA — Menautkan akun wali ke santri berdasarkan nomor WhatsApp (aman dijalankan ulang).
-- Akun wali dibuat server dengan app_metadata {peran:'wali', no_wa:'62…'}; app_metadata
-- hanya bisa diubah oleh service role, jadi pengguna biasa tidak bisa memalsukannya.
-- =============================================================================

-- Semua santri aktif dengan nomor wali yang sama (di pondok yang modul Portal Walinya aktif)
-- ditautkan ke akun ini. Dipanggil saat wali masuk, supaya anak yang ditambah belakangan
-- ikut muncul. Mengembalikan jumlah tautan baru.
create or replace function tautkan_wali() returns int
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_no text; n int;
begin
  if auth.uid() is null then return 0; end if;
  if (auth.jwt() -> 'app_metadata' ->> 'peran') is distinct from 'wali' then return 0; end if;
  v_no := auth.jwt() -> 'app_metadata' ->> 'no_wa';
  if v_no is null or v_no !~ '^62[0-9]{8,13}$' then return 0; end if;

  insert into wali_akun (pondok_id, user_id, santri_id)
  select s.pondok_id, auth.uid(), s.id
    from santri s
   where s.no_wa_wali = v_no and s.status = 'aktif' and punya_addon(s.pondok_id, 'portal_wali')
  on conflict (user_id, santri_id) do nothing;
  get diagnostics n = row_count;
  return n;
end $$;

-- Akun wali tidak boleh membuat pondok.
create or replace function buat_pondok(
  p_nama text, p_kode text, p_nama_pengguna text, p_hari_percobaan int default 14
) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'BELUM_MASUK' using errcode = '42501'; end if;
  if exists (select 1 from wali_akun where user_id = auth.uid())
     or (auth.jwt() -> 'app_metadata' ->> 'peran') = 'wali' then
    raise exception 'AKUN_WALI' using errcode = 'P0001';
  end if;
  if not adalah_staf_tsiqa() and exists (
    select 1 from anggota_pondok where user_id = auth.uid() and aktif
  ) then
    raise exception 'SUDAH_PUNYA_PONDOK' using errcode = 'P0001';
  end if;
  insert into pondok (nama, kode) values (p_nama, p_kode) returning id into v_id;
  insert into anggota_pondok (pondok_id, user_id, peran, nama)
    values (v_id, auth.uid(), 'admin', p_nama_pengguna);
  insert into langganan (pondok_id, status, siklus, berakhir)
    values (v_id, 'percobaan', 'percobaan', current_date + p_hari_percobaan);
  insert into addon_pondok (pondok_id, kode) select v_id, kode from modul where tersedia;
  return v_id;
end $$;

revoke all on function tautkan_wali() from public, anon, authenticated;
grant execute on function tautkan_wali() to authenticated;
