\set ON_ERROR_STOP off
\pset pager off
-- Dijalankan setelah uji.sql pada basis data yang sama (pondok-a dengan santri 001–003 dan tagihan Okt).
select id as pa from pondok where kode='pondok-a' \gset
select id as s_ahmad from santri where nis='001' and pondok_id=:'pa' \gset
select id as s_aisyah from santri where nis='002' and pondok_id=:'pa' \gset
select id as t_aisyah from tagihan where santri_id=:'s_aisyah' \gset
select id as t_ahmad from tagihan where santri_id=:'s_ahmad' \gset

insert into auth.users(id,email) values ('00000000-0000-0000-0000-0000000000f1','wali_ahmad@x'),('00000000-0000-0000-0000-0000000000f2','wali_lain@x');
update modul set tersedia = true where kode in ('portal_wali','keuangan');
insert into addon_pondok(pondok_id,kode) values (:'pa','portal_wali') on conflict do nothing;
insert into wali_akun(pondok_id,user_id,santri_id) values (:'pa','00000000-0000-0000-0000-0000000000f1',:'s_aisyah');
-- pastikan tagihan Aisyah belum lunas
\echo '== W0 admin membuat undangan (harus 1 baris kode panjang)'
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
select length(buat_undangan_wali(:'s_aisyah')) as panjang_kode;
reset role;

set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000f1';
\echo '== W1 wali hanya melihat santri/tagihan anaknya (harus 1 1)'
select (select count(*) from santri) s, (select count(*) from tagihan) t;
\echo '== W2 wali melihat pondok & rekening pondoknya (harus 1 1)'
select (select count(*) from pondok) p, (select count(*) from keuangan_pengaturan) k;
\echo '== W3 wali tidak bisa menulis tagihan (harus error izin)'
update tagihan set nominal = 1;
\echo '== W4 konfirmasi untuk tagihan anak sendiri (harus berhasil)'
insert into konfirmasi_transfer(pondok_id,tagihan_id,santri_id,wali_user_id,nominal,tanggal_transfer)
 values (:'pa',:'t_aisyah',:'s_aisyah','00000000-0000-0000-0000-0000000000f1',100000,'2026-10-20');
\echo '== W5 konfirmasi untuk tagihan anak orang lain (harus error RLS)'
insert into konfirmasi_transfer(pondok_id,tagihan_id,santri_id,wali_user_id,nominal,tanggal_transfer)
 values (:'pa',:'t_ahmad',:'s_ahmad','00000000-0000-0000-0000-0000000000f1',100000,'2026-10-20');
\echo '== W6 konfirmasi ganda untuk tagihan yang sama (harus error unik)'
insert into konfirmasi_transfer(pondok_id,tagihan_id,santri_id,wali_user_id,nominal,tanggal_transfer)
 values (:'pa',:'t_aisyah',:'s_aisyah','00000000-0000-0000-0000-0000000000f1',50000,'2026-10-20');
\echo '== W7 wali tidak bisa memproses sendiri (harus error TIDAK_BERHAK)'
select proses_konfirmasi((select id from konfirmasi_transfer limit 1), true);
reset role;

set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000f2';
\echo '== W8 wali lain tidak melihat apa pun (harus 0 0 0)'
select (select count(*) from santri) s, (select count(*) from tagihan) t, (select count(*) from konfirmasi_transfer) k;
reset role;

set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
\echo '== W9 admin menerima (harus status diterima + pembayaran terisi)'
select status, pembayaran_id is not null as ada_pembayaran from proses_konfirmasi((select id from konfirmasi_transfer limit 1), true);
select status, terbayar from tagihan where id=:'t_aisyah';
\echo '== W10 diproses ulang (harus error SUDAH_DIPROSES)'
select proses_konfirmasi((select id from konfirmasi_transfer limit 1), true);
reset role;

-- ---- 0007: tautkan_wali
insert into auth.users(id,email) values ('00000000-0000-0000-0000-0000000000f3','6281234567890@wali.tsiqa.id'),('00000000-0000-0000-0000-0000000000f4','palsu@x');
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000f3';
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000f3","app_metadata":{"peran":"wali","no_wa":"6281234567890"}}';
\echo '== W11 tautkan_wali menautkan santri bernomor sama (harus 1, lalu 0 saat diulang)'
select tautkan_wali() as pertama;
select tautkan_wali() as ulang;
select count(*) as terlihat from santri;
reset role;
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000f4';
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000f4","user_metadata":{"peran":"wali","no_wa":"6281234567891"}}';
\echo '== W12 pengguna biasa memalsukan user_metadata (harus 0)'
select tautkan_wali() as palsu;
\echo '== W13 akun wali tidak bisa membuat pondok (harus error AKUN_WALI)'
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000f1';
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000f1"}';
select buat_pondok('Curang','curang','Wali');
reset role;
