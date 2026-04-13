import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/colors';

interface WorkoutLogCardProps {
  log: {
    routineName: string;
    timestamp: any;
    cnsStressRating: number;
  };
}

export function WorkoutLogCard({ log }: WorkoutLogCardProps) {
  const date = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
  const formattedDate = date.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: 'short', 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.date}>{formattedDate.toUpperCase()}</Text>
        <View style={styles.stressBadge}>
          <Text style={styles.stressText}>{log.cnsStressRating}% CNS</Text>
        </View>
      </View>
      <Text style={styles.routineName}>{log.routineName || 'Sesión sin nombre'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surfaceContainerHighest,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    color: theme.colors.outline,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  stressBadge: {
    backgroundColor: theme.colors.secondary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
  },
  stressText: {
    color: theme.colors.secondary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  routineName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.5,
  }
});
