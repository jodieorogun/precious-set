"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Booking = { id: string; customerName: string; customerPhone: string; customerEmail: string | null; bookingDate: string; startTime: string; endTime: string; notes: string | null; status: string; services: { name: string } | null; };

function formatTime(time: string) { return time.slice(0, 5); }
function formatDate(date: string) { return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }); }
function isUpcoming(booking: Booking) { return booking.status === "confirmed" && booking.bookingDate >= new Date().toISOString().slice(0, 10); }

function BookingCard({ booking, onUpdate }: { booking: Booking; onUpdate: (id: string, status: "confirmed" | "declined" | "cancelled") => void }) {
  return <details className="booking-details"><summary><span><strong>{booking.services?.name ?? "Service"}</strong><small>{formatDate(booking.bookingDate)} · {formatTime(booking.startTime)}</small></span><span className={`status-pill status-${booking.status}`}>{booking.status}</span></summary><div className="booking-detail-body"><div className="booking-detail-grid"><div><span className="detail-label">Customer</span><p>{booking.customerName}</p></div><div><span className="detail-label">Phone</span><p>{booking.customerPhone}</p></div><div><span className="detail-label">Email</span><p>{booking.customerEmail || "Not provided"}</p></div><div><span className="detail-label">Appointment</span><p>{formatDate(booking.bookingDate)}<br />{formatTime(booking.startTime)}–{formatTime(booking.endTime)}</p></div></div>{booking.notes && <p className="booking-notes">“{booking.notes}”</p>}{booking.status === "pending" && <div className="booking-actions"><button className="button approve-button" onClick={() => onUpdate(booking.id, "confirmed")}>Confirm request</button><button className="button decline-button" onClick={() => onUpdate(booking.id, "declined")}>Decline</button></div>}{booking.status === "confirmed" && <div className="booking-actions"><button className="button decline-button" onClick={() => onUpdate(booking.id, "cancelled")}>Cancel appointment</button></div>}</div></details>;
}

export function AdminDashboard() {
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadBookings() {
    if (!supabase) return;
    const { data: roleData, error: roleError } = await supabase.from("admin_users").select("role").maybeSingle();
    if (roleError || !roleData || !["owner", "admin"].includes(roleData.role)) { setErrorMessage("Your account does not have an admin role yet."); return; }
    const { data, error } = await supabase.from("bookings").select("id, customerName, customerPhone, customerEmail, bookingDate, startTime, endTime, notes, status, services(name)").order("bookingDate", { ascending: true }).order("startTime", { ascending: true });
    if (error) { setErrorMessage(error.message); return; }
    setBookings((data ?? []) as Booking[]);
  }

  useEffect(() => {
    if (!supabase) { setIsLoading(false); return; }
    let isMounted = true;
    async function loadSession() { const { data } = await supabase.auth.getSession(); if (isMounted) { setSessionEmail(data.session?.user.email ?? null); setIsLoading(false); } if (data.session) await loadBookings(); }
    void loadSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => { setSessionEmail(nextSession?.user.email ?? null); if (nextSession) void loadBookings(); });
    return () => { isMounted = false; listener.subscription.unsubscribe(); };
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!supabase) { setErrorMessage("Supabase is not configured."); return; } setIsSubmitting(true); setErrorMessage(""); const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) setErrorMessage(error.message); setIsSubmitting(false); }
  async function updateBooking(id: string, status: "confirmed" | "declined" | "cancelled") { if (!supabase) return; const { error } = await supabase.from("bookings").update({ status }).eq("id", id); if (error) setErrorMessage(error.message); else setBookings((current) => current.map((booking) => booking.id === id ? { ...booking, status } : booking)); }

  if (isLoading) return <section className="admin-panel">Loading dashboard…</section>;
  if (!supabase) return <section className="admin-panel"><p className="form-error">Add Supabase environment variables to use the dashboard.</p></section>;
  if (!sessionEmail) return <section className="admin-panel admin-login"><form className="admin-login-form" onSubmit={handleLogin}><label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Password<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>{errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}<button className="button button-dark submit-button" disabled={isSubmitting}>{isSubmitting ? "Signing in…" : "Sign in ↗"}</button></form></section>;

  const pendingBookings = bookings.filter((booking) => booking.status === "pending");
  const upcomingBookings = bookings.filter(isUpcoming);
  return <section className="admin-panel"><div className="admin-heading"><div><p className="eyebrow">{sessionEmail}</p><h2>Studio overview</h2></div><button className="text-button" onClick={() => supabase.auth.signOut()}>Sign out</button></div>{errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}<div className="admin-stats"><div><strong>{pendingBookings.length}</strong><span>Pending requests</span></div><div><strong>{upcomingBookings.length}</strong><span>Upcoming appointments</span></div></div><section className="admin-section"><div className="admin-section-heading"><div><p className="eyebrow">Needs your attention</p><h3>Pending requests</h3></div></div>{pendingBookings.length ? <div className="booking-list">{pendingBookings.map((booking) => <BookingCard key={booking.id} booking={booking} onUpdate={(id, status) => void updateBooking(id, status)} />)}</div> : <div className="admin-empty"><span>✦</span><p>No pending requests.</p></div>}</section><section className="admin-section"><div className="admin-section-heading"><div><p className="eyebrow">Your diary</p><h3>Upcoming appointments</h3></div></div>{upcomingBookings.length ? <div className="booking-list">{upcomingBookings.map((booking) => <BookingCard key={booking.id} booking={booking} onUpdate={(id, status) => void updateBooking(id, status)} />)}</div> : <div className="admin-empty"><span>✦</span><p>No upcoming appointments yet.</p></div>}</section></section>;
}
