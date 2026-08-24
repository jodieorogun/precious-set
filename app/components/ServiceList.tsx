"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Service = { id: string; name: string; description: string | null; startingPrice: number; durationMinutes: number; };

export function ServiceList() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadServices() {
      if (!supabase) { setIsLoading(false); return; }
      const { data } = await supabase.from("services").select("id, name, description, startingPrice, durationMinutes").eq("isActive", true).order("name");
      setServices((data ?? []) as Service[]);
      setIsLoading(false);
    }
    void loadServices();
  }, []);

  if (isLoading) return <section className="page-shell services-grid"><p>Loading services…</p></section>;
  if (!supabase) return <section className="page-shell placeholder-panel">Add Supabase keys to load services.</section>;
  if (!services.length) return <section className="page-shell placeholder-panel">No active services yet.</section>;

  return <section className="page-shell services-grid">{services.map((service) => <article className="service-menu-card" key={service.id}><p className="eyebrow">From £{Number(service.startingPrice).toFixed(2)} · {service.durationMinutes} mins</p><h2>{service.name}</h2><p>{service.description || "A considered service from The Precious Set."}</p></article>)}</section>;
}
