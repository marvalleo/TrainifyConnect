import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

export function useStorage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (folder: string, file: File): Promise<string | null> => {
    if (!user) {
      setError("No hay sesión activa");
      return null;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    // Format: coachId/folder/timestamp_filename
    const filePath = `${user.uid}/${folder}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filePath);

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(p);
        },
        (err) => {
          console.error("Storage upload error:", err);
          setError(err.message);
          setUploading(false);
          resolve(null); // Resolve null on error so we don't crash the promise chain unexpectedly in simple components, error state will be set
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            setUploading(false);
            setProgress(100);
            resolve(downloadUrl);
          } catch (err) {
             const errorMessage = err instanceof Error ? err.message : "Error obteniendo URL";
             setError(errorMessage);
             setUploading(false);
             resolve(null);
          }
        }
      );
    });
  };

  return { uploadFile, progress, uploading, error };
}
