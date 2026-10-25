\set ON_ERROR_STOP off
\pset pager off
-- Data awal sebagai superuser
insert into auth.users(id,email) values
 ('00000000-0000-0000-0000-00000000000a','admin_a@x'),
 ('00000000-0000-0000-0000-00000000000b','kasir_a@x'),
 ('00000000-0000-0000-0000-00000000000c','admin_b@x'),
 ('00000000-0000-0000-0000-00000000000d','tsiqa@x'),
 ('00000000-0000-0000-0000-00000000000e','wali@x');
insert into staf_tsiqa values ('00000000-0000-0000-0000-00000000000d');

-- A: admin membuat pondok
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
select buat_pondok('Pondok A','pondok-a','Ust. Admin A') as pondok_a \gset
reset role;
-- B
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000c';
select buat_pondok('Pondok B','pondok-b','Admin B') as pondok_b \gset
reset role;
insert into anggota_pondok(pondok_id,user_id,peran,nama) values (:'pondok_a','00000000-0000-0000-0000-00000000000b','staf_tu','Kasir A');

-- A: isi santri
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
insert into keuangan_pengaturan(pondok_id,syahriyah_default) values (:'pondok_a',450000);
insert into santri(pondok_id,nis,nama,jenis_kelamin,nama_wali,no_wa_wali) values
 (:'pondok_a','001','Ahmad','L','Bpk Ahmad','6281234567890'),
 (:'pondok_a','002','Aisyah','P','Bpk Aisyah','6281234567891');
insert into santri(pondok_id,nis,nama,jenis_kelamin,nama_wali,no_wa_wali) values
 (:'pondok_a','003','Yatim','L','Wali','6281234567892');
insert into keringanan_santri(pondok_id,santri_id,nominal) select :'pondok_a', id, 200000 from santri where nis='003' and pondok_id=:'pondok_a';
\echo '== T1 WA tidak valid ditolak (harus error)'
insert into santri(pondok_id,nis,nama,jenis_kelamin,nama_wali,no_wa_wali) values (:'pondok_a','9','X','L','W','0812');
\echo '== T2 terbitkan massal (harus 3), ulang (harus 0)'
select terbitkan_tagihan_massal(:'pondok_a','Syahriyah Oktober 2026',10,2026,'2026-10-10');
select terbitkan_tagihan_massal(:'pondok_a','Syahriyah Oktober 2026',10,2026,'2026-10-10');
select kode, nominal from tagihan t join santri s on s.id=t.santri_id order by s.nis;
reset role;

-- Isolasi: B tidak melihat data A
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000c';
\echo '== T3 B melihat santri/tagihan A (harus 0 0)'
select (select count(*) from santri) s, (select count(*) from tagihan) t;
\echo '== T4 B menyisipkan santri ke pondok A (harus error RLS)'
insert into santri(pondok_id,nis,nama,jenis_kelamin,nama_wali,no_wa_wali) values (:'pondok_a','777','Curang','L','W','6281234567899');
reset role;

-- Kasir
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000b';
select id as tag_ahmad from tagihan t where santri_id=(select id from santri where nis='001') \gset
\echo '== T5 kasir bayar sebagian 200rb (cicilan), lalu 250rb (lunas)'
select nomor_kwitansi, nominal from catat_pembayaran(:'tag_ahmad', 200000, 'tunai');
select status, terbayar, sisa from tagihan where id=:'tag_ahmad';
select nomor_kwitansi, nominal from catat_pembayaran(:'tag_ahmad', 250000, 'transfer', 'BSI 123');
select status, terbayar, sisa from tagihan where id=:'tag_ahmad';
\echo '== T6 bayar melebihi sisa (harus error)'
select catat_pembayaran(:'tag_ahmad', 1000);
\echo '== T7 kasir insert langsung ke pembayaran (harus error izin)'
insert into pembayaran(pondok_id,tagihan_id,santri_id,nomor_kwitansi,nominal,penerima_nama) values (:'pondok_a',:'tag_ahmad',(select id from santri where nis='001'),'X',1,'x');
\echo '== T8 kasir membatalkan (harus error TIDAK_BERHAK)'
select batalkan_pembayaran((select id from pembayaran limit 1),'salah');
\echo '== T9 kasir menerbitkan tagihan massal (harus error TIDAK_BERHAK)'
select terbitkan_tagihan_massal(:'pondok_a','x',11,2026,'2026-11-10');
reset role;

-- Bendahara/admin membatalkan
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
\echo '== T10 admin batalkan tanpa alasan (error), dengan alasan (ok) lalu status kembali cicilan'
select batalkan_pembayaran((select id from pembayaran order by created_at desc limit 1),'');
select (batalkan_pembayaran((select id from pembayaran order by created_at desc limit 1),'Salah input')).alasan_batal;
select status, terbayar, sisa from tagihan where id=:'tag_ahmad';
\echo '== T11 hapus/ubah nominal pembayaran (harus error)'
update pembayaran set nominal=1 where id=(select id from pembayaran limit 1);
reset role;
delete from pembayaran;
\echo '== T12 audit tercatat (harus >0)'
select count(*) from jejak_audit where pondok_id=:'pondok_a';

-- Modul
\echo '== T12b percobaan: pondok baru otomatis punya keuangan (harus 1)'
select count(*) from addon_pondok where pondok_id=:'pondok_a' and kode='keuangan' and aktif;
\echo '== T12c matikan keuangan di pondok B: terbit/bayar ditolak MODUL_TIDAK_AKTIF, data Core tetap bisa ditulis'
update addon_pondok set aktif=false where pondok_id=:'pondok_b' and kode='keuangan';
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000c';
insert into santri(pondok_id,nis,nama,jenis_kelamin,nama_wali,no_wa_wali,tempat_tinggal) values (:'pondok_b','001','Santri Kalong','L','W','6281234567801','kalong');
select terbitkan_tagihan_massal(:'pondok_b','x',10,2026,'2026-10-10');
insert into tagihan(pondok_id,santri_id,kode,judul,nominal,jatuh_tempo) select :'pondok_b', id,'INV/X','x',1000,current_date from santri;
reset role;
\echo '== T12d tempat_tinggal tidak valid ditolak (harus error)'
insert into santri(pondok_id,nis,nama,jenis_kelamin,nama_wali,no_wa_wali,tempat_tinggal) values (:'pondok_b','002','X','L','W','6281234567802','lain');
\echo '== T12e kuota default 100'
select kuota_santri from langganan where pondok_id=:'pondok_b';

-- Kuota
\echo '== T13 kuota: turunkan jadi 3, tambah santri aktif ke-4 (harus error KUOTA)'
update langganan set kuota_santri=3 where pondok_id=:'pondok_a';
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
insert into santri(pondok_id,nis,nama,jenis_kelamin,nama_wali,no_wa_wali) values (:'pondok_a','004','Keempat','L','W','6281234567893');
reset role;

-- Langganan berakhir
\echo '== T14 langganan berakhir >7 hari: baca boleh, tulis ditolak'
update langganan set berakhir=current_date-8 where pondok_id=:'pondok_a';
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
select count(*) as masih_bisa_baca from santri;
update santri set catatan='coba' where nis='001';
select catat_pembayaran(:'tag_ahmad', 1000);
\echo '== T15 admin tidak bisa memperpanjang sendiri (0 baris terubah)'
update langganan set berakhir=current_date+365 where pondok_id=:'pondok_a';
reset role;
-- Staf TSIQA
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000d';
\echo '== T16 staf TSIQA melihat 2 pondok dan bisa memperpanjang'
select count(*) from pondok;
update langganan set berakhir=current_date+30, status='aktif' where pondok_id=:'pondok_a';
reset role;

-- Wali
insert into addon_pondok(pondok_id,kode) values (:'pondok_a','portal_wali');
insert into wali_akun(pondok_id,user_id,santri_id) values (:'pondok_a','00000000-0000-0000-0000-00000000000e',(select id from santri where nis='001' and pondok_id=:'pondok_a'));
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000e';
\echo '== T17 wali melihat hanya anaknya (1 santri, 1 tagihan), tak bisa menulis'
select (select count(*) from santri) s, (select count(*) from tagihan) t, (select count(*) from anggota_pondok) a;
update tagihan set nominal=1;

-- ===== Pengguna & penempatan =====
reset role;
\echo '== T18 admin terakhir tidak bisa dinonaktifkan / diturunkan (harus 2 error)'
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
update anggota_pondok set aktif=false where user_id='00000000-0000-0000-0000-00000000000a';
update anggota_pondok set peran='staf_tu' where user_id='00000000-0000-0000-0000-00000000000a';
\echo '== T19 anggota tidak bisa dihapus (harus error izin)'
delete from anggota_pondok where user_id='00000000-0000-0000-0000-00000000000b';
\echo '== T20 tahun ajaran: aktifkan 2026/2027 lalu 2027/2028 (hanya satu aktif)'
insert into tahun_ajaran(pondok_id,nama,semester) values (:'pondok_a','2026/2027','ganjil'),(:'pondok_a','2027/2028','ganjil');
select aktifkan_tahun_ajaran((select id from tahun_ajaran where nama='2026/2027'));
select aktifkan_tahun_ajaran((select id from tahun_ajaran where nama='2027/2028'));
select nama, aktif from tahun_ajaran order by nama;
\echo '== T21 penempatan massal tanpa tujuan (error), lalu 3 santri ke kamar (3 riwayat)'
insert into kamar(pondok_id,kode,nama,jenis) values (:'pondok_a','A-01','Al-Farabi','putra');
select tempatkan_santri((select array_agg(id) from santri), null, null, null);
select tempatkan_santri((select array_agg(id) from santri), (select id from kamar where kode='A-01'));
select count(*) as riwayat from riwayat_penempatan;
select count(*) as di_kamar from santri where kamar_id is not null;
reset role;
\echo '== T22 penempatan lintas pondok: admin B tak bisa memindahkan santri A (harus 0)'
select id as kamar_a from kamar where pondok_id=:'pondok_a' limit 1 \gset
select array_agg(id) as santri_a from santri where pondok_id=:'pondok_a' \gset
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000c';
insert into tahun_ajaran(pondok_id,nama,semester,aktif) values (:'pondok_b','2026/2027','ganjil',true);
select tempatkan_santri(:'santri_a'::uuid[], :'kamar_a'::uuid);
reset role;

-- ===== Konsol TSIQA =====
\echo '== T23 admin pondok memanggil konsol_ringkasan / perpanjang (harus 2 error TIDAK_BERHAK)'
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
select * from konsol_ringkasan();
select perpanjang_langganan(:'pondok_a', 1, 0);
reset role;
\echo '== T24 staf TSIQA: ringkasan 2 pondok, tanpa akses santri'
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000d';
select nama, status, kuota_santri, santri_aktif, pengguna, modul from konsol_ringkasan() order by nama;
select count(*) as santri_terlihat_staf from santri;
\echo '== T25 perpanjang 12 bulan (bayar 11): berakhir bergeser, status aktif, tercatat'
select berakhir as sebelum from langganan where pondok_id=:'pondok_b' \gset
select perpanjang_langganan(:'pondok_b', 12, 3000000, 'tahunan', 'Transfer BSI') as baru;
select status, siklus, berakhir - :'sebelum'::date as selisih_hari from langganan where pondok_id=:'pondok_b';
select jumlah, bulan, catatan from pembayaran_langganan where pondok_id=:'pondok_b';
\echo '== T26 bulan tidak valid (harus error)'
select perpanjang_langganan(:'pondok_b', 0, 0);
\echo '== T27 staf ubah kuota & matikan modul: tercatat di audit'
update langganan set kuota_santri=150 where pondok_id=:'pondok_b';
update addon_pondok set aktif=false where pondok_id=:'pondok_b' and kode='keuangan';
reset role;
select tabel, aksi from jejak_audit where pondok_id=:'pondok_b' and tabel in ('langganan','addon_pondok') order by id;
\echo '== T28 admin pondok B melihat riwayat pembayaran langganannya (1), pondok A tidak melihat milik B (0)'
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000c';
select count(*) from pembayaran_langganan;
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
select count(*) from pembayaran_langganan;
reset role;
