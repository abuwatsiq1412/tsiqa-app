-- Hak akses pengurus per modul (fleksibel: satu pengurus bisa pegang 1 atau beberapa modul sekaligus).
-- 'admin' selalu punya akses penuh; pengurus non-admin mengikuti daftar kode di kolom akses_modul
-- (mis. {'core', 'keuangan', 'website'}). Aman dijalankan ulang.
alter table anggota_pondok
  add column if not exists akses_modul text[] not null default array['core']::text[];
