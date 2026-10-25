import type { Metadata } from "next";
import { Suspense } from "react";
import { PenjagaTemaRoute } from "@/components-tema";
import { BarProgresNavigasi } from "@/components-progres";
import "./globals.css";

export const metadata: Metadata = {
  title: "TSIQA",
  description: "Administrasi dan syahriyah pesantren",
  icons: { icon: "/logo-tsiqa.svg", apple: "/logo-tsiqa.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <meta name="theme-color" content="#f8faf9" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0e1613" media="(prefers-color-scheme: dark)" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var path=location.pathname;var publik=path==="/"||path==="/mulai"||path==="/privasi"||path==="/masuk"||path==="/daftar"||path==="/lupa-sandi"||path==="/atur-sandi"||path.indexOf("/p/")===0||path.indexOf("/dokumen/")===0||path.indexOf("/wali/masuk")===0||path.indexOf("/wali/aktivasi")===0||path.indexOf("/guru/masuk")===0;if(publik){document.documentElement.dataset.theme="light";return;}var p=localStorage.getItem("tema")||"otomatis";var d=p==="gelap"||(p==="otomatis"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light";}catch(e){}})();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Suspense fallback={null}>
          <BarProgresNavigasi />
        </Suspense>
        <PenjagaTemaRoute />
        {children}
      </body>
    </html>
  );
}
