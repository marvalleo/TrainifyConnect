import { useAthletes } from "../hooks/useAthletes";

export function DashboardPage() {
  const { athletes, loading } = useAthletes();

  const activeAthletes = athletes.filter(a => a.status === "active").length;
  const alertAthletes = athletes.filter(a => a.status === "alert").length;

  const totalProgress = athletes.reduce((acc, curr) => acc + curr.stats.progressPercent, 0);
  const avgProgress = athletes.length > 0 ? (totalProgress / athletes.length).toFixed(1) : "0.0";

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease]">
      {/* Hero Stats Row (Asymmetric Bento Grid) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Large Real-time Metric */}
        <div className="col-span-12 lg:col-span-8 bg-tc-surface-container-low p-8 rounded-lg relative overflow-hidden flex flex-col justify-between group min-h-[280px]">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[120px]">
              insights
            </span>
          </div>
          <div className="z-10">
            <p className="font-headline text-white/50 uppercase tracking-[0.3em] text-xs font-bold mb-2">
              Performance Global — Últimos 7 Días
            </p>
            <h3 className="font-headline text-5xl font-black text-white italic tracking-tighter">
              {Number(avgProgress) > 0 ? "+" : ""}{avgProgress}
              <span className="text-tc-primary-fixed text-2xl ml-2 tracking-normal not-italic">
                %
              </span>
            </h3>
          </div>
          <div className="mt-12 h-32 flex items-end gap-2">
            {[50, 66, 80, 75, 50, 100, 66].map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-sm transition-all ${
                  i === 2
                    ? "bg-tc-primary-fixed shadow-[0_0_15px_rgba(202,253,0,0.3)]"
                    : i === 5
                      ? "bg-tc-secondary-fixed shadow-[0_0_15px_rgba(38,230,255,0.3)]"
                      : "bg-tc-surface-container-highest group-hover:bg-tc-surface-bright"
                }`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        {/* Security Alert Module */}
        <div className="col-span-12 lg:col-span-4 bg-tc-surface-container-highest p-8 rounded-lg border-l-4 border-tc-error/50 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-6">
              <h4 className="font-headline font-bold text-lg text-white">
                Seguridad
              </h4>
              <span className="px-2 py-1 bg-tc-error/20 text-tc-error text-[10px] font-bold uppercase tracking-widest rounded">
                High Alert
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4 items-start p-3 bg-tc-error/5 rounded-lg border border-tc-error/10">
                <span className="material-symbols-outlined text-tc-error">
                  lock_reset
                </span>
                <div>
                  <p className="text-sm font-bold text-white">
                    Login Fallido — IP: 192.168.1.4
                  </p>
                  <p className="text-[10px] text-white/50 uppercase">
                    Hace 2 minutos • Unknown Device
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start p-3 bg-tc-surface-container-low rounded-lg opacity-60">
                <span className="material-symbols-outlined text-tc-secondary">
                  verified_user
                </span>
                <div>
                  <p className="text-sm font-bold text-white">
                    Protocolo de Cifrado Actualizado
                  </p>
                  <p className="text-[10px] text-white/50 uppercase">
                    Hace 4 horas • System Auto
                  </p>
                </div>
              </div>
            </div>
          </div>
          <button className="mt-6 w-full py-3 bg-tc-surface-container-low text-white text-xs font-bold uppercase tracking-widest hover:bg-tc-surface-bright transition-all border border-tc-outline-variant/10 cursor-pointer">
            Ver Log Completo
          </button>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-12 gap-6">
        <StatCard
          label="Total Base"
          value={athletes.length.toString()}
          subtitle="Atletas registrados"
          icon="groups"
          accentColor="text-tc-secondary"
        />
        <StatCard
          label="Atletas en Sesión"
          value={activeAthletes.toString()}
          subtitle="Monitoreo en tiempo real"
          pulse={activeAthletes > 0}
          accentColor="text-tc-primary-fixed"
        />
        <StatCard
          label="Alertas de Fatiga"
          value={alertAthletes.toString().padStart(2, '0')}
          subtitle="Requiere intervención inmediata"
          icon="warning"
          accentColor="text-tc-error"
        />
      </div>

      {/* Active Athletes Section */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="font-headline text-2xl font-black text-white italic tracking-tighter">
              ATLETAS RECIENTES
            </h3>
            <p className="text-white/40 text-xs font-headline uppercase tracking-[0.2em]">
              Monitoreo del roster
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-tc-primary-fixed font-bold text-xl font-headline">
              {athletes.length}
            </span>
          </div>
        </div>

        {loading ? (
           <div className="flex justify-center p-12">
             <div className="w-10 h-10 border-2 border-tc-primary/20 border-t-tc-primary-fixed rounded-full animate-spin" />
           </div>
        ) : athletes.length === 0 ? (
           <p className="text-center text-tc-outline-variant text-[10px] uppercase font-bold tracking-widest">Base de datos vacía</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {athletes.map(a => {
               const isAlert = a.status === "alert";
               const isActive = a.status === "active";
               
               return (
                 <AthleteCard
                   key={a.id}
                   name={a.displayName}
                   status={`ESTADO: ${a.status.toUpperCase()}`}
                   statusColor={isAlert ? "text-tc-error" : isActive ? "text-tc-primary-fixed" : "text-white/40"}
                   metric={a.stats.cnsStress.toString()}
                   metricLabel="CNS STRESS"
                   progress={a.stats.progressPercent > 0 ? `+${a.stats.progressPercent}%` : `${a.stats.progressPercent}%`}
                   progressColor={a.stats.progressPercent > 0 ? "text-tc-secondary" : "text-white/40"}
                   barPercent={a.stats.cnsStress}
                   active={isActive}
                   accentBorder={isAlert}
                 />
               );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

/* ── Sub-components ── */

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  subtitle: string;
  icon?: string;
  pulse?: boolean;
  accentColor: string;
}

function StatCard({
  label,
  value,
  unit,
  subtitle,
  icon,
  pulse,
  accentColor,
}: StatCardProps) {
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
        <div className={`text-4xl font-headline font-black tracking-tighter ${accentColor}`}>
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

interface AthleteCardProps {
  name: string;
  status: string;
  statusColor: string;
  metric: string;
  metricLabel?: string;
  progress: string;
  progressColor: string;
  barPercent: number;
  active?: boolean;
  accentBorder?: boolean;
}

function AthleteCard({
  name,
  status,
  statusColor,
  metric,
  metricLabel = "Métrica",
  progress,
  progressColor,
  barPercent,
  active,
  accentBorder,
}: AthleteCardProps) {
  return (
    <div
      className={`bg-tc-surface-container-low p-5 rounded-lg group hover:bg-tc-surface-container-high transition-all cursor-pointer ${
        accentBorder ? "border-t-2 border-tc-error/50" : ""
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded bg-tc-surface-container-highest overflow-hidden flex items-center justify-center ${
              accentBorder ? "border border-tc-error/20" : "border border-white/5"
            }`}
          >
            <span className="material-symbols-outlined text-white/40 text-2xl">
              person
            </span>
          </div>
          <div>
            <h5 className="text-white font-bold text-sm">{name}</h5>
            <p
              className={`${statusColor} text-[10px] uppercase font-black tracking-widest`}
            >
              {status}
            </p>
          </div>
        </div>
        <span
          className={`material-symbols-outlined text-lg ${
            active ? "text-tc-secondary" : accentBorder ? "text-tc-error" : "text-white/20"
          }`}
          style={{
            fontVariationSettings: active || accentBorder ? "'FILL' 1" : "'FILL' 0",
          }}
        >
          {active ? "sensors" : accentBorder ? "warning" : "sensors_off"}
        </span>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-widest">
            {metricLabel}
          </p>
          <p className="font-headline font-bold text-lg">
            {metric}{" "}
            <span className="text-xs text-white/40 font-normal">%</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-white/40 uppercase tracking-widest">
            Progreso 7D
          </p>
          <p className={`font-headline font-bold text-lg ${progressColor}`}>
            {progress}
          </p>
        </div>
      </div>

      <div className="mt-4 w-full h-1 bg-tc-surface-container-highest rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${
            barPercent === 0
              ? "bg-tc-surface-container-highest"
              : barPercent === 100
                ? "bg-tc-primary/40"
                : accentBorder
                  ? "bg-tc-error"
                  : active
                     ? "bg-gradient-to-r from-tc-primary to-tc-secondary"
                     : "bg-tc-outline-variant"
          }`}
          style={{ width: `${barPercent}%` }}
        />
      </div>
    </div>
  );
}
