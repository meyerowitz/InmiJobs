import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, ScrollView,  Dimensions , StatusBar, Image} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import { User, Lock, EyeOff, Eye } from 'lucide-react-native';
import { useTheme } from './Components/Temas_y_colores/ThemeContext';
import {useRouter} from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
const { width } = Dimensions.get('window');

export default function Login() {
  const { theme, isDark } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.gradient[0] }}>
      <StatusBar  barStyle={'light-content'} backgroundColor={'#B85CFB'}/>
         <LinearGradient 
          colors={[theme.gradient[0], theme.gradient[1], theme.gradient[1], theme.gradient[1]]} 
          style={{ flex:1 }}
        >
      <ScrollView contentContainerStyle={{ height:'110%',paddingTop:'65%'}}>   
        <Image source={require('../assets/img/inmifriend.png')} style={{position:'absolute', zIndex:1, width:160, height:160, left:'26%', top:'18%'}}></Image>
         <Image source={require('../assets/img/brujula.png')} style={{position:'absolute', zIndex:1, width:130, height:130, left:'74%', top:'2%'}}></Image>
          <Image source={require('../assets/img/triangulo.png')} style={{position:'absolute', zIndex:1, width:140, height:140, left:'-10%', top:'26%'}}></Image>
          {/* Formulario Blanco */}
          <View style={{ backgroundColor: 'white', padding: 30, borderTopLeftRadius: 40, borderTopRightRadius: 40 , height:'125%'}}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 25, color: theme.text}}>Login Here</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 , width:'100%',borderBottomColor: '#EEE',borderBottomWidth: 1, paddingVertical:10}}>
              {/* Círculo con Persona */}
              <View style={{width: 36,height: 36,borderRadius: 18,backgroundColor: theme.primary + '20',justifyContent: 'center',alignItems: 'center',marginRight: 12 }}>
                <User size={18} color={theme.primary} />
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
            <TouchableOpacity onPress={()=>{router.replace('./pages/olvide/forgot_password')}}>
              <Text style={{ color: '#A0A0A0', fontSize: 12, marginBottom: 20 }}>Forget Password?</Text>
            </TouchableOpacity>
          <View style={{ justifyContent: 'flex-end', height:'20%'}}>
           

            <TouchableOpacity onPress={()=>{router.replace('/pages/Navigation')}}style={{ backgroundColor: theme.button, padding: 15, borderRadius: 15, alignItems: 'center' }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Login</Text>
            </TouchableOpacity>
            
            <View style={{width: 320,marginTop: 20,display: "flex",flexDirection: "row",justifyContent: "center",alignItems: "center",}}>
                <Text style={{color: "#544F4F",fontFamily: "roboto",fontWeight: "bold",fontSize: 16,}}>¿No tienes cuenta? </Text>
                <TouchableOpacity onPress={() => router.replace("/Register")}>
                    <Text style={{color: "#0661BC",fontFamily: "roboto",fontWeight: "bold",fontSize: 16, textDecorationLine: "underline",}}>Regístrate aquí</Text>
                </TouchableOpacity>
                </View>
          </View>
          </View>

       

      </ScrollView>
                </LinearGradient>
    </SafeAreaView>
  );
}