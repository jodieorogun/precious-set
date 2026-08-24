import Image from "next/image";
import Link from "next/link";

const services = [
  ["The Signature Set", "A polished, timeless set made for everyday luxury."],
  ["Soft Gel Extensions", "Elegant length with a lightweight, natural finish."],
  ["The Precious Refresh", "A considered refresh for your current set."],
];

export default function Home() {
  return <main>
    <section className="hero page-shell"><div className="hero-copy"><p className="eyebrow">✦ Nails, thoughtfully done</p><h1>Pretty nails.<br /><em>Precious</em> moments.</h1><p className="lede">A modern nail studio for considered details, soft confidence and a little everyday luxury.</p><Link className="button button-dark" href="/book">Book Appointment <span>↗</span></Link><div className="hero-note"><span>✦</span> Your next favourite set starts here.</div></div><div className="hero-art"><div className="art-glow" /><Image src="/precious-set-logo.png" alt="The Precious Set logo" width={760} height={600} priority /></div></section>
    <section className="marquee"><div>THE PRECIOUS SET <span>✦</span> NAILS, THOUGHTFULLY DONE <span>✦</span> THE PRECIOUS SET <span>✦</span></div></section>
    <section className="section page-shell"><div className="section-heading"><div><p className="eyebrow">01 / A little luxury</p><h2>Made for your hands.</h2></div><Link className="text-link" href="/services">View services <span>↗</span></Link></div><div className="card-grid">{services.map(([title, description], index) => <article className="service-card" key={title}><div className="card-number">0{index + 1}</div><h3>{title}</h3><p>{description}</p><span className="card-arrow">↗</span></article>)}</div></section>
    <section className="feature-band page-shell"><div className="portfolio-art"><span>your<br /><em>next set</em><br />awaits ✦</span></div><div className="feature-copy"><p className="eyebrow">02 / The portfolio</p><h2>Details worth looking at twice.</h2><p>From barely-there neutrals to expressive little moments, explore the work behind The Precious Set.</p><Link className="text-link" href="/portfolio">See the portfolio <span>↗</span></Link></div></section>
    <section className="details-grid page-shell"><div><p className="eyebrow">03 / Find us</p><h2>Leeds</h2></div><div className="social-card"><p className="eyebrow">04 / Stay close</p><h2><a className="social-link" href="https://www.instagram.com/the_precious_set/" target="_blank" rel="noreferrer">@the_precious_set ↗</a></h2><p>Follow The Precious Set on Instagram.</p><span className="social-sparkle">✦</span></div></section>
  </main>;
}
