import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { theme } from '../theme/colors';
import { getDeviceId } from '../lib/device';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const handleAuth = async () => {
    if (!email || !password) return;
    
    if (mode === 'register' && password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const currentDeviceId = await getDeviceId();

      if (mode === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Verificación de Device Binding
        const q = query(collection(db, "athletes"), where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const athleteDoc = querySnapshot.docs[0];
          const data = athleteDoc.data();
          
          if (!data.boundDeviceId) {
            // First time on this device after an update or manual registration: lock it in
            await updateDoc(doc(db, "athletes", athleteDoc.id), {
              boundDeviceId: currentDeviceId
            });
          } else if (data.boundDeviceId !== currentDeviceId) {
            await auth.signOut();
            throw new Error("Dispositivo no autorizado. Tu cuenta está enlazada a otro teléfono. Solicita a tu coach que la libere.");
          }
        }
      } else {
        // 1. Verificar si el atleta existe en Firestore (creado por coach)
        const q = query(collection(db, "athletes"), where("email", "==", email.toLowerCase()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error("Este email no ha sido registrado por ningún coach. Contacta a tu entrenador.");
        }

        const athleteDoc = querySnapshot.docs[0];
        if (athleteDoc.data().uid) {
          throw new Error("Este perfil ya está activo. Por favor, inicia sesión.");
        }

        // 2. Crear usuario en Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 3. Vincular Auth UID con el documento de Firestore y atar el dispositivo
        await updateDoc(doc(db, "athletes", athleteDoc.id), {
          uid: user.uid,
          status: 'active',
          boundDeviceId: currentDeviceId
        });

        alert("¡Cuenta activada con éxito!");
      }
    } catch (err: any) {
      console.error(err);
      let msg = "Error en la autenticación.";
      if (err.code === 'auth/email-already-in-use') msg = "El email ya está en uso.";
      if (err.code === 'auth/weak-password') msg = "La contraseña debe tener al menos 6 caracteres.";
      if (err.message) msg = err.message;
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>TrainifyConnect</Text>
          <Text style={styles.subtitle}>PORTAL DE ATLETAS</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.modeTitle}>
            {mode === 'login' ? 'INICIA SESIÓN' : 'ACTIVA TU CUENTA'}
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="EMAIL"
            placeholderTextColor={theme.colors.outline}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="CONTRASEÑA"
            placeholderTextColor={theme.colors.outline}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          {mode === 'register' && (
            <TextInput
              style={styles.input}
              placeholder="CONFIRMAR CONTRASEÑA"
              placeholderTextColor={theme.colors.outline}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          )}

          <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={theme.colors.onPrimaryFixed} />
            ) : (
              <Text style={styles.buttonText}>
                {mode === 'login' ? 'ENTRAR' : 'ACTIVAR Y VINCULAR'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.toggleMode} 
            onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            <Text style={styles.toggleText}>
              {mode === 'login' 
                ? '¿ES TU PRIMERA VEZ? ACTIVA TU CUENTA' 
                : '¿YA TENÉS CUENTA? INICIA SESIÓN'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.primaryFixed,
    letterSpacing: 4,
  },
  modeTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    gap: 16,
  },
  input: {
    width: '100%',
    backgroundColor: theme.colors.surfaceContainerHighest,
    height: 56,
    borderRadius: 8,
    paddingHorizontal: 16,
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  button: {
    width: '100%',
    backgroundColor: theme.colors.primaryFixed,
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: theme.colors.primaryFixed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: theme.colors.onPrimaryFixed,
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 2,
  },
  toggleMode: {
    padding: 16,
    alignItems: 'center',
  },
  toggleText: {
    color: theme.colors.outline,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  }
});
