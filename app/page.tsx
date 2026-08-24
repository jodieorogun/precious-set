"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const services = [
  ["Gel-X Extensions", "Lightweight length with a polished, glossy finish.", "01", "full set", "For a little extra length and a clean, sculpted finish."],
  ["Gel on Natural Nails", "Clean, glossy colour for your own nails.", "02", "natural nails", "Your natural nails, finished with a smooth, high-shine gel colour."],
  ["Refills", "A fresh, tidy refresh for your current set.", "03", "maintenance", "Keep your favourite set looking fresh with a considered refill."],
];

export default function Home() {
  const [selectedService, setSelectedService] = useState(0);
  const selected = services[selectedService];

  return <main>
    <section className="hero hero-expressive page-shell">
      <div className="hero-orbit hero-orbit-one" />
      <div className="hero-orbit hero-orbit-two" />
      <div className="hero-copy">
        <div className="hero-kicker">Leeds · The Precious Set</div>
        <h1>Nails<br /><em>made</em><br />personal.</h1>
        <p className="lede">Glossy finishes, thoughtful details and nail sets designed around you.</p>
        <div className="hero-actions"><Link className="button button-dark" href="/book">Book an appointment <span>↗</span></Link><Link className="hero-secondary-link" href="/portfolio">View portfolio <span>↓</span></Link></div>
        <div className="hero-proof"><span className="proof-dots">✦</span><span>Independent nail studio<br /><b>Based in Leeds</b></span></div>
      </div>
      <div className="hero-art">
        <div className="hero-sticker">your<br /><b>next set</b><br />starts here</div>
        <div className="art-glow" />
        <Image src="/precious-set-logo.png" alt="The Precious Set logo" width={760} height={600} priority />
      </div>
    </section>
    <section className="marquee"><div>THE PRECIOUS SET <span>✦</span> LEEDS NAIL STUDIO <span>✦</span> THOUGHTFUL DETAILS <span>✦</span> THE PRECIOUS SET <span>✦</span></div></section>
    <section className="section page-shell">
      <div className="section-heading expressive-heading"><div><p className="eyebrow">01 / Services</p><h2>Find your<br /><em>finish.</em></h2></div><Link className="text-link" href="/services">View all services <span>↗</span></Link></div>
      <div className="card-grid expressive-cards interactive-service-cards">{services.map(([title, description, number, tag], index) => <button className={`service-card expressive-card service-selector ${selectedService === index ? "is-selected" : ""}`} key={title} onClick={() => setSelectedService(index)} aria-pressed={selectedService === index}><div className="card-topline"><span className="card-number">{number}</span><span className="service-tag">{tag}</span></div><h3>{title}</h3><p>{description}</p><span className="card-arrow">↗</span></button>)}</div>
      <div className="service-preview" aria-live="polite"><div className="service-preview-number">{selected[2]}</div><div><p className="eyebrow">Selected service</p><h3>{selected[0]}</h3><p>{selected[4]}</p></div><Link className="button button-dark" href="/book">Book this set <span>↗</span></Link></div>
    </section>
    <section className="feature-band feature-band-expressive page-shell">
      <div className="portfolio-art portfolio-collage">
        <div className="portfolio-image portfolio-image-one"><Image src="/portfolio/01.jpeg" alt="Glossy nail set by The Precious Set" width={450} height={560} /></div>
        <div className="portfolio-image portfolio-image-two"><Image src="/portfolio/08.jpeg" alt="Detailed nail set by The Precious Set" width={450} height={560} /></div>
        <span className="portfolio-collage-label">recent work<br /><em>from the studio</em></span>
      </div>
      <div className="feature-copy"><p className="eyebrow">02 / Portfolio</p><h2>See the<br /><em>sets.</em></h2><p>A few of the real sets created at The Precious Set. Save an idea, bring a reference or start from scratch.</p><Link className="text-link" href="/portfolio">Explore the portfolio <span>↗</span></Link></div>
    </section>
    <section className="details-grid page-shell expressive-details">
      <div className="location-card"><p className="eyebrow">03 / Location</p><h2>Leeds<span>✦</span></h2><p>Appointments are based in Leeds. Full studio details are shared with your booking.</p><Link className="text-link" href="/info">Read appointment info <span>↗</span></Link></div>
      <div className="social-card"><p className="eyebrow">04 / Instagram</p><h2><a className="social-link" href="https://www.instagram.com/the_precious_set/" target="_blank" rel="noreferrer">@the_precious_set <span>↗</span></a></h2><p>Follow along for new sets and availability.</p><span className="social-sparkle">✦</span></div>
    </section>
  </main>;
}
