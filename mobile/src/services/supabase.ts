import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as FileSystem from 'expo-file-system';
import { CONFIG } from '../config';

let client: SupabaseClient | null = null;

export function getSupabase() {
  if (!client && CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY) {
    client = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  }
  return client;
}

export async function uploadMeshToSupabase(localUri: string, destPath: string): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');
  const bucket = 'meshes';
  const file = await FileSystem.readAsStringAsync(localUri, { encoding: FileSystem.EncodingType.Base64 });
  const { error } = await supabase.storage.from(bucket).upload(destPath, Buffer.from(file, 'base64'), {
    contentType: 'model/gltf-binary',
    upsert: true,
  } as any);
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(destPath);
  return data.publicUrl;
}

export async function signIn(email: string, password: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signUp(email: string, password: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data.user;
}