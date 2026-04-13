import { useState } from "react";
import { useExercises } from "../hooks/useExercises";
import { useRoutines, type RoutineExercise } from "../hooks/useRoutines";

export function RoutinesPage() {
  const { exercises, loading: exLoading } = useExercises();
  const { addRoutine } = useRoutines();

  const [draftName, setDraftName] = useState("ESTRATEGIA_01");
  const [draftPhase, setDraftPhase] = useState("Fase II: Reclutamiento de Unidades Motoras");
  const [draftExercises, setDraftExercises] = useState<RoutineExercise[]>([]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  // Filter exercises for right sidebar
  const filteredExercises = exercises.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddExerciseToDraft = (exerciseId: string) => {
    setDraftExercises([
      ...draftExercises,
      {
        exerciseId,
        order: draftExercises.length + 1,
        sets: [10, 10, 10], // Default 3 sets of 10
        intensity: "RPE 8",
        rest: "90s",
      },
    ]);
  };

  const handleRemoveDraftExercise = (index: number) => {
    const fresh = [...draftExercises];
    fresh.splice(index, 1);
    setDraftExercises(fresh);
  };

  const updateDraftExercise = (index: number, attr: keyof RoutineExercise, value: any) => {
    const fresh = [...draftExercises];
    fresh[index] = { ...fresh[index], [attr]: value };
    setDraftExercises(fresh);
  };

  const handleSaveDraft = async () => {
    if (draftExercises.length === 0) return alert("Agrega al menos un ejercicio.");
    setSaving(true);
    const res = await addRoutine({
      name: draftName,
      phase: draftPhase,
      exercises: draftExercises,
    });
    setSaving(false);
    if (res.success) {
      alert("Rutina guardada en la base de datos.");
      setDraftExercises([]); // Clear to start another
    } else {
      alert("Error al guardar rutina.");
    }
  };

  return (
    <div className="grid grid-cols-12 gap-8 animate-[fadeIn_0.3s_ease]">
      {/* Left: Routine Builder */}
      <div className="col-span-12 xl:col-span-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-end flex-wrap gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-headline font-black tracking-tighter text-tc-on-surface flex items-center gap-2">
              PLAN:{" "}
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="bg-transparent border-b-2 border-tc-primary-fixed outline-none text-tc-primary-fixed w-64"
              />
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-tc-on-surface-variant font-label text-xs tracking-widest uppercase">
                FASE:
              </span>
              <input
                type="text"
                value={draftPhase}
                onChange={(e) => setDraftPhase(e.target.value)}
                className="bg-transparent border-none outline-none text-tc-on-surface-variant text-xs w-80 font-label tracking-widest uppercase"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="px-4 py-2 border border-tc-outline-variant/15 text-tc-secondary font-headline font-bold text-xs tracking-widest rounded-sm flex items-center gap-2 hover:bg-tc-secondary/5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              {saving ? "GUARDANDO..." : "GUARDAR BORRADOR"}
            </button>
            <button className="px-6 py-2 bg-tc-primary-fixed/50 text-tc-on-primary-fixed/50 font-headline font-bold text-xs tracking-widest rounded-sm flex items-center gap-2 transition-transform cursor-not-allowed">
               <span className="material-symbols-outlined text-sm">send</span>
               DESPLEGAR A ATLETA
            </button>
          </div>
        </div>

        {/* Exercises */}
        {draftExercises.length === 0 ? (
           <div className="w-full h-40 border-2 border-dashed border-white/5 rounded-lg flex flex-col items-center justify-center gap-2">
             <span className="material-symbols-outlined text-3xl text-white/20">back_hand</span>
             <span className="text-xs font-headline font-bold tracking-widest text-white/20 uppercase">Arrastra o elige ejercicios desde la librería</span>
           </div>
        ) : (
          draftExercises.map((dx, i) => {
            // Check exercise metadata
            const exMeta = exercises.find((e) => e.id === dx.exerciseId);
            if (!exMeta) return null;

            return (
              <div
                key={i}
                className="bg-tc-surface-container-low p-6 rounded-lg relative overflow-hidden group border border-transparent hover:border-white/5 transition-all"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-tc-primary-fixed" />
                <div className="flex justify-between">
                  <div className="flex gap-6 w-full pr-8">
                    <div className="w-32 h-32 bg-tc-surface-container-highest rounded flex items-center justify-center border border-white/5 flex-shrink-0 relative">
                       {exMeta.videoUrl ? (
                          <video src={exMeta.videoUrl} className="w-full h-full object-cover rounded opacity-50" />
                       ) : exMeta.imageUrl ? (
                          <img src={exMeta.imageUrl} className="w-full h-full object-cover rounded opacity-50" />
                       ) : (
                          <span className="material-symbols-outlined text-white/15 text-5xl">exercise</span>
                       )}
                    </div>
                    <div className="flex flex-col justify-between py-1 flex-grow">
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-headline font-black text-2xl tracking-tighter uppercase">
                            {`${(i + 1).toString().padStart(2, "0")}. ${exMeta.name}`}
                          </span>
                        </div>
                        <p className="text-tc-on-surface-variant text-xs mt-1 font-medium tracking-wide uppercase">
                          {exMeta.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-6 mt-4 flex-wrap">
                        <div className="space-y-1">
                          <span className="text-[10px] text-tc-on-surface-variant font-label tracking-widest uppercase">
                            ESQUEMA DE SERIES (Reps)
                          </span>
                          <div className="flex gap-2">
                            {dx.sets.map((rep, repIndex) => (
                              <input
                                key={repIndex}
                                type="number"
                                value={rep}
                                onChange={(e) => {
                                  const newSets = [...dx.sets];
                                  newSets[repIndex] = parseInt(e.target.value) || 0;
                                  updateDraftExercise(i, "sets", newSets);
                                }}
                                className="w-10 h-10 bg-tc-surface-container-highest border-b-2 border-tc-primary-fixed text-center text-tc-primary-fixed font-headline font-bold outline-none"
                              />
                            ))}
                            {/* Add Set button */}
                            <button
                              onClick={() => {
                                const newSets = [...dx.sets, 10]; // Add a set of 10
                                updateDraftExercise(i, "sets", newSets);
                              }}
                              className="w-10 h-10 bg-tc-surface-container-highest border-b-2 border-white/20 text-white/50 hover:bg-white/5 font-headline font-bold text-lg cursor-pointer"
                            >
                              +
                            </button>
                            {/* Remove Set button */}
                            {dx.sets.length > 1 && (
                               <button
                                 onClick={() => {
                                   const newSets = [...dx.sets];
                                   newSets.pop();
                                   updateDraftExercise(i, "sets", newSets);
                                 }}
                                 className="w-10 h-10 bg-tc-surface-container-highest border-b-2 border-tc-error text-tc-error/50 hover:text-tc-error hover:bg-white/5 font-headline font-bold cursor-pointer"
                               >
                                 -
                               </button>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-tc-on-surface-variant font-label tracking-widest uppercase">
                            INTENSIDAD
                          </span>
                          <input
                            type="text"
                            value={dx.intensity}
                            onChange={(e) => updateDraftExercise(i, "intensity", e.target.value)}
                            className="text-xl font-headline font-black text-white bg-transparent border-b border-dashed border-white/30 w-24 outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-tc-on-surface-variant font-label tracking-widest uppercase">
                            DESCANSO
                          </span>
                          <input
                            type="text"
                            value={dx.rest}
                            onChange={(e) => updateDraftExercise(i, "rest", e.target.value)}
                            className="text-xl font-headline font-black text-white bg-transparent border-b border-dashed border-white/30 w-24 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 relative">
                    <button
                      onClick={() => handleRemoveDraftExercise(i)}
                      className="p-2 hover:bg-tc-error/10 rounded transition-colors text-tc-error/40 hover:text-tc-error cursor-pointer"
                      title="Eliminar de la rutina"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
                
                {/* Optional Alert */}
                <div className="mt-4 flex gap-2 items-center">
                   <span className="material-symbols-outlined text-tc-error text-sm">warning</span>
                   <input 
                     type="text"
                     placeholder="Agregar alerta técnica (opcional)..."
                     value={dx.technicalAlert || ""}
                     onChange={(e) => updateDraftExercise(i, "technicalAlert", e.target.value)}
                     className="bg-transparent border-none text-[10px] uppercase font-bold tracking-widest outline-none text-tc-error placeholder:text-tc-error/30 w-full"
                   />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Right: Library + Project Metrics */}
      <div className="col-span-12 xl:col-span-4 space-y-6">
        {/* Search & Filter */}
        <div className="bg-tc-surface-container-low p-6 rounded-lg space-y-4">
          <h3 className="text-sm font-headline font-bold text-white tracking-widest uppercase border-b border-white/5 pb-4">
            Librería de Unidades
          </h3>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-tc-on-surface-variant text-sm">
              search
            </span>
            <input
              className="w-full bg-tc-surface-container-highest border-none text-xs font-label tracking-widest uppercase py-3 pl-10 rounded-sm transition-all outline-none focus:ring-1 focus:ring-tc-secondary"
              placeholder="BUSCAR EJERCICIO..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Exercise Quick List */}
        <div className="bg-tc-surface-container-low p-3 rounded-lg max-h-[500px] overflow-y-auto custom-scrollbar space-y-1">
          {exLoading ? (
            <div className="p-4 text-center">
              <div className="w-6 h-6 border-2 border-tc-secondary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredExercises.length === 0 ? (
            <p className="text-[10px] text-center text-tc-outline-variant font-bold uppercase py-6">
              No hay ejercicios ({search ? "para tu búsqueda" : "registrados"})
            </p>
          ) : (
            filteredExercises.map((ex) => (
              <div
                key={ex.id}
                onClick={() => handleAddExerciseToDraft(ex.id)}
                className="p-3 rounded cursor-pointer flex gap-4 transition-colors hover:bg-tc-surface-container-highest group border border-transparent hover:border-tc-secondary/30"
              >
                <div className="w-14 h-14 bg-tc-surface flex-shrink-0 rounded flex items-center justify-center p-1 overflow-hidden relative">
                   {ex.imageUrl ? (
                     <img src={ex.imageUrl} className="w-full h-full object-cover rounded opacity-60" />
                   ) : ex.videoUrl ? (
                     <video src={ex.videoUrl} className="w-full h-full object-cover rounded opacity-60" />
                   ) : (
                     <span className="material-symbols-outlined text-white/20 text-2xl">
                       fitness_center
                     </span>
                   )}
                   <div className="absolute inset-0 bg-tc-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-xl">add</span>
                   </div>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-xs font-headline font-bold text-white uppercase tracking-tight line-clamp-1">
                    {ex.name}
                  </p>
                  <p className="text-[10px] text-tc-secondary uppercase font-bold tracking-widest mt-1">
                    {ex.category}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info Module */}
        <div className="bg-tc-surface-container-low p-6 rounded-lg border-t-4 border-tc-primary shadow-lg">
           <p className="text-[10px] text-tc-on-surface-variant font-label tracking-widest uppercase mb-1">
              Guía de Creador
           </p>
           <p className="text-xs text-tc-outline leading-relaxed mt-2 font-medium">
             Toca cualquier ejercicio en la librería para agregarlo a la rutina actual. Luego define los bloques de series, repeticiones, intensidad y tiempos de recuperación.
           </p>
        </div>
      </div>
    </div>
  );
}
