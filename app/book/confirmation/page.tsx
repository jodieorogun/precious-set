"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function Confirmation() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  return <main><section className="confirmation-page page-shell"><span className="confirmation-mark">✦</span><p className="eyebrow">Request received</p><h1>Booking request sent 💅</h1><p>Your appointment isn’t confirmed yet.<br />The Precious Set will contact you once your request has been accepted.</p><p className="confirmation-note">Need to cancel later? Please contact The Precious Set at least 24 hours before your appointment with your name, date and time.</p><div className="confirmation-actions">{token && <Link className="button button-dark" href={`/booking/manage?token=${encodeURIComponent(token)}`}>Manage booking ↗</Link>}<Link className="text-link" href="/">Back to home</Link><Link className="text-link" href="/services">View services</Link></div></section></main>;
}
