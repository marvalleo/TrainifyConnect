import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAthletes, type NewAthleteData } from "../hooks/useAthletes";

const trainingTypes = [
  "Hipertrofia",
  "Fuerza",
  "HIIT",
  "Potencia",
  "Resistencia",
  "Funcional",
  "Recuperación",
  "General",
];

const goals = [
  "Ganar masa muscular",
  "Perder grasa",
  "Mejorar rendimiento",
  "Rehabilitación",
  "Preparación competencia",
  "Mantenimiento",
  "Otro",
];

export function AddAthletePage() {
  const navigate = useNavigate();
  const { addAthlete } = useAthletes();

  const [formData, setFormData] = useState<NewAthleteData>({
    displayName: "",
    email: "",
    phone: "",
    age: 0,
    goal: "",
    trainingType: "General",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "age" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!formData.displayName.trim()) {
      setErrorMsg("El nombre del atleta es obligatorio.");
      return;
    }

    setSubmitting(true);

    const result = await addAthlete({
      ...formData,
      displayName: formData.displayName.trim(),
    });

    setSubmitting(false);

    if (result.success) {
      setSuccessMsg(`${formData.displayName} fue agregado exitosamente.`);
      setTimeout(() => navigate("/athletes"), 1200);
    } else {
      setErrorMsg(result.error || "No se pudo registrar el atleta. ¿Habilitaste Cloud Firestore en la consola de Firebase?");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <button
            onClick={() => navigate("/athletes")}
            className="flex items-center gap-1 text-tc-on-surface-variant hover:text-white transition-colors text-xs font-headline uppercase tracking-widest mb-3 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Volver al directorio
          </button>
          <h2 className="font-headline font-black text-3xl tracking-tighter uppercase">
            Registrar <span className="text-tc-primary-fixed">Nuevo Atleta</span>
          </h2>
          <p className="text-tc-on-surface-variant text-sm uppercase tracking-widest font-label font-bold mt-1">
            Ingreso al sistema de monitoreo
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-tc-surface-container-highest rounded border border-tc-outline-variant/10">
          <span
            className="material-symbols-outlined text-tc-secondary text-sm"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            security
          </span>
          <span className="text-[10px] font-bold text-tc-on-surface-variant tracking-widest uppercase">
            Encrypted Storage
          </span>
        </div>
      </div>

      {/* Feedback Messages */}
      {errorMsg && (
        <div className="p-4 bg-tc-error/10 border border-tc-error/20 rounded-lg flex items-start gap-3 animate-[fadeIn_0.3s_ease]">
          <span className="material-symbols-outlined text-tc-error shrink-0">error</span>
          <div>
            <p className="text-sm font-bold text-tc-error">{errorMsg}</p>
            <p className="text-[10px] text-tc-error/70 mt-1 uppercase tracking-widest">
              Verificá la configuración de Firestore en la consola de Firebase
            </p>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="ml-auto text-tc-error/50 hover:text-tc-error cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-tc-primary/10 border border-tc-primary/20 rounded-lg flex items-center gap-3 animate-[fadeIn_0.3s_ease]">
          <span
            className="material-symbols-outlined text-tc-primary-fixed"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          <p className="text-sm font-bold text-tc-primary-fixed">{successMsg}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identity Section */}
        <div className="bg-tc-surface-container-low p-6 rounded-lg space-y-5">
          <h3 className="font-headline font-bold text-sm uppercase tracking-widest border-b border-white/5 pb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-tc-secondary text-sm">badge</span>
            Información Personal
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name - Required */}
            <div className="md:col-span-2">
              <label
                htmlFor="displayName"
                className="text-[10px] text-tc-on-surface-variant uppercase tracking-widest font-bold block mb-2"
              >
                Nombre Completo *
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                required
                value={formData.displayName}
                onChange={handleChange}
                placeholder="Ej: Wilfredo Martínez"
                className="w-full bg-tc-surface-container-highest border-none py-3 px-4 rounded-sm text-sm font-headline outline-none focus:ring-2 focus:ring-tc-primary-fixed/50 placeholder:text-tc-outline-variant/40 transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="text-[10px] text-tc-on-surface-variant uppercase tracking-widest font-bold block mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="atleta@email.com"
                className="w-full bg-tc-surface-container-highest border-none py-3 px-4 rounded-sm text-sm font-headline outline-none focus:ring-2 focus:ring-tc-primary-fixed/50 placeholder:text-tc-outline-variant/40 transition-all"
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="text-[10px] text-tc-on-surface-variant uppercase tracking-widest font-bold block mb-2"
              >
                Teléfono
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+56 9 1234 5678"
                className="w-full bg-tc-surface-container-highest border-none py-3 px-4 rounded-sm text-sm font-headline outline-none focus:ring-2 focus:ring-tc-primary-fixed/50 placeholder:text-tc-outline-variant/40 transition-all"
              />
            </div>

            {/* Age */}
            <div>
              <label
                htmlFor="age"
                className="text-[10px] text-tc-on-surface-variant uppercase tracking-widest font-bold block mb-2"
              >
                Edad
              </label>
              <input
                id="age"
                name="age"
                type="number"
                min={10}
                max={99}
                value={formData.age || ""}
                onChange={handleChange}
                placeholder="25"
                className="w-full bg-tc-surface-container-highest border-none py-3 px-4 rounded-sm text-sm font-headline outline-none focus:ring-2 focus:ring-tc-primary-fixed/50 placeholder:text-tc-outline-variant/40 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Training Section */}
        <div className="bg-tc-surface-container-low p-6 rounded-lg space-y-5">
          <h3 className="font-headline font-bold text-sm uppercase tracking-widest border-b border-white/5 pb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-tc-primary-fixed text-sm">fitness_center</span>
            Configuración de Entrenamiento
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Training Type */}
            <div>
              <label
                htmlFor="trainingType"
                className="text-[10px] text-tc-on-surface-variant uppercase tracking-widest font-bold block mb-2"
              >
                Tipo de Entrenamiento
              </label>
              <select
                id="trainingType"
                name="trainingType"
                value={formData.trainingType}
                onChange={handleChange}
                className="w-full bg-tc-surface-container-highest border-none py-3 px-4 rounded-sm text-sm font-headline outline-none focus:ring-2 focus:ring-tc-primary-fixed/50 transition-all cursor-pointer appearance-none"
              >
                {trainingTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Goal */}
            <div>
              <label
                htmlFor="goal"
                className="text-[10px] text-tc-on-surface-variant uppercase tracking-widest font-bold block mb-2"
              >
                Objetivo Principal
              </label>
              <select
                id="goal"
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                className="w-full bg-tc-surface-container-highest border-none py-3 px-4 rounded-sm text-sm font-headline outline-none focus:ring-2 focus:ring-tc-primary-fixed/50 transition-all cursor-pointer appearance-none"
              >
                <option value="">Seleccionar objetivo...</option>
                {goals.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="notes"
              className="text-[10px] text-tc-on-surface-variant uppercase tracking-widest font-bold block mb-2"
            >
              Notas Médicas / Observaciones
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Lesiones previas, condiciones médicas, restricciones de movimiento..."
              className="w-full bg-tc-surface-container-highest border-none py-3 px-4 rounded-sm text-sm font-headline outline-none focus:ring-2 focus:ring-tc-primary-fixed/50 placeholder:text-tc-outline-variant/40 transition-all resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={() => navigate("/athletes")}
            className="px-6 py-3 border border-tc-outline-variant/15 text-tc-on-surface-variant hover:text-white hover:border-white/20 font-headline font-bold text-xs tracking-widest transition-all cursor-pointer rounded-sm"
          >
            CANCELAR
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 bg-tc-primary-fixed text-tc-on-primary-fixed font-headline font-bold text-xs tracking-widest rounded-sm flex items-center gap-2 active:scale-95 transition-all shadow-[0_0_20px_rgba(202,253,0,0.2)] hover:shadow-[0_0_30px_rgba(202,253,0,0.3)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-tc-on-primary-fixed/30 border-t-tc-on-primary-fixed rounded-full animate-spin" />
                REGISTRANDO...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">person_add</span>
                REGISTRAR ATLETA
              </>
            )}
          </button>
        </div>

        {/* Info Banner */}
        <div className="flex justify-center">
          <div className="bg-tc-surface-container-highest/50 px-4 py-2 rounded-full flex items-center gap-2 border border-tc-outline-variant/10">
            <span
              className="material-symbols-outlined text-tc-secondary text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield
            </span>
            <span className="text-[10px] font-label font-bold text-tc-on-surface-variant tracking-widest uppercase">
              Los datos del atleta están protegidos por protocolo de encriptación
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
