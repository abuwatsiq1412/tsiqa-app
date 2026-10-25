-- Koreksi tanggal Hijriah per pondok (hari). Hitungan bawaan Umm al-Qura bisa selisih 1 hari
-- dari penetapan Kemenag/ormas yang diikuti pondok. Aman dijalankan ulang.
alter table pondok add column if not exists geser_hijriah smallint not null default 0
  check (geser_hijriah between -2 and 2);
