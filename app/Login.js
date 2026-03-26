import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, TouchableOpacity, ScrollView, Dimensions, Image, Animated, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView ,useSafeAreaInsets} from "react-native-safe-area-context";
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
    outputRange: [0, -40] 
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
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
  const insets = useSafeAreaInsets();


const checkVPN2 = async () => {
  console.log("----- Iniciando búsqueda de VPN ------");
  try {

    const response = await fetch('https://ipwho.is/');
    const data = await response.json();

    console.log("JSON:", JSON.stringify(data));

    const vpnFlag = data.security?.vpn || data.proxy || false;

    const isHosting = data.connection?.type === 'hosting' || data.type === 'hosting';

    const ispName = (data.connection?.isp || data.isp || "").toLowerCase();
    const vpnProviders = ['proton', 'm247', 'datacamp', 'vpn', 'proxy', 'hosting', 'ovh', 'digitalocean'];
    const matchesProvider = vpnProviders.some(provider => ispName.includes(provider));

    const tieneVPN = vpnFlag || isHosting || matchesProvider;

    console.log(`¿Detección final?: ${tieneVPN} (ISP: ${ispName})`);

    return tieneVPN;

  } catch (error) {
    console.error("Error en del VPN:", error);
    return false;
  }
};
const checkVPN4 = async () => {
  console.log("----- Iniciando búsqueda de VPN (Versión Pro) ------");
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos máximo

  try {
    const response = await fetch('https://ipwho.is/', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'InmiFriend-App-Client' 
      }
    });
    
    const data = await response.json();
    clearTimeout(timeoutId);

    console.log("IP Data recibida:", data.ip);

    const vpnFlag = data.security?.vpn || data.security?.proxy || data.security?.tor || false;

    const isCloud = data.connection?.type === 'hosting' || data.type === 'hosting';

    const ispName = (data.connection?.isp || data.isp || "").toLowerCase();
    const blacklistedISPs = [
      'proton', 'm247', 'datacamp', 'ovh', 'digitalocean', 
      'linode', 'amazon', 'google', 'microsoft', 'akamai',
      'vpn', 'proxy', 'cloud', 'server'
    ];
    const isBlacklistedISP = blacklistedISPs.some(name => ispName.includes(name));

    const tieneVPN = vpnFlag || isCloud || isBlacklistedISP;

    console.log(`Resultado VPN: ${tieneVPN} | ISP: ${ispName}`);
    return tieneVPN;

  } catch (error) {
    console.error("Error en primera API, intentando respaldo...", error.message);
    
    try {
      const fallbackResponse = await fetch('https://ipapi.co/json/');
      const fallbackData = await fallbackResponse.json();
      
      return fallbackData.security === true || fallbackData.hosting === true;
    } catch (fallbackError) {
      console.error("Ambas APIs fallaron:", fallbackError);
      
      return false; 
    }
  }
};
const checkVPN = async () => {
  console.log("----- Iniciando búsqueda de VPN (Versión Optimizada) ------");
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch('https://ipwho.is/', {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    
    const data = await response.json();
    clearTimeout(timeoutId);

    if (!data.success) return false; 

    const ip = data.ip;
    const ispName = (data.connection?.isp || data.isp || "").toLowerCase();
    const connectionType = (data.connection?.type || data.type || "").toLowerCase();

    console.log(`Analizando IP: ${ip} | ISP: ${ispName} | Tipo: ${connectionType}`);

    if (ip.startsWith('192.168.') || ip === '127.0.0.1' || ip.startsWith('10.')) {
      return false;
    }

    if (data.security?.vpn === true || data.security?.proxy === true) {
      return true;
    }

    if (connectionType === 'hosting') {
      const commonISPs = ['claro', 'movistar', 'tigo', 'cantv', 'fibertel']; 
      const isCommonISP = commonISPs.some(name => ispName.includes(name));
      
      if (!isCommonISP) return true;
    }

    const blacklistedISPs = [
      'proton', 'm247', 'datacamp', 'ovh', 'digitalocean', 
      'linode', 'akamai', 'expressvpn', 'nordvpn', 'surfshark'
    ];
    
    if (blacklistedISPs.some(name => ispName.includes(name))) {
      return true;
    }

    return false;

  } catch (error) {
    console.error("Error validando VPN:", error.message);
    return false;
  }
};
const checkVPN5 = async () => {
  console.log("----- Iniciando búsqueda de VPN (Lógica de Riesgo) ------");
  
  try {
    const response = await fetch('https://ipwho.is/');
    const data = await response.json();

    if (!data.success) return false;

    const ip = data.ip;
    const isp = (data.connection?.isp || data.isp || "").toLowerCase();
    const type = (data.connection?.type || data.type || "").toLowerCase();
    const isProxy = data.security?.proxy || false;
    const isVpn = data.security?.vpn || false;

    console.log(`IP: ${ip} | ISP: ${isp} | Tipo: ${type}`);

    let riesgo = 0;

    if (isVpn || isProxy) riesgo += 2;

    if (type === 'hosting') riesgo += 1.5;

    const hardBlacklist = ['datacamp', 'm247', 'ovh', 'digitalocean', 'linode', 'proton'];
    if (hardBlacklist.some(name => isp.includes(name))) {
      riesgo += 1.5;
    }

    if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return false; 
    }

    const esAmenazaReal = riesgo > 2;

    console.log(`Nivel de riesgo: ${riesgo} | ¿Bloqueado?: ${esAmenazaReal}`);
    return esAmenazaReal;

  } catch (error) {
    console.error("Error en validación:", error);
    return false;
  }
};

  const handleLoginCloud = async () => {
  try {
    const cleanUser = userInput.trim(); 
    const cleanPass = passwordInput.trim();
    if (!userInput.trim() || !passwordInput.trim()) {
      Alert.alert("Atención", "Por favor, completa los campos para buscar en la nube.");
      return;
    }
    setLoading(true);

    const isVpn = await checkVPN();
    if (isVpn) {
      setLoading(false);
      Alert.alert(
        "Acceso Denegado", 
        "No se permite el inicio de sesión a través de conexiones VPN o Proxy por razones de seguridad."
      );
      return;
    }
    console.log("Iniciando búsqueda en Firebase...");

    const usuariosRef = collection(db, "Usuarios");
    
    // Consulta A: Por Email
    const qEmail = query(usuariosRef, where("email", "==", cleanUser.toLowerCase()));
    // Consulta B: Por NickName
    const qNick = query(usuariosRef, where("NickName", "==", cleanUser));

    const [snapEmail, snapNick] = await Promise.all([getDocs(qEmail), getDocs(qNick)]);
    
    const docs = [...snapEmail.docs, ...snapNick.docs];

    if (docs.length > 0) {

      const userCloud = docs[0].data();
      const userId = docs[0].id;

      if (userCloud.password === passwordInput) {
        console.log('user_id: '+userId)
        const sessionData = {
          id: userId,
          name: userCloud.Name,
          nickname:userCloud.NickName,
          email:userCloud.email,
          role: userCloud.role,
          image: userCloud.image || null,
          banner:userCloud.banner,
          description: userCloud.description,
          countFriends: userCloud.countFriends,
          countPost:userCloud.countPost,
          empresa: userCloud.empresa,
          loginAt: new Date().toISOString()
        };
        console.log(sessionData)

        await AsyncStorage.setItem('@session', JSON.stringify(sessionData));
        setUserData(sessionData);
        setLoading(false)
        router.replace('/pages/Navigation');
      } else {
        Alert.alert("Error", "La contraseña de la nube no coincide.");setLoading(false)
      }
    } else {
      Alert.alert("No encontrado", "No existe ningún usuario en Firebase con ese Email/NickName.");setLoading(false)
    }
  } catch (error) {
    console.error("Error en Login Cloud:", error);
    Alert.alert("Error de Conexión", "No se pudo acceder a la base de datos remota.");setLoading(false)
  }
  };

  return (
    <>
          <StatusBar 
         style="light" 
      />
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.gradient[0] }}>
      
      
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
                autoCorrect={false}
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
                autoCorrect={false}
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
                onPress={handleLoginCloud} 
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