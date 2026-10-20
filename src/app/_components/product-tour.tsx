"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Icon, type IconName } from "./icons";
import { Badge, WindowFrame } from "./ui";

type TabId = "hari-ini" | "santri" | "syahriah" | "whatsapp";

interface Tab {
  id: TabId;
  label: string;
  icon: IconName;
  judul: string;
  isi: string;
  poin: string[];
  jendela: string;
}

const TABS: Tab[] = [
  {
    id: "hari-ini",
    label: "Hari Ini",
    icon: "home",
    judul: "Satu layar untuk melihat keadaan pondok.",
    isi: "Penerimaan, tunggakan, dan kapasitas santri terangkum begitu Anda masuk. Pengasuh dan bendahara tidak perlu lagi menunggu rekap akhir bulan.",
    poin: [
      "Ringkasan penerimaan syahriah",
      "Daftar yang perlu ditindaklanjuti",
      "Kuota santri aktif sekilas pandang",
    ],
    jendela: "Hari Ini · Pondok Contoh",
  },
  {
    id: "santri",
    label: "Santri & Kamar",
    icon: "users",
    judul: "Buku induk yang rapi, alumni tidak ikut dihitung.",
    isi: "Santri, kamar, dan kelas tercatat di satu tempat. Data lama dari Excel bisa diimpor, dan santri yang lulus pindah ke alumni tanpa memakan kuota.",
    poin: [
      "Impor dari template Excel",
      "Penempatan kamar dan rombel kelas",
      "Alumni tersimpan gratis",
    ],
    jendela: "Santri · Pondok Contoh",
  },
  {
    id: "syahriah",
    label: "Syahriah",
    icon: "wallet",
    judul: "Tagihan, cicilan, dan keringanan yatim tercatat jelas.",
    isi: "Bendahara mencatat pembayaran, mengatur keringanan per santri tanpa merusak rekap utama, lalu mencetak kwitansi resmi.",
    poin: [
      "Status lunas, cicilan, dan tunggakan",
      "Keringanan yatim dan beasiswa",
      "Kwitansi siap cetak",
    ],
    jendela: "Syahriah Oktober · Pondok Contoh",
  },
  {
    id: "whatsapp",
    label: "Pengingat WA",
    icon: "message",
    judul: "Wali santri terkabari dengan santun, tanpa mengetik satu per satu.",
    isi: "Kirim pengingat dengan satu klik (gratis di paket Core), atau jadwalkan pengiriman otomatis dengan modul WhatsApp Auto-Bot.",
    poin: [
      "Format pesan sopan dan seragam",
      "Kirim 1-klik di paket Core",
      "Terjadwal otomatis dengan modul WhatsApp",
    ],
    jendela: "Pengingat WhatsApp · Pondok Contoh",
  },
];

/* ------------------------- Isi jendela per tab ---------------------- */
function MockHariIni() {
  return (
    <div className="space-y-3 p-5">
      <div className="grid grid-cols-3 gap-3">
        {[
          ["Penerimaan", "Rp29,4 jt"],
          ["Santri aktif", "94"],
          ["Belum lunas", "12"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-line bg-ivory p-3">
            <p className="text-xs text-muted">{k}</p>
            <p className="mt-1 text-lg font-semibold text-ink">{v}</p>
          </div>
        ))}
      </div>
      <p className="pt-1 text-xs font-semibold uppercase tracking-wider text-muted">
        Perlu ditindaklanjuti
      </p>
      <ul className="divide-y divide-line rounded-xl border border-line text-sm">
        {[
          ["Syahriah Oktober belum lunas", "12 santri", "belum"],
          ["Izin pulang menunggu persetujuan", "3 pengajuan", "cicilan"],
          ["Pendaftaran santri baru masuk", "5 berkas", "netral"],
        ].map(([a, b, tone]) => (
          <li
            key={a}
            className="flex items-center justify-between gap-3 px-3.5 py-3"
          >
            <span className="font-medium text-ink">{a}</span>
            <Badge tone={tone as "belum" | "cicilan" | "netral"}>{b}</Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MockSantri() {
  const rows = [
    ["Ahmad Fauzan", "Al-Ghazali", "Kelas 2A", "Aktif"],
    ["M. Zidni Ilman", "Al-Ghazali", "Kelas 2A", "Aktif"],
    ["Hasan Basri", "Ibnu Sina", "Kelas 1B", "Aktif"],
    ["Yusuf Maulana", "Ibnu Sina", "Kelas 3A", "Aktif"],
    ["Rafi Hidayat", "—", "—", "Alumni"],
  ];
  return (
    <div className="p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge tone="lunas">Aktif 94</Badge>
        <Badge tone="netral">Alumni 24</Badge>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs font-semibold text-ink">
          <Icon name="upload" className="size-3.5 text-emerald" />
          Impor Excel
        </span>
      </div>
      <div className="overflow-hidden rounded-xl border border-line text-sm">
        <div className="grid grid-cols-[1.4fr_1fr_0.9fr_0.8fr] gap-2 bg-surface-soft px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-muted">
          <span>Nama</span>
          <span>Kamar</span>
          <span>Kelas</span>
          <span>Status</span>
        </div>
        {rows.map(([n, k, c, s]) => (
          <div
            key={n}
            className="grid grid-cols-[1.4fr_1fr_0.9fr_0.8fr] items-center gap-2 border-t border-line px-3.5 py-2.5"
          >
            <span className="truncate font-medium text-ink">{n}</span>
            <span className="truncate text-muted">{k}</span>
            <span className="truncate text-muted">{c}</span>
            <span>
              <Badge tone={s === "Aktif" ? "lunas" : "netral"}>{s}</Badge>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockSyahriah() {
  const rows: [string, string, string, "lunas" | "cicilan" | "belum"][] = [
    ["Ahmad Fauzan", "Rp300.000", "Lunas", "lunas"],
    ["M. Zidni Ilman", "Rp150.000", "Cicilan", "cicilan"],
    ["Hasan Basri", "Rp300.000", "Belum bayar", "belum"],
  ];
  return (
    <div className="space-y-3 p-5">
      <ul className="divide-y divide-line rounded-xl border border-line text-sm">
        {rows.map(([n, j, s, t]) => (
          <li
            key={n}
            className="flex items-center justify-between gap-3 px-3.5 py-3"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{n}</p>
              <p className="text-[13px] text-muted">Syahriah Oktober · {j}</p>
            </div>
            <Badge tone={t}>{s}</Badge>
          </li>
        ))}
      </ul>
      <div className="flex items-start gap-3 rounded-xl border border-gold-soft bg-gold-pale p-3.5">
        <Icon name="heart" className="mt-0.5 size-4 shrink-0 text-gold" />
        <p className="text-[13px] leading-relaxed text-gold-ink">
          <strong>Keringanan yatim 50%</strong> diterapkan: tagihan Rp300.000
          menjadi Rp150.000 per bulan, rekap utama tetap utuh.
        </p>
      </div>
      <div className="flex items-center justify-between rounded-xl bg-surface-soft px-3.5 py-3 text-sm">
        <span className="font-medium text-ink">Kwitansi #KW-108</span>
        <span className="inline-flex items-center gap-1.5 font-semibold text-emerald">
          <Icon name="download" className="size-4" />
          Cetak
        </span>
      </div>
    </div>
  );
}

function MockWhatsapp() {
  return (
    <div className="space-y-3 bg-surface-soft p-5">
      <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-emerald-pale p-3.5 text-[13.5px] leading-relaxed text-ink shadow-sm">
        <p>Assalamu’alaikum Bapak/Ibu,</p>
        <p className="mt-2">
          Kami sampaikan rincian syahriah ananda{" "}
          <strong>Ahmad Fauzan</strong> bulan Oktober sebesar{" "}
          <strong>Rp300.000</strong>. Mohon berkenan menyelesaikannya paling
          lambat tanggal 10.
        </p>
        <p className="mt-2">Jazakumullah khairan.</p>
        <p className="text-muted">— Admin Pondok Contoh</p>
        <p className="mt-1.5 text-right text-[11px] text-muted">08.00 ✓✓</p>
      </div>
      <div className="flex items-center justify-between rounded-xl border border-line bg-white px-3.5 py-3 text-sm">
        <span className="inline-flex items-center gap-2 font-medium text-ink">
          <Icon name="clock" className="size-4 text-emerald" />
          Terjadwal setiap tanggal 1
        </span>
        <Badge tone="lunas">86 wali terkirim</Badge>
      </div>
    </div>
  );
}

const MOCKS: Record<TabId, () => ReactNode> = {
  "hari-ini": () => <MockHariIni />,
  santri: () => <MockSantri />,
  syahriah: () => <MockSyahriah />,
  whatsapp: () => <MockWhatsapp />,
};

/* ------------------------------ Komponen ---------------------------- */
export function ProductTour() {
  const [aktif, setAktif] = useState<TabId>("hari-ini");
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const tab = TABS.find((t) => t.id === aktif)!;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = TABS.findIndex((t) => t.id === aktif);
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + TABS.length) % TABS.length;
    else return;
    e.preventDefault();
    setAktif(TABS[next].id);
    tabRefs.current[TABS[next].id]?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Fitur utama TSIQA"
        onKeyDown={onKeyDown}
        className="-mx-5 -my-2 flex gap-2 overflow-x-auto px-5 py-2 sm:mx-0 sm:my-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:py-0"
      >
        {TABS.map((t) => {
          const on = t.id === aktif;
          return (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[t.id] = el;
              }}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={on}
              aria-controls={`panel-${t.id}`}
              tabIndex={on ? 0 : -1}
              type="button"
              onClick={() => setAktif(t.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
                on
                  ? "bg-ink text-white shadow-md"
                  : "border border-line bg-white text-muted hover:-translate-y-0.5 hover:border-emerald/40 hover:text-ink hover:shadow-sm"
              }`}
            >
              <Icon name={t.icon} className="size-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div
        key={tab.id}
        role="tabpanel"
        id={`panel-${tab.id}`}
        aria-labelledby={`tab-${tab.id}`}
        className="animate-swap mt-6 grid items-center gap-6 lg:grid-cols-12 lg:gap-10"
      >
        <div className="lg:col-span-5">
          <h3 className="text-xl font-semibold leading-snug tracking-tight text-ink sm:text-2xl">
            {tab.judul}
          </h3>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">{tab.isi}</p>
          <ul className="mt-5 space-y-2.5">
            {tab.poin.map((p) => (
              <li key={p} className="flex items-start gap-3 text-[15px] text-ink">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-pale text-emerald">
                  <Icon name="check" className="size-3.5" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-7">
          <WindowFrame title={tab.jendela}>{MOCKS[tab.id]()}</WindowFrame>
        </div>
      </div>
    </div>
  );
}
