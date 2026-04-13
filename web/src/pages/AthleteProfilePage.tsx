import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAthletes, type Athlete } from "../hooks/useAthletes";
import { useRoutines } from "../hooks/useRoutines";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export function AthleteProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { athletes, loading } = useAthletes();
  const { routines, loading: routinesLoading } = useRoutines();
  
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Athlete>>({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("INFO"); // INFO, ROUTINES, STATS

  useEffect(() => {
    if (!loading) {
      const found = athletes.find(a => a.id === id);
      if (found) {
        setAthlete(found);
        if(!isEditing) {
           setEditForm(found);
        }
      } else {
        // Only redirect if we finished loading and couldn't find them
        navigate("/athletes");
      }
    }
  }, [id, athletes, loading, navigate, isEditing]);

  const handleSave = async () => {
    if (!athlete || !id) return;
    setSaving(true);
    try {
       const ref = doc(db, "athletes", id);
       await updateDoc(ref, {
         displayName: editForm.displayName,
         email: editForm.email,
         phone: editForm.phone,
         age: editForm.age,
         trainingType: editForm.trainingType,
         goal: editForm.goal,
         notes: editForm.notes,
         status: editForm.status
       });
       setIsEditing(false);
    } catch (err) {
       console.error("Error updating athlete:", err);
       alert("Error al actualizar atleta");
    } finally {
       setSaving(false);
    }
  };

  const handleAssignRoutine = async (routineId: string, routineName: string) => {
    if (!athlete || !id) return;
    try {
       const ref = doc(db, "athletes", id);
       await updateDoc(ref, {
         activeRoutineId: routineId,
         activeRoutineName: routineName
       });
       alert(`Rutina asignada con éxito`);
    } catch (err) {
       console.error("Error assigning routine:", err);
       alert("Error al asignar rutina");
    }
  };

  if (loading || !athlete) {
    return (
      <div className="flex justify-center p-20">
        <div className="w-10 h-10 border-2 border-tc-primary/20 border-t-tc-primary-fixed rounded-full animate-spin" />
      </div>
    );
  }

  const isAlert = athlete.status === "alert";
  const isActive = athlete.status === "active";
  const statusColor = isAlert ? "bg-tc-error text-tc-error" : isActive ? "bg-tc-primary-fixed text-tc-primary-fixed" : "bg-tc-outline text-tc-outline";

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease]">
      {/* Header Profile */}
      <div className="flex gap-4 items-start">
         <button onClick={() => navigate("/athletes")} className="p-2 hover:bg-white/5 rounded-full text-tc-outline hover:text-white transition-all cursor-pointer">
           <span className="material-symbols-outlined">arrow_back</span>
         </button>
         
         <div className="flex-grow flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-tc-surface-container-highest rounded-xl border border-white/10 flex items-center justify-center">
                 <span className="material-symbols-outlined text-white/30 text-5xl">person</span>
              </div>
              <span className={`absolute -top-2 -right-2 w-5 h-5 rounded-full border-4 border-tc-surface ${statusColor.split(' ')[0]}`} />
            </div>

            <div>
               <h2 className="font-headline font-black text-4xl tracking-tighter uppercase">{athlete.displayName}</h2>
               <div className="flex items-center gap-3 mt-1">
                 <span className="text-[10px] bg-tc-surface-container-highest px-2 py-1 rounded border border-white/5 font-mono text-tc-outline-variant">{athlete.id}</span>
                 <span className={`text-[10px] font-bold tracking-widest uppercase ${statusColor.split(' ')[1]}`}>ESTADO: {athlete.status}</span>
               </div>
            </div>
         </div>

         <div>
           {!isEditing ? (
             <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 border border-white/10 hover:border-tc-primary/50 text-xs font-bold uppercase tracking-widest rounded-sm transition-all cursor-pointer">
               <span className="material-symbols-outlined text-sm text-tc-primary-fixed">edit</span>
               EDITAR PERFIL
             </button>
           ) : (
             <div className="flex gap-2">
               <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2 border border-white/10 hover:bg-white/5 text-xs font-bold uppercase tracking-widest rounded-sm transition-all cursor-pointer">
                 CANCELAR
               </button>
               <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-tc-primary-fixed text-tc-on-primary-fixed font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all rounded-sm cursor-pointer shadow-[0_0_20px_rgba(202,253,0,0.2)]">
                 <span className="material-symbols-outlined text-sm">save</span>
                 {saving ? "GUARDANDO..." : "GUARDAR"}
               </button>
             </div>
           )}
         </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10">
         {["INFO", "RUTINAS", "HISTORIAL FIT"].map(tab => (
           <button 
             key={tab}
             onClick={() => setActiveTab(tab)}
             className={`px-8 py-3 text-xs font-headline font-bold uppercase tracking-widest transition-all cursor-pointer border-b-2 ${activeTab === tab ? "border-tc-primary-fixed text-tc-primary-fixed" : "border-transparent text-tc-outline hover:text-white"}`}
           >
             {tab}
           </button>
         ))}
      </div>

      {/* Tab Content */}
      <div className="pt-4">
        {activeTab === "INFO" && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Clinical / Physical Data */}
              <div className="lg:col-span-2 bg-tc-surface-container-low p-6 rounded-2xl border border-white/5 space-y-6">
                <h3 className="font-headline font-bold text-sm uppercase tracking-widest border-b border-white/5 pb-3">Ficha de Atleta</h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-tc-outline uppercase tracking-widest block mb-1">Nombre</label>
                    {isEditing ? (
                      <input type="text" value={editForm.displayName || ""} onChange={e => setEditForm({...editForm, displayName: e.target.value})} className="w-full bg-tc-surface-container-highest border-none py-2 px-3 rounded text-sm font-headline outline-none focus:ring-1 focus:ring-tc-primary-fixed" />
                    ) : (
                      <p className="font-headline text-lg">{athlete.displayName}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-tc-outline uppercase tracking-widest block mb-1">Email</label>
                    {isEditing ? (
                      <input type="email" value={editForm.email || ""} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full bg-tc-surface-container-highest border-none py-2 px-3 rounded text-sm font-headline outline-none focus:ring-1 focus:ring-tc-primary-fixed" />
                    ) : (
                      <p className="font-headline text-lg">{athlete.email || "No registrado"}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-tc-outline uppercase tracking-widest block mb-1">Teléfono</label>
                    {isEditing ? (
                      <input type="tel" value={editForm.phone || ""} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full bg-tc-surface-container-highest border-none py-2 px-3 rounded text-sm font-headline outline-none focus:ring-1 focus:ring-tc-primary-fixed" />
                    ) : (
                      <p className="font-headline text-lg">{athlete.phone || "No registrado"}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-tc-outline uppercase tracking-widest block mb-1">Edad</label>
                    {isEditing ? (
                      <input type="number" value={editForm.age || 0} onChange={e => setEditForm({...editForm, age: parseInt(e.target.value)})} className="w-full bg-tc-surface-container-highest border-none py-2 px-3 rounded text-sm font-headline outline-none focus:ring-1 focus:ring-tc-primary-fixed" />
                    ) : (
                      <p className="font-headline text-lg">{athlete.age} años</p>
                    )}
                  </div>

                  {isEditing && (
                    <div className="col-span-2">
                       <label className="text-[10px] font-bold text-tc-outline uppercase tracking-widest block mb-1">Status de Monitoreo</label>
                       <select value={editForm.status || "inactive"} onChange={e => setEditForm({...editForm, status: e.target.value as any})} className="w-full bg-tc-surface-container-highest border-none py-2 px-3 rounded text-sm font-headline outline-none focus:ring-1 focus:ring-tc-primary-fixed cursor-pointer">
                         <option value="active">Activo</option>
                         <option value="inactive">Inactivo</option>
                         <option value="alert">Alerta (Requiere Atención)</option>
                       </select>
                    </div>
                  )}
                </div>

                <div>
                   <label className="text-[10px] font-bold text-tc-outline uppercase tracking-widest block mb-1">Notas Médicas / Observaciones</label>
                   {isEditing ? (
                     <textarea rows={3} value={editForm.notes || ""} onChange={e => setEditForm({...editForm, notes: e.target.value})} className="w-full bg-tc-surface-container-highest border-none py-2 px-3 rounded text-sm font-headline outline-none focus:ring-1 focus:ring-tc-primary-fixed resize-none" />
                   ) : (
                     <p className="font-headline text-sm bg-tc-surface-container-highest p-4 rounded-lg text-tc-on-surface-variant min-h-[80px]">
                       {athlete.notes || "No hay notas clínicas registradas."}
                     </p>
                   )}
                </div>
              </div>

              {/* Training Parameters */}
              <div className="bg-tc-surface-container-low p-6 rounded-2xl border border-white/5 space-y-6">
                <h3 className="font-headline font-bold text-sm uppercase tracking-widest border-b border-white/5 pb-3">Parámetros</h3>

                <div>
                  <label className="text-[10px] font-bold text-tc-outline uppercase tracking-widest block mb-1">Tipo de Entrenamiento</label>
                  {isEditing ? (
                    <select value={editForm.trainingType || ""} onChange={e => setEditForm({...editForm, trainingType: e.target.value})} className="w-full bg-tc-surface-container-highest border-none py-2 px-3 rounded text-sm font-headline outline-none focus:ring-1 focus:ring-tc-primary-fixed cursor-pointer">
                      <option value="Fuerza">Fuerza</option>
                      <option value="Hipertrofia">Hipertrofia</option>
                      <option value="Cardio">Cardio</option>
                      <option value="Funcional">Funcional</option>
                      <option value="General">General</option>
                    </select>
                  ) : (
                     <p className="font-headline font-black text-xl text-tc-primary-fixed uppercase tracking-tight">{athlete.trainingType}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-[10px] font-bold text-tc-outline uppercase tracking-widest block mb-1">Objetivo</label>
                  {isEditing ? (
                    <input type="text" value={editForm.goal || ""} onChange={e => setEditForm({...editForm, goal: e.target.value})} className="w-full bg-tc-surface-container-highest border-none py-2 px-3 rounded text-sm font-headline outline-none focus:ring-1 focus:ring-tc-primary-fixed" />
                  ) : (
                     <p className="font-headline font-bold text-white uppercase tracking-tight">{athlete.goal}</p>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-white/5">
                   <div className="flex justify-between items-center mb-1">
                     <span className="text-[10px] font-bold text-tc-outline uppercase tracking-widest block">Estrés SNC Promedio</span>
                     <span className="font-bold text-tc-secondary">{athlete.stats.cnsStress}%</span>
                   </div>
                   <div className="w-full h-1 bg-tc-surface-container-highest rounded-full overflow-hidden">
                     <div className="h-full bg-tc-secondary" style={{ width: `${Math.max(athlete.stats.cnsStress, 5)}%` }} />
                   </div>
                </div>

                <div>
                   <div className="flex justify-between items-center mb-1">
                     <span className="text-[10px] font-bold text-tc-outline uppercase tracking-widest block">Progesión Último Mes</span>
                     <span className="font-bold text-tc-primary-fixed">+{athlete.stats.progressPercent}%</span>
                   </div>
                </div>
              </div>

           </div>
        )}

        {/* Routines Assignment Tab */}
        {activeTab === "RUTINAS" && (
           <div className="bg-tc-surface-container-low p-6 rounded-2xl border border-white/5 space-y-6">
             <div className="flex justify-between items-center border-b border-white/5 pb-4">
               <div>
                 <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-tc-primary-fixed">Rutina Activa</h3>
                 {athlete.activeRoutineId ? (
                   <div className="flex items-center gap-3 mt-2">
                     <span className="text-xl font-headline font-black text-white">{athlete.activeRoutineName}</span>
                     <button 
                       onClick={() => handleAssignRoutine("", "")}
                       className="text-[10px] bg-tc-error/10 text-tc-error px-2 py-1 rounded border border-tc-error/20 font-bold uppercase tracking-widest cursor-pointer hover:bg-tc-error/20"
                     >
                       Desasignar
                     </button>
                   </div>
                 ) : (
                   <p className="text-tc-on-surface-variant text-sm mt-2 font-headline uppercase">Ninguna rutina asignada actualmente.</p>
                 )}
               </div>
             </div>

             <div>
               <h3 className="font-headline font-bold text-sm uppercase tracking-widest mb-4">Librería de Planes (Da clic para asignar)</h3>
               {routinesLoading ? (
                 <div className="flex justify-center py-8">
                   <div className="w-6 h-6 border-2 border-tc-primary/20 border-t-tc-primary-fixed rounded-full animate-spin" />
                 </div>
               ) : routines.length === 0 ? (
                 <div className="text-center py-10 bg-tc-surface-container-highest/30 rounded-lg border border-dashed border-white/5">
                   <p className="text-tc-outline uppercase tracking-widest text-[10px] font-bold">Librería Vacía</p>
                   <button onClick={() => navigate("/routines")} className="text-tc-primary-fixed text-xs font-bold uppercase hover:underline mt-2 cursor-pointer">Crear Plan</button>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {routines.map(routine => {
                     const isAssigned = athlete.activeRoutineId === routine.id;
                     return (
                       <div 
                         key={routine.id}
                         onClick={() => {
                           if(!isAssigned && window.confirm(`¿Asignar ${routine.name} a ${athlete.displayName}?`)) {
                             handleAssignRoutine(routine.id, routine.name);
                           }
                         }}
                         className={`p-4 rounded-xl border transition-all cursor-${isAssigned ? 'default' : 'pointer'} flex flex-col gap-2 ${isAssigned ? 'bg-tc-primary-fixed/5 border-tc-primary-fixed/50' : 'bg-tc-surface-container-highest border-white/5 hover:border-tc-primary/30'}`}
                       >
                         <h4 className="font-headline font-bold text-lg uppercase tracking-tight text-white line-clamp-1">{routine.name}</h4>
                         <span className="text-[10px] font-bold tracking-widest uppercase text-tc-secondary">{routine.phase}</span>
                         <div className="flex justify-between items-center mt-2 border-t border-white/5 pt-2">
                           <span className="text-[10px] text-tc-outline-variant font-black uppercase">{routine.exercises.length} Ejercicios</span>
                           {isAssigned ? (
                             <span className="material-symbols-outlined text-tc-primary-fixed text-sm">check_circle</span>
                           ) : (
                             <span className="material-symbols-outlined text-white/20 text-sm">send</span>
                           )}
                         </div>
                       </div>
                     );
                   })}
                 </div>
               )}
             </div>
           </div>
        )}

        {activeTab === "HISTORIAL FIT" && (
           <div className="text-center py-20 bg-tc-surface-container-low rounded-2xl border border-dashed border-white/5">
             <span className="material-symbols-outlined text-6xl text-white/10 mb-4 font-light">monitoring</span>
             <p className="text-tc-outline uppercase tracking-widest text-sm font-headline">Aquí se verán los logs de métricas subidas por la app de Atleta</p>
           </div>
        )}
      </div>

    </div>
  );
}
