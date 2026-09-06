// ============================================================
// SODIS-SACCO — Supabase configuration
// ------------------------------------------------------------
// Fill these two values in from your Supabase project:
// Project Settings → API → Project URL / anon public key
// ============================================================
const SUPABASE_URL = "PASTE_YOUR_SUPABASE_PROJECT_URL_HERE";
const SUPABASE_ANON_KEY = "PASTE_YOUR_SUPABASE_ANON_PUBLIC_KEY_HERE";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
