import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useSession } from '../ctx';
import { useRouter } from 'expo-router';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useSession();
  const router = useRouter();

  const handleLogin = () => {
    console.log("🔍 Intentando iniciar sesión con:", `"${email}"`, `"${password}"`);

    if (!email || !password) {
      Alert.alert("Error", "Por favor ingresa tu correo y contraseña");
      return;
    }

    const emailNormalized = email.trim().toLowerCase();
    const passwordNormalized = password.trim();

    if (emailNormalized === "usuario@ejemplo.com" && passwordNormalized === "password123") {
      console.log("✅ Credenciales correctas, guardando sesión...");

      const success = signIn(email, password);
      
      if (success) {
        Alert.alert("Éxito", "Inicio de sesión correcto", [
          { text: "OK", onPress: () => router.replace('/') }
        ]);
      } else {
        Alert.alert("Error", "No se pudo guardar la sesión");
      }
    } else {
      Alert.alert("Error", "Correo o contraseña incorrectos");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginBox}>
        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#ccc"
          onChangeText={setEmail}
          value={email}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#ccc"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
        />

        <TouchableOpacity onPress={handleLogin} style={styles.button}>
          <Text style={styles.buttonText}>Ingresar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// todos los estilos del login
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginBox: {
    width: '85%',
    padding: 35,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#00000',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#00000',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 60,
    borderColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingLeft: 15,
    borderRadius: 8,
    fontSize: 16,
    color: '#00000',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#2b2d42',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

