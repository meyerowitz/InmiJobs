import React, { useState } from 'react';
import { 
  Modal, View, Text, StyleSheet, TouchableOpacity, 
  TouchableWithoutFeedback, Image, ActivityIndicator, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { db } from '../../../firebaseConfig'; 
import { doc, updateDoc } from 'firebase/firestore';
import { useUser } from '../Data/DataProvider';

const IMGBB_API_KEY = process.env.EXPO_PUBLIC_IMGBB_API_KEY;

export default function newPortrait({ visible, onClose, mode }) {
  const { userData, setUserData } = useUser();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: mode === 'profile' ? [1, 1] : [16, 9],
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const uploadToImgBB = async (uri) => {
    const formData = new FormData();
    formData.append('image', {
      uri: uri,
      type: 'image/jpeg',
      name: 'update_media.jpg',
    });

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = await response.json();
      return data.success ? data.data.display_url : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const handleUpdate = async () => {
    if (!selectedImage) return;

    setIsUploading(true);
    try {
      const imageUrl = await uploadToImgBB(selectedImage);
      if (!imageUrl) throw new Error("Error al subir");

      const userRef = doc(db, "Usuarios", userData.id || userData.uid);
      const atributoASustituir = mode === 'profile' ? 'image' : 'banner';
      // Actualizamos dinámicamente según el modo
      const updateData = mode === 'profile' 
        ? { image: imageUrl } 
        : { banner: imageUrl };

      await updateDoc(userRef, updateData);
      // 2. ACTUALIZAR ESTADO GLOBAL (La clave del éxito)
      // Mantenemos todo lo que tenía userData y solo sobreescribimos el campo editado
      setUserData(prev => ({
        ...prev,
        [atributoASustituir]: imageUrl
      }));

      Alert.alert("Éxito", "Imagen actualizada correctamente");
      setSelectedImage(null);
      onClose();
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar la imagen");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>
                  {mode === 'profile' ? 'Foto de perfil' : 'Foto de portada'}
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={20} color="#65676b" />
                </TouchableOpacity>
              </View>

              <View style={styles.body}>
                {selectedImage ? (
                  <Image 
                    source={{ uri: selectedImage }} 
                    style={[styles.preview, mode === 'profile' ? styles.previewCircle : styles.previewRect]} 
                  />
                ) : (
                  <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
                    <Ionicons name="image-outline" size={40} color="#1877f2" />
                    <Text style={styles.uploadText}>Seleccionar nueva foto</Text>
                  </TouchableOpacity>
                )}

                {selectedImage && (
                  <TouchableOpacity style={styles.changeButton} onPress={pickImage}>
                    <Text style={{color: '#1877f2'}}>Elegir otra</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity 
                style={[styles.saveButton, (!selectedImage || isUploading) && styles.disabledButton]}
                onPress={handleUpdate}
                disabled={!selectedImage || isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Guardar cambios</Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  closeButton: { backgroundColor: '#e4e6eb', borderRadius: 20, padding: 5 },
  body: { alignItems: 'center', marginVertical: 20 },
  uploadArea: { width: '100%', height: 200, backgroundColor: '#f0f2f5', borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc' },
  uploadText: { marginTop: 10, color: '#1877f2', fontWeight: '600' },
  preview: { width: 200, height: 200, marginBottom: 15 },
  previewCircle: { borderRadius: 100 },
  previewRect: { width: '100%', height: 180, borderRadius: 10 },
  changeButton: { marginBottom: 15 },
  saveButton: { backgroundColor: '#1877f2', padding: 15, borderRadius: 8, alignItems: 'center' },
  disabledButton: { backgroundColor: '#e4e6eb' },
  saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});