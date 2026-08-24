"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

type ManagedBooking = { bookingId: string; customerName: string; serviceName: string; bookingDate: string; startTime: string; endTime: string; status: string; startingPrice: number; };
function hashManageToken(token: string) { return crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)).then((buffer) => Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, "0")).join("")); }
function formatDate(date: string) { return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); }

export function ManageBooking() {
  const searchParams = useSearchParams(); const [booking, setBooking] = useState<ManagedBooking | null>(null); const [errorMessage, setErrorMessage] = useState(""); const [isLoading, setIsLoading] = useState(true); const [isCancelling, setIsCancelling] = useState(false); const token = searchParams.get("token");
  async function loadBooking() { if (!supabase || !token) { setErrorMessage("This booking link is incomplete."); setIsLoading(false); return; } const tokenHash = await hashManageToken(token); const { data, error } = await supabase.rpc("get_booking_by_manage_token", { token_hash: tokenHash }); if (error || !data?.length) setErrorMessage("This booking link is invalid or has expired."); else setBooking(data[0] as ManagedBooking); setIsLoading(false); }
  useEffect(() => { void loadBooking(); }, [token]);
  async function cancelBooking() { if (!supabase || !token) return; setIsCancelling(true); const tokenHash = await hashManageToken(token); const { error } = await supabase.rpc("cancel_booking_by_manage_token", { token_hash: tokenHash }); if (error) setErrorMessage(error.message); else await loadBooking(); setIsCancelling(false); }
  if (isLoading) return <section className="confirmation-page page-shell"><p className="eyebrow">Manage booking</p><h1>Loading…</h1></section>;
  if (!booking) return <section className="confirmation-page page-shell"><p className="eyebrow">Manage booking</p><h1>Booking not found</h1><p>{errorMessage}</p><Link className="text-link" href="/">Back to home</Link></section>;
  const canCancel = ["pending", "confirmed"].includes(booking.status);
  return <section className="manage-booking-page page-shell"><p className="eyebrow">Manage booking</p><div className="manage-booking-heading"><h1>{booking.serviceName}</h1><p>for <strong>{booking.customerName}</strong></p></div><div className="manage-booking-card"><div className="manage-booking-detail"><span className="detail-label">Date</span><strong>{formatDate(booking.bookingDate)}</strong></div><div className="manage-booking-detail"><span className="detail-label">Time</span><strong>{booking.startTime.slice(0, 5)}–{booking.endTime.slice(0, 5)}</strong></div><div className="manage-booking-detail"><span className="detail-label">Price</span><strong>£{Number(booking.startingPrice || 0).toFixed(2)}</strong></div><div className="manage-booking-detail"><span className="detail-label">Status</span><strong className={`status-pill status-${booking.status}`}>{booking.status}</strong></div></div>{canCancel ? <div className="manage-booking-actions"><p className="manage-booking-policy">Need to cancel? You can cancel online if there are at least 24 hours before your appointment.</p><button className="button decline-button" onClick={() => void cancelBooking()} disabled={isCancelling}>{isCancelling ? "Cancelling…" : "Cancel appointment"}</button></div> : <p className="form-error">This appointment can no longer be cancelled online. Please contact The Precious Set directly.</p>}{errorMessage && <p className="form-error">{errorMessage}</p>}<p className="manage-booking-back"><Link className="text-link" href="/">Back to The Precious Set</Link></p></section>;
}
