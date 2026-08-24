import Link from "next/link";
export function Navbar() { return <header className="site-header"><Link className="brand" href="/">The Precious Set</Link><nav aria-label="Main navigation"><Link href="/">Home</Link><Link href="/services">Services</Link><Link href="/portfolio">Portfolio</Link><Link href="/info">Info</Link><Link className="nav-cta" href="/book">Book</Link></nav></header>; }
