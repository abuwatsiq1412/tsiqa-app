-- Inti harus bisa dipakai penuh tanpa tabel/fungsi modul mana pun.
\set ON_ERROR_STOP on
insert into auth.users(id,email) values ('00000000-0000-0000-0000-0000000000aa','a@x');
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000aa';
select buat_pondok('Pondok Inti','pondok-inti','Admin') as p \gset
insert into santri(pondok_id,nis,nama,jenis_kelamin,nama_wali,no_wa_wali,tempat_tinggal)
  values (:'p','1','Santri','L','Wali','6281234567890','kalong');
insert into kamar(pondok_id,kode,nama,jenis) values (:'p','K1','Kamar 1','putra');
insert into tahun_ajaran(pondok_id,nama,semester,aktif) values (:'p','2026/2027','ganjil',true);
select tempatkan_santri(array[(select id from santri)], (select id from kamar)) as dipindahkan;
reset role;
select 'tabel modul di Inti (harus 0)' as cek, count(*) from information_schema.tables
 where table_schema='public' and table_name in ('tagihan','pembayaran','penomoran','keuangan_pengaturan','keringanan_santri','wali_akun');
select 'kolom syahriyah di Inti (harus 0)' as cek, count(*) from information_schema.columns
 where table_schema='public' and column_name like 'syahriyah%';
