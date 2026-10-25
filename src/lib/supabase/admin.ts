import { createClient } from "@supabase/supabase-js";

/**
 * Klien dengan kunci service role: MELEWATI RLS. Hanya untuk kode server,
 * dan hanya setelah peran pemanggil diperiksa secara eksplisit.
 */
export function supabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY belum diatur");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
