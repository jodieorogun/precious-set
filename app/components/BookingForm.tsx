"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

type Service = { id: string; name: string; durationMinutes: number; };
type OpeningHour = { dayOfWeek: number; isOpen: boolean; openTime: string; closeTime: string; breakStart: string | null; breakEnd: string | null; };
type BusySlot = { startTime: string; endTime: string; };

function getEndTime(startTime: string, durationMinutes: number) { const [hours, minutes] = startTime.split(":").map(Number); const end = new Date(2000, 0, 1, hours, minutes + durationMinutes); return `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`; }
function getMinutes(time: string) { const [hours, minutes] = time.split(":").map(Number); return hours * 60 + minutes; }
function getTimeOptions(openTime: string, closeTime: string, breakStart: string | null, breakEnd: string | null, durationMinutes: number, busySlots: BusySlot[]) { const options: string[] = []; for (let minutes = getMinutes(openTime); minutes + durationMinutes <= getMinutes(closeTime); minutes += 30) { const start = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`; const end = getEndTime(start, durationMinutes); const duringBreak = breakStart && breakEnd && getMinutes(start) < getMinutes(breakEnd) && getMinutes(end) > getMinutes(breakStart); const overlaps = duringBreak || busySlots.some((slot) => getMinutes(start) < getMinutes(slot.endTime) && getMinutes(end) > getMinutes(slot.startTime)); if (!overlaps) options.push(start); } return options; }
function dateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function dateFromKey(key: string) { return new Date(`${key}T12:00:00`); }
function hashManageToken(token: string) { return crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)).then((buffer) => Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, "0")).join("")); }
function calendarDays(month: Date) { const firstDay = new Date(month.getFullYear(), month.getMonth(), 1); const startOffset = firstDay.getDay(); const totalDays = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate(); return [...Array(startOffset).fill(null), ...Array.from({ length: totalDays }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1))]; }

export function BookingForm() {
  const [services, setServices] = useState<Service[]>([]); const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]); const [busySlots, setBusySlots] = useState<BusySlot[]>([]); const [monthAvailability, setMonthAvailability] = useState<Record<string, boolean>>({});
  const [serviceId, setServiceId] = useState(""); const [bookingDate, setBookingDate] = useState(""); const [startTime, setStartTime] = useState(""); const [calendarMonth, setCalendarMonth] = useState(() => { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), 1); });
  const [customerName, setCustomerName] = useState(""); const [customerPhone, setCustomerPhone] = useState(""); const [addOns, setAddOns] = useState<string[]>([]); const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); const [isSubmitting, setIsSubmitting] = useState(false); const router = useRouter();

  useEffect(() => { async function loadSetup() { if (!supabase) return; const [{ data: serviceData }, { data: hoursData }] = await Promise.all([supabase.from("services").select("id, name, durationMinutes").eq("isActive", true).order("name"), supabase.from("opening_hours").select("dayOfWeek, isOpen, openTime, closeTime, breakStart, breakEnd")]); setServices((serviceData ?? []) as Service[]); setOpeningHours((hoursData ?? []) as OpeningHour[]); } void loadSetup(); }, []);
  useEffect(() => { async function loadBusySlots() { if (!supabase || !bookingDate) return; const { data } = await supabase.rpc("get_booked_times", { target_date: bookingDate }); setBusySlots((data ?? []) as BusySlot[]); setStartTime(""); } void loadBusySlots(); }, [bookingDate]);

  const selectedService = services.find((service) => service.id === serviceId);
  const today = dateKey(new Date());
  const openingHourForDate = (date: Date) => openingHours.find((hours) => hours.dayOfWeek === date.getDay());
  const openingHour = bookingDate ? openingHourForDate(dateFromKey(bookingDate)) : null;
  const bookingDuration = (selectedService?.durationMinutes ?? 0) + (addOns.includes("Removal / Soak Off") ? 30 : 0) + (addOns.includes("Nail Art & Charms") ? 30 : 0);
  const timeOptions = useMemo(() => selectedService && openingHour?.isOpen ? getTimeOptions(openingHour.openTime, openingHour.closeTime, openingHour.breakStart, openingHour.breakEnd, bookingDuration, busySlots) : [], [selectedService, openingHour, bookingDuration, busySlots]);

  useEffect(() => {
    async function loadMonthAvailability() {
      if (!supabase || !selectedService || !openingHours.length) return;
      const days = calendarDays(calendarMonth).filter((date): date is Date => Boolean(date) && dateKey(date) >= today);
      const results = await Promise.all(days.map(async (date) => {
        const key = dateKey(date); const hours = openingHourForDate(date);
        if (!hours?.isOpen) return [key, false] as const;
        const { data } = await supabase.rpc("get_booked_times", { target_date: key });
        return [key, getTimeOptions(hours.openTime, hours.closeTime, hours.breakStart, hours.breakEnd, selectedService.durationMinutes + (addOns.includes("Removal / Soak Off") ? 30 : 0) + (addOns.includes("Nail Art & Charms") ? 30 : 0), (data ?? []) as BusySlot[]).length > 0] as const;
      }));
      setMonthAvailability(Object.fromEntries(results));
    }
    void loadMonthAvailability();
  }, [calendarMonth, selectedService, openingHours, today, addOns]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setErrorMessage(""); if (!supabase) { setErrorMessage("Booking is not connected yet. Add your Supabase environment variables first."); return; } if (!selectedService) { setErrorMessage("Please choose a service."); return; } if (!openingHour?.isOpen) { setErrorMessage("The studio is closed on that date. Please choose another day."); return; } if (!startTime) { setErrorMessage("Please choose an available time."); return; } setIsSubmitting(true); const manageToken = crypto.randomUUID(); const manageTokenHash = await hashManageToken(manageToken); const { error } = await supabase.from("bookings").insert({ customerUserId: userData.user.id, customerName, customerPhone, serviceId, bookingDate, startTime, endTime: getEndTime(startTime, bookingDuration), addOns, addonPrice: addOns.includes("Removal / Soak Off") ? 10 : 0, notes: notes || null, manageTokenHash, status: "pending" }); setIsSubmitting(false); if (error) { setErrorMessage(error.message); return; } router.push(`/book/confirmation?token=${encodeURIComponent(manageToken)}`); }

  const selectedDateLabel = bookingDate ? dateFromKey(bookingDate).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "Choose a date";
  const days = calendarDays(calendarMonth);
  function isAvailable(date: Date) { const key = dateKey(date); return key >= today && openingHourForDate(date)?.isOpen && (selectedService ? monthAvailability[key] !== false : true); }
  function chooseDate(date: Date) { if (!isAvailable(date)) return; const key = dateKey(date); setBookingDate(key); setMonthAvailability((current) => ({ ...current, [key]: current[key] ?? true })); }

  return <form className="booking-form" onSubmit={handleSubmit}>
    <div className="form-section"><p className="eyebrow">01 / Your appointment</p><div className="booking-choice-layout">
      <div className="booking-choice-left">
        <label>Service<select required value={serviceId} onChange={(event) => { setServiceId(event.target.value); setStartTime(""); }}><option value="">Choose a service</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></label>
        <div className="time-picker-field"><span className="field-label">Time</span><div className="time-picker">{!bookingDate ? <p className="picker-placeholder">Choose a date first</p> : !selectedService ? <p className="picker-placeholder">Choose a service first</p> : !openingHour?.isOpen ? <p className="picker-placeholder">Studio closed</p> : timeOptions.length ? <div className="time-options">{timeOptions.map((time) => <button type="button" key={time} className={startTime === time ? "selected" : ""} onClick={() => setStartTime(time)}>{time}</button>)}</div> : <p className="picker-placeholder">No times available</p>}<input className="visually-hidden" required tabIndex={-1} value={startTime} readOnly aria-label="Selected appointment time" /></div></div>
      </div>
      <div className="date-picker-field"><span className="field-label">Date</span><div className="calendar"><div className="calendar-header"><button type="button" aria-label="Previous month" disabled={calendarMonth.getFullYear() === new Date().getFullYear() && calendarMonth.getMonth() === new Date().getMonth()} onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}>‹</button><strong>{calendarMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</strong><button type="button" aria-label="Next month" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}>›</button></div><div className="calendar-weekdays">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-grid">{days.map((date, index) => date ? <button type="button" key={dateKey(date)} className={`${bookingDate === dateKey(date) ? "selected" : ""}${isAvailable(date) ? "" : " unavailable"}`} disabled={!isAvailable(date)} onClick={() => chooseDate(date)} aria-label={`${date.toDateString()}${isAvailable(date) ? "" : " unavailable"}`}>{date.getDate()}</button> : <span className="calendar-empty" key={`empty-${index}`} />)}</div><p className="selected-date">{selectedDateLabel}</p></div></div>
    </div><div className="booking-overview"><p className="eyebrow">Booking overview</p>{selectedService ? <><div className="booking-overview-line"><span>{selectedService.name}{addOns.length ? ` + ${addOns.join(" + ")}` : ""}</span><strong>{bookingDate && startTime ? `${selectedDateLabel} · ${startTime}–${getEndTime(startTime, bookingDuration)}` : "Choose a date and time"}</strong></div><div className="booking-overview-line"><span>Estimated duration</span><strong>{Math.floor(bookingDuration / 60)} hr{bookingDuration % 60 ? ` ${bookingDuration % 60} mins` : ""}</strong></div><div className="booking-overview-line"><span>Estimated price</span><strong>£{(Number(selectedService.startingPrice) + (addOns.includes("Removal / Soak Off") ? 10 : 0)).toFixed(2)}{addOns.includes("Nail Art & Charms") ? "–£" + (Number(selectedService.startingPrice) + (addOns.includes("Removal / Soak Off") ? 10 : 0) + 12).toFixed(2) : ""}</strong></div></> : <p className="picker-placeholder">Choose a service to see your booking overview.</p>}</div></div>
    <div className="form-section"><p className="eyebrow">02 / Your details</p><div className="form-grid"><label>Name<input required value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Your name" /></label><label>Phone number<input required type="tel" inputMode="tel" value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="07…" /></label><div className="full-width addon-picker"><span className="field-label">Extras <span className="optional">optional</span></span><label className="addon-option"><input type="checkbox" checked={addOns.includes("Removal / Soak Off")} onChange={(event) => setAddOns((current) => event.target.checked ? [...current, "Removal / Soak Off"] : current.filter((item) => item !== "Removal / Soak Off"))} /><span><strong>Removal / Soak Off</strong><small>+30 minutes · £10</small></span></label><label className="addon-option"><input type="checkbox" checked={addOns.includes("Nail Art & Charms")} onChange={(event) => setAddOns((current) => event.target.checked ? [...current, "Nail Art & Charms"] : current.filter((item) => item !== "Nail Art & Charms"))} /><span><strong>Nail Art & Charms</strong><small>+30 minutes · £5–£12</small></span></label></div><label className="full-width">Notes <span className="optional">optional</span><textarea rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Anything The Precious Set should know?" /></label></div></div>
    {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}<button className="button button-dark submit-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Sending request…" : "Send booking request ↗"}</button>
  </form>;
}
