import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Public client factory. Never pass a service-role key from a client app. */
export function createDukaanFlowClient(url: string, publicKey: string): SupabaseClient {
  if (!url || !publicKey) throw new Error("Supabase project URL and public key are required.");
  return createClient(url, publicKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
}
