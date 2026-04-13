import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

export interface Exercise {
  id: string;
  coachId: string;
  name: string;
  category: string;
  tags: string[];
  audioNote?: string;
  videoUrl?: string;
  imageUrl?: string;
  createdAt: unknown;
}

export interface NewExerciseData {
  name: string;
  category: string;
  tags: string[];
  audioNote?: string;
  videoUrl?: string;
  imageUrl?: string;
}

export function useExercises() {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "exercises"),
      where("coachId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Exercise[] = [];
        snapshot.forEach((docSnap) => {
          data.push({ id: docSnap.id, ...docSnap.data() } as Exercise);
        });
        setExercises(data);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore exercises error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addExercise = async (data: NewExerciseData): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "No session" };

    try {
      await addDoc(collection(db, "exercises"), {
        coachId: user.uid,
        ...data,
        createdAt: serverTimestamp(),
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Error" };
    }
  };

  const deleteExercise = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "exercises", id));
  };

  return { exercises, loading, error, addExercise, deleteExercise };
}
