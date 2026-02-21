import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, TouchableOpacity, ScrollView, Dimensions, Image, Animated, Alert, ActivityIndicator,StatusBar } from 'react-native';
import { SafeAreaView ,useSafeAreaInsets} from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import { User, Lock, EyeOff, Eye } from 'lucide-react-native';
import { useTheme } from './Components/Temas_y_colores/ThemeContext';
import { useRouter,useLocalSearchParams } from 'expo-router';
import {Users} from './Components/Data/Users.json'
import { Ionicons } from '@expo/vector-icons';
import { db } from '../firebaseConfig'; 
import { collection, addDoc, serverTimestamp, query ,where,getDocs} from "firebase/firestore";
import Volver from './Components/Botones/Volver'


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
// --- ARRAY ORIGINAL CON LAS URLs ---
const initialPortraits = [
  "https://i.pinimg.com/1200x/be/00/cc/be00cc9524a7e4edddfee2edc50f2ec7.jpg",
  "https://i.pinimg.com/1200x/e4/0d/62/e40d629aa07c9215905fb8ae969223b9.jpg",
  "https://i.pinimg.com/736x/37/0f/15/370f151c228d7f0c9b1cc7cfde3fb5fb.jpg",
  "https://i.pinimg.com/1200x/55/02/9b/55029b4937e25f252431b1a259c77920.jpg",
  "https://i.pinimg.com/736x/ce/6a/d5/ce6ad517c04e5895bfd8626326bd1281.jpg",
  "https://i.pinimg.com/1200x/d5/b9/e0/d5b9e0ab94c15aeec8471d302bcab02e.jpg",
  "https://i.pinimg.com/736x/21/51/fb/2151fb446e2858c477d260b7929c97b7.jpg"
];

export default function Register() {
  const { theme, isDark } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  // --- ESTADOS PARA LOS CAMPOS DE FIREBASE ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickName, setNickName] = useState('');
  const [empresa, setEmpresa] = useState('Independiente');
  const [cargo, setCargo] = useState('Independiente');
  const { role: roleParam } = useLocalSearchParams();
  const [role, setRole] = useState(roleParam );
  const [loading, setLoading] = useState(false);

  const [portraits, setPortraits] = useState([]);
  const [randomPortrait, SetrandomPortrait] =useState('');
  const router = useRouter();
  
  // 1. EFECTO PARA SINCRONIZAR Y CARGAR IMÁGENES
  useEffect(() => {
    const syncPortraits = async () => {
      try {
        console.log("--- Conectando a Default_Portrait ---");
        const colRef = collection(db, "Default_Portrait");
        const querySnapshot = await getDocs(colRef);

        if (querySnapshot.empty) {
          console.log("Colección vacía. Subiendo arsenal original...");
          // Si la tabla no tiene datos, subimos los del array inicial uno por uno
          const uploadPromises = initialPortraits.map((url, index) => 
            addDoc(colRef, { url: url, id: (index + 1).toString() })
          );
          await Promise.all(uploadPromises);
          setPortraits(initialPortraits);
          console.log("¡Imágenes sincronizadas con éxito!");
        } else {
          // Extraemos las URLs de los documentos (buscando el campo 'url')
          const urlList = querySnapshot.docs
            .map(doc => doc.data().url)
            .filter(url => url !== undefined && url !== "");
          
          setPortraits(urlList);
          console.log("Retratos cargados desde Firebase:", urlList.length);
        }
      } catch (error) {
        console.error("Error en sincronización:", error);
        setPortraits(initialPortraits); // Fallback de seguridad
      }
    };

    syncPortraits();
  }, []);

  const handleRegister = async () => {
  // 1. Validación de campos vacíos
  if (!name.trim() || !email.trim() || !password.trim()) {
    Alert.alert("Error", "Por favor completa los campos principales.");
    return;
  }

  setLoading(true);

  try {
    const usuariosRef = collection(db, "Usuarios");

    // --- NUEVO: VALIDACIÓN DE DUPLICADOS ---
    
    // Consulta para el Email
    const qEmail = query(usuariosRef, where("email", "==", email.toLowerCase().trim()));
    // Consulta para el Nickname (usamos la variable 'name' que tienes vinculada al input de Nickname)
    const qNick = query(usuariosRef, where("NickName", "==", name.trim()));

    // Ejecutamos ambas búsquedas al mismo tiempo para ganar velocidad
    const [querySnapshotEmail, querySnapshotNick] = await Promise.all([
      getDocs(qEmail),
      getDocs(qNick)
    ]);

    if (!querySnapshotEmail.empty) {
      Alert.alert("Error", "Este correo electrónico ya está registrado.");
      setLoading(false);
      return;
    }

    if (!querySnapshotNick.empty) {
      Alert.alert("Error", "Este Nickname ya está en uso. Elige otro.");
      setLoading(false);
      return;
    }
    // ---------------------------------------
    console.log('portraits: '+portraits.toString())
    const randomIndex = Math.floor(Math.random() * (portraits.length - 1)) + 1;
    console.log('randomIndex: '+randomIndex)
    console.log('portraits[randomIndex]: '+portraits[randomIndex])
    const random = portraits[randomIndex]
    SetrandomPortrait(portraits[randomIndex]);
    console.log( randomIndex)
    // 2. Si pasó las validaciones, procedemos a guardar
    await addDoc(usuariosRef, {
      Name: name, // Aquí puedes usar una variable para nombre real si añades el input
      NickName: name.trim(), 
      email: email.toLowerCase().trim(),
      image: random, // Tu link por defecto
      banner:'https://i.pinimg.com/originals/0f/8c/8a/0f8c8aa6189de952da3ea34c5d93b9dc.gif',
      description:'hola soy nuevo aqui tratame bien',
      countFriends: 0,
      countPost:0,
      password: password, 
      empresa: empresa,
      role: role,
      createdAt: serverTimestamp()
    });

    Alert.alert("¡Éxito!", "Cuenta creada correctamente.");
    router.replace('/Login');

  } catch (error) {
    console.error("Error al registrar:", error);
    Alert.alert("Error", "No se pudo conectar con el servidor.");
  } finally {
    setLoading(false);
  }
  };

  return (
  <>
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.gradient[0] }}>
      <StatusBar 
          barStyle={'light-content'} 
          backgroundColor={'transparent'} 
          translucent={true} 
        />
         <TouchableOpacity 
                    style={[{backgroundColor: 'rgba(255, 255, 255, 0)', position:'absolute', zIndex:5},{left:11, top:60}]} 
                    onPress={() => router.replace('/Login')}
                >
                    <Ionicons name="chevron-back" size={30} color={'#ffff'} />
          </TouchableOpacity>
      
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
          contentContainerStyle={{ flexGrow: 1, paddingTop: '50%' }}
          showsVerticalScrollIndicator={false}
        >
    

          {/* --- FORMULARIO BLANCO --- */}
          <View style={{ 
            backgroundColor: 'white', 
            padding: 30, 
            borderTopLeftRadius: 40, 
            borderTopRightRadius: 40, 
            minHeight: height * 0.80 
          }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 25, color: theme.text}}>Create Account</Text>

           {role === 'civil' ? (
            <>  
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 , width:'100%',borderBottomColor: '#EEE',borderBottomWidth: 1, paddingVertical:10}}>
              <View style={{width: 36,height: 36,borderRadius: 18,backgroundColor: theme.primary + '20',justifyContent: 'center',alignItems: 'center',marginRight: 12 }}>
                <User size={18} color={theme.primary} />
              </View>
                <TextInput 
                  style={{  fontSize: 14, width:'80%',textAlignVertical: 'center'}} 
                  placeholder="Nickname" 
                  value={name}
                  onChangeText={setName}
                ></TextInput>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 , width:'100%',borderBottomColor: '#EEE',borderBottomWidth: 1, paddingVertical:10}}>
              <View style={{width: 36,height: 36,borderRadius: 18,backgroundColor: '#3295d2' + '30',justifyContent: 'center',alignItems: 'center',marginRight: 12 }}>
                <Ionicons name="mail-outline" size={18} color={'#3962c3'} />
              </View>
                <TextInput 
                  style={{  fontSize: 14, width:'80%',textAlignVertical: 'center'}} 
                  placeholder="email" 
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                ></TextInput>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EEE', marginBottom: 15, paddingVertical:10 }}>
              <View style={{width: 36,height: 36,borderRadius: 18,backgroundColor: '#552381' + '20',justifyContent: 'center',alignItems: 'center',marginRight: 12 }}>
                <Lock size={18} color={'#8339c3'} />
              </View>
              <TextInput 
                style={{ flex: 1, paddingVertical: 10, fontSize: 14 }} 
                placeholder="password" 
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity style={{marginLeft:-10}} onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <Eye size={22} color={theme.primary} />
                ) : (
                  <EyeOff size={22} color="#A0A0A0" />
                )}
              </TouchableOpacity>
            </View>
                       
          <View style={{ justifyContent: 'flex-end', height:'20%'}}>
           

            <TouchableOpacity onPress={handleRegister} 
              disabled={loading} style={{ backgroundColor: theme.button, padding: 15, borderRadius: 15, alignItems: 'center' }}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Register</Text>
              )}
            </TouchableOpacity>
            

            <View style={{width: 320,marginTop: 20,display: "flex",flexDirection: "row",justifyContent: "center",alignItems: "center",}}>
                <Text style={{color: "#544F4F",fontFamily: "roboto",fontWeight: "bold",fontSize: 16,}}>¿Ya tienes cuenta? </Text>
                <TouchableOpacity onPress={() => router.replace("/Login")}>
                    <Text style={{color: "#0661BC",fontFamily: "roboto",fontWeight: "bold",fontSize: 16, textDecorationLine: "underline",}}>Inicia Sesion</Text>
                </TouchableOpacity>
                </View>
          </View>
            </>
            ) : (
             <>
  <Text style={{ fontSize: 14, color: '#777', marginBottom: 20 }}>
    Completa los datos de tu entidad para empezar a publicar.
  </Text>

  <View style={styles.inputWrapper}>
    <View style={[styles.iconCircle, { backgroundColor: theme.primary + '20' }]}>
      <User size={18} color={theme.primary} />
    </View>
    <TextInput
      style={styles.textInput}
      placeholder="Nickname personal"
      value={name}
      onChangeText={setName}
    />
  </View>
  <View style={styles.inputWrapper}>
    <View style={[styles.iconCircle, { backgroundColor: '#3295d2' + '30' }]}>
      <Ionicons name="mail-outline" size={18} color={'#3962c3'} />
    </View>
    <TextInput
      style={styles.textInput}
      placeholder="Email corporativo"
      keyboardType="email-address"
      autoCapitalize="none"
      value={email}
      onChangeText={setEmail}
    />
  </View>

  <View style={styles.inputWrapper}>
    <View style={[styles.iconCircle, { backgroundColor: '#552381' + '20' }]}>
      <Lock size={18} color={'#8339c3'} />
    </View>
    <TextInput
      style={[styles.textInput, { flex: 1 }]}
      placeholder="Contraseña"
      secureTextEntry={!showPassword}
      value={password}
      onChangeText={setPassword}
    />
    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
      <Ionicons name={showPassword ? "eye" : "eye-off"} size={22} color={theme.primary} />
    </TouchableOpacity>
  </View>
  <View style={{height:0, width:'99%', borderBottomWidth:1, borderColor:'gray' }}></View>
  <View style={styles.inputWrapper}>
    <View style={[styles.iconCircle, { backgroundColor: '#4CAF50' + '20' }]}>
      <Ionicons name="business-outline" size={18} color={'#4CAF50'} />
    </View>
    <TextInput
      style={styles.textInput}
      placeholder="Nombre de la Empresa / Agencia"
      value={empresa}
      onChangeText={setEmpresa}
    />
  </View>

  <View style={styles.inputWrapper}>
    <View style={[styles.iconCircle, { backgroundColor: '#FF9800' + '20' }]}>
      <Ionicons name="briefcase-outline" size={18} color={'#FF9800'} />
    </View>
    <TextInput
      style={styles.textInput}
      placeholder="Tu cargo (Ej: HR Manager, CEO)"
      value={cargo} 
      onChangeText={setCargo}
    />
  </View>

  <View style={{ marginTop: 20 }}>
    <TouchableOpacity 
      onPress={handleRegister} 
      disabled={loading} 
      style={{ backgroundColor: theme.button, padding: 15, borderRadius: 15, alignItems: 'center', elevation: 2 }}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Register</Text>
      )}
    </TouchableOpacity>

    <View style={styles.footerContainer}>
      <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
      <TouchableOpacity onPress={() => router.replace("/Login")}>
        <Text style={{ color: "#0661BC", fontWeight: "bold", fontSize: 16, textDecorationLine: "underline" }}>Inicia Sesión</Text>
      </TouchableOpacity>
    </View>
  </View>
</>
            )}

          

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