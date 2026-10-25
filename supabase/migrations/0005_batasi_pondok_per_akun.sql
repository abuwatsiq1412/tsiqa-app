-- =============================================================================
-- TSIQA — Satu akun, satu pondok. Mencegah akun yang sama membuat pondok (dan masa
-- percobaan) berulang kali. Staf TSIQA dikecualikan agar bisa membuat pondok uji.
-- Aman dijalankan ulang.
-- =============================================================================
create or replace function buat_pondok(
  p_nama text, p_kode text, p_nama_pengguna text, p_hari_percobaan int default 14
) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'BELUM_MASUK' using errcode = '42501'; end if;
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
