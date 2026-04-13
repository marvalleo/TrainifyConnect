import { useLocation } from "react-router-dom";

const routeTitles: Record<string, string> = {
  "/": "Lab Control",
  "/athletes": "Gestión de Atletas",
  "/exercises": "Librería de Ejercicios",
  "/routines": "Asignación de Rutinas",
  "/settings": "Ajustes",
};

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const location = useLocation();
  const title = routeTitles[location.pathname] ?? "TrainifyConnect";

  return (
    <header className="sticky top-0 z-40 bg-tc-surface/70 backdrop-blur-xl h-16 flex justify-between items-center px-4 lg:px-8 border-b border-tc-surface-container-highest/30 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
      {/* Left: Menu Mobile + Title + Security Badge */}
      <div className="flex items-center gap-2 lg:gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-tc-outline hover:text-tc-primary-fixed transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        
        <span
          className="material-symbols-outlined text-tc-secondary hidden sm:inline-block"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          security
        </span>
        <h2 className="font-headline font-black tracking-tighter text-lg lg:text-2xl text-tc-primary-fixed truncate max-w-[150px] sm:max-w-none">
          {title}
        </h2>
        <span className="hidden md:inline-block px-2 py-0.5 bg-tc-surface-container-highest rounded text-[10px] font-bold text-tc-secondary uppercase tracking-widest border border-tc-secondary/20">
          Secured Protocol
        </span>
      </div>

      {/* Right: Live Monitor + Actions */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1 bg-tc-surface-container-highest rounded-lg text-white/80">
          <span className="w-2 h-2 rounded-full bg-tc-error animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest">
            Live Monitoring
          </span>
        </div>

        <button
          className="text-white/80 hover:text-tc-secondary transition-colors active:scale-95 cursor-pointer relative"
          title="Notificaciones"
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-tc-error rounded-full" />
        </button>

        <button
          className="text-white/80 hover:text-tc-primary-fixed transition-colors active:scale-95 cursor-pointer"
          title="Seguridad"
        >
          <span className="material-symbols-outlined">ring_volume</span>
        </button>
      </div>
    </header>
  );
}
