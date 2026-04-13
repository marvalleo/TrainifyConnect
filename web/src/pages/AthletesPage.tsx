import { useNavigate } from "react-router-dom";
import { useAthletes } from "../hooks/useAthletes";

export function AthletesPage() {
  const { athletes, loading, deleteAthlete } = useAthletes();
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-12 gap-6">
        <SummaryCard
          label="Estatus de Red"
          value="98.2"
          unit="%"
          subtitle="Sincronización de biometría activa"
          icon="hub"
          accentColor="text-tc-secondary"
        />
        <SummaryCard
          label="Atletas en Sesión"
          value={athletes.length.toString()}
          subtitle="Total bajo monitoreo"
          pulse
          accentColor="text-tc-primary-fixed"
        />
        <SummaryCard
          label="Alertas de Fatiga"
          value={athletes.filter(a => a.status === "alert").length.toString().padStart(2, '0')}
          subtitle="Requiere intervención inmediata"
          icon="warning"
          accentColor="text-tc-error"
        />
      </div>

      {/* Athletes Table */}
      <div className="space-y-6">
        <div className="flex justify-between items-end mb-4">
          <h3 className="font-headline text-2xl font-black uppercase tracking-tighter">
            Directorio de Rendimiento
          </h3>
          <div className="flex gap-4 items-center">
            <button className="text-[10px] font-bold text-tc-outline uppercase tracking-widest border-b border-tc-outline/30 pb-1 hover:text-white transition-colors cursor-pointer">
              Todos
            </button>
            <button className="text-[10px] font-bold text-tc-error uppercase tracking-widest border-b border-tc-error pb-1 cursor-pointer">
              Alta Prioridad
            </button>
            <button 
              onClick={() => navigate("/athletes/new")}
              className="bg-tc-primary-fixed text-tc-on-primary-fixed px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all cursor-pointer rounded-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">add</span>
              Añadir Atleta
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-2 border-tc-primary/20 border-t-tc-primary-fixed rounded-full animate-spin" />
          </div>
        ) : athletes.length === 0 ? (
           <div className="text-center p-12 bg-tc-surface-container-low rounded-lg border border-white/5">
             <span className="material-symbols-outlined text-4xl text-tc-outline-variant mb-4">group_add</span>
             <p className="text-tc-on-surface-variant font-headline uppercase tracking-widest text-sm mb-4">No hay atletas registrados</p>
             <button onClick={() => navigate("/athletes/new")} className="text-tc-primary-fixed underline text-xs font-bold uppercase tracking-widest cursor-pointer hover:brightness-110">Registrar Primer Atleta</button>
           </div>
        ) : (
        <div className="space-y-3">
          {athletes.map((athlete) => {
            // Derived coloring logic based on standard data
            const isAlert = athlete.status === "alert";
            const isActive = athlete.status === "active";
            const stressColor = isAlert ? "bg-tc-error" : isActive ? "bg-tc-secondary" : "bg-tc-outline";
            const labelColor = isAlert ? "text-tc-error" : isActive ? "text-tc-secondary" : "text-tc-outline";
            const gainColor = athlete.stats.progressPercent > 0 ? "text-tc-primary-fixed" : athlete.stats.progressPercent < 0 ? "text-tc-error" : "text-tc-outline";
            const typeColor = isAlert ? "text-tc-error" : isActive ? "text-tc-primary-fixed" : "text-tc-outline-variant";

            return (
              <div
                key={athlete.id}
                className={`bg-tc-surface-container-low hover:bg-tc-surface-container-high transition-all group flex items-center p-4 gap-8 rounded-lg ${
                  !isActive && !isAlert ? "opacity-50 hover:opacity-100" : ""
                }`}
              >
                {/* Avatar + Name */}
                <div className="flex items-center gap-4 w-1/4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-tc-surface-container-highest rounded-sm border border-white/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white/30">
                        person
                      </span>
                    </div>
                    <span
                      className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-tc-surface ${
                        isAlert
                          ? "bg-tc-error"
                          : isActive
                            ? "bg-tc-primary-fixed"
                            : "bg-tc-outline"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-headline font-bold text-tc-on-surface text-sm uppercase tracking-tight truncate">
                      {athlete.displayName}
                    </p>
                    <p className="text-[10px] text-tc-outline font-mono">
                      ID: {athlete.id.substring(0, 8)}
                    </p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex-1 flex justify-around items-center">
                  <div className="text-center">
                    <p className="text-[9px] font-bold text-tc-outline uppercase tracking-widest mb-1">
                      Último Entrenamiento
                    </p>
                    <p className="text-xs font-headline font-medium">
                      {athlete.stats.lastWorkout}{" "}
                      <span className={typeColor}>
                        / {athlete.stats.workoutType}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-tc-outline uppercase tracking-widest mb-1">
                      Ganancia %
                    </p>
                    <p
                      className={`text-lg font-headline font-bold ${gainColor}`}
                    >
                      {athlete.stats.progressPercent > 0 ? "+" : ""}{athlete.stats.progressPercent}%
                    </p>
                  </div>
                  <div className="text-center w-32">
                    <div className="w-full h-1 bg-tc-surface-container-highest overflow-hidden rounded-full">
                      <div
                        className={`${stressColor} h-full transition-all`}
                        style={{ width: `${Math.max(athlete.stats.cnsStress, 5)}%` }}
                      />
                    </div>
                    <p
                      className={`text-[9px] font-bold ${labelColor} uppercase tracking-widest mt-1`}
                    >
                      Estrés SNC: {athlete.stats.cnsStress}%
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/athletes/${athlete.id}`)}
                    className="p-2 hover:bg-tc-secondary/10 text-tc-outline hover:text-tc-secondary transition-all rounded cursor-pointer"
                    title="Ver Perfil"
                  >
                    <span className="material-symbols-outlined text-lg">
                      open_in_new
                    </span>
                  </button>
                  <button
                    className="p-2 hover:bg-tc-primary/10 text-tc-outline hover:text-tc-primary transition-all rounded cursor-pointer"
                    title="Asignar Rutina"
                  >
                    <span className="material-symbols-outlined text-lg">
                      edit_calendar
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("¿Estás seguro de eliminar a este atleta?")) {
                        deleteAthlete(athlete.id);
                      }
                    }}
                    className="p-2 hover:bg-tc-error/10 text-tc-outline hover:text-tc-error transition-all rounded cursor-pointer"
                    title="Eliminar Atleta"
                  >
                    <span className="material-symbols-outlined text-lg">
                      delete
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}

/* ── Summary Card ── */
interface SummaryCardProps {
  label: string;
  value: string;
  unit?: string;
  subtitle: string;
  icon?: string;
  pulse?: boolean;
  accentColor: string;
}

function SummaryCard({
  label,
  value,
  unit,
  subtitle,
  icon,
  pulse,
  accentColor,
}: SummaryCardProps) {
  return (
    <div className="col-span-12 lg:col-span-4 bg-tc-surface-container-low p-6 flex flex-col justify-between min-h-[160px] rounded-lg">
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold text-tc-outline uppercase tracking-widest">
          {label}
        </span>
        {icon ? (
          <span className={`material-symbols-outlined ${accentColor}`}>
            {icon}
          </span>
        ) : pulse ? (
          <span className="flex h-2 w-2 rounded-full bg-tc-primary-fixed animate-pulse" />
        ) : null}
      </div>
      <div>
        <div
          className={`text-4xl font-headline font-black tracking-tighter ${accentColor}`}
        >
          {value}
          {unit && (
            <span className="text-tc-secondary text-xl tracking-normal">
              {unit}
            </span>
          )}
        </div>
        <p className="text-[10px] text-tc-outline mt-1 uppercase tracking-widest">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
