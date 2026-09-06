// ============================================================
// SODIS-SACCO — Supabase configuration
// ------------------------------------------------------------
// Fill these two values in from your Supabase project:
// Project Settings → API → Project URL / anon public key
// ============================================================
const SUPABASE_URL = "https://ocmlzcavobiujbmidpks.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jbWx6Y2F2b2JpdWpibWlkcGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2ODAyODUsImV4cCI6MjEwNDI1NjI4NX0.wfo7BDHagVQMAkN0xMakFCy5KtJpmpZEx-ItiszkK-U";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabaseClient = supabaseClient; 