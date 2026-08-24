import Link from "next/link";

const services = ["The Signature Set", "Soft Gel Extensions", "The Precious Refresh"];

export default function Home() {
  return <main>
    <section className="hero page-shell"><div className="hero-copy"><p className="eyebrow">Nails, thoughtfully done</p><h1>Your next favourite set starts here.</h1><p className="lede">A modern nail studio for considered details, soft confidence and a little everyday luxury.</p><Link className="button button-dark" href="/book">Book Appointment <span>↗</span></Link></div><div className="hero-art" aria-label="Nail studio image placeholder"><span>your next<br />precious set</span></div></section>
    <section className="section page-shell"><div className="section-heading"><div><p className="eyebrow">A little luxury</p><h2>Made for your hands.</h2></div><Link className="text-link" href="/services">View services <span>↗</span></Link></div><div className="card-grid">{services.map((title, index) => <article className="service-card" key={title}><div className="card-number">0{index + 1}</div><h3>{title}</h3><p>A considered service for everyday luxury and beautifully finished details.</p><span className="card-arrow">↗</span></article>)}</div></section>
    <section className="feature-band page-shell"><div className="portfolio-art" aria-label="Portfolio image placeholder"><span>portfolio<br />preview</span></div><div className="feature-copy"><p className="eyebrow">The portfolio</p><h2>Details worth looking at twice.</h2><p>From barely-there neutrals to expressive little moments, explore the work behind The Precious Set.</p><Link className="text-link" href="/portfolio">See the portfolio <span>↗</span></Link></div></section>
    <section className="details-grid page-shell"><div><p className="eyebrow">Find us</p><h2>In the details.</h2><p>Location placeholder<br />London, United Kingdom</p></div><div><p className="eyebrow">Stay close</p><h2>@thepreciousset</h2><p>Instagram / TikTok placeholder</p></div></section>
  </main>;
}
