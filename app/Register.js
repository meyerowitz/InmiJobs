import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, TouchableOpacity, ScrollView, Dimensions, StatusBar, Image, Animated } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import { User, Lock, EyeOff, Eye } from 'lucide-react-native';
import { useTheme } from './Components/Temas_y_colores/ThemeContext';
import { useRouter } from 'expo-router';
import {Users} from './Components/Data/Users.json'
import { Ionicons } from '@expo/vector-icons';

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

export default function Register() {
  const { theme, isDark } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.gradient[0] }}>
      <StatusBar 
  barStyle={'light-content'} 
  backgroundColor={'transparent'} 
  translucent={true} 
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
                    <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 25, color: theme.text}}>Create Account</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 , width:'100%',borderBottomColor: '#EEE',borderBottomWidth: 1, paddingVertical:10}}>
              {/* Círculo con Persona */}
              <View style={{width: 36,height: 36,borderRadius: 18,backgroundColor: theme.primary + '20',justifyContent: 'center',alignItems: 'center',marginRight: 12 }}>
                <User size={18} color={theme.primary} />
              </View>
                <TextInput 
                  style={{  fontSize: 14, width:'80%',textAlignVertical: 'center'}} 
                  placeholder="Nombre Completo" 
                ></TextInput>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 , width:'100%',borderBottomColor: '#EEE',borderBottomWidth: 1, paddingVertical:10}}>
              {/* Círculo con Persona */}
              <View style={{width: 36,height: 36,borderRadius: 18,backgroundColor: '#3295d2' + '30',justifyContent: 'center',alignItems: 'center',marginRight: 12 }}>
                <Ionicons name="mail-outline" size={18} color={'#3962c3'} />
              </View>
                <TextInput 
                  style={{  fontSize: 14, width:'80%',textAlignVertical: 'center'}} 
                  placeholder="email" 
                ></TextInput>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EEE', marginBottom: 15, paddingVertical:10 }}>
              {/* Círculo con candado */}
              <View style={{width: 36,height: 36,borderRadius: 18,backgroundColor: '#552381' + '20',justifyContent: 'center',alignItems: 'center',marginRight: 12 }}>
                <Lock size={18} color={'#8339c3'} />
              </View>
              <TextInput 
                style={{ flex: 1, paddingVertical: 10, fontSize: 14 }} 
                placeholder="password" 
                secureTextEntry={!showPassword}
              />
              {/* Botón del Ojo */}
              <TouchableOpacity style={{marginLeft:-10}} onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <Eye size={22} color={theme.primary} />
                ) : (
                  <EyeOff size={22} color="#A0A0A0" />
                )}
              </TouchableOpacity>
            </View>
           
          <View style={{ justifyContent: 'flex-end', height:'20%'}}>
           

            <TouchableOpacity onPress={()=>{alert('creaste tu cuenta'), router.replace('/Login')}} style={{ backgroundColor: theme.button, padding: 15, borderRadius: 15, alignItems: 'center' }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Register</Text>
            </TouchableOpacity>
            
            <View style={{width: 320,marginTop: 20,display: "flex",flexDirection: "row",justifyContent: "center",alignItems: "center",}}>
                <Text style={{color: "#544F4F",fontFamily: "roboto",fontWeight: "bold",fontSize: 16,}}>¿Ya tienes cuenta? </Text>
                <TouchableOpacity onPress={() => router.replace("/Login")}>
                    <Text style={{color: "#0661BC",fontFamily: "roboto",fontWeight: "bold",fontSize: 16, textDecorationLine: "underline",}}>Inicia Sesion</Text>
                </TouchableOpacity>
                </View>
          </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
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