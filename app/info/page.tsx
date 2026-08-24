import { PageIntro } from "../components/PageIntro";

const infoItems = [
  ["01", "Before you arrive", "Please arrive on time with clean hands and let The Precious Set know about any allergies or sensitivities in advance."],
  ["02", "Cancellations", "Please contact The Precious Set at least 24 hours before your appointment if you need to cancel. Include your name, appointment date and time so the request can be handled quickly."],
  ["03", "On the day", "Your booking is not confirmed until The Precious Set accepts your request. Please wait for the confirmation message before treating the appointment as final."],
];

export default function Info() {
  return <main className="info-page"><PageIntro eyebrow="Info" title="Good to know before your visit." description="A few simple details to help your appointment run smoothly." /><section className="page-shell info-accordion" aria-label="Appointment information">{infoItems.map(([number, title, copy], index) => <details className="info-item" open={index === 0} key={title}><summary><span>{number}</span><strong>{title}</strong><b>+</b></summary><div><p>{copy}</p></div></details>)}</section></main>;
}
