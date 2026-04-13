import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

export interface AthleteStats {
  lastWorkout: string;
  progressPercent: number;
  cnsStress: number;
  workoutType: string;
}

export interface Athlete {
  id: string;
  coachId: string;
  displayName: string;
  email: string;
  phone: string;
  age: number;
  goal: string;
  trainingType: string;
  status: "active" | "inactive" | "alert";
  notes: string;
  activeRoutineId?: string;
  activeRoutineName?: string;
  createdAt: unknown;
  stats: AthleteStats;
}

export interface NewAthleteData {
  displayName: string;
  email: string;
  phone: string;
  age: number;
  goal: string;
  trainingType: string;
  notes: string;
}

export function useAthletes() {
  const { user } = useAuth();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setError(null);

    const q = query(
      collection(db, "athletes"),
      where("coachId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const athletesData: Athlete[] = [];
        snapshot.forEach((docSnap) => {
          athletesData.push({ id: docSnap.id, ...docSnap.data() } as Athlete);
        });
        setAthletes(athletesData);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore athletes listener error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addAthlete = async (data: NewAthleteData): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "No hay sesión activa" };

    try {
      await addDoc(collection(db, "athletes"), {
        coachId: user.uid,
        displayName: data.displayName,
        email: data.email || "",
        phone: data.phone || "",
        age: data.age || 0,
        goal: data.goal || "",
        trainingType: data.trainingType || "General",
        notes: data.notes || "",
        status: "inactive" as const,
        createdAt: serverTimestamp(),
        stats: {
          lastWorkout: "Sin datos",
          workoutType: data.trainingType || "General",
          progressPercent: 0,
          cnsStress: 0,
        },
      });
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido al guardar";
      console.error("Error adding athlete:", err);
      return { success: false, error: message };
    }
  };

  const deleteAthlete = async (athleteId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "No hay sesión activa" };

    try {
      await deleteDoc(doc(db, "athletes", athleteId));
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido al eliminar";
      console.error("Error deleting athlete:", err);
      return { success: false, error: message };
    }
  };

  return { athletes, loading, error, addAthlete, deleteAthlete };
}
