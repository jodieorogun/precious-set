import Image from "next/image";
import Link from "next/link";

const destinations = [
  ["/services", "Services", "01"],
  ["/portfolio", "Portfolio", "02"],
  ["#find-us", "Find us", "03"],
  ["https://www.instagram.com/the_precious_set/", "Instagram", "04"],
];

export default function Home() {
  return <main className="gallery-home">
    <section className="gallery-hero page-shell">
      <div className="gallery-intro"><p className="eyebrow">The Precious Set</p><h1>Leeds<br /><em>nails.</em></h1><Link className="gallery-book" href="/book">Book <span>↗</span></Link></div>
      <div className="gallery-main-image"><Image src="/portfolio/03.jpeg" alt="French tip nail set by The Precious Set" width={900} height={1100} priority /><div className="gallery-logo"><Image src="/precious-set-logo.png" alt="The Precious Set" width={210} height={160} /></div></div>
      <div className="gallery-side-images"><Image src="/portfolio/08.jpeg" alt="Detailed nail set by The Precious Set" width={450} height={560} /><Image src="/portfolio/13.jpeg" alt="Pink nail set by The Precious Set" width={450} height={560} /></div>
    </section>
    <nav className="gallery-nav page-shell" aria-label="Explore The Precious Set">{destinations.map(([href, label, number]) => href.startsWith("http") ? <a href={href} target="_blank" rel="noreferrer" key={label}><span>{number}</span>{label}<b>↗</b></a> : <Link href={href} key={label}><span>{number}</span>{label}<b>{label === "Find us" ? "Leeds" : "↗"}</b></Link>)}</nav>
    <section className="gallery-find page-shell" id="find-us"><p className="eyebrow">Find us</p><strong>Leeds</strong><a href="https://www.instagram.com/the_precious_set/" target="_blank" rel="noreferrer">@the_precious_set ↗</a></section>
  </main>;
}
