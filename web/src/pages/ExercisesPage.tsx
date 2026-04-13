import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useExercises } from "../hooks/useExercises";

const filterTags = ["TODOS", "TREN INFERIOR", "TREN SUPERIOR", "CORE", "CARDIO", "FUNCIONAL"];

export function ExercisesPage() {
  const navigate = useNavigate();
  const { exercises, loading, deleteExercise } = useExercises();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("TODOS");

  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => {
      const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase()) || 
                           ex.category.toLowerCase().includes(search.toLowerCase());
      const matchesTab = activeTab === "TODOS" || ex.category.toUpperCase() === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [exercises, search, activeTab]);

  const groupedExercises = useMemo(() => {
    const groups: Record<string, typeof exercises> = {};
    filteredExercises.forEach(ex => {
      if (!groups[ex.category]) groups[ex.category] = [];
      groups[ex.category].push(ex);
    });
    return groups;
  }, [filteredExercises]);

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease]">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline font-black text-4xl tracking-tighter uppercase leading-none">
            Librería de <span className="text-tc-secondary">Ejercicios</span>
          </h2>
          <p className="text-tc-on-surface-variant text-sm uppercase tracking-[0.2em] font-label font-bold mt-2">
            Control de máquinas y biomecánica
          </p>
        </div>
        <button 
          onClick={() => navigate("/exercises/new")}
          className="bg-tc-secondary text-tc-on-secondary-container px-6 py-3 rounded-sm font-headline font-bold text-xs tracking-widest hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_20px_rgba(0,227,253,0.2)]"
        >
          <span className="material-symbols-outlined text-sm">add_circle</span>
          NUEVO EJERCICIO
        </button>
      </div>

      {/* Search & Tabs */}
      <div className="space-y-6">
        <div className="relative max-w-xl">
          <input
            className="w-full bg-tc-surface-container-low border-none py-4 px-5 rounded-xl focus:ring-2 focus:ring-tc-secondary/50 outline-none transition-all placeholder:text-tc-outline-variant font-headline font-medium text-sm pr-12"
            placeholder="BUSCAR POR NOMBRE O CATEGORÍA..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-tc-secondary">
            search
          </span>
        </div>

        <div className="flex gap-2 flex-wrap">
          {filterTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTab(tag)}
              className={`px-6 py-2 rounded-full font-headline font-bold text-[10px] tracking-widest uppercase transition-all cursor-pointer border ${
                activeTab === tag
                  ? "bg-tc-secondary border-tc-secondary text-tc-on-secondary"
                  : "bg-transparent border-white/10 text-tc-outline hover:border-tc-secondary/40"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-2 border-tc-secondary/20 border-t-tc-secondary rounded-full animate-spin" />
        </div>
      ) : Object.keys(groupedExercises).length === 0 ? (
        <div className="text-center py-20 bg-tc-surface-container-low rounded-2xl border border-dashed border-white/5 mx-auto max-w-xl">
           <span className="material-symbols-outlined text-6xl text-white/10 mb-4 font-light">inventory_2</span>
           <p className="text-tc-outline uppercase tracking-widest text-sm font-headline">No se encontraron resultados</p>
           <button onClick={() => navigate("/exercises/new")} className="mt-4 text-tc-secondary text-xs font-bold uppercase tracking-widest hover:underline cursor-pointer">Crear ejercicio</button>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedExercises).map(([category, items]) => (
            <div key={category}>
              <div className="flex items-center gap-4 mb-6">
                <h3 className="font-headline text-xl font-black tracking-tighter text-white uppercase shrink-0">
                  {category}
                </h3>
                <div className="h-[1px] bg-white/5 flex-grow" />
                <span className="text-[10px] font-label font-black text-tc-secondary tracking-widest uppercase">
                  {items.length} UNIDADES
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="bg-tc-surface-container-low rounded-xl p-5 flex gap-5 group hover:bg-tc-surface-container transition-all relative overflow-hidden border border-white/5"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-tc-surface-container-highest flex items-center justify-center border border-white/5 relative">
                      {exercise.videoUrl ? (
                        <video 
                          src={exercise.videoUrl} 
                          className="w-full h-full object-cover" 
                          muted 
                          loop 
                          playsInline 
                          onMouseEnter={e => e.currentTarget.play()} 
                          onMouseLeave={e => e.currentTarget.pause()} 
                        />
                      ) : exercise.imageUrl ? (
                        <img 
                          src={exercise.imageUrl} 
                          alt={exercise.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span className="material-symbols-outlined text-white/10 text-3xl">
                          fitness_center
                        </span>
                      )}
                      {(exercise.videoUrl || exercise.imageUrl) && (
                        <div className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5 flex items-center justify-center pointer-events-none">
                           <span className="material-symbols-outlined text-[10px] text-tc-secondary">
                             {exercise.videoUrl ? 'play_circle' : 'image'}
                           </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col justify-between py-1 flex-grow">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-headline font-bold text-lg tracking-tight uppercase">
                            {exercise.name}
                          </h4>
                          <button 
                            onClick={() => { if(window.confirm("¿Eliminar ejercicio?")) deleteExercise(exercise.id) }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-tc-outline hover:text-tc-error transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {exercise.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[8px] bg-white/5 text-white/60 px-2 py-0.5 rounded border border-white/10 font-bold uppercase tracking-widest"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <button className="w-8 h-8 rounded-full bg-tc-secondary/10 border border-tc-secondary/20 flex items-center justify-center text-tc-secondary group-hover:bg-tc-secondary group-hover:text-tc-on-secondary transition-all cursor-pointer">
                          <span
                            className="material-symbols-outlined text-sm"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            play_arrow
                          </span>
                        </button>
                        <span className="text-[9px] font-label font-bold text-tc-outline-variant uppercase tracking-widest truncate max-w-[200px]">
                          {exercise.audioNote || "Sincronizando biometricos..."}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Security Badge */}
      <div className="flex justify-center pb-8 opacity-50">
        <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-tc-surface-container-low border border-white/5">
           <span className="material-symbols-outlined text-tc-secondary text-sm">verified_user</span>
           <span className="text-[10px] uppercase tracking-[0.2em] font-black text-tc-outline-variant">Protocolo de Librería Activo</span>
        </div>
      </div>
    </div>
  );
}
