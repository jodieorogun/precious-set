import { PageIntro } from "../components/PageIntro";

export default function Info() {
  return <main><PageIntro eyebrow="Info" title="Good to know before your visit." description="A few simple details to help your appointment run smoothly." /><section className="page-shell simple-grid"><article><p className="eyebrow">01</p><h2>Before you arrive</h2><p>Please arrive on time with clean hands and let The Precious Set know about any allergies or sensitivities in advance.</p></article><article><p className="eyebrow">02</p><h2>Cancellations</h2><p>Please contact The Precious Set at least 24 hours before your appointment if you need to cancel. Include your name, appointment date and time so the request can be handled quickly.</p></article><article><p className="eyebrow">03</p><h2>On the day</h2><p>Your booking is not confirmed until The Precious Set accepts your request. Please wait for the confirmation message before treating the appointment as final.</p></article></section></main>;
}
