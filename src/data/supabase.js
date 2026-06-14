import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://gganuycafgplvcizfazu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnYW51eWNhZmdwbHZjaXpmYXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzODQ2OTMsImV4cCI6MjA5Njk2MDY5M30.wIC426UFQXqUHDk2x7mwHOwT4qsZulZWQOnAmo1c4zo";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
