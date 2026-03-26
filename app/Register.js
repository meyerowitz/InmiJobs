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
import { Picker } from '@react-native-picker/picker'; // Importar el Picker
import CompanySelector from './Components/Modales/CompanySelector';
const { width, height } = Dimensions.get('window');


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

  const [name, setName] = useState('');
  const [truename, setTrueName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickName, setNickName] = useState('');
  const [empresa, setEmpresa] = useState('Independiente');
  const [cargo, setCargo] = useState('RRHH');
  const { role: roleParam } = useLocalSearchParams();
  const [role, setRole] = useState(roleParam );
  const [loading, setLoading] = useState(false);


  const [docType, setDocType] = useState('DNI'); // 'DNI' o 'Pasaporte'
  const [documento, setDocumento] = useState('');
  const [portraits, setPortraits] = useState([]);
  const [banner, setBanners] = useState([]);
  const [randomPortrait, SetrandomPortrait] =useState('');
  const router = useRouter();
  const [companyModalVisible, setCompanyModalVisible] = useState(false);

  const [listaEmpresas, setListaEmpresas] = useState([]); // Nuevo estado
const [selectedEmpresaId, setSelectedEmpresaId] = useState(null);
  
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
          const BannerList = querySnapshot.docs
            .map(doc => doc.data().banner)
            .filter(banner=> banner !== undefined && banner !== "");

          setPortraits(urlList);
          setBanners(BannerList)
          console.log("Retratos cargados desde Firebase:", urlList.length);
        }
      } catch (error) {
        console.error("Error en sincronización:", error);
        setPortraits(initialPortraits); // Fallback de seguridad
      }
    };

    syncPortraits();
  }, []);

  useEffect(() => {
  const fetchEmpresas = async () => {
    const colRef = collection(db, "Empresas");
    const snapshot = await getDocs(colRef);
    const empresas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setListaEmpresas(empresas);
  };
  fetchEmpresas();
}, []);

  const handleRegister = async () => {
  // 1. Validación de campos vacíos
  if (!name.trim() ||!truename.trim() || !email.trim() || !password.trim()) {
    Alert.alert("Error", "Por favor completa los campos principales.");
    return;
  }
  // VALIDACIÓN DE DOCUMENTO
  if (!validarDocumentoUniversal(documento, docType)) {
    Alert.alert(
      "Documento Inválido", 
      `El número de ${docType} debe tener entre ${docType === 'DNI' ? '7 y 15' : '6 y 12'} caracteres alfanuméricos.`
    );
    return;
  }

  setLoading(true);

  try {
    const usuariosRef = collection(db, "Usuarios");
    // VALIDAR QUE NO EXISTA EL DOCUMENTO EN LA DB
    const qDoc = query(usuariosRef, where("documento", "==", documento.trim().toUpperCase()));
    const snapDoc = await getDocs(qDoc);

    if (!snapDoc.empty) {
      Alert.alert("Error", "Este documento ya está registrado por otro usuario.");
      setLoading(false);
      return;
    }
    // --- NUEVO: VALIDACIÓN DE DUPLICADOS ---
    
    // Consulta para el Email
    const qEmail = query(usuariosRef, where("email", "==", email.toLowerCase().trim()));
    // Consulta para el Nickname (usamos la variable 'name' que tienes vinculada al input de Nickname)
    const qNick = query(usuariosRef, where("NickName", "==", name.trim()));
    const qName = query(usuariosRef, where("Name", "==", truename.trim()));
    // Ejecutamos ambas búsquedas al mismo tiempo para ganar velocidad
    const [querySnapshotEmail, querySnapshotNick, querySnapshotName] = await Promise.all([
      getDocs(qEmail),
      getDocs(qNick),
      getDocs(qName)
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
      if (!querySnapshotName.empty) {
      Alert.alert("Error", "Esta persona ya existe");
      setLoading(false);
      return;
    }
    // ---------------------------------------
    console.log('portraits: '+portraits.toString())
    const randomIndex = Math.floor(Math.random() * (portraits.length - 1)) + 1;
  
    const random = portraits[randomIndex]
    const randomBanner = banner[randomIndex]
    // 2. Si pasó las validaciones, procedemos a guardar
    await addDoc(usuariosRef, {
      Name: truename, // Aquí puedes usar una variable para nombre real si añades el input
      NickName: name.trim(), 
      email: email.toLowerCase().trim(),
      image: random, // Tu link por defecto
      banner:randomBanner,
      description:'hola soy nuevo aqui tratame bien',
      countFriends: 0,
      countPost:0,
      password: password, 
      empresa: empresa, // El nombre que se guardó desde el picker
      empresa_id: selectedEmpresaId,
      documento: documento.trim().toUpperCase(),
      tipoDocumento: docType,
      role: role,
      Nacionalidad: "Venezuela",
      Residencia: "Venezuela",
      location: null,
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

  const validarDocumentoUniversal = (doc, tipo) => {
    const limpio = doc.trim();
    if (tipo === 'DNI') {
      // DNI/Cédula: Entre 7 y 15 caracteres (Cubre casi todo el mundo)
      // Solo permite letras y números (sin espacios ni símbolos raros)
      const dniRegex = /^[a-zA-Z0-9]{7,15}$/;
      return dniRegex.test(limpio);
    } else {
      // Pasaporte: Generalmente entre 6 y 12 caracteres alfanuméricos
      const passRegex = /^[a-zA-Z0-9]{6,12}$/;
      return passRegex.test(limpio);
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
            paddingBottom:35,
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
              <View style={{width: 36,height: 36,borderRadius: 18,backgroundColor: theme.primary + '20',justifyContent: 'center',alignItems: 'center',marginRight: 12 }}>
                <User size={18} color={theme.primary} />
              </View>
                <TextInput 
                  style={{  fontSize: 14, width:'80%',textAlignVertical: 'center'}} 
                  placeholder="Nombre real" 
                  value={truename}
                  onChangeText={setTrueName}
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
                       
                       {/* SECCIÓN DE IDENTIFICACIÓN UNIVERSAL */}
<View style={{ marginBottom: 20 }}>
  <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#544F4F', marginBottom: 10 }}>
    Documento de Identidad
  </Text>
  
  <View style={{ flexDirection: 'row', backgroundColor: '#F5F5F5', borderRadius: 12, padding: 4, marginBottom: 10 }}>
    <TouchableOpacity 
      onPress={() => { setDocType('DNI'); setDocumento(''); }}
      style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10, backgroundColor: docType === 'DNI' ? 'white' : 'transparent', elevation: docType === 'DNI' ? 2 : 0 }}
    >
      <Text style={{ color: docType === 'DNI' ? theme.primary : '#AAA', fontWeight: '600' }}>DNI / Cédula</Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      onPress={() => { setDocType('Pasaporte'); setDocumento(''); }}
      style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10, backgroundColor: docType === 'Pasaporte' ? 'white' : 'transparent', elevation: docType === 'Pasaporte' ? 2 : 0 }}
    >
      <Text style={{ color: docType === 'Pasaporte' ? theme.primary : '#AAA', fontWeight: '600' }}>Pasaporte</Text>
    </TouchableOpacity>
  </View>

  <View style={styles.inputWrapper}>
    <View style={[styles.iconCircle, { backgroundColor: '#FF572220' }]}>
      <Ionicons name="id-card-outline" size={18} color={'#FF5722'} />
    </View>
    <TextInput
      style={styles.textInput}
      placeholder={docType === 'DNI' ? "Número de identificación" : "Número de pasaporte"}
      value={documento}
      onChangeText={setDocumento}
      autoCapitalize="characters"
    />
  </View>
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
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 , width:'100%',borderBottomColor: '#EEE',borderBottomWidth: 1, paddingVertical:10}}>
              <View style={{width: 36,height: 36,borderRadius: 18,backgroundColor: theme.primary + '20',justifyContent: 'center',alignItems: 'center',marginRight: 12 }}>
                <User size={18} color={theme.primary} />
              </View>
                <TextInput 
                  style={{  fontSize: 14, width:'80%',textAlignVertical: 'center'}} 
                  placeholder="Nombre real" 
                  value={truename}
                  onChangeText={setTrueName}
                ></TextInput>
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
    <TouchableOpacity 
  style={styles.inputWrapper} 
  onPress={() => setCompanyModalVisible(true)}
>
  <View style={[styles.iconCircle, { backgroundColor: '#4CAF50' + '20' }]}>
    <Ionicons name="business-outline" size={18} color={'#4CAF50'} />
  </View>
  <View style={{ flex: 1 }}>
    <Text style={{ color: selectedEmpresaId ? '#333' : '#999', fontSize: 14 }}>
      {empresa || "Selecciona tu empresa"}
    </Text>
  </View>
  <Ionicons name="chevron-down" size={20} color="#AAA" />
</TouchableOpacity>

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
  {/* SECCIÓN DE IDENTIFICACIÓN UNIVERSAL */}
<View style={{ marginBottom: 20 }}>
  <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#544F4F', marginBottom: 10 }}>
    Documento de Identidad
  </Text>
  
  <View style={{ flexDirection: 'row', backgroundColor: '#F5F5F5', borderRadius: 12, padding: 4, marginBottom: 10 }}>
    <TouchableOpacity 
      onPress={() => { setDocType('DNI'); setDocumento(''); }}
      style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10, backgroundColor: docType === 'DNI' ? 'white' : 'transparent', elevation: docType === 'DNI' ? 2 : 0 }}
    >
      <Text style={{ color: docType === 'DNI' ? theme.primary : '#AAA', fontWeight: '600' }}>DNI / Cédula</Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      onPress={() => { setDocType('Pasaporte'); setDocumento(''); }}
      style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10, backgroundColor: docType === 'Pasaporte' ? 'white' : 'transparent', elevation: docType === 'Pasaporte' ? 2 : 0 }}
    >
      <Text style={{ color: docType === 'Pasaporte' ? theme.primary : '#AAA', fontWeight: '600' }}>Pasaporte</Text>
    </TouchableOpacity>
  </View>

  <View style={styles.inputWrapper}>
    <View style={[styles.iconCircle, { backgroundColor: '#FF572220' }]}>
      <Ionicons name="id-card-outline" size={18} color={'#FF5722'} />
    </View>
    <TextInput
      style={styles.textInput}
      placeholder={docType === 'DNI' ? "Número de identificación" : "Número de pasaporte"}
      value={documento}
      onChangeText={setDocumento}
      autoCapitalize="characters"
    />
  </View>
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
    <CompanySelector
  visible={companyModalVisible}
  companies={listaEmpresas}
  onClose={() => setCompanyModalVisible(false)}
  theme={theme}
  onSelect={(item) => {
    setSelectedEmpresaId(item.id);
    setEmpresa(item.Name);
  }}
/>
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