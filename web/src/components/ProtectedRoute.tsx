import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    // A nice skeleton or loader could go here, for now simple text
    return (
      <div className="min-h-screen bg-tc-background technical-grid flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-tc-primary/20 border-t-tc-primary-fixed rounded-full animate-spin" />
          <p className="text-xs font-bold text-tc-primary-fixed uppercase tracking-widest font-headline">
            Inicializando protocolos de seguridad...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
