import { PageIntro } from "../components/PageIntro";

const portfolioImages = Array.from({ length: 15 }, (_, index) => `/portfolio/${String(index + 1).padStart(2, "0")}.jpeg`);

export default function Portfolio() { return <main className="portfolio-page"><PageIntro eyebrow="Portfolio" title="The work." description="A selection of real sets by The Precious Set." /><section className="page-shell portfolio-grid portfolio-grid-new" aria-label="The Precious Set nail portfolio">{portfolioImages.map((src, index) => <figure className="portfolio-photo" key={src}><img src={src} alt={`The Precious Set nail set ${index + 1}`} loading={index < 6 ? "eager" : "lazy"} /></figure>)}</section></main>; }
