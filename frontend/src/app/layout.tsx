import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Lexend } from "next/font/google";

import { AppShell } from "@/components/layout/AppShell";

import "./globals.css";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-display"
});

const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "STCS",
  description: "Base funcional para una app TEA con pictogramas y seguimiento."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${lexend.variable} ${atkinson.variable}`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
