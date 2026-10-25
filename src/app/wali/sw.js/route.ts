// Service worker TSIQA Wali. Disajikan dari /wali/sw.js agar cakupannya /wali/.
const SW = `
const VERSI = "wali-v2";
const OFFLINE = '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:system-ui;padding:3rem 1.5rem;text-align:center;color:#182622"><h2>Tidak ada sambungan</h2><p>Buka kembali saat sinyal tersedia.</p></body>';

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSI) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;

  // Berkas statis: cache dulu.
  if (u.pathname.startsWith("/_next/static/") || u.pathname.startsWith("/logo-tsiqa")) {
    e.respondWith(caches.match(r).then((c) => c || fetch(r).then((res) => {
      if (res.ok) { const cp = res.clone(); caches.open(VERSI).then((ca) => ca.put(r, cp)); }
      return res;
    })));
    return;
  }

  // Halaman portal: jaringan dulu, salinan terakhir bila offline.
  if (r.mode === "navigate" && u.pathname.startsWith("/wali") && !u.pathname.startsWith("/wali/sw.js")) {
    e.respondWith(fetch(r).then((res) => {
      if (res.ok && !res.redirected) { const cp = res.clone(); caches.open(VERSI).then((ca) => ca.put(r, cp)); }
      return res;
    }).catch(async () => (await caches.match(r)) || new Response(OFFLINE, { headers: { "Content-Type": "text/html; charset=utf-8" } })));
  }
});

// Dipanggil saat keluar akun agar data pribadi tidak tertinggal di perangkat.
self.addEventListener("message", (e) => { if (e.data === "bersihkan") e.waitUntil(caches.delete(VERSI)); });

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data.json(); } catch (_) {}
  e.waitUntil(self.registration.showNotification(d.judul || "TSIQA Wali", {
    body: d.isi || "", icon: "/logo-tsiqa.png", badge: "/logo-tsiqa.png", data: { url: d.url || "/wali" },
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "/wali";
  e.waitUntil(self.clients.matchAll({ type: "window" }).then((list) => {
    for (const c of list) if (c.url.includes("/wali") && "focus" in c) { c.navigate(url); return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
`;

export function GET() {
  return new Response(SW, {
    headers: {
      "Content-Type": "text/javascript; charset=utf-8",
      "Cache-Control": "no-cache",
      "Service-Worker-Allowed": "/wali/",
    },
  });
}
