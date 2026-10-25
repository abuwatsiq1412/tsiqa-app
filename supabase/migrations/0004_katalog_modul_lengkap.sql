-- =============================================================================
-- TSIQA — Melengkapi katalog modul (aman dijalankan ulang).
-- Menambah dua modul yang belum ada. Harga awal mengikuti daftar harga resmi dan
-- dapat diubah kapan saja di Konsol → Katalog & Harga Modul. Kode dan harga modul
-- yang sudah ada TIDAK diubah.
-- =============================================================================
insert into modul (kode, nama, kategori, harga_bulanan, tersedia, urutan) values
  ('kas_dapur',  'Kas Operasional & Dapur', 'Operasional', 15000, false, 9),
  ('poskestren', 'Poskestren',              'Kesehatan',   15000, false, 10)
on conflict (kode) do nothing;
