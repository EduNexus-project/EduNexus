import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseServiceRoleKey &&
  supabaseUrl.startsWith("http") &&
  supabaseUrl !== "your_supabase_url"
);

let client: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    client = createClient(supabaseUrl!, supabaseServiceRoleKey!, {
      auth: { persistSession: false },
    });
    console.log("[EduNexus DB] Connected to Supabase PostgreSQL at:", supabaseUrl);
  } catch (err: any) {
    console.warn("[EduNexus DB] Warning: Failed to initialize Supabase client:", err.message);
    client = null;
  }
} else {
  console.log("[EduNexus DB] Running with integrated local ERP database engine (Supabase credentials not specified).");
}

export const supabase = client;
