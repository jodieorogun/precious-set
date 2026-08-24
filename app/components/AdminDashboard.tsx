"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { OpeningHoursSettings } from "./OpeningHoursSettings";

type Booking = { id: string; customerUserId: string | null; customerName: string; customerPhone: string; customerEmail: string | null; serviceId: string; bookingDate: string; startTime: string; endTime: string; notes: string | null; status: string; services: { name: string; startingPrice: number } | null; };
type Service = { id: string; name: string; durationMinutes: number; startingPrice: number; };
type BookingStatus = "confirmed" | "declined" | "cancelled" | "completed";
const timeOptions = ["10:00", "12:00", "14:00", "16:00", "18:00"];

function formatTime(time: string) { return time.slice(0, 5); }
function formatDate(date: string) { return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }); }
function todayString() { return new Date().toISOString().slice(0, 10); }
function isUpcoming(booking: Booking) { return booking.status === "confirmed" && booking.bookingDate >= todayString(); }
function getEndTime(startTime: string, durationMinutes: number) { const [hours, minutes] = startTime.split(":").map(Number); const end = new Date(2000, 0, 1, hours, minutes + durationMinutes); return `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`; }
function encodeWhatsAppMessage(message: string) {
  return encodeURIComponent(message)
    .replaceAll("__HEART__", "%F0%9F%92%95")
    .replaceAll("__NAIL__", "%F0%9F%92%85")
    .replaceAll("__SPARKLES__", "%E2%9C%A8");
}

function getWhatsAppLink(booking: Booking, kind: "confirmed" | "modify" = "confirmed", changedDetails?: { bookingDate: string; startTime: string; endTime: string }) {
  const phone = booking.customerPhone.replace(/\D/g, "");
  const date = changedDetails?.bookingDate ?? booking.bookingDate;
  const time = changedDetails?.startTime ?? booking.startTime;
  const endTime = changedDetails?.endTime ?? booking.endTime;
  const message = kind === "modify"
    ? `Hi ${booking.customerName} __HEART__ Thanks for booking with *The Precious Set*. Unfortunately, we’ll need to make a small change to your appointment.\nWould you be available for *${formatDate(date)} at ${formatTime(time)}–${formatTime(endTime)}* instead?\nPlease let us know if this works for you, or we can find another suitable time __NAIL__`
    : `Hi ${booking.customerName} __HEART__ Your appointment with *The Precious Set* has been confirmed!\n*Service:* ${booking.services?.name ?? "Appointment"}\n*Date:* ${formatDate(date)}\n*Time:* ${formatTime(time)}–${formatTime(endTime)}\n*Price:* £${Number(booking.services?.startingPrice ?? 0).toFixed(2)}\nCan’t wait to see you __NAIL____SPARKLES__`;
  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeWhatsAppMessage(message)}`;
}

function BookingCard({ booking, services, onUpdate, onModify }: { booking: Booking; services: Service[]; onUpdate: (id: string, status: BookingStatus) => void; onModify: (id: string, updates: { serviceId: string; bookingDate: string; startTime: string; endTime: string }) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [serviceId, setServiceId] = useState(booking.serviceId);
  const [bookingDate, setBookingDate] = useState(booking.bookingDate);
  const [startTime, setStartTime] = useState(formatTime(booking.startTime));
  const selectedService = services.find((service) => service.id === serviceId);
  function saveChanges() { if (!selectedService || !bookingDate || !startTime) return; onModify(booking.id, { serviceId, bookingDate, startTime, endTime: getEndTime(startTime, selectedService.durationMinutes) }); setIsEditing(false); }
  return <details className="booking-details"><summary><span><strong>{booking.services?.name ?? "Service"}</strong><small>{formatDate(booking.bookingDate)} · {formatTime(booking.startTime)}</small></span><span className={`status-pill status-${booking.status}`}>{booking.status}</span></summary><div className="booking-detail-body">{isEditing ? <div className="modify-form"><label>Service<select value={serviceId} onChange={(event) => setServiceId(event.target.value)}>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></label><label>Date<input type="date" min={todayString()} value={bookingDate} onChange={(event) => setBookingDate(event.target.value)} /></label><label>Time<select value={startTime} onChange={(event) => setStartTime(event.target.value)}>{timeOptions.map((time) => <option key={time} value={time}>{time}</option>)}</select></label><div className="booking-actions"><button className="button approve-button" onClick={saveChanges}>Save changes</button><a className="button whatsapp-button" href={getWhatsAppLink(booking, "modify", { bookingDate, startTime, endTime: getEndTime(startTime, selectedService?.durationMinutes ?? 0) })} target="_blank" rel="noreferrer">Message change ↗</a><button className="button decline-button" onClick={() => setIsEditing(false)}>Cancel edit</button></div></div> : <><div className="booking-detail-grid"><div><span className="detail-label">Customer</span><p>{booking.customerName}</p></div><div><span className="detail-label">Phone</span><p>{booking.customerPhone}</p></div><div><span className="detail-label">Email</span><p>{booking.customerEmail || "Not provided"}</p></div><div><span className="detail-label">Appointment</span><p>{formatDate(booking.bookingDate)}<br />{formatTime(booking.startTime)}–{formatTime(booking.endTime)}</p></div><div><span className="detail-label">Price</span><p>£{Number(booking.services?.startingPrice ?? 0).toFixed(2)}</p></div></div>{booking.notes && <p className="booking-notes">“{booking.notes}”</p>}<div className="booking-actions"><a className="button whatsapp-button" href={getWhatsAppLink(booking)} target="_blank" rel="noreferrer">WhatsApp customer ↗</a>{booking.status !== "completed" && booking.status !== "cancelled" && <button className="button decline-button" onClick={() => setIsEditing(true)}>Modify appointment</button>}{booking.status === "pending" && <><button className="button approve-button" onClick={() => onUpdate(booking.id, "confirmed")}>Confirm request</button><button className="button decline-button" onClick={() => onUpdate(booking.id, "declined")}>Decline</button></>}{booking.status === "confirmed" && <><button className="button approve-button" onClick={() => onUpdate(booking.id, "completed")}>Was this appointment completed?</button><button className="button decline-button" onClick={() => onUpdate(booking.id, "cancelled")}>Cancel appointment</button></>}</div></>}</div></details>;
}

function BookingSection({ label, title, bookings, services, onUpdate, onModify, emptyText, previewLimit, viewLink, showHeading = true }: { label: string; title: string; bookings: Booking[]; services: Service[]; onUpdate: (id: string, status: BookingStatus) => void; onModify: (id: string, updates: { serviceId: string; bookingDate: string; startTime: string; endTime: string }) => void; emptyText: string; previewLimit?: number; viewLink?: string; showHeading?: boolean }) {
  const visibleBookings = previewLimit ? bookings.slice(0, previewLimit) : bookings;
  return <section className="admin-section">{showHeading && <div className="admin-section-heading"><div><p className="eyebrow">{label}</p><h3>{title}</h3></div>{viewLink && bookings.length > 3 && <Link className="admin-section-link" href={viewLink}>View all <span>↗</span></Link>}</div>}{visibleBookings.length ? <div className="booking-list">{visibleBookings.map((booking) => <BookingCard key={booking.id} booking={booking} services={services} onUpdate={onUpdate} onModify={onModify} />)}</div> : <div className="admin-empty"><span>✦</span><p>{emptyText}</p></div>}</section>;
}

export function AdminDashboard() {
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true); const [isSubmitting, setIsSubmitting] = useState(false); const [errorMessage, setErrorMessage] = useState("");
  const pathname = usePathname(); const searchParams = useSearchParams();

  async function loadBookings() {
    if (!supabase) return;
    const { data: roleData, error: roleError } = await supabase.from("admin_users").select("role").maybeSingle();
    if (roleError || !roleData || !["owner", "admin"].includes(roleData.role)) { setErrorMessage("Your account does not have an admin role yet."); return; }
    const [{ data: bookingData, error: bookingError }, { data: serviceData }] = await Promise.all([supabase.from("bookings").select("id, customerUserId, customerName, customerPhone, serviceId, bookingDate, startTime, endTime, notes, status, services(name, startingPrice)").order("bookingDate", { ascending: true }).order("startTime", { ascending: true }), supabase.from("services").select("id, name, durationMinutes, startingPrice").eq("isActive", true).order("name")]);
    if (bookingError) { setErrorMessage(bookingError.message); return; }
    const bookingsWithInspo = await Promise.all(((bookingData ?? []) as Booking[]).map(async (booking) => { if (!booking.inspoImageUrl || !supabase) return booking; const { data } = await supabase.storage.from("booking-inspo").createSignedUrl(booking.inspoImageUrl, 3600); return { ...booking, inspoImageUrl: data?.signedUrl ?? null }; })); setBookings(bookingsWithInspo); setServices((serviceData ?? []) as Service[]);
  }

  useEffect(() => { if (!supabase) { setIsLoading(false); return; } let isMounted = true; async function loadSession() { const { data } = await supabase.auth.getSession(); if (isMounted) { setSessionEmail(data.session?.user.email ?? null); setIsLoading(false); } if (data.session) await loadBookings(); } void loadSession(); const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => { setSessionEmail(nextSession?.user.email ?? null); if (nextSession) void loadBookings(); }); return () => { isMounted = false; listener.subscription.unsubscribe(); }; }, []);
  async function handleLogin(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!supabase) return; setIsSubmitting(true); setErrorMessage(""); const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) setErrorMessage(error.message); setIsSubmitting(false); }
  async function updateBooking(id: string, status: BookingStatus) { if (!supabase) return; const { error } = await supabase.from("bookings").update({ status }).eq("id", id); if (error) setErrorMessage(error.message); else setBookings((current) => current.map((booking) => booking.id === id ? { ...booking, status } : booking)); }
  async function modifyBooking(id: string, updates: { serviceId: string; bookingDate: string; startTime: string; endTime: string }) { if (!supabase) return; const { error } = await supabase.from("bookings").update(updates).eq("id", id); if (error) { setErrorMessage(error.message); return; } await loadBookings(); }

  if (isLoading) return <section className="admin-panel">Loading dashboard…</section>;
  if (!supabase) return <section className="admin-panel"><p className="form-error">Add Supabase environment variables to use the dashboard.</p></section>;
  if (!sessionEmail) return <section className="admin-panel admin-login"><h1>Admin Sign In</h1><form className="admin-login-form" onSubmit={handleLogin}><label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Password<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>{errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}<button className="button button-dark submit-button" disabled={isSubmitting}>{isSubmitting ? "Signing in…" : "Sign in ↗"}</button></form></section>;

  const pendingBookings = bookings.filter((booking) => booking.status === "pending").sort((a, b) => a.bookingDate.localeCompare(b.bookingDate) || a.startTime.localeCompare(b.startTime));
  const todayBookings = bookings.filter((booking) => booking.bookingDate === todayString() && booking.status === "confirmed").sort((a, b) => a.startTime.localeCompare(b.startTime));
  const upcomingBookings = bookings.filter(isUpcoming).sort((a, b) => a.bookingDate.localeCompare(b.bookingDate) || a.startTime.localeCompare(b.startTime));
  const completedBookings = bookings.filter((booking) => booking.status === "completed").sort((a, b) => a.bookingDate.localeCompare(b.bookingDate) || a.startTime.localeCompare(b.startTime));
  const allBookings = bookings.slice().sort((a, b) => a.bookingDate.localeCompare(b.bookingDate) || a.startTime.localeCompare(b.startTime));
  const detailView = searchParams.get("view");
  if (pathname.startsWith("/admin/appointments")) { const detailBookings = detailView === "pending" ? pendingBookings : detailView === "completed" ? completedBookings : detailView === "upcoming" ? upcomingBookings : allBookings; const detailTitle = detailView === "pending" ? "Pending appointments" : detailView === "completed" ? "Completed appointments" : detailView === "upcoming" ? "Upcoming appointments" : "All appointments"; return <section className="admin-panel"><div className="admin-heading"><div><p className="eyebrow">Full history</p><h2>{detailTitle}</h2></div><Link className="text-button" href="/admin">← Dashboard</Link></div>{errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}<BookingSection label="Appointments" title={detailTitle} bookings={detailBookings} services={services} onUpdate={updateBooking} onModify={modifyBooking} emptyText="No appointments in this section." showHeading={false} /></section>; }
  return <section className="admin-panel"><div className="admin-heading"><div><p className="eyebrow">{sessionEmail}</p><h2>Studio overview</h2></div><button className="text-button" onClick={() => supabase.auth.signOut()}>Sign out</button></div>{errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}<div className="admin-stats"><div><strong>{todayBookings.length}</strong><span>Today</span></div><div><strong>{pendingBookings.length}</strong><span>Pending</span></div><div><strong>{upcomingBookings.length}</strong><span>Upcoming</span></div><div><strong>{completedBookings.length}</strong><span>Completed</span></div><div><strong>{allBookings.length}</strong><span>All appointments</span></div></div><OpeningHoursSettings /><BookingSection label="Needs attention" title="Pending appointments" bookings={pendingBookings} services={services} previewLimit={3} viewLink="/admin/appointments?view=pending" onUpdate={updateBooking} onModify={modifyBooking} emptyText="No pending appointments." /><BookingSection label="Today" title="Appointments today" bookings={todayBookings} services={services} onUpdate={updateBooking} onModify={modifyBooking} emptyText="Nothing scheduled today." /><BookingSection label="Your diary" title="Upcoming appointments" bookings={upcomingBookings} services={services} previewLimit={3} viewLink="/admin/appointments?view=upcoming" onUpdate={updateBooking} onModify={modifyBooking} emptyText="No upcoming appointments yet." /><BookingSection label="Finished" title="Completed appointments" bookings={completedBookings} services={services} previewLimit={3} viewLink="/admin/appointments?view=completed" onUpdate={updateBooking} onModify={modifyBooking} emptyText="No completed appointments yet." /><BookingSection label="Full history" title="All appointments" bookings={allBookings} services={services} previewLimit={3} viewLink="/admin/appointments?view=all" onUpdate={updateBooking} onModify={modifyBooking} emptyText="No appointments yet." /></section>;
}
