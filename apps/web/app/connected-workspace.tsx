"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import BusinessHome from "./business-home";

type Business = { id: string; name: string; default_currency: string; locale: string; time_zone: string };

export default function ConnectedWorkspace({ supabase, onViewDemo, signInPrompt = false }: { supabase: SupabaseClient; onViewDemo: () => void; signInPrompt?: boolean }) {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signup");

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setUser(data.session?.user ?? null);
      if (mounted && !data.session) setBusy(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        if (session?.user) setBusy(true);
      }
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, [supabase]);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    supabase.from("businesses").select("id,name,default_currency,locale,time_zone").order("created_at").limit(1).maybeSingle()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) setMessage(`Could not load your workspace: ${error.message}`);
        setBusiness(data as Business | null);
        setBusy(false);
      });
    return () => { mounted = false; };
  }, [supabase, user]);

  async function authenticate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const result = mode === "signup"
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (result.error) { setMessage(result.error.message); return; }
    if (mode === "signup" && !result.data.session) setMessage("Check your email to confirm your account, then sign in here.");
    else if (result.data.user) setUser(result.data.user);
  }

  async function createBusiness(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = new FormData(event.currentTarget);
    const { data, error } = await supabase.rpc("create_business", {
      p_name: String(form.get("businessName") || "").trim(),
      p_state_or_union_territory: String(form.get("state") || "").trim() || null,
    });
    if (error) { setMessage(error.message); setBusy(false); return; }
    const { data: created, error: loadError } = await supabase.from("businesses").select("id,name,default_currency,locale,time_zone").eq("id", data).single();
    setBusiness(created as Business | null);
    setMessage(loadError ? loadError.message : "Workspace created successfully.");
    setBusy(false);
  }

  async function signOut() { await supabase.auth.signOut(); setBusiness(null); setUser(null); setMessage("Signed out."); }

  return <main className="connect-shell"><section className="connect-card"><div className="connect-brand"><span className="brand-mark">d</span><span>Dukaan<span className="brand-light">Flow</span></span></div>
    {!user ? <>
      <div className="eyebrow">YOUR INDIA-FIRST BUSINESS WORKSPACE</div>
      <h1>{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
      <p className="connect-intro">Use your email to securely access DukaanFlow.</p>
      {signInPrompt && <p className="connect-message" role="status">Create an account or sign in to add products and sales to your own workspace.</p>}
      <form className="connect-form" onSubmit={authenticate}>
        <label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
        <label>Password<input name="password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={8} required placeholder="At least 8 characters" /></label>
        <button className="button button-primary" disabled={busy}>{busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}</button>
      </form>
      <button className="connect-switch" onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setMessage(""); }}>{mode === "signup" ? "Already registered? Sign in" : "New to DukaanFlow? Create an account"}</button>
      <button className="connect-demo" onClick={onViewDemo}>Explore the interactive sample workspace</button>
    </> : busy ? <div className="connect-loading">Loading your workspace…</div> : business ? <>
      <BusinessHome business={business} email={user.email ?? ""} supabase={supabase} onSignOut={signOut} />
    </> : <>
      <div className="eyebrow">BUSINESS SETUP</div><h1>Set up your workspace</h1><p className="connect-intro">Start with your business name. You can add more details later.</p>
      <form className="connect-form" onSubmit={createBusiness}>
        <label>Business name<input name="businessName" required maxLength={160} placeholder="e.g. Step & Style" /></label>
        <label>State or union territory <span className="optional">(optional)</span><input name="state" placeholder="e.g. Maharashtra" /></label>
        <button className="button button-primary" disabled={busy}>{busy ? "Creating…" : "Create workspace"}</button>
      </form>
      <button className="connect-switch" onClick={signOut}>Sign out</button>
    </>}
    {message && <p className="connect-message" role="status">{message}</p>}
    <small className="connect-note">Your information is stored in your Supabase business workspace.</small>
  </section></main>;
}
