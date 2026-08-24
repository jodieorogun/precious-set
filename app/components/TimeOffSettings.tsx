"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type BlockedPeriod = { id: string; startDate: string; endDate: string; startTime: string | null; endTime: string | null; reason: string | null; };

function formatDate(value: string) { return new Date(`${value}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }

export function TimeOffSettings() {
  const [periods, setPeriods] = useState<BlockedPeriod[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState("");

  async function loadPeriods() {
    if (!supabase) return;
    const { data } = await supabase.from("blocked_periods").select("id, startDate, endDate, startTime, endTime, reason").order("startDate");
    setPeriods((data ?? []) as BlockedPeriod[]);
  }

  useEffect(() => { void loadPeriods(); }, []);

  async function addPeriod(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage("");
    if (!supabase || !startDate || !endDate) return;
    if (endDate < startDate) { setMessage("The end date must be after the start date."); return; }
    if ((startTime && !endTime) || (!startTime && endTime) || (startTime && endTime && endTime <= startTime)) { setMessage("Add both times, with the end time after the start time."); return; }
    const { error } = await supabase.from("blocked_periods").insert({ startDate, endDate, startTime: startTime || null, endTime: endTime || null, reason: reason.trim() || null });
    if (error) { setMessage(error.message); return; }
    setStartDate(""); setEndDate(""); setStartTime(""); setEndTime(""); setReason(""); setMessage("Time off added."); await loadPeriods();
  }

  async function removePeriod(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from("blocked_periods").delete().eq("id", id);
    if (error) { setMessage(error.message); return; }
    setPeriods((current) => current.filter((period) => period.id !== id));
  }

  return <details className="time-off-settings"><summary><span><small>Availability</small><strong>Time off</strong></span><span className="hours-toggle">⌄</span></summary><div className="time-off-content"><p className="time-off-intro">Block a full day or add hours for a partial-day break. Any appointment overlapping the blocked hours will be unavailable.</p><form className="time-off-form" onSubmit={addPeriod}><label>From<input required type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label><label>To<input required type="date" min={startDate || undefined} value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label><label>Start time <span className="optional">optional</span><input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} /></label><label>End time <span className="optional">optional</span><input type="time" min={startTime || undefined} value={endTime} onChange={(event) => setEndTime(event.target.value)} /></label><label>Reason <span className="optional">optional</span><input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Holiday or lunch" /></label><button className="button approve-button" type="submit">Add time off</button></form>{periods.length > 0 && <div className="time-off-list">{periods.map((period) => <div className="time-off-row" key={period.id}><span><strong>{formatDate(period.startDate)} – {formatDate(period.endDate)}</strong><small>{period.startTime && period.endTime ? `${period.startTime.slice(0, 5)}–${period.endTime.slice(0, 5)} · ` : ""}{period.reason || "Studio unavailable"}</small></span><button className="text-button" type="button" onClick={() => void removePeriod(period.id)}>Remove</button></div>)}</div>}{message && <p className="hours-message">{message}</p>}</div></details>;
}
