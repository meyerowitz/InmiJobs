import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Para los iconos de candado y ojo
import { useTheme } from '../../Components/Temas_y_colores/ThemeContext';
import {useRouter} from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from 'expo-status-bar';

export default function ForgotPassword() {
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const router = useRouter();
  const { theme, isDark } = useTheme();
  // Lógica de validación
  const hasMinLength = password.length >= 6;
  const hasNumber = /\d/.test(password);

  return (
    <>
     <StatusBar 
                 style="light" backgroundColor={'#B85CFB'}
                 translucent={false}
              />
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Reset your password</Text>
        <Text style={styles.subtitle}>Please enter your new password</Text>

        {/* Contenedor del Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="********"
            secureTextEntry={secureText}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setSecureText(!secureText)}>
            <Ionicons name={secureText ? "eye-outline" : "eye-off-outline"} size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Requerimientos */}
        <View style={styles.requirementsContainer}>
          <Text style={styles.requirementTitle}>Your Password must contain:</Text>
          
          <View style={styles.requirementRow}>
            <Ionicons 
              name="checkmark-circle" 
              size={18} 
              color={hasMinLength ? theme.button : "#E0E0E0"} 
            />
            <Text style={[styles.requirementText, hasMinLength && styles.activeText]}>
              At least 6 characters
            </Text>
          </View>

          <View style={styles.requirementRow}>
            <Ionicons 
              name="checkmark-circle" 
              size={18} 
              color={hasNumber ? theme.button : "#E0E0E0"} 
            />
            <Text style={[styles.requirementText, hasNumber && styles.activeText]}>
              Contains a number
            </Text>
          </View>
        </View>
        {/* disabled={!(hasMinLength && hasNumber)}*/}
        {/* Botón */}
        <TouchableOpacity 
          style={[{backgroundColor: theme.gradient[0], height: 55,borderRadius: 25,justifyContent: 'center',alignItems: 'center',marginTop: 20, elevation: 2, shadowColor: '#000',shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,shadowRadius: 4,}, { opacity: (hasMinLength && hasNumber) ? 1 : 0.6 }]}
          onPress={()=>{router.replace('Login')}}
         
        >
          <Text style={styles.buttonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 30,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#4A4A4A',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#9E9E9E',
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFD35C', // Color amarillo de tu imagen
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 30,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  requirementsContainer: {
    marginBottom: 40,
  },
  requirementTitle: {
    fontSize: 15,
    color: '#9E9E9E',
    marginBottom: 15,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requirementText: {
    marginLeft: 10,
    color: '#BDBDBD',
    fontSize: 14,
  },
  activeText: {
    color: '#4A4A4A',
  },
  button: {
     },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});