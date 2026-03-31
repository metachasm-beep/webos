import { supabase } from './supabase';

export async function uploadBrandAsset(file: File, path: string) {
  try {
    const { data, error } = await supabase.storage
      .from('branding')
      .upload(path, file, {
        upsert: true,
        cacheControl: '3600',
      });

    if (error) throw error;
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('branding')
      .getPublicUrl(path);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error("Neural Storage Upload Failure.", err);
    throw err;
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
