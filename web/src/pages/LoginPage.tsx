import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export function LoginPage() {
  const { loginWithGoogle, user } = useAuth();

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Error logging in with Google:", error);
      // In a real app we'd show a toast notification here
    }
  };

  return (
    <div className="min-h-screen bg-tc-background technical-grid flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-tc-surface-container-low p-8 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] border border-white/5 relative overflow-hidden">
        {/* Top Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-tc-primary-fixed to-tc-secondary" />

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-tc-surface-container-highest rounded-2xl mx-auto mb-6 flex items-center justify-center border border-white/5">
            <span className="material-symbols-outlined text-tc-primary-fixed text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              security
            </span>
          </div>
          <h1 className="text-2xl font-black text-tc-primary-fixed font-headline uppercase tracking-tighter">
            TrainifyConnect
          </h1>
          <p className="font-headline uppercase text-xs tracking-widest text-tc-outline mt-2">
            Performance Lab Access
          </p>
        </div>

        {/* Security Warning */}
        <div className="mb-8 p-4 bg-tc-surface-container-highest/50 rounded-lg flex gap-3 border border-tc-outline-variant/10">
          <span className="material-symbols-outlined text-tc-secondary text-sm shrink-0">
            info
          </span>
          <p className="text-[10px] text-tc-on-surface-variant uppercase tracking-widest font-bold leading-relaxed">
            Acceso restringido únicamente a entrenadores autorizados. El acceso está protegido por el protocolo de Device Binding.
          </p>
        </div>

        {/* Login Action */}
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-between p-4 bg-white text-black hover:bg-gray-100 transition-colors rounded group cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            <span className="font-headline font-bold text-sm tracking-widest uppercase">
              Continuar con Google
            </span>
          </div>
          <span className="material-symbols-outlined text-tc-outline-variant group-hover:text-black transition-colors">
            arrow_forward
          </span>
        </button>

        {/* Footer */}
        <div className="mt-8 text-center border-t border-white/5 pt-6 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-tc-secondary animate-pulse" />
            <span className="text-[10px] font-bold text-tc-on-surface-variant tracking-widest uppercase">
              Secure Auth Node Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
