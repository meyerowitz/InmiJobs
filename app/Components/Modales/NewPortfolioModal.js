import React, { useState } from 'react';
import { 
  Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, 
  TouchableWithoutFeedback, KeyboardAvoidingView, Platform,
  ActivityIndicator, Image, ScrollView, Dimensions 
} from 'react-native';
import { useUser } from '../Data/DataProvider';
import { db } from '../../../firebaseConfig'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const IMGBB_API_KEY = process.env.EXPO_PUBLIC_IMGBB_API_KEY;


export default function NewPortfolio({ visible, onClose }) {
  const { userData } = useUser();
  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState('#B85CFB');
  const [selectedIcon, setSelectedIcon] = useState('folder'); // Estado para el icono
  const [banner, setBanner] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const colors = ['#FF7D54', '#B85CFB', '#56CCF2', '#4CAF50', '#FFC107'];
  
  // Array de iconos sugeridos para portafolios
  const icons = [
    'folder', 'color-palette', 'code-slash', 'videocam', 
    'camera', 'layers', 'briefcase', 'create', 'image', 'globe'
  ];

  const pickBanner = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });
    if (!result.canceled) setBanner(result.assets[0].uri);
  };

  const uploadToImgBB = async (uri) => {
    const formData = new FormData();
    formData.append('image', { uri, type: 'image/jpeg', name: 'portfolio_banner.jpg' });
    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = await response.json();
      return data.success ? data.data.display_url : null;
    } catch (error) {
      return null;
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !userData) return;
    setIsPublishing(true);

    try {
      let bannerUrl = banner ? await uploadToImgBB(banner) : null;

      const portfolioData = {
        userId: userData.id || userData.uid,
        title: title,
        color: selectedColor,
        icon: selectedIcon, // Guardamos el icono seleccionado
        banner: bannerUrl,
        createdAt: serverTimestamp(),
        subSections: [], 
        files: [],      
        type: 'portfolio_root'
      };

      await addDoc(collection(db, "Portafolio"), portfolioData);
      
      setTitle('');
      setBanner(null);
      setSelectedIcon('folder');
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error al crear el portafolio");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
              
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Nuevo Sub-Portafolio</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Título del Portafolio</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Ej: Proyectos de Branding 2024" 
                  value={title} 
                  onChangeText={setTitle} 
                />

                <Text style={styles.label}>Icono representativo</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScroll}>
                  {icons.map((iconName) => (
                    <TouchableOpacity 
                      key={iconName}
                      onPress={() => setSelectedIcon(iconName)}
                      style={[
                        styles.iconOption, 
                        selectedIcon === iconName && { backgroundColor: selectedColor, borderColor: selectedColor }
                      ]}
                    >
                      <Ionicons 
                        name={iconName} 
                        size={24} 
                        color={selectedIcon === iconName ? '#fff' : '#65676b'} 
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.label}>Banner de portada (Opcional)</Text>
                <TouchableOpacity style={styles.bannerPicker} onPress={pickBanner}>
                  {banner ? (
                    <Image source={{ uri: banner }} style={styles.bannerImage} />
                  ) : (
                    <View style={styles.bannerPlaceholder}>
                      <Ionicons name="image-outline" size={32} color="#ccc" />
                      <Text style={{color: '#aaa', fontSize: 12}}>Click para subir imagen</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <Text style={styles.label}>Color temático</Text>
                <View style={styles.colorRow}>
                  {colors.map(c => (
                    <TouchableOpacity 
                      key={c} 
                      onPress={() => setSelectedColor(c)}
                      style={[styles.colorCircle, { backgroundColor: c, borderWidth: selectedColor === c ? 3 : 0, borderColor: '#000' }]} 
                    />
                  ))}
                </View>

                <TouchableOpacity 
                  style={[styles.saveButton, (!title || isPublishing) && styles.disabledButton]} 
                  onPress={handleSave}
                  disabled={!title || isPublishing}
                >
                  {isPublishing ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Crear Portafolio</Text>}
                </TouchableOpacity>
              </ScrollView>

            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, height: '80%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  closeButton: { backgroundColor: '#f0f2f5', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: '#65676b', marginBottom: 8, marginTop: 15 },
  input: { fontSize: 18, borderBottomWidth: 1, borderColor: '#ddd', paddingVertical: 5, marginBottom: 10 },
  
  // Estilos de iconos
  iconScroll: { flexDirection: 'row', marginBottom: 5 },
  iconOption: { 
    width: 45, 
    height: 45, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#ddd', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 10 
  },

  bannerPicker: { width: '100%', height: 120, backgroundColor: '#f9f9f9', borderRadius: 15, overflow: 'hidden', marginTop: 5, borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc' },
  bannerImage: { width: '100%', height: '100%' },
  bannerPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  colorRow: { flexDirection: 'row', gap: 15, marginTop: 10 },
  colorCircle: { width: 35, height: 35, borderRadius: 17.5 },
  saveButton: { backgroundColor: '#1877f2', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 30, marginBottom: 20 },
  disabledButton: { backgroundColor: '#e4e6eb' },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});