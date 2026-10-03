import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

console.log("URL loaded:", supabaseUrl ? "YES" : "NO");
console.log("Key loaded:", supabaseKey ? "YES" : "NO");

if (!supabaseUrl || !supabaseKey) {
    throw new Error(
        "Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env"
    );
}

export const supabase = createClient(
    supabaseUrl,
    supabaseKey
);