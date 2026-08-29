import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";

import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display"
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "STCS",
  description:
    "Plataforma STCS para configurar comunicacion CAA y seguimiento con dispositivo ESP32-S3."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${outfit.variable} ${inter.variable}`}>
        {children}
      </body>
    </html>
  );
}
