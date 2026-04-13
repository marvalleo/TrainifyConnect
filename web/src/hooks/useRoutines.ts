import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

export interface RoutineExercise {
  exerciseId: string;
  order: number;
  sets: number[]; // e.g., [8, 8, 6] (reps per set)
  intensity: string; // e.g., 'RPE 8' or '85% 1RM'
  rest: string; // e.g., '90s'
  technicalAlert?: string;
}

export interface Routine {
  id: string;
  coachId: string;
  name: string;
  phase: string;
  exercises: RoutineExercise[];
  createdAt: unknown;
}

export interface NewRoutineData {
  name: string;
  phase: string;
  exercises: RoutineExercise[];
}

export function useRoutines() {
  const { user } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "routines"),
      where("coachId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Routine[] = [];
        snapshot.forEach((docSnap) => {
          data.push({ id: docSnap.id, ...docSnap.data() } as Routine);
        });
        setRoutines(data);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore routines error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addRoutine = async (data: NewRoutineData): Promise<{ success: boolean; id?: string; error?: string }> => {
    if (!user) return { success: false, error: "No session" };

    try {
      const docRef = await addDoc(collection(db, "routines"), {
        coachId: user.uid,
        ...data,
        createdAt: serverTimestamp(),
      });
      return { success: true, id: docRef.id };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Error" };
    }
  };

  const updateRoutine = async (id: string, data: Partial<NewRoutineData>) => {
    if (!user) return { success: false, error: "No session" };
    try {
      await updateDoc(doc(db, "routines", id), data);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Error" };
    }
  };

  const deleteRoutine = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "routines", id));
  };

  return { routines, loading, error, addRoutine, updateRoutine, deleteRoutine };
}
