import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { collection, query, where, documentId, getDocs, addDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { theme } from '../theme/colors';

// Native UI video replacement since we don't have expo-av installed for MVP. We will just use placeholders for video/image.
// In a full build, we'd install expo-av for video rendering.

interface WorkoutEngineProps {
  routine: any;
  onFinish: () => void;
  onCancel: () => void;
}

export function WorkoutEngine({ routine, onFinish, onCancel }: WorkoutEngineProps) {
  const [exercisesMeta, setExercisesMeta] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Performance Logging State
  // Array matching routine.exercises, where each has loggedSets array
  const [performanceLog, setPerformanceLog] = useState<any[]>([]);
  
  // Finish Screen State
  const [isFinished, setIsFinished] = useState(false);
  const [cnsStress, setCnsStress] = useState<number>(50);
  const [savingLog, setSavingLog] = useState(false);

  useEffect(() => {
    const fetchExercises = async () => {
      const ids = routine.exercises.map((e: any) => e.exerciseId);
      if (ids.length === 0) {
        setLoading(false);
        return;
      }

      // Firestore 'in' query supports up to 10 limits, assume MVP routine is <= 10.
      const q = query(collection(db, "exercises"), where(documentId(), "in", ids));
      const snap = await getDocs(q);
      const metas: any[] = [];
      snap.forEach(doc => metas.push({ id: doc.id, ...doc.data() }));
      setExercisesMeta(metas);

      // Initialize logs
      const initLogs = routine.exercises.map((rx: any) => ({
         exerciseId: rx.exerciseId,
         setsAchieved: rx.sets.map((targetRep: number) => ({
            reps: targetRep.toString(),
            weight: ""
         }))
      }));
      setPerformanceLog(initLogs);
      setLoading(false);
    };

    fetchExercises();
  }, [routine]);

  const updateSet = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight', value: string) => {
    const updated = [...performanceLog];
    updated[exerciseIndex].setsAchieved[setIndex][field] = value;
    setPerformanceLog(updated);
  };

  const handleNext = () => {
    if (currentIndex < routine.exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSaveWorkout = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setSavingLog(true);

    try {
      // 1. Create Workout Log
      await addDoc(collection(db, `athletes/${user.uid}/logs`), {
        routineId: routine.id,
        routineName: routine.name,
        timestamp: new Date(),
        cnsStressRating: cnsStress,
        exercisesPerformances: performanceLog.map(log => ({
           exerciseId: log.exerciseId,
           repsAchieved: log.setsAchieved.map((s: any) => parseInt(s.reps) || 0),
           weightUsedKg: log.setsAchieved.map((s: any) => parseInt(s.weight) || 0)
        }))
      });

      setSavingLog(false);
      onFinish();
    } catch (err) {
      console.error(err);
      alert("Error al guardar la rutina");
      setSavingLog(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
         <ActivityIndicator color={theme.colors.primaryFixed} size="large" />
      </View>
    );
  }

  if (isFinished) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
           <Text style={styles.headerTitle}>ENTRENAMIENTO COMPLETADO</Text>
        </View>
        <View style={styles.finishContent}>
           <View style={styles.iconDial}>
             <Text style={styles.dialText}>{cnsStress}</Text>
             <Text style={styles.dialLabel}>%</Text>
           </View>
           
           <Text style={styles.finishTitle}>EVALÚA LA FATIGA (CNS)</Text>
           <Text style={styles.finishDesc}>
             Desliza para registrar tu esfuerzo y fatiga de hoy. Esto calibra tu progresión en el dashboard global.
           </Text>

           {/* MVP Slider hack with inputs/buttons since standard react-native slider requires external packages */}
           <View style={styles.dialControls}>
              <TouchableOpacity style={styles.dialBtn} onPress={() => setCnsStress(Math.max(10, cnsStress - 10))}>
                <Text style={styles.dialBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.dialCurrent}>{cnsStress}</Text>
              <TouchableOpacity style={styles.dialBtn} onPress={() => setCnsStress(Math.min(100, cnsStress + 10))}>
                <Text style={styles.dialBtnText}>+</Text>
              </TouchableOpacity>
           </View>

           <TouchableOpacity style={styles.saveBtn} onPress={handleSaveWorkout} disabled={savingLog}>
              {savingLog ? (
                <ActivityIndicator color={theme.colors.onPrimaryFixed} />
              ) : (
                <Text style={styles.saveBtnText}>REGISTRAR LOG Y VOLVER</Text>
              )}
           </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentRx = routine.exercises[currentIndex];
  const currentMeta = exercisesMeta.find(m => m.id === currentRx.exerciseId);
  const currentLog = performanceLog[currentIndex];

  return (
    <View style={styles.container}>
      {/* Immersive Header */}
      <View style={styles.header}>
         <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>ABORTAR</Text>
         </TouchableOpacity>
         <View style={styles.progressCounter}>
           <Text style={styles.progressText}>{currentIndex + 1} / {routine.exercises.length}</Text>
         </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Media Block Proxy (Since we lack expo-av for now) */}
        <View style={styles.mediaFrame}>
           <View style={styles.mediaOverlay} />
           <Text style={styles.mediaPlaceholder}>[ MEDIA VISUALIZER ]</Text>
           <Text style={styles.mediaPlaceholderSub}>Técnica: {currentMeta?.name || 'Cargando...'}</Text>
        </View>

        {/* Engine Controls */}
        <View style={styles.content}>
           <View>
              <Text style={styles.category}>{currentMeta?.category || '---'}</Text>
              <Text style={styles.title}>{currentMeta?.name || 'Desconocido'}</Text>
              {currentRx.technicalAlert ? (
                <View style={styles.alertBox}>
                   <Text style={styles.alertText}>ALERTA TÉCNICA: {currentRx.technicalAlert}</Text>
                </View>
              ) : null}
           </View>

           {/* Metrics targets */}
           <View style={styles.targets}>
              <View style={styles.targetItem}>
                 <Text style={styles.targetVal}>{currentRx.intensity}</Text>
                 <Text style={styles.targetLabel}>INT</Text>
              </View>
              <View style={styles.targetItem}>
                 <Text style={styles.targetVal}>{currentRx.rest}</Text>
                 <Text style={styles.targetLabel}>DESC</Text>
              </View>
              <View style={styles.timerBlock}>
                 <Text style={styles.timerVal}>00:00</Text>
                 <Text style={styles.timerLabel}>RECUPERACIÓN</Text>
              </View>
           </View>

           {/* Logging Rows */}
           <View style={styles.logs}>
              <View style={styles.logHeader}>
                 <Text style={[styles.logH, {flex: 0.5}]}>SERIE</Text>
                 <Text style={[styles.logH, {flex: 1}]}>TGT REPS</Text>
                 <Text style={[styles.logH, {flex: 1}]}>REPS (REAL)</Text>
                 <Text style={[styles.logH, {flex: 1}]}>CARGA (KG)</Text>
              </View>
              {currentRx.sets.map((targetRep: number, sIndex: number) => (
                <View key={sIndex} style={styles.logRow}>
                   <View style={[styles.logCell, {flex: 0.5}]}><Text style={styles.logSer}>{sIndex + 1}</Text></View>
                   <View style={[styles.logCell, {flex: 1}]}><Text style={styles.logTgt}>{targetRep}</Text></View>
                   <View style={[styles.logCell, {flex: 1}]}>
                      <TextInput 
                        style={styles.logInput}
                        keyboardType="numeric"
                        value={currentLog.setsAchieved[sIndex].reps}
                        onChangeText={(val) => updateSet(currentIndex, sIndex, 'reps', val)}
                      />
                   </View>
                   <View style={[styles.logCell, {flex: 1}]}>
                      <TextInput 
                        style={styles.logInput}
                        keyboardType="numeric"
                        placeholder="--"
                        placeholderTextColor={theme.colors.outline}
                        value={currentLog.setsAchieved[sIndex].weight}
                        onChangeText={(val) => updateSet(currentIndex, sIndex, 'weight', val)}
                      />
                   </View>
                </View>
              ))}
           </View>
        </View>
      </ScrollView>

      {/* Footer Nav */}
      <View style={styles.footer}>
         <TouchableOpacity 
           style={[styles.navBtn, { opacity: currentIndex === 0 ? 0.3 : 1 }]} 
           onPress={handlePrev}
           disabled={currentIndex === 0}
         >
           <Text style={styles.navText}>ANTERIOR</Text>
         </TouchableOpacity>
         
         <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
           <Text style={styles.nextText}>
             {currentIndex === routine.exercises.length - 1 ? 'FINALIZAR' : 'SIGUIENTE'}
           </Text>
         </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainerLow,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  cancelText: { color: theme.colors.error, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  cancelBtn: { padding: 8 },
  progressCounter: {
    backgroundColor: theme.colors.surfaceContainerHighest,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  progressText: { color: theme.colors.secondary, fontWeight: '900', fontSize: 12, letterSpacing: 2 },
  scroll: { paddingBottom: 40 },
  mediaFrame: {
    height: 250,
    backgroundColor: theme.colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: theme.colors.primaryFixed,
    position: 'relative'
  },
  mediaOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  mediaPlaceholder: { color: theme.colors.primaryFixed, fontSize: 14, fontWeight: '900', letterSpacing: 2 },
  mediaPlaceholderSub: { color: 'white', marginTop: 10, fontSize: 16, fontWeight: '600' },
  content: { padding: 24, gap: 24 },
  category: { color: theme.colors.outline, fontSize: 10, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase' },
  title: { color: 'white', fontSize: 32, fontWeight: '900', textTransform: 'uppercase', lineHeight: 32 },
  alertBox: { backgroundColor: 'rgba(255, 180, 171, 0.1)', padding: 12, borderRadius: 8, borderLeftWidth: 2, borderLeftColor: theme.colors.error },
  alertText: { color: theme.colors.error, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  targets: { flexDirection: 'row', gap: 12, marginTop: 12 },
  targetItem: { flex: 1, backgroundColor: theme.colors.surfaceContainerHighest, padding: 12, borderRadius: 8 },
  timerBlock: { flex: 1.5, backgroundColor: theme.colors.secondary + '20', padding: 12, borderRadius: 8, borderColor: theme.colors.secondary, borderWidth: 1 },
  targetVal: { color: 'white', fontSize: 20, fontWeight: '900' },
  targetLabel: { color: theme.colors.outline, fontSize: 9, fontWeight: 'bold', letterSpacing: 1, marginTop: 4 },
  timerVal: { color: theme.colors.secondary, fontSize: 20, fontWeight: '900' },
  timerLabel: { color: theme.colors.secondary, fontSize: 9, fontWeight: 'bold', letterSpacing: 1, marginTop: 4 },
  logs: { marginTop: 16 },
  logHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.colors.surfaceContainerHighest, paddingBottom: 8 },
  logH: { color: theme.colors.outline, fontSize: 9, fontWeight: 'bold', letterSpacing: 1, textAlign: 'center' },
  logRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.surfaceContainerLow },
  logCell: { alignItems: 'center', justifyContent: 'center' },
  logSer: { color: 'white', fontWeight: '900', fontSize: 16 },
  logTgt: { color: theme.colors.outline, fontWeight: '900', fontSize: 16 },
  logInput: { 
    backgroundColor: theme.colors.surfaceContainerHighest, 
    width: '80%', 
    height: 44, 
    borderRadius: 8, 
    color: theme.colors.primaryFixed, 
    textAlign: 'center', 
    fontWeight: '900', 
    fontSize: 16 
  },
  footer: { 
    flexDirection: 'row', 
    padding: 20, 
    backgroundColor: theme.colors.surfaceContainerLow, 
    paddingBottom: 40,
    gap: 16 
  },
  navBtn: { flex: 1, backgroundColor: theme.colors.surfaceContainerHighest, paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  navText: { color: theme.colors.outline, fontWeight: '900', fontSize: 12, letterSpacing: 2 },
  nextBtn: { flex: 2, backgroundColor: theme.colors.primaryFixed, paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  nextText: { color: theme.colors.onPrimaryFixed, fontWeight: '900', fontSize: 12, letterSpacing: 2 },
  
  // Finish Screen Styles
  headerTitle: { color: 'white', fontSize: 12, fontWeight: 'bold', letterSpacing: 2, flex: 1, textAlign: 'center' },
  finishContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  iconDial: { width: 140, height: 140, borderRadius: 70, borderWidth: 8, borderColor: theme.colors.error, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  dialText: { color: theme.colors.error, fontSize: 40, fontWeight: '900', lineHeight: 40 },
  dialLabel: { color: theme.colors.error, fontWeight: 'bold' },
  finishTitle: { color: 'white', fontSize: 24, fontWeight: '900', letterSpacing: -0.5, marginBottom: 12 },
  finishDesc: { color: theme.colors.outline, textAlign: 'center', marginBottom: 40, lineHeight: 22 },
  dialControls: { flexDirection: 'row', alignItems: 'center', gap: 24, marginBottom: 48 },
  dialBtn: { width: 48, height: 48, backgroundColor: theme.colors.surfaceContainerHighest, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  dialBtnText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  dialCurrent: { color: 'white', fontSize: 32, fontWeight: '900' },
  saveBtn: { width: '100%', backgroundColor: theme.colors.primaryFixed, paddingVertical: 20, borderRadius: 8, alignItems: 'center' },
  saveBtnText: { color: theme.colors.onPrimaryFixed, fontWeight: '900', fontSize: 12, letterSpacing: 2 }
});
