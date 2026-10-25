import { nomorWA } from "@/lib/format";

/** Akun wali memakai email sintetis dari nomor WhatsApp: tanpa biaya SMS/email, tanpa lupa-email. */
export const DOMAIN_WALI = "wali.tsiqa.id";

/** Nomor valid Indonesia (62 + 8–13 digit) atau null. */
export function nomorValid(s: string): string | null {
  const n = nomorWA(s);
  return /^62[0-9]{8,13}$/.test(n) ? n : null;
}

export const DOMAIN_GURU = "guru.tsiqa.id";
export const emailGuru = (no: string) => `${no}@${DOMAIN_GURU}`;
/** Email sintetis milik sistem tidak boleh dipakai mendaftar lewat /daftar. */
export const adalahEmailSistem = (e: string) => /@(wali|guru)\.tsiqa\.id$/i.test(e.trim());
export const emailWali = (no: string) => `${no}@${DOMAIN_WALI}`;
export const adalahEmailWali = (e: string) => e.trim().toLowerCase().endsWith(`@${DOMAIN_WALI}`);

/** 6281234567890 → 0812-3456-7890 (tampilan) */
export const tampilNomor = (no: string) => {
  const l = "0" + no.slice(2);
  return l.replace(/(\d{4})(\d{4})(\d+)/, "$1-$2-$3");
};
export const samarkanNomor = (no: string) => `+${no.slice(0, 4)}••••${no.slice(-3)}`;
