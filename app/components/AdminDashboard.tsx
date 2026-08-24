"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Booking = { id: string; customerName: string; customerPhone: string; customerEmail: string | null; bookingDate: string; startTime: string; endTime: string; notes: string | null; status: string; services: { name: string } | null; };

function formatTime(time: string) { return time.slice(0, 5); }

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
    if (error) { setErrorMessage(error.message.includes("permission") ? "Your account does not have an admin role yet." : error.message); return; }
    setBookings((data ?? []) as Booking[]);
  }

  useEffect(() => {
    if (!supabase) { setIsLoading(false); return; }
    let isMounted = true;
    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      if (isMounted) { setSessionEmail(data.session?.user.email ?? null); setIsLoading(false); }
      if (data.session) await loadBookings();
    }
    void loadSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => { setSessionEmail(nextSession?.user.email ?? null); if (nextSession) void loadBookings(); });
    return () => { isMounted = false; listener.subscription.unsubscribe(); };
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) { setErrorMessage("Supabase is not configured."); return; }
    setIsSubmitting(true); setErrorMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErrorMessage(error.message);
    setIsSubmitting(false);
  }

  async function updateBooking(id: string, status: "confirmed" | "declined") {
    if (!supabase) return;
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) setErrorMessage(error.message);
    else setBookings((current) => current.map((booking) => booking.id === id ? { ...booking, status } : booking));
  }

  if (isLoading) return <section className="admin-panel">Loading dashboard…</section>;
  if (!supabase) return <section className="admin-panel"><p className="form-error">Add Supabase environment variables to use the dashboard.</p></section>;
  if (!sessionEmail) return <section className="admin-panel admin-login"><p className="eyebrow">Private studio area</p><h2>Admin sign in</h2><p>Sign in with your Supabase Auth email and password.</p><form className="admin-login-form" onSubmit={handleLogin}><label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Password<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>{errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}<button className="button button-dark submit-button" disabled={isSubmitting}>{isSubmitting ? "Signing in…" : "Sign in ↗"}</button></form></section>;

  return <section className="admin-panel"><div className="admin-heading"><div><p className="eyebrow">{sessionEmail}</p><h2>Booking requests</h2></div><button className="text-button" onClick={() => supabase.auth.signOut()}>Sign out</button></div>{errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}{bookings.length === 0 ? <div className="admin-empty"><span>✦</span><p>No booking requests yet.</p></div> : <div className="booking-list">{bookings.map((booking) => <article className="booking-row" key={booking.id}><div className="booking-main"><p className="eyebrow">{booking.status} · {booking.bookingDate} · {formatTime(booking.startTime)}–{formatTime(booking.endTime)}</p><h3>{booking.services?.name ?? "Service"}</h3><p>{booking.customerName} · {booking.customerPhone}{booking.customerEmail ? ` · ${booking.customerEmail}` : ""}</p>{booking.notes && <p className="booking-notes">“{booking.notes}”</p>}</div>{booking.status === "pending" && <div className="booking-actions"><button className="button approve-button" onClick={() => void updateBooking(booking.id, "confirmed")}>Confirm</button><button className="button decline-button" onClick={() => void updateBooking(booking.id, "declined")}>Decline</button></div>}</article>)}</div>}</section>;
}
