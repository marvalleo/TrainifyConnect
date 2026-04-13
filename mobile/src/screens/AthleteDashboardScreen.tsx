import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { doc, onSnapshot, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { theme } from '../theme/colors';
import { WorkoutEngine } from '../components/WorkoutEngine';
import { WorkoutLogCard } from '../components/WorkoutLogCard';

export function AthleteDashboardScreen() {
  const [athlete, setAthlete] = useState<any>(null);
  const [routine, setRoutine] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTraining, setIsTraining] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // 1. Listen to athlete doc
    const unsubAthlete = onSnapshot(doc(db, "athletes", user.uid), async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAthlete(data);
        
        // If they have an assigned routine, fetch its details
        if (data.activeRoutineId) {
           const routineSnap = await getDoc(doc(db, "routines", data.activeRoutineId));
           if (routineSnap.exists()) {
             setRoutine({ id: routineSnap.id, ...routineSnap.data() });
           }
        } else {
           setRoutine(null);
        }
      }
      setLoading(false);
    });

    // 2. Fetch recent logs
    const fetchLogs = async () => {
      try {
        const q = query(
          collection(db, `athletes/${user.uid}/logs`),
          orderBy("timestamp", "desc"),
          limit(5)
        );
        const logSnap = await getDocs(q);
        const logData: any[] = [];
        logSnap.forEach(doc => logData.push({ id: doc.id, ...doc.data() }));
        setLogs(logData);
      } catch (err) {
        console.error("Error fetching logs:", err);
      }
    };

    fetchLogs();

    return () => unsubAthlete();
  }, [isTraining]); // Re-fetch logs when training ends

  const handleLogout = () => auth.signOut();

  if (loading || !athlete) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
         <ActivityIndicator color={theme.colors.secondary} size="large" />
      </View>
    );
  }

  if (isTraining && routine) {
     return (
       <WorkoutEngine 
         routine={routine} 
         onCancel={() => setIsTraining(false)} 
         onFinish={() => {
            setIsTraining(false);
            alert("¡Entrenamiento registrado con éxito!");
         }} 
       />
     );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
         <View>
           <Text style={styles.greeting}>HOLA,</Text>
           <Text style={styles.name}>{athlete.displayName.toUpperCase()}</Text>
         </View>
         <TouchableOpacity onPress={handleLogout}>
           <Text style={styles.logout}>SALIR</Text>
         </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
         {/* Focus View: Today's Plan */}
         <View style={styles.planCard}>
           <Text style={styles.planLabel}>PLAN DE HOY</Text>
           
           {!routine ? (
             <View style={styles.emptyState}>
               <Text style={styles.emptyIcon}>!</Text>
               <Text style={styles.emptyText}>Día de Descanso Activo</Text>
               <Text style={styles.emptySub}>No hay rutinas programadas</Text>
             </View>
           ) : (
             <View style={styles.routineModule}>
               <Text style={styles.routineName}>{routine.name}</Text>
               <Text style={styles.routinePhase}>{routine.phase}</Text>
               
               <View style={styles.statsRow}>
                 <View style={styles.statBox}>
                   <Text style={styles.statValue}>{routine.exercises?.length || 0}</Text>
                   <Text style={styles.statLabel}>ZONAS</Text>
                 </View>
                 <View style={styles.statBox}>
                   <Text style={styles.statValue}>60m</Text>
                   <Text style={styles.statLabel}>APROX</Text>
                 </View>
                 <View style={styles.statBox}>
                   <Text style={[styles.statValue, { color: theme.colors.error }]}>Alta</Text>
                   <Text style={styles.statLabel}>FATIGA</Text>
                 </View>
               </View>

               <TouchableOpacity style={styles.startButton} onPress={() => setIsTraining(true)}>
                 <Text style={styles.startButtonText}>INICIAR MODO ENTRENAMIENTO</Text>
               </TouchableOpacity>
             </View>
           )}
         </View>

         {/* History Section */}
         <View style={styles.historySection}>
            <Text style={styles.planLabel}>SESIONES RECIENTES</Text>
            {logs.length === 0 ? (
              <Text style={styles.emptyHistory}>Aún no registras entrenamientos.</Text>
            ) : (
              logs.map(log => (
                <WorkoutLogCard key={log.id} log={log} />
              ))
            )}
         </View>

         {/* Stats Overview */}
         <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
               <Text style={styles.planLabel}>MI RENDIMIENTO</Text>
            </View>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Progreso Semanal</Text>
              <Text style={styles.progressValue}>+{athlete.stats?.progressPercent || 0}%</Text>
            </View>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Estrés SNC Residual</Text>
              <Text style={[styles.progressValue, {color: theme.colors.secondary}]}>{athlete.stats?.cnsStress || 0}%</Text>
            </View>
            <View style={styles.progressBarBg}>
               <View style={[styles.progressBarFill, { width: `${athlete.stats?.cnsStress || 0}%` }]} />
            </View>
         </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    color: theme.colors.outline,
    fontWeight: 'bold',
    fontSize: 10,
    letterSpacing: 2,
  },
  name: {
    color: 'white',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  logout: {
    color: theme.colors.error,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    padding: 8,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
    gap: 24,
  },
  planCard: {
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 20,
    borderTopWidth: 4,
    borderTopColor: theme.colors.primaryFixed,
  },
  planLabel: {
    color: theme.colors.outline,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    color: theme.colors.surfaceContainerHighest,
    fontSize: 48,
    fontWeight: '900',
    marginBottom: 8,
  },
  emptyText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptySub: {
    color: theme.colors.outline,
    fontSize: 12,
    marginTop: 4,
  },
  routineModule: {
    gap: 8,
  },
  routineName: {
    color: 'white',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  routinePhase: {
    color: theme.colors.primaryFixed,
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: theme.colors.surfaceContainerHighest,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
  },
  statLabel: {
    color: theme.colors.outline,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginTop: 4,
  },
  startButton: {
    backgroundColor: theme.colors.primaryFixed,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: theme.colors.onPrimaryFixed,
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 2,
  },
  historySection: {
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 20,
  },
  emptyHistory: {
    color: theme.colors.outline,
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  statsCard: {
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 20,
    borderTopWidth: 4,
    borderTopColor: theme.colors.secondary,
  },
  statsHeader: {
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  progressLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  progressValue: {
    color: theme.colors.primaryFixed,
    fontSize: 14,
    fontWeight: '900',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: theme.colors.surfaceContainerHighest,
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.secondary,
  }
});
