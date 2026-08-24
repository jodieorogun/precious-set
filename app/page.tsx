import Image from "next/image";
import Link from "next/link";

const studioDetails = [
  ["01", "Services", "Gel-X · Gel · Refills.", "/services", "Choose a service"],
  ["02", "Portfolio", "A closer look at real sets.", "/portfolio", "Look closer"],
  ["03", "Find us", "Leeds, United Kingdom.", "#find-us", "Studio details"],
  ["04", "Instagram", "New sets, studio updates.", "https://www.instagram.com/the_precious_set/", "Instagram"],
];

export default function Home() {
  return <main className="creative-home">
    <section className="creative-hero page-shell">
      <div className="creative-hero-copy"><p className="eyebrow">The Precious Set · Leeds, UK</p><h1>The<br /><em>precious</em><br />Set</h1><Link className="creative-book" href="/book">Book an appointment <span>↗</span></Link></div>
      <div className="creative-hero-gallery"><div className="hero-mini-gallery"><div><Image src="/portfolio/08.jpeg" alt="Detailed nail set by The Precious Set" width={500} height={620} /></div><div><Image src="/portfolio/13.jpeg" alt="Pink nail set by The Precious Set" width={500} height={620} /></div><div><Image src="/portfolio/04.jpeg" alt="White 3D nail set by The Precious Set" width={500} height={620} /></div></div></div>
    </section>
    <section className="creative-details page-shell" aria-label="The Precious Set information">{studioDetails.map(([number, title, description, href, action]) => href.startsWith("http") ? <a className={`creative-detail creative-detail-${number}`} href={href} target="_blank" rel="noreferrer" key={number}><span className="detail-number">{number}</span><strong>{title}</strong><p>{description}</p><i>{action} ↗</i></a> : <Link className={`creative-detail creative-detail-${number}`} href={href} key={number}><span className="detail-number">{number}</span><strong>{title}</strong><p>{description}</p><i>{action} {title === "Find us" ? "↓" : "↗"}</i></Link>)}</section>
  </main>;
}
