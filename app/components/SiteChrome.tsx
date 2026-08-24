"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  if (pathname.startsWith("/admin")) return <>{children}</>;
  const closeMenu = () => setMenuOpen(false);
  return <><header className="site-header site-header-new"><Link className="brand" href="/" onClick={closeMenu}><Image src="/precious-set-logo.png" alt="The Precious Set" width={110} height={86} /></Link><button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen((open) => !open)}><span /> <span /> <span /><b>{menuOpen ? "Close" : "Menu"}</b></button><nav id="main-navigation" className={menuOpen ? "is-open" : ""} aria-label="Main navigation"><Link href="/" onClick={closeMenu}>Home</Link><Link href="/services" onClick={closeMenu}>Services</Link><Link href="/portfolio" onClick={closeMenu}>Portfolio</Link><Link href="/info" onClick={closeMenu}>Info</Link><Link className="nav-cta" href="/book" onClick={closeMenu}>Book <span>↗</span></Link></nav></header>{children}<footer className="site-footer page-shell site-footer-new"><span>© The Precious Set</span><span>Leeds · by appointment</span><Link href="/admin">Admin sign in</Link></footer></>;
}
