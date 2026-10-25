\set ON_ERROR_STOP off
\echo '### D. Akademik & Portal Guru'
reset role;
insert into auth.users(id,email) values ('00000000-0000-0000-0000-0000000000a1','6285500000001@guru.tsiqa.id'),('00000000-0000-0000-0000-0000000000a2','6285500000002@guru.tsiqa.id') on conflict do nothing;
insert into addon_pondok(pondok_id,kode) select id,'akademik' from pondok where kode='pondok-a' on conflict (pondok_id,kode) do update set aktif=true;
insert into addon_pondok(pondok_id,kode) select id,'portal_guru' from pondok where kode='pondok-a' on conflict (pondok_id,kode) do update set aktif=true;
insert into guru(pondok_id,nama,no_wa) select id,'Ust. Ali','6285500000001' from pondok where kode='pondok-a';
insert into guru(pondok_id,nama,no_wa) select id,'Ust. Budi','6285500000002' from pondok where kode='pondok-a';
insert into mapel(pondok_id,nama) select id,'Nahwu' from pondok where kode='pondok-a';
insert into kelas(pondok_id,kode,nama,jenis) select id,'D1','Diniyah 1','diniyah' from pondok where kode='pondok-a';
update santri set kelas_diniyah_id=(select id from kelas where kode='D1' and pondok_id=santri.pondok_id) where nis in ('001','002') and pondok_id=(select id from pondok where kode='pondok-a');
insert into jadwal(pondok_id,kelas_id,mapel_id,guru_id,hari,jam_mulai,jam_selesai)
 select p.id,(select id from kelas where kode='D1'),(select id from mapel limit 1),(select id from guru where nama='Ust. Ali'),1,'08:00','09:00' from pondok p where kode='pondok-a';

select id as jid from jadwal limit 1 \gset
\echo '== A1 jadwal bentrok (harus error JADWAL_BENTROK)'
insert into jadwal(pondok_id,kelas_id,mapel_id,guru_id,hari,jam_mulai,jam_selesai)
 select p.id,(select id from kelas where kode='D1'),(select id from mapel limit 1),(select id from guru where nama='Ust. Budi'),1,'08:30','09:30' from pondok p where kode='pondok-a';

-- guru Ali masuk
update guru set user_id=null;
set role authenticated; set request.jwt.claim.sub='00000000-0000-0000-0000-0000000000a1';
set request.jwt.claims='{"sub":"00000000-0000-0000-0000-0000000000a1","app_metadata":{"peran":"guru","no_wa":"6285500000001"}}';
\echo '== A2 tautkan_guru (harus 1)'
select tautkan_guru();
\echo '== A3 jadwal_guru (harus 1 baris)'
select count(*) from jadwal_guru();
\echo '== A4 roster (harus 2 santri)'
select count(*) from roster_jadwal(:'jid', current_date) ;
\echo '== A5 simpan absensi (harus 2)'
select simpan_absensi(:'jid', current_date,
  (select jsonb_agg(jsonb_build_object('santri_id',santri_id,'status','hadir')) from roster_jadwal(:'jid', current_date)));
\echo '== A6 tanggal masa depan ditolak (harus error TANGGAL_TIDAK_VALID)'
select simpan_absensi(:'jid', current_date + 3, '[]'::jsonb);
\echo '== A7 guru tak boleh baca tabel langsung (harus 0)'
select count(*) from absensi;
reset role;

-- guru Budi tak punya jadwal itu
set role authenticated; set request.jwt.claim.sub='00000000-0000-0000-0000-0000000000a2';
set request.jwt.claims='{"sub":"00000000-0000-0000-0000-0000000000a2","app_metadata":{"peran":"guru","no_wa":"6285500000002"}}';
select tautkan_guru();
\echo '== A8 guru lain mengisi jadwal orang (harus error TIDAK_BERHAK)'
select simpan_absensi(:'jid', current_date, '[]'::jsonb);
reset role;

\echo '== A9 nilai: guru isi, wali belum boleh lihat sebelum publikasi (harus 0, lalu 1 setelah publikasi)'
insert into tahun_ajaran(pondok_id,nama,semester,aktif) select id,'2026/2027','ganjil',true from pondok where kode='pondok-a' on conflict do nothing;
set role authenticated; set request.jwt.claim.sub='00000000-0000-0000-0000-0000000000a1';
set request.jwt.claims='{"sub":"00000000-0000-0000-0000-0000000000a1","app_metadata":{"peran":"guru","no_wa":"6285500000001"}}';
select simpan_nilai(:'jid','uts',(select jsonb_agg(jsonb_build_object('santri_id',santri_id,'nilai',88)) from roster_nilai(:'jid','uts')));
reset role;
set role authenticated; set request.jwt.claim.sub='00000000-0000-0000-0000-0000000000f3';
set request.jwt.claims='{"sub":"00000000-0000-0000-0000-0000000000f3","app_metadata":{"peran":"wali","no_wa":"6281234567890"}}';
select count(*) as sebelum from nilai;
reset role;
insert into rapor_catatan(pondok_id,santri_id,tahun_ajaran_id,dipublikasi)
 select s.pondok_id,s.id,(select id from tahun_ajaran where aktif and pondok_id=s.pondok_id),true from santri s where nis='001' and pondok_id=(select id from pondok where kode='pondok-a');
set role authenticated; set request.jwt.claim.sub='00000000-0000-0000-0000-0000000000f3';
set request.jwt.claims='{"sub":"00000000-0000-0000-0000-0000000000f3","app_metadata":{"peran":"wali","no_wa":"6281234567890"}}';
select count(*) as sesudah from nilai;
reset role;
