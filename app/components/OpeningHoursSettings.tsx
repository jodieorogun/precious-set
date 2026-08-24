"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type OpeningHour = { id: string; dayOfWeek: number; isOpen: boolean; openTime: string; closeTime: string; breakStart: string | null; breakEnd: string | null; };
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function OpeningHoursSettings() {
  const [hours, setHours] = useState<OpeningHour[]>([]);
  const [message, setMessage] = useState("");
  useEffect(() => { async function loadHours() { if (!supabase) return; const { data } = await supabase.from("opening_hours").select("id, dayOfWeek, isOpen, openTime, closeTime, breakStart, breakEnd").order("dayOfWeek"); setHours((data ?? []) as OpeningHour[]); } void loadHours(); }, []);
  function updateHour(id: string, changes: Partial<OpeningHour>) { setHours((current) => current.map((hour) => hour.id === id ? { ...hour, ...changes } : hour)); }
  async function saveHours() { if (!supabase) return; const results = await Promise.all(hours.map((hour) => supabase.from("opening_hours").update({ isOpen: hour.isOpen, openTime: hour.openTime, closeTime: hour.closeTime, breakStart: hour.breakStart || null, breakEnd: hour.breakEnd || null }).eq("id", hour.id))); const error = results.find((result) => result.error)?.error; setMessage(error ? error.message : "Opening hours saved."); }
  return <details className="hours-settings"><summary><span><small>Availability</small><strong>Opening hours</strong></span><span className="hours-toggle">⌄</span></summary><div className="hours-settings-content"><div className="hours-settings-actions"><p>Set when customers can request appointments.</p><button className="button approve-button" onClick={() => void saveHours()}>Save hours</button></div><div className="hours-list">{hours.map((hour) => <div className="hours-row" key={hour.id}><label className="hours-day"><input type="checkbox" checked={hour.isOpen} onChange={(event) => updateHour(hour.id, { isOpen: event.target.checked })} />{dayNames[hour.dayOfWeek]}</label><div className="hours-time-group"><span>Open</span><input aria-label={`${dayNames[hour.dayOfWeek]} opening time`} type="time" value={hour.openTime.slice(0, 5)} disabled={!hour.isOpen} onChange={(event) => updateHour(hour.id, { openTime: event.target.value })} /><b>to</b><input aria-label={`${dayNames[hour.dayOfWeek]} closing time`} type="time" value={hour.closeTime.slice(0, 5)} disabled={!hour.isOpen} onChange={(event) => updateHour(hour.id, { closeTime: event.target.value })} /></div><div className="hours-time-group break-group"><span>Break</span><input aria-label={`${dayNames[hour.dayOfWeek]} break start`} type="time" value={hour.breakStart?.slice(0, 5) || ""} disabled={!hour.isOpen} onChange={(event) => updateHour(hour.id, { breakStart: event.target.value || null })} /><b>to</b><input aria-label={`${dayNames[hour.dayOfWeek]} break end`} type="time" value={hour.breakEnd?.slice(0, 5) || ""} disabled={!hour.isOpen} onChange={(event) => updateHour(hour.id, { breakEnd: event.target.value || null })} /></div></div>)}</div>{message && <p className="hours-message">{message}</p>}</div></details>;
}
