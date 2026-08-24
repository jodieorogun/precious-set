"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

const timeOptions = ["10:00", "12:00", "14:00", "16:00", "18:00"];
type Service = { id: string; name: string; durationMinutes: number; };

function isValidPhoneNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

function getEndTime(startTime: string, durationMinutes: number) {
  const [hours, minutes] = startTime.split(":").map(Number);
  const end = new Date(2000, 0, 1, hours, minutes + durationMinutes);
  return `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`;
}

export function BookingForm() {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadServices() {
      if (!supabase) return;
      const { data } = await supabase.from("services").select("id, name, durationMinutes").eq("isActive", true).order("name");
      setServices((data ?? []) as Service[]);
    }
    void loadServices();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    if (!supabase) { setErrorMessage("Booking is not connected yet. Add your Supabase environment variables first."); return; }
    const selectedService = services.find((service) => service.id === serviceId);
    if (!selectedService) { setErrorMessage("Please choose a service."); return; }
    if (!isValidPhoneNumber(customerPhone)) { setErrorMessage("Please enter a valid phone number, including your country code if needed."); return; }
    setIsSubmitting(true);
    const { error } = await supabase.from("bookings").insert({ customerName, customerPhone, customerEmail: customerEmail || null, serviceId, bookingDate, startTime, endTime: getEndTime(startTime, selectedService.durationMinutes), notes: notes || null, status: "pending" });
    setIsSubmitting(false);
    if (error) { setErrorMessage(error.message); return; }
    router.push("/book/confirmation");
  }

  const today = new Date().toISOString().split("T")[0];
  return <form className="booking-form" onSubmit={handleSubmit}><div className="form-section"><p className="eyebrow">01 / Your appointment</p><div className="form-grid"><label>Service<select required value={serviceId} onChange={(event) => setServiceId(event.target.value)}><option value="">Choose a service</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></label><label>Date<input required type="date" min={today} value={bookingDate} onChange={(event) => setBookingDate(event.target.value)} /></label><label>Time<select required value={startTime} onChange={(event) => setStartTime(event.target.value)}><option value="">Choose a time</option>{timeOptions.map((time) => <option key={time} value={time}>{time}</option>)}</select></label></div></div><div className="form-section"><p className="eyebrow">02 / Your details</p><div className="form-grid"><label>Name<input required value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Your name" /></label><label>Phone number<input required type="tel" inputMode="tel" value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="07…" /></label><label>Email <span className="optional">optional</span><input type="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} placeholder="you@example.com" /></label><label className="full-width">Notes <span className="optional">optional</span><textarea rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Anything The Precious Set should know?" /></label></div></div>{errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}<button className="button button-dark submit-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Sending request…" : "Send booking request ↗"}</button></form>;
}
