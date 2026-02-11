import type { Metadata } from "next";
import { Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Cemetery AI SaaS - Contract Management",
  description: "Efficient contract digitization and inheritance support for temples and cemeteries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${notoSansJP.variable} ${notoSerifJP.variable} antialiased`}
      >
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-border/40 bg-background/80 backdrop-blur sticky top-0 z-50">
            <div className="container mx-auto max-w-5xl flex h-20 items-center justify-center md:justify-between px-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <span className="font-serif font-bold text-lg">霊</span>
                </div>
                <div className="font-serif text-xl font-bold tracking-widest text-foreground">
                  霊園AISaaS
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 container mx-auto max-w-5xl py-12 px-6 font-sans">
            {children}
          </main>
          <footer className="border-t py-6 md:px-8 md:py-0">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row text-sm text-muted-foreground">
              <p>&copy; 2026 Cemetery AI SaaS. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
