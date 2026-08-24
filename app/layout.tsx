import type { Metadata } from "next";
import "./globals.css";
import { SiteChrome } from "./components/SiteChrome";

export const metadata: Metadata = {
  title: "The Precious Set | Modern nail studio",
  description: "Thoughtfully done nails and a little everyday luxury.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SiteChrome>{children}</SiteChrome></body></html>;
}
