import type { Metadata } from "next";
import { Rajdhani, Roboto } from "next/font/google";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SkipLink } from "@/components/layout/SkipLink";

import "./globals.css";

// Pesos aprovados para o projeto: Rajdhani 600 nos títulos, Roboto 400 e 500 no corpo.
const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["600"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const MAIN_CONTENT_ID = "main-content";

export const metadata: Metadata = {
  title: {
    default: "Can | Loja de jogos",
    template: "%s | Can",
  },
  description:
    "Loja e biblioteca de jogos Can: destaques, ofertas especiais e lançamentos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${rajdhani.variable} ${roboto.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col bg-background font-sans text-medium text-title">
        <SkipLink targetId={MAIN_CONTENT_ID} />
        <SiteHeader />
        {/* tabIndex -1 deixa o link de pular conteúdo mover o foco para cá. */}
        <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
