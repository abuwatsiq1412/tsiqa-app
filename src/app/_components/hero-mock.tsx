import { Icon } from "./icons";
import { Badge, WindowFrame } from "./ui";

/** Mockup dashboard untuk hero. Semua data adalah contoh (ilustrasi). */
export function HeroMock() {
  return (
    <div className="relative">
      <WindowFrame title="Hari Ini · Data contoh">
        <div className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Ringkasan hari ini
              </p>
              <p className="mt-0.5 text-lg font-semibold text-ink">
                Selasa, 20 Oktober
              </p>
            </div>
            <Badge tone="lunas">Layanan aktif</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-line bg-ivory p-3.5">
              <p className="text-[13px] text-muted">Penerimaan syahriah</p>
              <p className="mt-1 text-xl font-semibold text-ink">
                Rp29.400.000
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge tone="lunas">86 lunas</Badge>
                <Badge tone="cicilan">8 cicilan</Badge>
              </div>
            </div>
            <div className="rounded-xl border border-line bg-ivory p-3.5">
              <p className="text-[13px] text-muted">Kuota santri aktif</p>
              <p className="mt-1 text-xl font-semibold text-ink">
                94 <span className="text-sm font-medium text-muted">/ 100</span>
              </p>
              <div
                className="mt-3 h-2 overflow-hidden rounded-full bg-line"
                aria-hidden="true"
              >
                <div className="h-full w-[94%] rounded-full bg-emerald" />
              </div>
            </div>
          </div>

          <ul className="divide-y divide-line rounded-xl border border-line text-sm">
            <li className="flex items-center justify-between gap-3 px-3.5 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-emerald-pale text-xs font-bold text-emerald">
                  AF
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">
                    Ahmad Fauzan
                  </p>
                  <p className="truncate text-[13px] text-muted">
                    Kamar Al-Ghazali · Syahriah Oktober
                  </p>
                </div>
              </div>
              <Badge tone="lunas">Lunas</Badge>
            </li>
            <li className="flex items-center justify-between gap-3 px-3.5 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-cicilan-bg text-xs font-bold text-cicilan">
                  MZ
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">
                    M. Zidni Ilman
                  </p>
                  <p className="truncate text-[13px] text-muted">
                    Keringanan yatim 50% · sisa Rp150.000
                  </p>
                </div>
              </div>
              <Badge tone="cicilan">Cicilan</Badge>
            </li>
          </ul>
        </div>
      </WindowFrame>

      <div className="animate-floaty absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-2xl border border-line bg-white p-3.5 shadow-[0_20px_50px_-20px_rgba(24,38,34,0.35)] sm:flex lg:-left-8">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald text-white">
          <Icon name="message" className="size-[18px]" />
        </span>
        <div>
          <p className="text-[13px] font-semibold text-ink">
            Kwitansi terkirim ke wali
          </p>
          <p className="text-xs text-muted">Via WhatsApp · baru saja</p>
        </div>
      </div>
    </div>
  );
}
