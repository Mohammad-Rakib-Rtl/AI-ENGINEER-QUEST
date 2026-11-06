import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./theme.css";
import "./roadmap.css";
export const metadata: Metadata = {
  title: "AI Engineer Quest · Rakib’s learning journey",
  description:
    "A little progress, every day. Your personal engineering learning workspace.",
};
const manrope = localFont({
  src: "../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2",
  display: "swap",
  variable: "--font-manrope",
  weight: "200 800",
});
export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={manrope.variable}>
      <body>{children}</body>
    </html>
  );
}
