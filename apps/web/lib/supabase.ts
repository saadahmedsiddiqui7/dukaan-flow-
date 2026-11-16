import { createDukaanFlowClient } from "@dukaanflow/backend";

let client: ReturnType<typeof createDukaanFlowClient> | null = null;

export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publicKey) return null;
  if (!client) client = createDukaanFlowClient(url, publicKey);
  return client;
}
