import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://uidoustvtgrtkhotfqkn.supabase.co";
const supabaseAnonKey = "sb_publishable_7w8A_a_EG_QvsuEH3PxCHg_2OduLrbE";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);