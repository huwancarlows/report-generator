// src/utils/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type SupabaseError = {
    message: string;
    details: string;
    hint: string;
    code: string;
};

export const handleSupabaseError = <T>(error: any, defaultValue: T): T => {
    if (error) {
        console.error('Supabase error:', error);
    }
    return defaultValue;
};
