import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity,StatusBar} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../Components/Temas_y_colores/ThemeContext';
import { SafeAreaView } from "react-native-safe-area-context";
import {useRouter} from 'expo-router';

export default function VerificationScreen() {
  const [code, setCode] = useState(['8', '8', '7', '6']); // Iniciado con los valores de tu imagen
  const [timer, setTimer] = useState(192); // 03:12 en segundos
  const { theme, isDark } = useTheme();
  const inputs = useRef([]);
  const router = useRouter();
  // Lógica del temporizador
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Mover al siguiente input automáticamente
    if (text && index < 3) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Retroceder si se borra
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={'light-content'} backgroundColor={theme.gradient[0]}/>
      {/* Botón Volver */}
      <TouchableOpacity onPress={()=>{router.replace('/pages/olvide/forgot_password')}} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color="#9E9E9E" />
        <Text style={styles.backText}>Go Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Check your phone</Text>
        <Text style={styles.subtitle}>We've sent the code to your phone</Text>

        {/* Contenedores de los dígitos */}
        <View style={styles.otpContainer}>
          {code.map((digit, index) => (
            <View key={index} style={[styles.inputBox, index === 3 && styles.activeBox]}>
              <TextInput
                ref={(el) => (inputs.current[index] = el)}
                style={styles.otpText}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
              />
            </View>
          ))}
        </View>

        <Text style={styles.timerText}>
          Code expires in: <Text style={styles.timerBold}>{formatTime(timer)}</Text>
        </Text>

        {/* Botones de acción */}
        <TouchableOpacity onPress={()=>{router.replace('/pages/olvide/reset_password')}} style={styles.verifyButton}>
          <Text style={styles.verifyButtonText}>Verify</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resendButton}>
          <Text style={styles.resendButtonText}>Send again</Text>
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
  },
  backText: {
    fontSize: 16,
    color: '#9E9E9E',
    marginLeft: 5,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#4A4A4A',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#9E9E9E',
    textAlign: 'center',
    marginBottom: 40,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 40,
  },
  inputBox: {
    width: 70,
    height: 80,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  activeBox: {
    borderColor: '#4A4A4A', // El último borde es más oscuro en tu imagen
    borderWidth: 1.5,
  },
  otpText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#4A4A4A',
    textAlign: 'center',
    width: '100%',
  },
  timerText: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 40,
  },
  timerBold: {
    fontWeight: 'bold',
    color: '#4A4A4A',
  },
  verifyButton: {
    backgroundColor: '#FFD35C',
    width: '100%',
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  resendButton: {
    backgroundColor: '#fff',
    width: '100%',
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  resendButtonText: {
    color: '#9E9E9E',
    fontSize: 16,
    fontWeight: '500',
  },
});