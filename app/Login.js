import React from 'react';
import { Text, View, TextInput, TouchableOpacity, ScrollView,  Dimensions , StatusBar} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import { Search, TrendingUp, Star, Award, Home, BarChart2, Wallet, FileText, User, EyeOff } from 'lucide-react-native';
import { useTheme } from './Components/Temas_y_colores/ThemeContext';
import {useRouter} from 'expo-router';
const { width } = Dimensions.get('window');

export default function Login() {
  const { theme, toggleTheme, isDark } = useTheme();
      const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle={'light-content'} backgroundColor={theme.gradient[0]}/>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* --- SECCIÓN LOGIN --- */}
        <LinearGradient 
          colors={[theme.gradient[0], theme.gradient[1], theme.gradient[1], theme.gradient[1]]} 
          style={{ paddingTop: 40, flex:1 }}
        >
          {/* Contenedor Mascota */}
          <View style={{ height: 150, alignItems: 'center', justifyContent: 'center' }}>
             <View style={{ width: 80, height: 80, backgroundColor: '#ffffff', borderRadius: 20 }} />
          </View>
          
          {/* Formulario Blanco */}
          <View style={{ backgroundColor: 'white', padding: 30, borderTopLeftRadius: 40, borderTopRightRadius: 40 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 25 }}>Login</Text>
            
            <TextInput 
              style={{ borderBottomWidth: 1, borderBottomColor: '#EEE', paddingVertical: 10, marginBottom: 20, fontSize: 14 }} 
              placeholder="email" 
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EEE', marginBottom: 15 }}>
              <TextInput 
                style={{ flex: 1, paddingVertical: 10, fontSize: 14 }} 
                placeholder="••••••••••••" 
                secureTextEntry 
              />
              <EyeOff size={18} color="#A0A0A0" />
            </View>

            <TouchableOpacity>
              <Text style={{ color: '#A0A0A0', fontSize: 12, marginBottom: 20 }}>Forget Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ backgroundColor: '#1A1A2E', padding: 15, borderRadius: 15, alignItems: 'center' }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Login</Text>
            </TouchableOpacity>
            
            <View style={{width: 320,marginTop: 20,display: "flex",flexDirection: "row",justifyContent: "center",alignItems: "center",}}>
                <Text style={{color: "#544F4F",fontFamily: "roboto",fontWeight: "bold",fontSize: 16,}}>¿No tienes cuenta? </Text>
                <TouchableOpacity onPress={() => router.replace("/Register")}>
                    <Text style={{color: "#0661BC",fontFamily: "roboto",fontWeight: "bold",fontSize: 16, textDecorationLine: "underline",}}>Regístrate aquí</Text>
                </TouchableOpacity>
                </View>

            {/* Iconos Sociales */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 25 }}>
               {[1, 2, 3].map((_, i) => (
                 <View key={i} style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#EEE', justifyContent: 'center', alignItems: 'center', marginHorizontal: 10 }}>
                   <View style={{ width: 15, height: 15, backgroundColor: '#DDD', borderRadius: 5 }} />
                 </View>
               ))}
            </View>
          </View>
        </LinearGradient>

       

      </ScrollView>

    </SafeAreaView>
  );
}