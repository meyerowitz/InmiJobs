import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ImageBackground, 
  Dimensions 
} from 'react-native';
import { BlurView } from 'expo-blur'; // Opcional: para un fondo desenfocado
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const IMGBB_API_KEY = process.env.EXPO_PUBLIC_IMGBB_API_KEY;

export default function NewJob ({ visible, onClose, onConfirm }){
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Fondo semi-transparente o desenfocado */}
        <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
        
        <View style={styles.modalContainer}>
          {/* Imagen de cabecera */}
          <ImageBackground 
            source={{ uri: 'https://i.pinimg.com/1200x/94/63/eb/9463ebf95199ebfc52fe8e9601d62431.jpg' }} 
            style={styles.imageHeader}
            imageStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
          >
            <LinearGradient 
              colors={['transparent', 'rgba(255,255,255,1)']} 
              style={styles.gradient} 
            />
          </ImageBackground>

          <View style={styles.content}>
            <Text style={styles.title}>¿Agregar nueva oferta laboral?</Text>
            <Text style={styles.subtitle}>
              Comienza a buscar al candidato ideal para tu equipo.
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={onClose}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onConfirm}>
                <LinearGradient 
                  colors={['#00a2e7', '#2374c4']} 
                  style={[styles.button, styles.confirmButton]}
                >
                  <Text style={styles.confirmText}>Confirmar</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  imageHeader: {
    width: '100%',
    height: 180,
    justifyContent: 'flex-end',
  },
  gradient: {
    height: 60,
    width: '100%',
  },
  content: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  confirmButton: {
    // El gradiente maneja el color
  },
  cancelText: {
    color: '#888',
    fontWeight: '600',
  },
  confirmText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
