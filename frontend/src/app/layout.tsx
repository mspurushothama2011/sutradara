import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import AppFooterWrapper from "@/components/layout/AppFooterWrapper";
import InteractiveSilkCanvas from "@/components/shared/ui/InteractiveSilkCanvas";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sutraಧಾರ — Curators of Authentic Indian Handloom Sarees",
  description:
    "Sutraಧಾರ curates certified authentic Banarasi, Kanjivaram, Chanderi, and Paithani handlooms directly from India's master weavers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`} suppressHydrationWarning>
      <body style={{ fontFamily: "var(--font-body)", display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }} suppressHydrationWarning>
        <InteractiveSilkCanvas />
        <CartProvider>
          <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
            {children}
          </div>
          <AppFooterWrapper />
        </CartProvider>
      </body>
    </html>
  );
}
