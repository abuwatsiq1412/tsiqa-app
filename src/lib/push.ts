import webpush from "web-push";
import { supabaseAdmin } from "@/lib/supabase/admin";

export interface IsiPush { judul: string; isi: string; url: string }

let siap: boolean | null = null;
function init() {
  if (siap !== null) return siap;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY, priv = process.env.VAPID_PRIVATE_KEY;
  siap = !!(pub && priv);
  if (siap) webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:admin@tsiqa.id", pub!, priv!);
  return siap;
}

/** Kirim ke semua perangkat milik user. Tidak pernah melempar galat: notifikasi hanya pelengkap. */
export async function kirimPush(userIds: string[], isi: IsiPush) {
  try {
    if (!userIds.length || !init()) return;
    const admin = supabaseAdmin();
    const { data } = await admin.from("push_langganan").select("id, endpoint, p256dh, auth").in("user_id", userIds);
    const mati: string[] = [];
    await Promise.all((data ?? []).map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(isi), { TTL: 86400 });
      } catch (e) {
        const kode = (e as { statusCode?: number }).statusCode;
        if (kode === 404 || kode === 410) mati.push(s.id as string);
      }
    }));
    if (mati.length) await admin.from("push_langganan").delete().in("id", mati);
  } catch { /* abaikan */ }
}

/** Beri kabar ke wali dari santri-santri tertentu. */
export async function kabarkanWali(santriIds: string[], isi: IsiPush) {
  try {
    if (!santriIds.length || !init()) return;
    const { data } = await supabaseAdmin().from("wali_akun").select("user_id").in("santri_id", santriIds);
    await kirimPush([...new Set((data ?? []).map((x) => x.user_id as string))], isi);
  } catch { /* abaikan */ }
}

/** Beri kabar ke admin & bendahara pondok. */
export async function kabarkanPengurus(pondokId: string, isi: IsiPush) {
  try {
    if (!init()) return;
    const { data } = await supabaseAdmin().from("anggota_pondok").select("user_id").eq("pondok_id", pondokId).eq("aktif", true).in("peran", ["admin", "bendahara"]);
    await kirimPush((data ?? []).map((x) => x.user_id as string), isi);
  } catch { /* abaikan */ }
}

/** Beri kabar ke semua wali di sebuah pondok (mis. tagihan massal baru). */
export async function kabarkanWaliPondok(pondokId: string, isi: IsiPush) {
  try {
    if (!init()) return;
    const { data } = await supabaseAdmin().from("wali_akun").select("user_id").eq("pondok_id", pondokId);
    await kirimPush([...new Set((data ?? []).map((x) => x.user_id as string))], isi);
  } catch { /* abaikan */ }
}
