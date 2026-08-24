import Link from "next/link";

export default function BookingConfirmation() {
  return <main><section className="confirmation-page page-shell"><span className="confirmation-mark">✦</span><p className="eyebrow">Request received</p><h1>Booking request sent 💅</h1><p>Your appointment isn’t confirmed yet.<br />The Precious Set will contact you once your request has been accepted.</p><p className="confirmation-note">Need to cancel later? Please contact The Precious Set at least 24 hours before your appointment with your name, date and time.</p><div className="confirmation-actions"><Link className="button button-dark" href="/">Back to home</Link><Link className="text-link" href="/services">View services</Link></div></section></main>;
}
