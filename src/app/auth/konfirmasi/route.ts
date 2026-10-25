import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

// Tujuan tautan di email (undangan, konfirmasi, atur ulang sandi).
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/atur-sandi";
  const tujuan = next.startsWith("/") && !next.startsWith("//") ? next : "/atur-sandi";

  if (token_hash && type) {
    const sb = await supabaseServer();
    const { error } = await sb.auth.verifyOtp({ type, token_hash });
    if (!error) return NextResponse.redirect(new URL(tujuan, req.url));
  }
  return NextResponse.redirect(new URL("/masuk?galat=1", req.url));
}
