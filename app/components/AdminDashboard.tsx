"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { OpeningHoursSettings } from "./OpeningHoursSettings";
import { TimeOffSettings } from "./TimeOffSettings";

type Booking = { id: string; createdAt: string; changeRequestDate: string | null; changeRequestStartTime: string | null; changeRequestEndTime: string | null; changeRequestStatus: string | null; customerUserId: string | null; customerName: string; customerPhone: string; customerEmail: string | null; serviceId: string; bookingDate: string; startTime: string; endTime: string; notes: string | null; addOns: string[] | null; addonPrice: number | null; status: string; services: { name: string; startingPrice: number } | null; };
type Service = { id: string; name: string; durationMinutes: number; startingPrice: number; };
type BookingStatus = "confirmed" | "declined" | "cancelled" | "completed";
type WhatsAppKind = "confirmed" | "modify" | "approvedChange";
const timeOptions = ["10:00", "12:00", "14:00", "16:00", "18:00"];

function formatTime(time: string) { return time.slice(0, 5); }
function formatTimeRange(startTime: string, endTime: string) { return `${formatTime(startTime)}–${formatTime(endTime)}`; }
function formatDate(date: string) { return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }); }
function todayString() { return new Date().toISOString().slice(0, 10); }
function isUpcoming(booking: Booking) { return booking.status === "confirmed" && booking.bookingDate >= todayString(); }
function getEndTime(startTime: string, durationMinutes: number) { const [hours, minutes] = startTime.split(":").map(Number); const end = new Date(2000, 0, 1, hours, minutes + durationMinutes); return `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`; }
function hashManageToken(token: string) { return crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)).then((buffer) => Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, "0")).join("")); }

function encodeWhatsAppMessage(message: string) {
  return encodeURIComponent(message)
    .replaceAll("__HEART__", "%F0%9F%92%95")
    .replaceAll("__NAIL__", "%F0%9F%92%85")
    .replaceAll("__SPARKLES__", "%E2%9C%A8");
}

function getWhatsAppLink(booking: Booking, kind: WhatsAppKind = "confirmed", changedDetails?: { bookingDate: string; startTime: string; endTime: string }, manageUrl?: string) {
  const phone = booking.customerPhone.replace(/\D/g, "");
  const date = changedDetails?.bookingDate ?? booking.bookingDate;
  const time = changedDetails?.startTime ?? booking.startTime;
  const endTime = changedDetails?.endTime ?? booking.endTime;
  const message = kind === "modify"
    ? `Hi ${booking.customerName} __HEART__ Thanks for booking with *The Precious Set*. Unfortunately, we’ll need to make a small change to your appointment.\nWould you be available for *${formatDate(date)} at ${formatTimeRange(time, endTime)}* instead?\nPlease let us know if this works for you, or we can find another suitable time __NAIL__${manageUrl ? `\n\nManage your booking: ${manageUrl}` : ""}`
    : kind === "approvedChange"
      ? `Hi ${booking.customerName} __HEART__ Your appointment change has been approved!\n*Service:* ${booking.services?.name ?? "Appointment"}\n*New date:* ${formatDate(date)}\n*New time:* ${formatTimeRange(time, endTime)}\nSee you then __NAIL____SPARKLES__${manageUrl ? `\n\nManage your booking: ${manageUrl}` : ""}`
      : `Hi ${booking.customerName} __HEART__ Your appointment with *The Precious Set* has been confirmed!\n*Service:* ${booking.services?.name ?? "Appointment"}\n*Date:* ${formatDate(date)}\n*Time:* ${formatTimeRange(time, endTime)}\n*Price:* £${(Number(booking.services?.startingPrice ?? 0) + Number(booking.addonPrice ?? 0)).toFixed(2)}${booking.addOns?.includes("Nail Art & Charms") ? " + Nail Art & Charms (£5–£12 depending on design difficulty)" : ""}\nCan’t wait to see you __NAIL____SPARKLES__${manageUrl ? `\n\nManage your booking: ${manageUrl}` : ""}`;
  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeWhatsAppMessage(message)}`;
}

async function createManageUrl(bookingId: string) {
  if (!supabase) return null;
  const token = crypto.randomUUID();
  const manageTokenHash = await hashManageToken(token);
  const { error } = await supabase.from("bookings").update({ manageTokenHash }).eq("id", bookingId);
  return error ? null : `${window.location.origin}/booking/manage?token=${encodeURIComponent(token)}`;
}

function WhatsAppButton({ booking, kind = "confirmed", changedDetails, label }: { booking: Booking; kind?: WhatsAppKind; changedDetails?: { bookingDate: string; startTime: string; endTime: string }; label: string }) {
  const [isOpening, setIsOpening] = useState(false);
  async function openWhatsApp() {
    setIsOpening(true);
    const manageUrl = await createManageUrl(booking.id);
    if (manageUrl) window.open(getWhatsAppLink(booking, kind, changedDetails, manageUrl), "_blank", "noopener,noreferrer");
    setIsOpening(false);
  }
  return <button className="button whatsapp-button" type="button" onClick={() => void openWhatsApp()} disabled={isOpening}>{isOpening ? "Preparing message…" : `${label} ↗`}</button>;
}

function BookingCard({ booking, services, onUpdate, onModify }: { booking: Booking; services: Service[]; onUpdate: (id: string, status: BookingStatus) => void; onModify: (id: string, updates: { serviceId: string; bookingDate: string; startTime: string; endTime: string }) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [serviceId, setServiceId] = useState(booking.serviceId);
  const [bookingDate, setBookingDate] = useState(booking.bookingDate);
  const [startTime, setStartTime] = useState(formatTime(booking.startTime));
  const selectedService = services.find((service) => service.id === serviceId);
  function saveChanges() { if (!selectedService || !bookingDate || !startTime) return; onModify(booking.id, { serviceId, bookingDate, startTime, endTime: getEndTime(startTime, selectedService.durationMinutes) }); setIsEditing(false); }
  return <details className="booking-details"><summary><span><strong>{booking.services?.name ?? "Service"}</strong><small>{formatDate(booking.bookingDate)} · {formatTime(booking.startTime)}</small></span><span className={`status-pill status-${booking.status}`}>{booking.status}</span></summary><div className="booking-detail-body">{isEditing ? <div className="modify-form"><label>Service<select value={serviceId} onChange={(event) => setServiceId(event.target.value)}>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></label><label>Date<input type="date" min={todayString()} value={bookingDate} onChange={(event) => setBookingDate(event.target.value)} /></label><label>Time<select value={startTime} onChange={(event) => setStartTime(event.target.value)}>{timeOptions.map((time) => <option key={time} value={time}>{time}</option>)}</select></label><div className="booking-actions"><button className="button approve-button" onClick={saveChanges}>Save changes</button><WhatsAppButton booking={booking} kind="modify" changedDetails={{ bookingDate, startTime, endTime: getEndTime(startTime, selectedService?.durationMinutes ?? 0) }} label="Message change" /><button className="button decline-button" onClick={() => setIsEditing(false)}>Cancel edit</button></div></div> : <><div className="booking-detail-grid"><div><span className="detail-label">Customer</span><p>{booking.customerName}</p></div><div><span className="detail-label">Phone</span><p>{booking.customerPhone}</p></div><div><span className="detail-label">Email</span><p>{booking.customerEmail || "Not provided"}</p></div><div><span className="detail-label">Appointment</span><p>{formatDate(booking.bookingDate)}<br />{formatTime(booking.startTime)}–{formatTime(booking.endTime)}</p></div><div><span className="detail-label">Price</span><p>£{(Number(booking.services?.startingPrice ?? 0) + Number(booking.addonPrice ?? 0)).toFixed(2)}{booking.addOns?.includes("Nail Art & Charms") ? " + £5–£12 depending on design difficulty" : ""}</p></div></div>{booking.status === "confirmed" && booking.changeRequestStatus === "pending" && <p className="booking-change-request"><strong>Change requested:</strong> {booking.changeRequestDate ? formatDate(booking.changeRequestDate) : "Date pending"} {booking.changeRequestStartTime && booking.changeRequestEndTime ? `${formatTimeRange(booking.changeRequestStartTime, booking.changeRequestEndTime)}` : ""}</p>}{booking.addOns?.length ? <p className="booking-notes">Extras: {booking.addOns.join(", ")}</p> : null}{booking.notes && <p className="booking-notes">“{booking.notes}”</p>}<div className="booking-actions"><WhatsAppButton booking={booking} label="WhatsApp customer" />{booking.status !== "completed" && booking.status !== "cancelled" && <button className="button decline-button" onClick={() => setIsEditing(true)}>Modify appointment</button>}{booking.status === "confirmed" && booking.changeRequestStatus === "pending" && <><WhatsAppButton booking={booking} kind="approvedChange" changedDetails={{ bookingDate: booking.changeRequestDate!, startTime: booking.changeRequestStartTime!.slice(0, 5), endTime: booking.changeRequestEndTime!.slice(0, 5) }} label="Send approval message" /><button className="button approve-button" onClick={() => onModify(booking.id, { serviceId: booking.serviceId, bookingDate: booking.changeRequestDate!, startTime: booking.changeRequestStartTime!.slice(0, 5), endTime: booking.changeRequestEndTime!.slice(0, 5) })}>Approve change</button><button className="button decline-button" onClick={() => void supabase?.from("bookings").update({ changeRequestStatus: "declined" }).eq("id", booking.id)}>Decline change</button></>}{booking.status === "pending" && <><button className="button approve-button" onClick={() => onUpdate(booking.id, "confirmed")}>Confirm request</button><button className="button decline-button" onClick={() => onUpdate(booking.id, "declined")}>Decline</button></>}{booking.status === "confirmed" && <><button className="button approve-button" onClick={() => onUpdate(booking.id, "completed")}>Was this appointment completed?</button><button className="button decline-button" onClick={() => onUpdate(booking.id, "cancelled")}>Cancel appointment</button></>}</div></>}</div></details>;
}

function BookingSection({ label, title, bookings, services, onUpdate, onModify, emptyText, previewLimit, viewLink, showHeading = true, recentFirst = false }: { label: string; title: string; bookings: Booking[]; services: Service[]; onUpdate: (id: string, status: BookingStatus) => void; onModify: (id: string, updates: { serviceId: string; bookingDate: string; startTime: string; endTime: string }) => void; emptyText: string; previewLimit?: number; viewLink?: string; showHeading?: boolean; recentFirst?: boolean }) {
  const visibleBookings = previewLimit ? (recentFirst ? bookings.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, previewLimit) : bookings.slice(0, previewLimit)) : bookings;
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
    const [{ data: bookingData, error: bookingError }, { data: serviceData }] = await Promise.all([supabase.from("bookings").select("id, createdAt, changeRequestDate, changeRequestStartTime, changeRequestEndTime, changeRequestStatus, customerUserId, customerName, customerPhone, serviceId, bookingDate, startTime, endTime, notes, addOns, addonPrice, status, services(name, startingPrice)").order("bookingDate", { ascending: true }).order("startTime", { ascending: true }), supabase.from("services").select("id, name, durationMinutes, startingPrice").eq("isActive", true).order("name")]);
    if (bookingError) { setErrorMessage(bookingError.message); return; }
    const bookingsWithInspo = await Promise.all(((bookingData ?? []) as Booking[]).map(async (booking) => { if (!booking.inspoImageUrl || !supabase) return booking; const { data } = await supabase.storage.from("booking-inspo").createSignedUrl(booking.inspoImageUrl, 3600); return { ...booking, inspoImageUrl: data?.signedUrl ?? null }; })); setBookings(bookingsWithInspo); setServices((serviceData ?? []) as Service[]);
  }

  useEffect(() => { if (!supabase) { setIsLoading(false); return; } let isMounted = true; async function loadSession() { const { data } = await supabase.auth.getSession(); if (isMounted) { setSessionEmail(data.session?.user.email ?? null); setIsLoading(false); } if (data.session) await loadBookings(); } void loadSession(); const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => { setSessionEmail(nextSession?.user.email ?? null); if (nextSession) void loadBookings(); }); return () => { isMounted = false; listener.subscription.unsubscribe(); }; }, []);
  async function handleLogin(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!supabase) return; setIsSubmitting(true); setErrorMessage(""); const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) setErrorMessage(error.message); setIsSubmitting(false); }
  async function updateBooking(id: string, status: BookingStatus) { if (!supabase) return; const { error } = await supabase.from("bookings").update({ status }).eq("id", id); if (error) setErrorMessage(error.message); else setBookings((current) => current.map((booking) => booking.id === id ? { ...booking, status } : booking)); }
  async function modifyBooking(id: string, updates: { serviceId: string; bookingDate: string; startTime: string; endTime: string }) { if (!supabase) return; const { error } = await supabase.from("bookings").update({ ...updates, changeRequestDate: null, changeRequestStartTime: null, changeRequestEndTime: null, changeRequestStatus: null }).eq("id", id); if (error) { setErrorMessage(error.message); return; } await loadBookings(); }

  if (isLoading) return <section className="admin-panel">Loading dashboard…</section>;
  if (!supabase) return <section className="admin-panel"><p className="form-error">Add Supabase environment variables to use the dashboard.</p></section>;
  if (!sessionEmail) return <section className="admin-panel admin-login"><h1>Admin Sign In</h1><form className="admin-login-form" onSubmit={handleLogin}><label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Password<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>{errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}<button className="button button-dark submit-button" disabled={isSubmitting}>{isSubmitting ? "Signing in…" : "Sign in ↗"}</button></form></section>;

  const pendingBookings = bookings.filter((booking) => booking.status === "pending").sort((a, b) => a.bookingDate.localeCompare(b.bookingDate) || a.startTime.localeCompare(b.startTime));
  const confirmedChangeRequests = bookings.filter((booking) => booking.status === "confirmed" && booking.changeRequestStatus === "pending").sort((a, b) => (a.changeRequestDate ?? "").localeCompare(b.changeRequestDate ?? ""));
  const todayBookings = bookings.filter((booking) => booking.bookingDate === todayString() && booking.status === "confirmed").sort((a, b) => a.startTime.localeCompare(b.startTime));
  const upcomingBookings = bookings.filter(isUpcoming).sort((a, b) => a.bookingDate.localeCompare(b.bookingDate) || a.startTime.localeCompare(b.startTime));
  const completedBookings = bookings.filter((booking) => booking.status === "completed").sort((a, b) => a.bookingDate.localeCompare(b.bookingDate) || a.startTime.localeCompare(b.startTime));
  const allBookings = bookings.slice().sort((a, b) => a.bookingDate.localeCompare(b.bookingDate) || a.startTime.localeCompare(b.startTime));
  const detailView = searchParams.get("view");
  if (pathname.startsWith("/admin/availability")) return <section className="admin-panel"><div className="admin-heading"><div><p className="eyebrow">Studio settings</p><h2>Availability</h2></div><div className="admin-heading-actions"><Link className="text-button" href="/admin">← Dashboard</Link></div></div>{errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}<OpeningHoursSettings /><TimeOffSettings /></section>;
  if (pathname.startsWith("/admin/appointments")) { const detailBookings = detailView === "pending" ? pendingBookings : detailView === "completed" ? completedBookings : detailView === "upcoming" ? upcomingBookings : allBookings; const detailTitle = detailView === "pending" ? "Pending appointments" : detailView === "completed" ? "Completed appointments" : detailView === "upcoming" ? "Upcoming appointments" : "All appointments"; return <section className="admin-panel"><div className="admin-heading"><div><p className="eyebrow">Full history</p><h2>{detailTitle}</h2></div><Link className="text-button" href="/admin">← Dashboard</Link></div>{errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}<BookingSection label="Appointments" title={detailTitle} bookings={detailBookings} services={services} onUpdate={updateBooking} onModify={modifyBooking} emptyText="No appointments in this section." showHeading={false} /></section>; }
  return <section className="admin-panel"><div className="admin-heading"><div><p className="eyebrow">{sessionEmail}</p><h2>Studio overview</h2></div><div className="admin-heading-actions"><Link className="text-button" href="/admin/availability">Availability →</Link></div></div>{errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}{(pendingBookings.length > 0 || confirmedChangeRequests.length > 0) && <div className="admin-alerts" role="status"><strong>Needs attention</strong>{pendingBookings.length > 0 && <Link className="admin-alert" href="/admin/appointments?view=pending">{pendingBookings.length} pending booking request{pendingBookings.length === 1 ? "" : "s"} <span>↗</span></Link>}{confirmedChangeRequests.length > 0 && <span className="admin-alert">{confirmedChangeRequests.length} confirmed appointment change request{confirmedChangeRequests.length === 1 ? "" : "s"}</span>}</div>}<div className="admin-stats"><div><strong>{todayBookings.length}</strong><span>Today</span></div><div><strong>{pendingBookings.length}</strong><span>Pending</span></div><div><strong>{upcomingBookings.length}</strong><span>Upcoming</span></div><div><strong>{completedBookings.length}</strong><span>Completed</span></div><div><strong>{allBookings.length}</strong><span>All appointments</span></div></div><BookingSection label="Today" title="Appointments today" bookings={todayBookings} services={services} onUpdate={updateBooking} onModify={modifyBooking} emptyText="Nothing scheduled today." /><BookingSection label="Action needed" title="Change requests" bookings={confirmedChangeRequests} services={services} onUpdate={updateBooking} onModify={modifyBooking} emptyText="No change requests." /><BookingSection label="Needs attention" title="Pending appointments" bookings={pendingBookings} services={services} previewLimit={3} recentFirst viewLink="/admin/appointments?view=pending" onUpdate={updateBooking} onModify={modifyBooking} emptyText="No pending appointments." /><BookingSection label="Your diary" title="Upcoming appointments" bookings={upcomingBookings} services={services} previewLimit={3} viewLink="/admin/appointments?view=upcoming" onUpdate={updateBooking} onModify={modifyBooking} emptyText="No upcoming appointments yet." /><BookingSection label="Finished" title="Completed appointments" bookings={completedBookings} services={services} previewLimit={3} viewLink="/admin/appointments?view=completed" onUpdate={updateBooking} onModify={modifyBooking} emptyText="No completed appointments yet." /><BookingSection label="Full history" title="All appointments" bookings={allBookings} services={services} previewLimit={3} recentFirst viewLink="/admin/appointments?view=all" onUpdate={updateBooking} onModify={modifyBooking} emptyText="No appointments yet." /></section>;
}
