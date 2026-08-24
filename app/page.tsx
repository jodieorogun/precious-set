import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return <main className="minimal-home">
    <section className="minimal-hero page-shell">
      <div className="minimal-hero-copy"><p className="eyebrow">The Precious Set · Leeds</p><h1>Pretty<br /><em>precise.</em></h1><Link className="minimal-book" href="/book">Book <span>↗</span></Link></div>
      <div className="minimal-hero-image"><Image src="/precious-set-logo.png" alt="The Precious Set" width={700} height={550} priority /></div>
    </section>
    <section className="minimal-links page-shell" aria-label="Explore The Precious Set">
      <Link href="/services"><span>01</span><strong>Services</strong><i>↗</i></Link>
      <Link href="/portfolio"><span>02</span><strong>Portfolio</strong><i>↗</i></Link>
      <div className="minimal-location"><span>03</span><strong>Find us</strong><b>Leeds</b></div>
      <a href="https://www.instagram.com/the_precious_set/" target="_blank" rel="noreferrer"><span>04</span><strong>Socials</strong><i>↗</i></a>
    </section>
    <section className="minimal-images page-shell" aria-label="Portfolio preview"><Image src="/portfolio/08.jpeg" alt="The Precious Set portfolio" width={500} height={620} /><Image src="/portfolio/13.jpeg" alt="The Precious Set portfolio" width={500} height={620} /><Image src="/portfolio/03.jpeg" alt="The Precious Set portfolio" width={500} height={620} /></section>
  </main>;
}
