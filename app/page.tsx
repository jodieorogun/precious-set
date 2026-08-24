import Image from "next/image";
import Link from "next/link";

const services = [
  ["Gel-X Extensions", "Lightweight length with a polished, glossy finish.", "01"],
  ["Gel on Natural Nails", "Clean, glossy colour for your own nails.", "02"],
  ["Refills", "A fresh, tidy refresh for your current set.", "03"],
];

export default function Home() {
  return <main className="home-new">
    <section className="home-hero page-shell">
      <div className="home-hero-copy"><p className="eyebrow">Leeds · The Precious Set</p><h1>Your nails,<br /><em>considered.</em></h1><p className="lede">A modern nail studio for glossy finishes, good details and sets that feel like you.</p><div className="hero-actions"><Link className="button button-dark" href="/book">Book an appointment <span>↗</span></Link><Link className="hero-secondary-link" href="/portfolio">View portfolio <span>↓</span></Link></div></div>
      <div className="home-hero-visual"><div className="hero-visual-frame"><Image src="/portfolio/03.jpeg" alt="French tip nail set by The Precious Set" width={700} height={850} priority /></div><div className="hero-visual-note">Real sets<br />from Leeds</div><div className="hero-visual-logo"><Image src="/precious-set-logo.png" alt="" width={180} height={140} /></div></div>
      <div className="home-hero-index">01 <span /> 04</div>
    </section>
    <section className="home-intro page-shell"><p className="eyebrow">The studio</p><h2>Small details make<br /><em>the whole set.</em></h2><p>From a clean gel finish to something more expressive, every appointment is shaped around the look you want to leave with.</p></section>
    <section className="home-services page-shell"><div className="section-line"><p className="eyebrow">01 / Services</p><Link className="text-link" href="/services">See the full menu <span>↗</span></Link></div><div className="home-service-list">{services.map(([title, description, number]) => <Link className="home-service-row" href="/book" key={title}><span className="row-number">{number}</span><h3>{title}</h3><p>{description}</p><span className="row-arrow">↗</span></Link>)}</div></section>
    <section className="home-portfolio page-shell"><div className="portfolio-copy"><p className="eyebrow">02 / Portfolio</p><h2>Real work.<br /><em>Real hands.</em></h2><p>A selection of sets created at The Precious Set. Bring an idea, save a reference or start from scratch.</p><Link className="text-link" href="/portfolio">Explore the portfolio <span>↗</span></Link></div><div className="portfolio-strip"><Image src="/portfolio/08.jpeg" alt="Detailed nail set by The Precious Set" width={480} height={620} /><Image src="/portfolio/13.jpeg" alt="Pink nail set by The Precious Set" width={480} height={620} /></div></section>
    <section className="home-footer-feature page-shell"><div><p className="eyebrow">03 / Find us</p><h2>Leeds<span>✦</span></h2><p>Appointments by request. Studio details are shared after your booking is confirmed.</p></div><div><p className="eyebrow">04 / Keep in touch</p><a href="https://www.instagram.com/the_precious_set/" target="_blank" rel="noreferrer">@the_precious_set ↗</a><p>New sets and studio updates on Instagram.</p></div></section>
  </main>;
}
