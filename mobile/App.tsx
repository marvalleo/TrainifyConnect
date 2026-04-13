import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './src/lib/firebase';
import { theme } from './src/theme/colors';

import { LoginScreen } from './src/screens/LoginScreen';
import { AthleteDashboardScreen } from './src/screens/AthleteDashboardScreen';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.surface, justifyContent: 'center' }}>
        <ActivityIndicator color={theme.colors.primaryFixed} size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      {user ? <AthleteDashboardScreen /> : <LoginScreen />}
    </>
  );
}
