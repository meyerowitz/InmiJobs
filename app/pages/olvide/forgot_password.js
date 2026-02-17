import React, { useState } from 'react';
import { StyleSheet,Text,View, TextInput,TouchableOpacity, StatusBar} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../Components/Temas_y_colores/ThemeContext';
import { SafeAreaView } from "react-native-safe-area-context";
import {useRouter} from 'expo-router';

export default function PasswordRecoveryScreen() {
  const [email, setEmail] = useState('');
  const { theme, isDark } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={'light-content'} backgroundColor={'#B85CFB'}/>
      {/* Botón Go Back */}
      <TouchableOpacity onPress={()=>{router.replace('Login')}} style={styles.backButton}>
        <Ionicons name="chevron-back" size={20} color="#9E9E9E" />
        <Text style={styles.backText}>Go Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Password recovery</Text>
        <Text style={styles.subtitle}>Enter your email to recover your password</Text>

        {/* Input de Email */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#9E9E9E" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="email@merchport.hk"
            placeholderTextColor="#BDBDBD"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Botón Recover Password */}
        <TouchableOpacity 
          style={[styles.button, { opacity: email.includes('@') ? 1 : 0.7 }]}
          activeOpacity={0.8}
          onPress={()=>{router.replace('/pages/olvide/code_password')}}
        >
          <Text style={styles.buttonText}>Recover password</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginTop: 10,
  },
  backText: {
    fontSize: 16,
    color: '#9E9E9E',
    marginLeft: 4,
  },
  content: {
    paddingHorizontal: 30,
    paddingTop: 80, // Espacio para centrar el contenido visualmente
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#9E9E9E',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 15, // Bordes un poco menos redondeados que los botones según la imagen
    paddingHorizontal: 15,
    height: 60,
    width: '100%',
    marginBottom: 30,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#4A4A4A',
  },
  button: {
    backgroundColor: '#F3C55A', // El amarillo mostaza de la imagen
    width: '100%',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    // Sombra suave
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});