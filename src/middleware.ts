import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { tujuanSetelahLogin } from "@/lib/arah";

// Halaman publik yang dapat diakses siapa pun (pengunjung web)
const PUBLIK_BEBAS = ["/", "/privasi", "/wali/sw.js", "/wali/manifest.webmanifest", "/wali/aktivasi", "/guru/aktivasi"];

// Halaman autentikasi (khusus pengguna yang belum login).
// /atur-sandi sengaja tidak di sini: pengguna undangan sudah punya sesi saat mengisinya.
const AUTH_PAGES = ["/masuk", "/daftar", "/lupa-sandi", "/wali/masuk", "/guru/masuk"];

// Prefix untuk tautan sistem (konfirmasi email / callback auth)
const BEBAS_PREFIX = ["/auth"];

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          list.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getClaims memverifikasi tanda tangan JWT secara lokal (tanpa perjalanan ke server Auth bila
  // proyek memakai kunci asimetris). Keputusan akses data tetap di RLS.
  const { data: klaim } = await supabase.auth.getClaims();
  const user = klaim?.claims?.sub ? { id: klaim.claims.sub as string } : null;

  const pathname = req.nextUrl.pathname;

  // 1. Tautan auth callback / konfirmasi email selalu bebas
  if (BEBAS_PREFIX.some((p) => pathname.startsWith(p))) return res;

  // 2. Halaman publik (landing page & privasi) bebas diakses siapa saja
  if (PUBLIK_BEBAS.includes(pathname)) return res;

  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  // 3. Jika belum login dan mencoba membuka halaman aplikasi internal -> lempar ke /masuk
  if (!user && !isAuthPage) {
    return NextResponse.redirect(new URL(pathname.startsWith("/wali") ? "/wali/masuk" : pathname.startsWith("/guru") ? "/guru/masuk" : "/masuk", req.url));
  }

  // 4. Jika sudah login dan membuka halaman auth (/masuk atau /daftar) -> arahkan ke dashboard yang sesuai
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL(await tujuanSetelahLogin(supabase, user.id), req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
