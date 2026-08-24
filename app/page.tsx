import Image from "next/image";
import Link from "next/link";

const services = [
  ["Gel-X Extensions", "Lightweight length with a polished, glossy finish.", "01", "from the studio"],
  ["Gel on Natural Nails", "Clean, glossy colour for your own nails.", "02", "your nails, elevated"],
  ["Refills", "A fresh, tidy refresh for your current set.", "03", "keep the magic"],
];

export default function Home() {
  return <main>
    <section className="hero hero-expressive page-shell">
      <div className="hero-orbit hero-orbit-one" />
      <div className="hero-orbit hero-orbit-two" />
      <div className="hero-copy">
        <div className="hero-kicker"><span>✦</span> Leeds nail studio <span>✦</span></div>
        <h1>Make your<br /><em>moment</em><br />shiny.</h1>
        <p className="lede">Beautiful sets, tiny details and a little bit of main-character energy for your hands.</p>
        <div className="hero-actions"><Link className="button button-dark" href="/book">Find your set <span>↗</span></Link><Link className="hero-secondary-link" href="/portfolio">See the work <span>↓</span></Link></div>
        <div className="hero-proof"><span className="proof-dots">● ● ●</span><span>made with care<br /><b>in Leeds</b></span></div>
      </div>
      <div className="hero-art">
        <div className="hero-sticker">your next<br /><b>favourite set</b><br />is here ✦</div>
        <div className="art-glow" />
        <Image src="/precious-set-logo.png" alt="The Precious Set logo" width={760} height={600} priority />
      </div>
    </section>
    <section className="marquee"><div>THE PRECIOUS SET <span>✦</span> NAILS WITH PERSONALITY <span>✦</span> LEEDS <span>✦</span> THE PRECIOUS SET <span>✦</span></div></section>
    <section className="section page-shell">
      <div className="section-heading expressive-heading"><div><p className="eyebrow">01 / Pick your energy</p><h2>Something for<br /><em>every mood.</em></h2></div><Link className="text-link" href="/services">All services <span>↗</span></Link></div>
      <div className="card-grid expressive-cards">{services.map(([title, description, number, tag]) => <article className="service-card expressive-card" key={title}><div className="card-topline"><span className="card-number">{number}</span><span className="service-tag">{tag}</span></div><h3>{title}</h3><p>{description}</p><Link className="card-arrow" href="/book" aria-label={`Book ${title}`}>↗</Link></article>)}</div>
    </section>
    <section className="feature-band feature-band-expressive page-shell">
      <div className="portfolio-art"><span>nails<br /><em>that feel</em><br />like you ✦</span><div className="art-caption">real sets / real sparkle</div></div>
      <div className="feature-copy"><p className="eyebrow">02 / The portfolio</p><h2>Go on.<br /><em>Have a look.</em></h2><p>Soft, glossy, detailed or extra—there is always room for one more idea.</p><Link className="text-link" href="/portfolio">Explore the sets <span>↗</span></Link></div>
    </section>
    <section className="details-grid page-shell expressive-details">
      <div className="location-card"><p className="eyebrow">03 / Find us</p><h2>Leeds<span>✦</span></h2><p>One lovely studio. Your next favourite appointment.</p><Link className="text-link" href="/info">Studio info <span>↗</span></Link></div>
      <div className="social-card"><p className="eyebrow">04 / Follow the sparkle</p><h2><a className="social-link" href="https://www.instagram.com/the_precious_set/" target="_blank" rel="noreferrer">@the_precious_set <span>↗</span></a></h2><p>New sets, tiny details and studio moments.</p><span className="social-sparkle">✦</span></div>
    </section>
  </main>;
}
