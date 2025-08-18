let API_BASE_URL = "http://localhost:3002";

let SUPABASE_URL: string | undefined = undefined;
let SUPABASE_ANON_KEY: string | undefined = undefined;

export const CONFIG = {
  get API_BASE_URL() {
    return API_BASE_URL;
  },
  get SUPABASE_URL() {
    return SUPABASE_URL;
  },
  get SUPABASE_ANON_KEY() {
    return SUPABASE_ANON_KEY;
  },
};

export function setApiBaseUrl(url: string) {
  API_BASE_URL = url;
}

export function setSupabase(url?: string, anonKey?: string) {
  SUPABASE_URL = url;
  SUPABASE_ANON_KEY = anonKey;
}
