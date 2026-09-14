import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Deliberately false: the automatic implicit-flow URL parser is unsafe
    // inside the Capacitor WebView the native iOS/Android builds use. The
    // magic-link callback is completed manually instead — see
    // lib/native-auth-link.ts and lib/auth.ts#completeAuthFromUrl — via the
    // PKCE `code` param, which survives a custom-scheme deep link far more
    // reliably than the implicit flow's URL fragment would.
    detectSessionInUrl: false,
    flowType: "pkce",
  },
});
