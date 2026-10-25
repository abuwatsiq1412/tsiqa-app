-- =============================================================================
-- TSIQA — Modul KEUANGAN (kode modul: 'keuangan')
-- Bergantung pada Inti (0001). Inti tidak mengenal tabel-tabel di berkas ini.
-- Isi: pengaturan syahriyah, keringanan santri, penomoran, tagihan, pembayaran.
-- =============================================================================

-- Pengaturan keuangan per pondok (syahriyah standar).
create table keuangan_pengaturan (
  pondok_id          uuid primary key references pondok(id) on delete cascade,
  syahriyah_default  bigint not null default 0 check (syahriyah_default >= 0),
  rekening_resmi     text,                       -- tampil di pesan tagihan, mis. "BSI 7123456789 a.n. Pondok X"
  updated_at         timestamptz not null default now()
);
create trigger trg_keuangan_pengaturan_upd before update on keuangan_pengaturan
  for each row execute function set_updated_at();

-- Keringanan / beasiswa: nominal syahriyah khusus per santri.
create table keringanan_santri (
  pondok_id  uuid not null references pondok(id) on delete cascade,
  santri_id  uuid not null,
  nominal    bigint not null check (nominal >= 0),
  catatan    text,
  primary key (pondok_id, santri_id),
  foreign key (pondok_id, santri_id) references santri(pondok_id, id) on delete cascade
);

-- Tagihan & pembayaran
create table penomoran (
  pondok_id  uuid not null references pondok(id) on delete cascade,
  jenis      text not null,          -- 'INV' | 'KW'
  periode    int  not null,          -- INV: yyyymm, KW: yyyy
  terakhir   int  not null default 0,
  primary key (pondok_id, jenis, periode)
);

create or replace function ambil_nomor(p_pondok uuid, p_jenis text, p_periode int) returns int
language sql security definer set search_path = public, pg_temp as $$
  insert into penomoran (pondok_id, jenis, periode, terakhir)
  values (p_pondok, p_jenis, p_periode, 1)
  on conflict (pondok_id, jenis, periode)
  do update set terakhir = penomoran.terakhir + 1
  returning terakhir
$$;

create table tagihan (
  id               uuid primary key default gen_random_uuid(),
  pondok_id        uuid not null references pondok(id) on delete cascade,
  santri_id        uuid not null,
  tahun_ajaran_id  uuid,
  kode             text not null,                    -- INV/202610/0001
  judul            text not null,
  kategori         text not null default 'syahriyah'
                   check (kategori in ('syahriyah', 'daftar_ulang', 'uang_gedung', 'kitab_seragam', 'lainnya')),
  periode_bulan    int check (periode_bulan between 1 and 12),
  periode_tahun    int,
  nominal          bigint not null check (nominal >= 0),
  terbayar         bigint not null default 0 check (terbayar >= 0),
  sisa             bigint generated always as (nominal - terbayar) stored,
  jatuh_tempo      date not null,
  status           text not null default 'belum_bayar'
                   check (status in ('belum_bayar', 'cicilan', 'lunas')),
  wa_terakhir      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (pondok_id, id),
  unique (pondok_id, kode),
  foreign key (pondok_id, santri_id)       references santri(pondok_id, id)       on delete cascade,
  foreign key (pondok_id, tahun_ajaran_id) references tahun_ajaran(pondok_id, id) on delete set null (tahun_ajaran_id)
);
create trigger trg_tagihan_upd before update on tagihan
  for each row execute function set_updated_at();
-- Satu tagihan per santri, kategori, dan bulan: penerbitan massal aman diulang.
create unique index uq_tagihan_periode
  on tagihan (pondok_id, santri_id, kategori, periode_tahun, periode_bulan)
  where periode_bulan is not null;
create index idx_tagihan_santri on tagihan(pondok_id, santri_id);
create index idx_tagihan_status on tagihan(pondok_id, status, jatuh_tempo);

create table pembayaran (
  id               uuid primary key default gen_random_uuid(),
  pondok_id        uuid not null references pondok(id) on delete cascade,
  tagihan_id       uuid not null,
  santri_id        uuid not null,
  nomor_kwitansi   text not null,
  nominal          bigint not null check (nominal > 0),
  tanggal          timestamptz not null default now(),
  metode           text not null default 'tunai'
                   check (metode in ('tunai', 'transfer', 'qris', 'online')),
  rekening_tujuan  text,
  referensi        text,                              -- id transaksi gateway / bukti transfer
  penerima_id      uuid references auth.users(id),
  penerima_nama    text not null,
  catatan          text,
  dibatalkan_pada  timestamptz,
  dibatalkan_oleh  uuid references auth.users(id),
  alasan_batal     text,
  created_at       timestamptz not null default now(),
  unique (pondok_id, nomor_kwitansi),
  foreign key (pondok_id, tagihan_id) references tagihan(pondok_id, id) on delete restrict,
  foreign key (pondok_id, santri_id)  references santri(pondok_id, id)  on delete restrict,
  check ((dibatalkan_pada is null) = (alasan_batal is null))
);
create index idx_pembayaran_tanggal on pembayaran(pondok_id, tanggal desc);
create index idx_pembayaran_tagihan on pembayaran(pondok_id, tagihan_id);
create unique index uq_pembayaran_referensi on pembayaran(pondok_id, referensi) where referensi is not null;

-- Hitung ulang total terbayar & status dari pembayaran yang tidak dibatalkan.
create or replace function hitung_ulang_tagihan(p_tagihan uuid) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_total bigint;
begin
  select coalesce(sum(nominal), 0) into v_total
    from pembayaran where tagihan_id = p_tagihan and dibatalkan_pada is null;
  update tagihan set
    terbayar = v_total,
    status = case when v_total >= nominal then 'lunas'
                  when v_total > 0 then 'cicilan'
                  else 'belum_bayar' end
  where id = p_tagihan;
end $$;

create or replace function trg_pembayaran_sinkron() returns trigger
language plpgsql as $$
begin
  perform hitung_ulang_tagihan(coalesce(new.tagihan_id, old.tagihan_id));
  return null;
end $$;
create trigger trg_pembayaran_sinkron
  after insert or update or delete on pembayaran
  for each row execute function trg_pembayaran_sinkron();

-- Pembayaran tidak boleh diubah selain proses pembatalan.
create or replace function jaga_pembayaran_tetap() returns trigger
language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'PEMBAYARAN_TIDAK_BOLEH_DIHAPUS' using errcode = 'P0001';
  end if;
  if (new.pondok_id, new.tagihan_id, new.santri_id, new.nomor_kwitansi, new.nominal, new.tanggal, new.metode)
     is distinct from
     (old.pondok_id, old.tagihan_id, old.santri_id, old.nomor_kwitansi, old.nominal, old.tanggal, old.metode)
     or old.dibatalkan_pada is not null then
    raise exception 'PEMBAYARAN_TIDAK_BOLEH_DIUBAH' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger trg_pembayaran_tetap before update or delete on pembayaran
  for each row execute function jaga_pembayaran_tetap();


-- Jejak audit modul keuangan (fungsi catat_audit ada di Inti).
create trigger trg_audit_tagihan    after insert or update or delete on tagihan    for each row execute function catat_audit();
create trigger trg_audit_pembayaran after insert or update or delete on pembayaran for each row execute function catat_audit();

-- -----------------------------------------------------------------------------
-- Fungsi aplikasi
-- -----------------------------------------------------------------------------
create or replace function catat_pembayaran(
  p_tagihan uuid, p_nominal bigint, p_metode text default 'tunai',
  p_rekening text default null, p_catatan text default null,
  p_tanggal timestamptz default now(), p_referensi text default null
) returns pembayaran
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  t   tagihan;
  a   anggota_pondok;
  no  int;
  out pembayaran;
begin
  select * into t from tagihan where id = p_tagihan for update;
  if not found then raise exception 'TAGIHAN_TIDAK_DITEMUKAN' using errcode = 'P0002'; end if;

  select * into a from anggota_pondok
   where pondok_id = t.pondok_id and user_id = auth.uid() and aktif
     and peran in ('admin', 'bendahara', 'staf_tu');
  if not found then raise exception 'TIDAK_BERHAK' using errcode = '42501'; end if;
  if not boleh_tulis(t.pondok_id) then raise exception 'LANGGANAN_BERAKHIR' using errcode = 'P0001'; end if;
  if not punya_addon(t.pondok_id, 'keuangan') then raise exception 'MODUL_TIDAK_AKTIF' using errcode = 'P0001'; end if;

  if p_nominal is null or p_nominal <= 0 then
    raise exception 'NOMINAL_TIDAK_VALID' using errcode = 'P0001';
  end if;
  if p_nominal > t.sisa then
    raise exception 'MELEBIHI_SISA_TAGIHAN' using errcode = 'P0001',
      detail = format('sisa %s, dibayar %s', t.sisa, p_nominal);
  end if;

  no := ambil_nomor(t.pondok_id, 'KW', extract(year from p_tanggal)::int);
  insert into pembayaran (pondok_id, tagihan_id, santri_id, nomor_kwitansi, nominal, tanggal,
                          metode, rekening_tujuan, referensi, penerima_id, penerima_nama, catatan)
  values (t.pondok_id, t.id, t.santri_id,
          format('KW/%s/%s', extract(year from p_tanggal)::int, lpad(no::text, 5, '0')),
          p_nominal, p_tanggal, p_metode, p_rekening, p_referensi, auth.uid(), a.nama, p_catatan)
  returning * into out;
  return out;
end $$;

create or replace function batalkan_pembayaran(p_id uuid, p_alasan text) returns pembayaran
language plpgsql security definer set search_path = public, pg_temp as $$
declare p pembayaran; out pembayaran;
begin
  select * into p from pembayaran where id = p_id for update;
  if not found then raise exception 'PEMBAYARAN_TIDAK_DITEMUKAN' using errcode = 'P0002'; end if;
  if not punya_peran(p.pondok_id, array['admin', 'bendahara']::peran_pondok[]) then
    raise exception 'TIDAK_BERHAK' using errcode = '42501';
  end if;
  if not boleh_tulis(p.pondok_id) then raise exception 'LANGGANAN_BERAKHIR' using errcode = 'P0001'; end if;
  if not punya_addon(p.pondok_id, 'keuangan') then raise exception 'MODUL_TIDAK_AKTIF' using errcode = 'P0001'; end if;
  if p.dibatalkan_pada is not null then raise exception 'SUDAH_DIBATALKAN' using errcode = 'P0001'; end if;
  if coalesce(trim(p_alasan), '') = '' then raise exception 'ALASAN_WAJIB' using errcode = 'P0001'; end if;

  update pembayaran set dibatalkan_pada = now(), dibatalkan_oleh = auth.uid(), alasan_batal = p_alasan
   where id = p_id returning * into out;
  return out;
end $$;

-- Terbitkan tagihan bulanan untuk semua santri aktif; aman dipanggil ulang.
create or replace function terbitkan_tagihan_massal(
  p_pondok uuid, p_judul text, p_bulan int, p_tahun int, p_jatuh_tempo date,
  p_kategori text default 'syahriyah', p_nominal bigint default null
) returns int
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  s record; v_default bigint; v_nominal bigint; no int; n int := 0;
begin
  if not punya_peran(p_pondok, array['admin', 'bendahara']::peran_pondok[]) then
    raise exception 'TIDAK_BERHAK' using errcode = '42501';
  end if;
  if not boleh_tulis(p_pondok) then raise exception 'LANGGANAN_BERAKHIR' using errcode = 'P0001'; end if;
  if not punya_addon(p_pondok, 'keuangan') then raise exception 'MODUL_TIDAK_AKTIF' using errcode = 'P0001'; end if;

  select coalesce((select syahriyah_default from keuangan_pengaturan where pondok_id = p_pondok), 0) into v_default;
  for s in
    select sa.id, r.nominal as syahriyah_khusus
      from santri sa
      left join keringanan_santri r on r.pondok_id = sa.pondok_id and r.santri_id = sa.id
     where sa.pondok_id = p_pondok and sa.status = 'aktif'
       and not exists (select 1 from tagihan t
                        where t.pondok_id = p_pondok and t.santri_id = sa.id
                          and t.kategori = p_kategori
                          and t.periode_tahun = p_tahun and t.periode_bulan = p_bulan)
     order by sa.nama
  loop
    v_nominal := coalesce(p_nominal, s.syahriyah_khusus, v_default);
    no := ambil_nomor(p_pondok, 'INV', p_tahun * 100 + p_bulan);
    insert into tagihan (pondok_id, santri_id, kode, judul, kategori, periode_bulan, periode_tahun,
                         nominal, jatuh_tempo)
    values (p_pondok, s.id, format('INV/%s%s/%s', p_tahun, lpad(p_bulan::text, 2, '0'), lpad(no::text, 4, '0')),
            p_judul, p_kategori, p_bulan, p_tahun, v_nominal, p_jatuh_tempo);
    n := n + 1;
  end loop;
  return n;
end $$;


-- -----------------------------------------------------------------------------
-- Keamanan baris
-- -----------------------------------------------------------------------------
alter table keuangan_pengaturan enable row level security;
alter table keringanan_santri   enable row level security;
alter table penomoran           enable row level security;
alter table tagihan             enable row level security;
alter table pembayaran          enable row level security;

create policy keuangan_pengaturan_baca on keuangan_pengaturan for select to authenticated
  using (pondok_id in (select pondok_saya()));
create policy keuangan_pengaturan_tulis on keuangan_pengaturan for all to authenticated
  using (punya_peran(pondok_id, array['admin','bendahara']::peran_pondok[]) and boleh_tulis(pondok_id) and punya_addon(pondok_id, 'keuangan'))
  with check (punya_peran(pondok_id, array['admin','bendahara']::peran_pondok[]) and boleh_tulis(pondok_id) and punya_addon(pondok_id, 'keuangan'));

create policy keringanan_baca on keringanan_santri for select to authenticated
  using (pondok_id in (select pondok_saya()));
create policy keringanan_tulis on keringanan_santri for all to authenticated
  using (punya_peran(pondok_id, array['admin','bendahara']::peran_pondok[]) and boleh_tulis(pondok_id) and punya_addon(pondok_id, 'keuangan'))
  with check (punya_peran(pondok_id, array['admin','bendahara']::peran_pondok[]) and boleh_tulis(pondok_id) and punya_addon(pondok_id, 'keuangan'));

-- Tagihan: semua anggota membaca; admin & bendahara menulis.
create policy tagihan_baca on tagihan for select to authenticated
  using (pondok_id in (select pondok_saya()));
create policy tagihan_tulis on tagihan for all to authenticated
  using (punya_peran(pondok_id, array['admin','bendahara']::peran_pondok[]) and boleh_tulis(pondok_id) and punya_addon(pondok_id, 'keuangan'))
  with check (punya_peran(pondok_id, array['admin','bendahara']::peran_pondok[]) and boleh_tulis(pondok_id) and punya_addon(pondok_id, 'keuangan'));

-- Pembayaran: baca saja. Penulisan hanya lewat catat_pembayaran / batalkan_pembayaran.
create policy pembayaran_baca on pembayaran for select to authenticated
  using (pondok_id in (select pondok_saya()));


-- -----------------------------------------------------------------------------
-- Hak akses (cabut bawaan Supabase, beri hanya yang perlu)
-- -----------------------------------------------------------------------------
revoke all on keuangan_pengaturan, keringanan_santri, penomoran, tagihan, pembayaran from anon, authenticated;
revoke all on function hitung_ulang_tagihan(uuid), trg_pembayaran_sinkron(), jaga_pembayaran_tetap(),
  ambil_nomor(uuid, text, int), catat_pembayaran(uuid, bigint, text, text, text, timestamptz, text),
  batalkan_pembayaran(uuid, text), terbitkan_tagihan_massal(uuid, text, int, int, date, text, bigint)
  from public, anon, authenticated;

grant select on keuangan_pengaturan, keringanan_santri, tagihan, pembayaran to authenticated;
grant insert, update, delete on keuangan_pengaturan, keringanan_santri, tagihan to authenticated;
grant execute on function
  catat_pembayaran(uuid, bigint, text, text, text, timestamptz, text),
  batalkan_pembayaran(uuid, text),
  terbitkan_tagihan_massal(uuid, text, int, int, date, text, bigint)
  to authenticated;
