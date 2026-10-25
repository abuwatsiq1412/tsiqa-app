// Tipe, nilai bawaan, dan daftar seksi fleksibel untuk Modul Website Pondok (CMS)

export type TemaWebsite = "zamrud" | "emas" | "samudra" | "klasik";

export interface ProgramUnggulan {
  judul: string;
  deskripsi: string;
}

export interface UnitPendidikan {
  nama: string;
  jenjang: string;
  deskripsi: string;
}

export interface SeksiWebsite {
  profil: boolean;
  statistik: boolean;
  program: boolean;
  unit: boolean;
  berita: boolean;
  pengumuman: boolean;
  galeri: boolean;
  pendaftaran: boolean;
  kontak: boolean;
}

export interface PengaturanWebsite {
  pondok_id: string;
  aktif_publik: boolean;
  tema: TemaWebsite;
  slogan: string;
  subjudul_hero: string;
  tentang_kami: string;
  visi: string;
  misi: string[];
  program_unggulan: ProgramUnggulan[];
  unit_pendidikan: UnitPendidikan[];
  seksi_aktif: SeksiWebsite;
  psb_buka: boolean;
  psb_judul: string;
  psb_gelombang: string;
  psb_syarat: string[];
  psb_biaya_ringkas: string;
  psb_tautan_daftar: string | null;
  wa_admin_web: string | null;
  alamat_peta_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
}

export interface TulisanWebsite {
  id: string;
  pondok_id: string;
  jenis: "berita" | "pengumuman";
  judul: string;
  slug: string;
  ringkasan: string | null;
  isi: string;
  kategori: string;
  gambar_url: string | null;
  penting: boolean;
  terbit: boolean;
  tanggal: string;
}

export interface GaleriWebsite {
  id: string;
  pondok_id: string;
  judul: string;
  kategori: string;
  gambar_url: string;
  keterangan: string | null;
  urutan: number;
}

export const DAFTAR_TEMA_WEBSITE: {
  kode: TemaWebsite;
  nama: string;
  ket: string;
  aksen: string;
  latar: string;
}[] = [
  {
    kode: "zamrud",
    nama: "Zamrud Pesantren",
    ket: "Hijau zamrud teduh khas pesantren Nusantara dengan aksen emas lembut.",
    aksen: "#0f766e",
    latar: "#1b2e28",
  },
  {
    kode: "emas",
    nama: "Klasik Turats & Emas",
    ket: "Nuansa hangat kitab kuning dengan aksen emas mulia dan hijau tua.",
    aksen: "#b45309",
    latar: "#292018",
  },
  {
    kode: "samudra",
    nama: "Biru Akademik Modern",
    ket: "Tampilan institusi pendidikan modern, bersih, dan terstruktur.",
    aksen: "#1d4ed8",
    latar: "#172554",
  },
  {
    kode: "klasik",
    nama: "Minimalis Monokrom",
    ket: "Fokus penuh pada tipografi bersih dan dokumentasi kegiatan.",
    aksen: "#334155",
    latar: "#0f172a",
  },
];

export const DAFTAR_SEKSI_WEBSITE: {
  kode: keyof SeksiWebsite;
  label: string;
  ket: string;
}[] = [
  {
    kode: "profil",
    label: "Profil, Visi & Misi Pondok",
    ket: "Menampilkan sejarah singkat, sambutan, visi, dan butir misi pesantren.",
  },
  {
    kode: "statistik",
    label: "Angka Ringkasan Pondok",
    ket: "Menampilkan jumlah santri aktif, kamar asrama, dan kelas secara otomatis.",
  },
  {
    kode: "program",
    label: "Program Unggulan",
    ket: "Menampilkan kartu program khas seperti Tahfidz, Kitab Kuning, atau Bahasa.",
  },
  {
    kode: "unit",
    label: "Unit & Jenjang Pendidikan",
    ket: "Menampilkan daftar lembaga formal/diniyah (SMP, SMA, MTs, MA, Salafiyah).",
  },
  {
    kode: "pengumuman",
    label: "Papan Pengumuman Resmi",
    ket: "Menampilkan maklumat penting untuk wali santri dan masyarakat.",
  },
  {
    kode: "berita",
    label: "Berita & Artikel Kegiatan",
    ket: "Menampilkan kabar terbaru kegiatan santri, kajian, dan prestasi.",
  },
  {
    kode: "galeri",
    label: "Galeri Dokumentasi Foto",
    ket: "Menampilkan foto lingkungan asrama, masjid, dan aktivitas santri.",
  },
  {
    kode: "pendaftaran",
    label: "Informasi Pendaftaran (PSB / PPDB)",
    ket: "Menampilkan gelombang pendaftaran, syarat, rincian biaya, dan tombol daftar WA.",
  },
  {
    kode: "kontak",
    label: "Kontak, Alamat & Media Sosial",
    ket: "Menampilkan alamat lengkap, nomor WhatsApp resmi, dan tautan sosial media.",
  },
];

export function bawaanPengaturanWebsite(pondokId: string, namaPondok = "Pondok Pesantren"): PengaturanWebsite {
  return {
    pondok_id: pondokId,
    aktif_publik: true,
    tema: "zamrud",
    slogan: `Mencetak Generasi Qur'ani, Berakhlak Mulia & Berwawasan Luas`,
    subjudul_hero: `${namaPondok} menyelenggarakan pendidikan Islam terpadu yang memadukan khazanah kitab kuning (turats), tahfidzul Qur'an, dan pendidikan formal berkualitas.`,
    tentang_kami: `${namaPondok} berkomitmen membina santri melalui keseimbangan ilmu syar'i, adab keseharian, serta kecakapan hidup masa depan di lingkungan asrama yang aman, bersih, dan kondusif.`,
    visi: "Menjadi lembaga pendidikan Islam rujukan yang melahirkan ulama, huffazh, dan pemimpin umat berakhlak karimah.",
    misi: [
      "Menyelenggarakan kajian kitab kuning dan tahfidzul Qur'an secara bersanad dan berjenjang.",
      "Membiasakan adab Islami, kedisiplinan, dan kemandirian santri di lingkungan asrama.",
      "Mengintegrasikan kurikulum diniyah dan pendidikan formal yang unggul.",
    ],
    program_unggulan: [
      {
        judul: "Tahfidzul Qur'an Bersanad",
        deskripsi: "Setoran hafalan dan muroja'ah harian terbimbing bersama muhaffizh/muhaffizhah berpengalaman.",
      },
      {
        judul: "Madrasah Diniyah & Kitab Kuning",
        deskripsi: "Kajian nahwu, sharaf, fiqih, aqidah, dan akhlak berjenjang dari tingkat dasar hingga mahir.",
      },
      {
        judul: "Bina Bahasa Arab & Inggris",
        deskripsi: "Pembiasaan percakapan harian dwibahasa, muhadatsah, dan latihan khitobah (pidato).",
      },
    ],
    unit_pendidikan: [
      {
        nama: "Madrasah Diniyah Salafiyah",
        jenjang: "Ula · Wustha · Ulya",
        deskripsi: "Pendalaman kurikulum kitab kuning (turats) dan ilmu alat secara intensif.",
      },
      {
        nama: "SMP / MTs Pesantren",
        jenjang: "Setara SLTP (3 Tahun)",
        deskripsi: "Pendidikan formal tingkat menengah pertama terintegrasi asrama dan tahfidz.",
      },
      {
        nama: "SMA / MA Pesantren",
        jenjang: "Setara SLTA (3 Tahun)",
        deskripsi: "Pendidikan formal tingkat atas dengan penguatan keislaman dan persiapan perguruan tinggi.",
      },
    ],
    seksi_aktif: {
      profil: true,
      statistik: true,
      program: true,
      unit: true,
      berita: true,
      pengumuman: true,
      galeri: true,
      pendaftaran: true,
      kontak: true,
    },
    psb_buka: true,
    psb_judul: "Penerimaan Santri Baru",
    psb_gelombang: "Gelombang I · Pendaftaran Dibuka",
    psb_syarat: [
      "Mengisi formulir pendaftaran dan menyerahkan pas foto terbaru.",
      "Fotokopi Kartu Keluarga (KK) dan Akta Kelahiran.",
      "Fotokopi rapor atau ijazah jenjang pendidikan sebelumnya.",
      "Mengikuti seleksi baca Al-Qur'an dan wawancara calon wali santri.",
    ],
    psb_biaya_ringkas:
      "Hubungi panitia Penerimaan Santri Baru (PSB) melalui WhatsApp untuk mendapatkan brosur rincian infaq masuk dan syahriah bulanan.",
    psb_tautan_daftar: null,
    wa_admin_web: null,
    alamat_peta_url: null,
    instagram_url: null,
    youtube_url: null,
  };
}

export function normalisasiPengaturanWebsite(
  pondokId: string,
  namaPondok: string,
  raw?: Record<string, unknown> | null
): PengaturanWebsite {
  const d = bawaanPengaturanWebsite(pondokId, namaPondok);
  if (!raw) return d;

  const seksiRaw = (raw.seksi_aktif ?? {}) as Partial<SeksiWebsite>;
  return {
    pondok_id: pondokId,
    aktif_publik: typeof raw.aktif_publik === "boolean" ? raw.aktif_publik : d.aktif_publik,
    tema: (["zamrud", "emas", "samudra", "klasik"].includes(String(raw.tema))
      ? raw.tema
      : d.tema) as TemaWebsite,
    slogan: String(raw.slogan ?? d.slogan),
    subjudul_hero: String(raw.subjudul_hero ?? d.subjudul_hero),
    tentang_kami: String(raw.tentang_kami ?? d.tentang_kami),
    visi: String(raw.visi ?? d.visi),
    misi: Array.isArray(raw.misi) && raw.misi.length > 0 ? raw.misi.map(String) : d.misi,
    program_unggulan:
      Array.isArray(raw.program_unggulan) && raw.program_unggulan.length > 0
        ? (raw.program_unggulan as ProgramUnggulan[])
        : d.program_unggulan,
    unit_pendidikan:
      Array.isArray(raw.unit_pendidikan) && raw.unit_pendidikan.length > 0
        ? (raw.unit_pendidikan as UnitPendidikan[])
        : d.unit_pendidikan,
    seksi_aktif: {
      profil: seksiRaw.profil ?? true,
      statistik: seksiRaw.statistik ?? true,
      program: seksiRaw.program ?? true,
      unit: seksiRaw.unit ?? true,
      berita: seksiRaw.berita ?? true,
      pengumuman: seksiRaw.pengumuman ?? true,
      galeri: seksiRaw.galeri ?? true,
      pendaftaran: seksiRaw.pendaftaran ?? true,
      kontak: seksiRaw.kontak ?? true,
    },
    psb_buka: typeof raw.psb_buka === "boolean" ? raw.psb_buka : d.psb_buka,
    psb_judul: String(raw.psb_judul ?? d.psb_judul),
    psb_gelombang: String(raw.psb_gelombang ?? d.psb_gelombang),
    psb_syarat:
      Array.isArray(raw.psb_syarat) && raw.psb_syarat.length > 0
        ? raw.psb_syarat.map(String)
        : d.psb_syarat,
    psb_biaya_ringkas: String(raw.psb_biaya_ringkas ?? d.psb_biaya_ringkas),
    psb_tautan_daftar: raw.psb_tautan_daftar ? String(raw.psb_tautan_daftar) : null,
    wa_admin_web: raw.wa_admin_web ? String(raw.wa_admin_web) : null,
    alamat_peta_url: raw.alamat_peta_url ? String(raw.alamat_peta_url) : null,
    instagram_url: raw.instagram_url ? String(raw.instagram_url) : null,
    youtube_url: raw.youtube_url ? String(raw.youtube_url) : null,
  };
}
