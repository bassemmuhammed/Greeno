import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://gganuycafgplvcizfazu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnYW51eWNhZmdwbHZjaXpmYXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzODQ2OTMsImV4cCI6MjA5Njk2MDY5M30.wIC426UFQXqUHDk2x7mwHOwT4qsZulZWQOnAmo1c4zo"
);
