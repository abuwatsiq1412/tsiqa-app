export function GET() {
  return Response.json(
    {
      name: "TSIQA Wali",
      short_name: "TSIQA Wali",
      description: "Pantau tagihan ananda dari HP.",
      lang: "id",
      start_url: "/wali",
      scope: "/wali/",
      display: "standalone",
      orientation: "portrait",
      background_color: "#f8faf9",
      theme_color: "#263b35",
      icons: [
        { src: "/logo-tsiqa.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
        { src: "/logo-tsiqa.png", sizes: "512x512", type: "image/png", purpose: "any" },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json" } },
  );
}
