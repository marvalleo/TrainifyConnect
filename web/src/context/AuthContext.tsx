import { createContext, useContext, useEffect, useState } from "react";
import { type User, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      // If user logs in, ensure they have a document in Firestore
      try {
        if (currentUser) {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              role: "master",
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
            });
          } else {
            await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
          }
        }
      } catch (error) {
        console.error("Critical: Error syncing user to Firestore.", error);
        // We continue even if sync fails so the app can at least render the UI/Login
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-tc-surface flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-tc-primary/20 border-t-tc-primary-fixed rounded-full animate-spin" />
        <p className="font-headline text-tc-primary-fixed text-xs font-bold uppercase tracking-[0.2em] animate-pulse">
          Iniciando Protocolo...
        </p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
