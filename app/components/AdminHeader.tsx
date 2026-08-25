"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export function AdminHeader({ backHref = "/", backLabel = "← Back to site" }: { backHref?: string; backLabel?: string }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => setIsSignedIn(Boolean(data.session)));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setIsSignedIn(Boolean(session)));
    return () => listener.subscription.unsubscribe();
  }, []);
  return <header className="admin-shell-header"><a href="/" aria-label="The Precious Set home"><Image src="/precious-set-logo.png" alt="The Precious Set" width={92} height={72} /></a><div className="admin-shell-links"><a className="back-to-site" href={backHref}>{backLabel}</a>{isSignedIn && <button className="back-to-site admin-sign-out" type="button" onClick={() => void supabase?.auth.signOut()}>Sign out</button>}</div></header>;
}
