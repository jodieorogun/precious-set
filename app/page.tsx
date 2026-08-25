const studioDetails = [
  ["01", "Services", "Gel-X · Gel · Refills.", "/services", "Choose a service"],
  ["02", "Portfolio", "A closer look at real sets.", "/portfolio", "Look closer"],
  ["04", "Instagram", "New sets, studio updates.", "https://www.instagram.com/the_precious_set/", "Instagram"],
];

export default function Home() {
  return <main className="creative-home">
    <section className="creative-hero page-shell">
      <div className="creative-hero-copy"><h1>the<br /><em>precious</em><br />set</h1><a className="creative-book" href="/book">Book an appointment <span>↗</span></a></div>
      <div className="creative-hero-gallery"><div className="hero-mini-gallery"><div><img src="/portfolio/08.jpeg" alt="Detailed nail set by The Precious Set" width="500" height="620" /></div><div><img src="/portfolio/13.jpeg" alt="Pink nail set by The Precious Set" width="500" height="620" /></div><div><img src="/portfolio/04.jpeg" alt="White 3D nail set by The Precious Set" width="500" height="620" /></div></div></div>
    </section>
    <section className="creative-details page-shell" aria-label="The Precious Set information">{studioDetails.map(([number, title, description, href, action]) => href.startsWith("http") ? <a className={`creative-detail creative-detail-${number}`} href={href} target="_blank" rel="noreferrer" key={number}><strong>{title}</strong><p>{description}</p><i>{action} ↗</i></a> : <a className={`creative-detail creative-detail-${number}`} href={href} key={number}><strong>{title}</strong><p>{description}</p><i>{action} {title === "Find us" ? "↓" : "↗"}</i></a>)}<div className="creative-detail creative-location-panel"><strong>Location</strong><p>Leeds, United Kingdom</p><i aria-hidden="true">&nbsp;</i></div></section>
  </main>;
}
