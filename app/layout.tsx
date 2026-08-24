import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "./components/Navbar";

export const metadata: Metadata = {
  title: "The Precious Set | Modern nail studio",
  description: "Thoughtfully done nails and a little everyday luxury.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body><Navbar />{children}<footer className="site-footer page-shell"><span>© The Precious Set</span><span>Nails, thoughtfully done.</span></footer></body>
    </html>
  );
}
