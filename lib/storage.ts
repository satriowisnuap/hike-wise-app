import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadMountainImage(mountainId: string, file: File): Promise<string> {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Hanya format JPEG, PNG, atau WEBP yang diizinkan');
  }

  // Validate size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('Ukuran file maksimal 2MB');
  }

  const storageRef = ref(storage, `mountains/${mountainId}/cover.jpg`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

export async function deleteMountainImage(mountainId: string): Promise<void> {
  const storageRef = ref(storage, `mountains/${mountainId}/cover.jpg`);
  try {
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Gagal menghapus gambar:", error);
    // Ignore if not exists
  }
}
