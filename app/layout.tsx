import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "1,500+ | A Thank You by Muhammad Hasan",
  description: "One incredible journey. Thank you for being part of it.",
  metadataBase: new URL("https://celebration.vercel.app"),
  openGraph: {
    title: "1,500+ connections. One incredible journey.",
    description: "A small milestone, made meaningful by people.",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
