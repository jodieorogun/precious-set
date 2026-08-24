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
      <div className="creative-hero-copy"><p className="eyebrow">The Precious Set · Leeds, UK</p><h1>The<br /><em>Precious</em><br />Set</h1><Link className="creative-book" href="/book">Book an appointment <span>↗</span></Link></div>
      <div className="creative-hero-photo"><Image src="/portfolio/03.jpeg" alt="French tip nail set by The Precious Set" width={900} height={1100} priority /><div className="creative-logo"><Image src="/precious-set-logo.png" alt="The Precious Set logo" width={230} height={180} /></div><span className="creative-photo-label">The Precious Set<br />01 / 04</span></div>
    </section>
    <section className="creative-details page-shell" aria-label="The Precious Set information">{studioDetails.map(([number, title, description, href, action]) => href.startsWith("http") ? <a className={`creative-detail creative-detail-${number}`} href={href} target="_blank" rel="noreferrer" key={number}><span className="detail-number">{number}</span><strong>{title}</strong><p>{description}</p><i>{action} ↗</i></a> : <Link className={`creative-detail creative-detail-${number}`} href={href} key={number}><span className="detail-number">{number}</span><strong>{title}</strong><p>{description}</p><i>{action} {title === "Find us" ? "↓" : "↗"}</i></Link>)}</section>
    <section className="creative-portfolio page-shell">
      <div className="creative-portfolio-heading"><p className="eyebrow">02 / Portfolio</p><h2>Look a little<br /><em>closer.</em></h2><Link className="text-link" href="/portfolio">View all work <span>↗</span></Link></div>
      <div className="hover-gallery" aria-label="Portfolio preview">
        <div className="hover-gallery-card hover-gallery-one"><Image src="/portfolio/08.jpeg" alt="Detailed nail set by The Precious Set" width={550} height={680} /><span>01</span></div>
        <div className="hover-gallery-card hover-gallery-two"><Image src="/portfolio/13.jpeg" alt="Pink nail set by The Precious Set" width={550} height={680} /><span>02</span></div>
        <div className="hover-gallery-card hover-gallery-three"><Image src="/portfolio/04.jpeg" alt="White 3D nail set by The Precious Set" width={550} height={680} /><span>03</span></div>
      </div>
    </section>
    <section className="creative-bottom page-shell" id="find-us"><span className="eyebrow">03 / Find us</span><strong>Leeds, United Kingdom</strong><span>By appointment only</span><Link href="/book">Book ↗</Link></section>
  </main>;
}
