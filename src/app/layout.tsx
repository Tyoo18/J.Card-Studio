import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Space_Mono } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Premium Music Archive Studio Map",
  description:
    "A structural cataloging of spatial sounds and tactile mika jackets.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${cormorant.variable} ${inter.variable} ${spaceMono.variable} font-sans bg-[#060608] text-[#e4ded2] overflow-hidden h-screen w-screen antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
