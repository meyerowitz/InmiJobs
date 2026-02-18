import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, TouchableOpacity, ScrollView, Dimensions, Image, Animated, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import { User, Lock, EyeOff, Eye } from 'lucide-react-native';
import { useTheme } from './Components/Temas_y_colores/ThemeContext';
import { useRouter } from 'expo-router';
import Users from './Components/Data/Users.json'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUserData, useUser } from './Components/Data/DataProvider';
import { db } from '../firebaseConfig'; 
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

// --- COMPONENTE DE BURBUJAS ANIMADAS ---
const FloatingOrb = ({ size, duration, delay, startPos }) => {
  const anim = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: duration,
          delay: delay,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: duration,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -40] // Movimiento sutil hacia arriba
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: 'rgba(255, 255, 255, 0.12)', // Color suave
          transform: [{ translateY }],
        },
        startPos
      ]}
    />
  );
};

export default function Login() {
  const { theme, isDark } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  // Estados para capturar lo que escribe el usuario
  const [userInput, setUserInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const { setUserData } = useUser();
  const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    try {
    // Validamos que no estén vacíos
    if (!userInput || !passwordInput) {
      Alert.alert("Atención", "Por favor, completa todos los campos.");
      return;
    }

    // Buscamos al usuario por Email o NickName
    const user = usersData.users.find(u => 
      (u.email.toLowerCase() === userInput.toLowerCase() || u.NickName === userInput) && 
      u.password === passwordInput
    );

    if (user) {
      // 3. BORRAR SESIÓN PREVIA (Si existe, se sobreescribe o elimina)
      await AsyncStorage.removeItem('@session');

      // 4. CREAR EL OBJETO DE SESIÓN
      const sessionData = {
        id: user._id,
        name: user.Name,
        role: user.role,
        empresa: user.empresa,
        loginAt: new Date().toISOString()
      };

      // 5. GUARDAR EN ASYNC STORAGE
      // Convertimos el objeto a String porque AsyncStorage solo guarda texto
      await AsyncStorage.setItem('@session', JSON.stringify(sessionData));

      Alert.alert("Éxito", `Bienvenido ${user.Name}`);
      
      // 6. REDIRIGIR
      router.replace('/pages/Navigation');
      
    } else {
      Alert.alert("Error", "Usuario o contraseña incorrectos.");
    }}catch (error) {
    console.log("Error en el login:", error);
    Alert.alert("Error", "Hubo un problema al guardar la sesión.");
  }

  };
  const handleLogin2 = async () => {
  try {
    // 1. Verificación básica de inputs
    if (!userInput.trim() || !passwordInput.trim()) {
      Alert.alert("Atención", "Por favor, completa todos los campos.");
      return;
    }

    // 2. Buscar usuario (Asegúrate de que 'Users' sea el nombre de tu import)
    // Si en tu import pusiste: import {Users} from './...', usa Users directamente.
    const user = Users.users.find(u => 
      (u.email.toLowerCase() === userInput.toLowerCase() || u.NickName === userInput) && 
      u.password === passwordInput
    );

    if (user) {
      // 3. GESTIÓN DE SESIÓN SEGURA
      // En lugar de borrar primero, simplemente verificamos si existe.
      const existingSession = await AsyncStorage.getItem('@session');
      
      if (existingSession !== null) {
        console.log("Sesión antigua encontrada, procediendo a borrar..."+existingSession.toString());
        await AsyncStorage.removeItem('@session');
      }

      // 4. PREPARAR NUEVOS DATOS
      const sessionData = {
        id: user._id,
        name: user.Name,
        role: user.role,
        image: user.image,
        empresa: user.empresa,
        loginAt: new Date().toISOString()
      };

      // 5. GUARDAR
      await AsyncStorage.setItem('@session', JSON.stringify(sessionData));
      setUserData(sessionData);
      console.log("Nueva sesión guardada con éxito");
      router.replace('/pages/Navigation');
      
    } else {
      Alert.alert("Error", "Usuario o contraseña incorrectos.");
    }
  } catch (error) {
    // Esto te dirá exactamente qué línea falló en tu terminal de Metro
    console.error("Error detallado:", error);
    Alert.alert("Error de Sistema", "No se pudo procesar el inicio de sesión.");
  }
};
const handleLoginCloud = async () => {
  try {
    if (!userInput.trim() || !passwordInput.trim()) {
      Alert.alert("Atención", "Por favor, completa los campos para buscar en la nube.");
      return;
    }
    setLoading(true);
    console.log("Iniciando búsqueda en Firebase...");

    // 1. Creamos dos consultas: una por email y otra por NickName
    const usuariosRef = collection(db, "Usuarios");
    
    // Consulta A: Por Email
    const qEmail = query(usuariosRef, where("email", "==", userInput.toLowerCase().trim()));
    // Consulta B: Por NickName
    const qNick = query(usuariosRef, where("NickName", "==", userInput));

    const [snapEmail, snapNick] = await Promise.all([getDocs(qEmail), getDocs(qNick)]);
    
    // Unificamos resultados
    const docs = [...snapEmail.docs, ...snapNick.docs];

    if (docs.length > 0) {
      // Tomamos el primer usuario encontrado
      const userCloud = docs[0].data();
      const userId = docs[0].id;

      // 2. Validar contraseña
      if (userCloud.password === passwordInput) {
        
        // 3. Gestión de sesión (Tu lógica original)
        const sessionData = {
          id: userId,
          name: userCloud.Name,
          role: userCloud.role,
          image: userCloud.image || null,
          empresa: userCloud.empresa,
          loginAt: new Date().toISOString()
        };

        await AsyncStorage.setItem('@session', JSON.stringify(sessionData));
        setUserData(sessionData);
        setLoading(false)
        Alert.alert("Éxito (Cloud)", `Bienvenido de nuevo, ${userCloud.Name}`);
        router.replace('/pages/Navigation');
      } else {
        Alert.alert("Error", "La contraseña de la nube no coincide.");
      }
    } else {
      Alert.alert("No encontrado", "No existe ningún usuario en Firebase con ese Email/NickName.");
    }
  } catch (error) {
    console.error("Error en Login Cloud:", error);
    Alert.alert("Error de Conexión", "No se pudo acceder a la base de datos remota.");
  }
};

  return (
    <>

    <SafeAreaView style={{ flex: 1, backgroundColor: theme.gradient[0] }}>
          <StatusBar 
        barStyle="light-content" 
        backgroundColor="#f90000" 
      />
      
      <LinearGradient
        colors={[theme.gradient[0], theme.gradient[1], theme.gradient[1], theme.gradient[1]]}
        style={{ flex: 1 }}
      >
        {/* --- CAPA DE BURBUJAS (Detrás de todo) --- */}
        <View style={{ ...styles.absoluteFill, zIndex: 0 }}>
          <FloatingOrb size={150} duration={5000} delay={0} startPos={{ top: '5%', left: '10%' }} />
          <FloatingOrb size={100} duration={4000} delay={500} startPos={{ top: '15%', right: '5%' }} />
          <FloatingOrb size={200} duration={6000} delay={200} startPos={{ top: '25%', left: '-10%' }} />
          <FloatingOrb size={80} duration={4500} delay={1000} startPos={{ top: '35%', right: '20%' }} />
        </View>

        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, paddingTop: '65%' }}
          showsVerticalScrollIndicator={false}
        >
          {/* --- IMÁGENES (zIndex superior a las burbujas) --- */}
          <Image 
            source={require('../assets/img/inmifriend.png')} 
            style={{ position: 'absolute', zIndex: 1, width: 160, height: 160, left: '26%', top: '18%' }} 
          />
          <Image 
            source={require('../assets/img/brujula.png')} 
            style={{ position: 'absolute', zIndex: 1, width: 130, height: 130, left: '74%', top: '2%' }} 
          />
          <Image 
            source={require('../assets/img/triangulo.png')} 
            style={{ position: 'absolute', zIndex: 1, width: 140, height: 140, left: '-10%', top: '26%' }} 
          />

          {/* --- FORMULARIO BLANCO --- */}
          <View style={{ 
            backgroundColor: 'white', 
            padding: 30, 
            borderTopLeftRadius: 40, 
            borderTopRightRadius: 40, 
            minHeight: height * 0.80 // Ajustado para que cubra el fondo
          }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 25, color: theme.text }}>Login Here</Text>

            {/* Input Email */}
            <View style={styles.inputWrapper}>
              <View style={[styles.iconCircle, { backgroundColor: theme.primary + '20' }]}>
                <User size={18} color={theme.primary} />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="email"
                placeholderTextColor="#A0A0A0"
                value={userInput}
                onChangeText={setUserInput}
                autoCapitalize="none"
              />
            </View>

            {/* Input Password */}
            <View style={styles.inputWrapper}>
              <View style={[styles.iconCircle, { backgroundColor: '#552381' + '20' }]}>
                <Lock size={18} color={'#8339c3'} />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="password"
                secureTextEntry={!showPassword}
                placeholderTextColor="#A0A0A0"
                value={passwordInput}
                onChangeText={setPasswordInput}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <Eye size={22} color={theme.primary} />
                ) : (
                  <EyeOff size={22} color="#A0A0A0" />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => router.replace('./pages/olvide/forgot_password')}>
              <Text style={{ color: '#A0A0A0', fontSize: 12, marginBottom: 20, textAlign: 'right' }}>Forget Password?</Text>
            </TouchableOpacity>

            <View style={{ marginTop: 20 }}>
              <TouchableOpacity 
                onPress={handleLoginCloud} onLongPress={handleLogin2}
                style={{ backgroundColor: theme.button, padding: 15, borderRadius: 15, alignItems: 'center', elevation: 2 }}
              >
               {loading ? (
                               <ActivityIndicator color="white" />
                             ) : (
                               <Text style={{ color: 'white', fontWeight: 'bold' }}>Login</Text>
                             )}
              </TouchableOpacity>

              <View style={styles.footerContainer}>
                <Text style={styles.footerText}>¿No tienes cuenta? </Text>
                <TouchableOpacity onPress={() => router.replace("/ChooseaRol")}>
                  <Text style={[styles.footerText, { color: "#0661BC", textDecorationLine: "underline" }]}>Regístrate aquí</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
    </>
  );
}

const styles = {
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
    borderBottomColor: '#EEE',
    borderBottomWidth: 1,
    paddingVertical: 10
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#333'
  },
  footerContainer: {
    marginTop: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontFamily: "roboto",
    fontWeight: "bold",
    fontSize: 16,
    color: "#544F4F"
  }
};