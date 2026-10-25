import { Icon } from "./icons";
import { Badge, WindowFrame } from "./ui";

/** Mockup dashboard untuk hero. Semua data adalah contoh (ilustrasi). */
export function HeroMock() {
  return (
    <div className="relative">
      <WindowFrame title="Hari Ini · Pondok Contoh">
        <div className="space-y-3 p-3.5 sm:space-y-4 sm:p-5">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted sm:text-xs">
                Ringkasan hari ini
              </p>
              <p className="mt-0.5 text-sm font-semibold text-ink sm:text-lg">
                Selasa, 20 Oktober
              </p>
            </div>
            <Badge tone="lunas">Layanan aktif</Badge>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <div className="rounded-xl border border-line bg-ivory p-2.5 sm:p-3.5">
              <p className="text-[11.5px] text-muted sm:text-[13px]">
                Penerimaan syahriah
              </p>
              <p className="mt-0.5 text-[15px] font-semibold text-ink sm:mt-1 sm:text-xl">
                Rp29.400.000
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1 sm:mt-2 sm:gap-1.5">
                <Badge tone="lunas">86 lunas</Badge>
                <Badge tone="cicilan">8 cicilan</Badge>
              </div>
            </div>
            <div className="rounded-xl border border-line bg-ivory p-2.5 sm:p-3.5">
              <p className="text-[11.5px] text-muted sm:text-[13px]">
                Kuota santri aktif
              </p>
              <p className="mt-0.5 text-[15px] font-semibold text-ink sm:mt-1 sm:text-xl">
                94{" "}
                <span className="text-xs font-medium text-muted sm:text-sm">
                  / 150
                </span>
              </p>
              <div
                className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-line sm:mt-3 sm:h-2"
                aria-hidden="true"
              >
                <div className="h-full w-[63%] rounded-full bg-emerald" />
              </div>
            </div>
          </div>

          <ul className="divide-y divide-line rounded-xl border border-line text-xs sm:text-sm">
            <li className="flex items-center justify-between gap-2 px-2.5 py-2 sm:gap-3 sm:px-3.5 sm:py-3">
              <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-emerald-pale text-[11px] font-bold text-emerald sm:size-8 sm:text-xs">
                  AF
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">
                    Ahmad Fauzan
                  </p>
                  <p className="truncate text-[11px] text-muted sm:text-[13px]">
                    Kamar Al-Ghazali · Syahriah Oktober
                  </p>
                </div>
              </div>
              <Badge tone="lunas">Lunas</Badge>
            </li>
            <li className="flex items-center justify-between gap-2 px-2.5 py-2 sm:gap-3 sm:px-3.5 sm:py-3">
              <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-cicilan-bg text-[11px] font-bold text-cicilan sm:size-8 sm:text-xs">
                  MZ
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">
                    M. Zidni Ilman
                  </p>
                  <p className="truncate text-[11px] text-muted sm:text-[13px]">
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
