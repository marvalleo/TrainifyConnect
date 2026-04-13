export function SettingsPage() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="font-headline font-black text-3xl tracking-tighter uppercase mb-2">
          Ajustes del Sistema
        </h2>
        <p className="text-tc-on-surface-variant text-sm uppercase tracking-widest font-label font-bold">
          Configuración de seguridad y plataforma
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-tc-surface-container-low p-6 rounded-lg space-y-4">
        <h3 className="font-headline font-bold text-sm uppercase tracking-widest border-b border-white/5 pb-3">
          Perfil del Coach
        </h3>
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-lg bg-tc-surface-container-highest flex items-center justify-center">
            <span className="material-symbols-outlined text-white/30 text-4xl">
              person
            </span>
          </div>
          <div className="space-y-2 flex-1">
            <div>
              <label className="text-[10px] text-tc-on-surface-variant uppercase tracking-widest font-bold block mb-1">
                Nombre
              </label>
              <input
                className="w-full bg-tc-surface-container-highest border-none py-2 px-3 rounded-sm text-sm font-headline outline-none focus:ring-1 focus:ring-tc-secondary"
                defaultValue="Master Coach"
                type="text"
              />
            </div>
            <div>
              <label className="text-[10px] text-tc-on-surface-variant uppercase tracking-widest font-bold block mb-1">
                Email
              </label>
              <input
                className="w-full bg-tc-surface-container-highest border-none py-2 px-3 rounded-sm text-sm font-headline outline-none focus:ring-1 focus:ring-tc-secondary"
                defaultValue="coach@trainifyconnect.com"
                type="email"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-tc-surface-container-low p-6 rounded-lg space-y-4">
        <h3 className="font-headline font-bold text-sm uppercase tracking-widest border-b border-white/5 pb-3 flex items-center gap-2">
          <span
            className="material-symbols-outlined text-tc-secondary text-sm"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            security
          </span>
          Protocolos de Seguridad
        </h3>
        <div className="space-y-3">
          <SettingToggle
            label="Device Binding"
            description="Bloquear cuenta a un único dispositivo móvil"
            enabled
          />
          <SettingToggle
            label="Restricción de Exportación"
            description="Impedir exportación de rutinas desde la app móvil"
            enabled
          />
          <SettingToggle
            label="Marca de Agua en Videos"
            description="Aplicar marca de agua dinámica con email del usuario"
            enabled
          />
          <SettingToggle
            label="Notificaciones de Login"
            description="Alertar cuando un atleta inicie sesión"
          />
        </div>
      </div>

      {/* Data Section */}
      <div className="bg-tc-surface-container-low p-6 rounded-lg space-y-4">
        <h3 className="font-headline font-bold text-sm uppercase tracking-widest border-b border-white/5 pb-3">
          Datos y Almacenamiento
        </h3>
        <div className="flex items-center justify-between p-3 bg-tc-surface-container-highest rounded">
          <div>
            <p className="text-sm font-bold text-white">Firebase Storage</p>
            <p className="text-[10px] text-tc-on-surface-variant uppercase tracking-widest">
              Videos, notas de voz, fotos de maquinaria
            </p>
          </div>
          <div className="text-right">
            <p className="font-headline font-bold text-tc-secondary">2.4 GB</p>
            <p className="text-[10px] text-tc-on-surface-variant">de 5 GB</p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-tc-surface-container-low p-6 rounded-lg border border-tc-error/20">
        <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-tc-error mb-4">
          Zona Peligrosa
        </h3>
        <button className="px-4 py-2 border border-tc-error/30 text-tc-error text-xs font-bold uppercase tracking-widest hover:bg-tc-error hover:text-tc-on-error transition-all rounded-sm cursor-pointer">
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

function SettingToggle({
  label,
  description,
  enabled,
}: {
  label: string;
  description: string;
  enabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-tc-surface-container-highest/50 rounded">
      <div>
        <p className="text-sm font-bold text-white">{label}</p>
        <p className="text-[10px] text-tc-on-surface-variant uppercase tracking-widest">
          {description}
        </p>
      </div>
      <div
        className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${
          enabled ? "bg-tc-primary-fixed" : "bg-tc-surface-container-highest"
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full absolute top-0.5 transition-all ${
            enabled
              ? "right-0.5 bg-tc-on-primary-fixed"
              : "left-0.5 bg-tc-outline"
          }`}
        />
      </div>
    </div>
  );
}
