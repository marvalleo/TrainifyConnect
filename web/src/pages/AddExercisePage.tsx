import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExercises, type NewExerciseData } from "../hooks/useExercises";
import { useStorage } from "../hooks/useStorage";

const categories = [
  "Tren Inferior",
  "Tren Superior",
  "Core / Abdominales",
  "Cardio / HIIT",
  "Funcional",
  "Estiramiento",
  "Otro",
];

const commonTags = [
  "Cuádriceps", "Glúteo", "Pectoral", "Espalda", "Brazos", "Potencia", "Fuerza", "Hipertrofia"
];

export function AddExercisePage() {
  const navigate = useNavigate();
  const { addExercise } = useExercises();

  const [formData, setFormData] = useState<NewExerciseData>({
    name: "",
    category: "Tren Inferior",
    tags: [],
    audioNote: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { uploadFile, progress, uploading, error: storageError } = useStorage();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag) 
        : [...prev.tags, tag]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    let mediaData: Partial<NewExerciseData> = {};

    if (selectedFile) {
      // Upload to 'exercises' folder
      const downloadUrl = await uploadFile("exercises", selectedFile);
      if (downloadUrl) {
        if (selectedFile.type.startsWith("video/")) {
          mediaData.videoUrl = downloadUrl;
        } else if (selectedFile.type.startsWith("image/")) {
          mediaData.imageUrl = downloadUrl;
        }
      } else {
        setErrorMsg("Error subiendo el archivo multimedia");
        setSubmitting(false);
        return;
      }
    }

    const res = await addExercise({ ...formData, ...mediaData });
    setSubmitting(false);

    if (res.success) {
      navigate("/exercises");
    } else {
      setErrorMsg(res.error || "Falla al guardar");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-[fadeIn_0.3s_ease]">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/exercises")} className="p-2 hover:bg-white/5 rounded-full text-tc-outline hover:text-white transition-all cursor-pointer">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="font-headline font-black text-2xl uppercase tracking-tighter">Nueva <span className="text-tc-secondary">Máquina / Ejercicio</span></h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-tc-surface-container-low p-8 rounded-2xl border border-white/5 space-y-6">
        <div>
          <label className="text-[10px] font-bold text-tc-outline uppercase tracking-widest block mb-2">Nombre del Ejercicio / Máquina</label>
          <input 
            type="text" 
            name="name" 
            required 
            value={formData.name} 
            onChange={handleChange}
            placeholder="Ej: PRENSA 45°"
            className="w-full bg-tc-surface-container-highest border-none py-3 px-4 rounded-lg text-sm font-headline outline-none focus:ring-2 focus:ring-tc-secondary/50 placeholder:text-white/20 transition-all"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-tc-outline uppercase tracking-widest block mb-2">Categoría</label>
          <select 
            name="category" 
            value={formData.category} 
            onChange={handleChange}
            className="w-full bg-tc-surface-container-highest border-none py-3 px-4 rounded-lg text-sm font-headline outline-none cursor-pointer appearance-none focus:ring-2 focus:ring-tc-secondary/50"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-tc-outline uppercase tracking-widest block mb-2">Tags / Músculos Especializados</label>
          <div className="flex flex-wrap gap-2">
            {commonTags.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 rounded border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  formData.tags.includes(tag)
                    ? "bg-tc-secondary border-tc-secondary text-tc-on-secondary"
                    : "border-white/10 text-tc-outline hover:border-tc-secondary/50"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-tc-outline uppercase tracking-widest block mb-2">Nota Técnica (Opcional)</label>
          <input 
            type="text" 
            name="audioNote" 
            value={formData.audioNote} 
            onChange={handleChange}
            placeholder="Ej: Retracción escapular obligatoria"
            className="w-full bg-tc-surface-container-highest border-none py-3 px-4 rounded-lg text-sm font-headline outline-none focus:ring-2 focus:ring-tc-secondary/50 placeholder:text-white/20 transition-all"
          />
        </div>

        {/* Media Upload Area */}
        <div className="bg-tc-surface-container-highest/30 border border-dashed border-white/10 rounded-xl p-6 relative overflow-hidden group">
          {uploading && (
            <div 
              className="absolute left-0 top-0 h-1 bg-tc-secondary transition-all duration-300" 
              style={{ width: `${progress}%` }} 
            />
          )}
          <label className="block cursor-pointer flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined text-4xl text-tc-outline-variant group-hover:text-tc-secondary transition-colors">
              cloud_upload
            </span>
            <div className="text-center">
              <span className="font-headline font-bold text-sm block">
                {selectedFile ? selectedFile.name : "Subir Demostración"}
              </span>
              <span className="text-[10px] uppercase font-bold text-tc-outline-variant tracking-widest mt-1 block">
                {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : "MP4, MOV, JPG, PNG (Max 50MB)"}
              </span>
            </div>
            <input 
              type="file" 
              accept="video/*,image/*"
              className="hidden" 
              onChange={(e) => {
                if(e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
            />
          </label>
        </div>

        {(errorMsg || storageError) && <p className="text-tc-error text-[10px] font-bold uppercase">{errorMsg || storageError}</p>}

        <div className="pt-4 flex gap-4">
           <button 
             type="button" 
             onClick={() => navigate("/exercises")}
             className="flex-1 py-3 border border-white/10 rounded-lg text-xs font-headline font-bold uppercase tracking-widest hover:bg-white/5 transition-all cursor-pointer"
           >
             Cancelar
           </button>
           <button 
             type="submit" 
             disabled={submitting}
             className="flex-1 py-3 bg-tc-secondary text-tc-on-secondary-container rounded-lg text-xs font-headline font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,227,253,0.3)] cursor-pointer"
           >
             {submitting ? "Guardando..." : "Guardar Ejercicio"}
           </button>
        </div>
      </form>
    </div>
  );
}
