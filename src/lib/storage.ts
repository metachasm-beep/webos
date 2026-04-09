import { supabase } from './supabase';

export async function uploadBrandAsset(file: File, path: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || supabaseUrl.includes("placeholder-neural-registry")) {
    throw new Error("Neural Credentials Missing. Please check your .env.local configuration.");
  }

  // Pre-flight connectivity check
  try {
    const preflight = await fetch(supabaseUrl, { method: 'HEAD', mode: 'no-cors' });
  } catch (err) {
    console.error("Deep Trace: Failed to reach synthesis endpoint.", supabaseUrl);
    throw new Error("Neural Link Severed. This is likely a CORS block or a dead Project URL.");
  }

  // Cap at 5MB
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error("Asset exceeds synthesis limit (5MB).");
  }

  try {
    const { data, error } = await supabase.storage
      .from('branding')
      .upload(path, file, {
        upsert: true,
        cacheControl: '3600',
      });

    if (error) {
      console.error("Supabase Storage Error Details:", error);
      if (error.message.includes("bucket not found")) {
        throw new Error("Neural Bucket 'branding' not found. Please initialize storage.");
      }
      throw error;
    }
    
    const { data: publicUrlData } = supabase.storage
      .from('branding')
      .getPublicUrl(path);

    if (!publicUrlData.publicUrl) {
      throw new Error("Failed to generate public neural link.");
    }

    return publicUrlData.publicUrl;
  } catch (err: any) {
    console.error("Neural Storage Process Failure:", err);
    throw new Error(err.message || "Unknown synthesis storage error.");
  }
}

export async function deleteBrandAsset(path: string) {
  const { error } = await supabase.storage
    .from('branding')
    .remove([path]);
  
  if (error) {
    console.error("Neural Storage Deletion Failure.", error);
  }
}
