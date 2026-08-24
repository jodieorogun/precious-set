"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type OpeningHour = { id: string; dayOfWeek: number; isOpen: boolean; openTime: string; closeTime: string; };
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function OpeningHoursSettings() {
  const [hours, setHours] = useState<OpeningHour[]>([]);
  const [message, setMessage] = useState("");
  useEffect(() => { async function loadHours() { if (!supabase) return; const { data } = await supabase.from("opening_hours").select("id, dayOfWeek, isOpen, openTime, closeTime").order("dayOfWeek"); setHours((data ?? []) as OpeningHour[]); } void loadHours(); }, []);
  function updateHour(id: string, changes: Partial<OpeningHour>) { setHours((current) => current.map((hour) => hour.id === id ? { ...hour, ...changes } : hour)); }
  async function saveHours() { if (!supabase) return; const results = await Promise.all(hours.map((hour) => supabase.from("opening_hours").update({ isOpen: hour.isOpen, openTime: hour.openTime, closeTime: hour.closeTime }).eq("id", hour.id))); const error = results.find((result) => result.error)?.error; setMessage(error ? error.message : "Opening hours saved."); }
  return <details className="hours-settings"><summary><span><small>Availability</small><strong>Opening hours</strong></span><span className="hours-toggle">⌄</span></summary><div className="hours-settings-content"><div className="hours-settings-actions"><p>Set when customers can request appointments.</p><button className="button approve-button" onClick={() => void saveHours()}>Save hours</button></div><div className="hours-list">{hours.map((hour) => <div className="hours-row" key={hour.id}><label className="hours-day"><input type="checkbox" checked={hour.isOpen} onChange={(event) => updateHour(hour.id, { isOpen: event.target.checked })} />{dayNames[hour.dayOfWeek]}</label><input aria-label={`${dayNames[hour.dayOfWeek]} opening time`} type="time" value={hour.openTime.slice(0, 5)} disabled={!hour.isOpen} onChange={(event) => updateHour(hour.id, { openTime: event.target.value })} /><span>to</span><input aria-label={`${dayNames[hour.dayOfWeek]} closing time`} type="time" value={hour.closeTime.slice(0, 5)} disabled={!hour.isOpen} onChange={(event) => updateHour(hour.id, { closeTime: event.target.value })} /></div>)}</div>{message && <p className="hours-message">{message}</p>}</div></details>;
}
