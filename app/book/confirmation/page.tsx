"use client";

import { useSearchParams } from "next/navigation";

export default function Confirmation() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  return <main><section className="confirmation-page page-shell"><span className="confirmation-mark">✦</span><p className="eyebrow">Request received</p><h1>Booking request sent 💅</h1><p>Your appointment isn’t confirmed yet.<br />The Precious Set will contact you once your request has been accepted.</p><p className="confirmation-note">Keep your manage booking link to view updates or cancel online at least 24 hours before your appointment.</p><div className="confirmation-actions">{token && <a className="button button-dark" href={`/booking/manage?token=${encodeURIComponent(token)}`}>Manage booking ↗</a>}<a className="text-link" href="/">Back to home</a><a className="text-link" href="/services">View services</a></div></section></main>;
}
