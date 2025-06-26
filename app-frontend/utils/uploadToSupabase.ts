import * as ImageManipulator from 'expo-image-manipulator';
import { ImagePickerAsset } from 'expo-image-picker';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseBucket = 'avatars';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export async function uploadImageToSupabase(asset: ImagePickerAsset, userId: string) {
  try {
    const ext = asset.uri.split('.').pop() || 'jpg';
    const filename = `${userId}_${Date.now()}.${ext}`;
    const filePath = filename;

    // ✅ compresser
    const processed = await ImageManipulator.manipulateAsync(
      asset.uri,
      [{ resize: { width: 600 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    const formData = new FormData();
    formData.append('file', {
      uri: processed.uri,
      type: 'image/jpeg',
      name: filename,
    } as any);

    const uploadUrl = `${supabaseUrl}/storage/v1/object/${supabaseBucket}/${filePath}`;

    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`,
        apikey: supabaseAnonKey,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Supabase upload failed:', errorText);
      throw new Error(`Erreur Supabase : ${res.status}`);
    }

    return `${supabaseUrl}/storage/v1/object/public/${supabaseBucket}/${filePath}`;
  } catch (err: any) {
    console.error('Erreur upload Supabase:', err.message);
    throw new Error("Erreur pendant l’envoi de la photo de profil");
  }
}
