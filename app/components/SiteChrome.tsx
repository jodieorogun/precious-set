"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return <>{children}</>;
  return <><header className="site-header"><Link className="brand" href="/"><Image src="/precious-set-logo.png" alt="The Precious Set" width={110} height={86} /></Link><nav aria-label="Main navigation"><Link href="/">Home</Link><Link href="/services">Services</Link><Link href="/portfolio">Portfolio</Link><Link href="/info">Info</Link><Link className="nav-cta" href="/book">Book <span>↗</span></Link></nav></header>{children}<footer className="site-footer page-shell"><span>© The Precious Set</span><span>✦ Nails, thoughtfully done.</span><Link href="/admin">Admin sign in</Link></footer></>;
}
