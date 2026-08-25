"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  if (pathname.startsWith("/admin")) return <>{children}</>;
  const closeMenu = () => setMenuOpen(false);
  return <><header className="site-header site-header-new"><a className="brand" href="/" onClick={closeMenu}><Image src="/precious-set-logo.png" alt="The Precious Set" width={110} height={86} /></a><button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen((open) => !open)}><span /> <span /> <span /><b>{menuOpen ? "Close" : "Menu"}</b></button><nav id="main-navigation" className={menuOpen ? "is-open" : ""} aria-label="Main navigation"><a href="/" onClick={closeMenu}>Home</a><a href="/services" onClick={closeMenu}>Services</a><a href="/portfolio" onClick={closeMenu}>Portfolio</a><a href="/info" onClick={closeMenu}>Info</a><a className="nav-cta" href="/book" onClick={closeMenu}>Book <span>↗</span></a></nav></header>{children}<footer className="site-footer page-shell site-footer-new"><span>© The Precious Set</span><a href="/admin">Admin sign in</a></footer></>;
}
