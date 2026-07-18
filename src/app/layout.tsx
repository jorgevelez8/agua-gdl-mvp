import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../design-system/tokens.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Campaña — genera piezas de campaña en minutos",
  description:
    "Escribí un mensaje y obtené 3 piezas gráficas listas para publicar (post, story, banner). Demo activa: Agua Guadalajara, para el reto Las Diez.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
