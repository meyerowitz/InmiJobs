import React, { useState, useEffect } from 'react';
import { 
  Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ActivityIndicator, Image, 
  ScrollView, Dimensions, Alert 
} from 'react-native';
import { useUser } from '../Data/DataProvider';
import { db } from '../../../firebaseConfig'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location'; // <--- IMPORTANTE
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons'; // Para el icono de mapa
import MapSelector from '../MapSelector'

const { width } = Dimensions.get('window');
const IMGBB_API_KEY = process.env.EXPO_PUBLIC_IMGBB_API_KEY;


const QUICK_PHOTOS = [
  'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg',
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
  'https://images.pexels.com/photos/3184357/pexels-photo-3184357.jpeg',
  'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg'
];

export default function NewJobPost({ visible, onClose, type }) {
  const [sector, setSector] = useState('Tecnología');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [text, setText] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const { userData } = useUser();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // ESTADO PARA UBICACIÓN
  const [location, setLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const [showMap, setShowMap] = useState(false);
  const [initialRegion, setInitialRegion] = useState(null);
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);

  const handleOpenMap = async () => {
    if (showMap) {
      setShowMap(false);
      return;
    }

    setIsLoadingGPS(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permiso necesario", "Para ubicar la oferta, necesitamos acceder a tu ubicación.");
        setIsLoadingGPS(false);
        return;
      }

      // Obtenemos la ubicación actual con precisión alta para el mapa
      let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude
      };

      setInitialRegion(coords);
      setLocation(coords); // Guardamos esta como ubicación inicial por defecto
      setShowMap(true);
    } catch (error) {
      Alert.alert("Error", "No pudimos obtener tu ubicación actual.");
    } finally {
      setIsLoadingGPS(false);
    }
  };

  // Función para obtener ubicación actual
  const handleGetLocation = async () => {
    setGettingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permiso denegado", "Necesitamos acceso al GPS para ubicar la oferta en el mapa.");
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No pudimos obtener tu ubicación.");
    } finally {
      setGettingLocation(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
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
      name: 'upload.jpg',
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

  const handlePublish = async () => {
    if (!text.trim() || !userData) return;
    
    setIsPublishing(true);
    try {
      let imageUrl = null;

      if (selectedImage) {
        setIsUploadingImage(true);
        imageUrl = await uploadToImgBB(selectedImage);
        setIsUploadingImage(false);
      }

      const postData = {
        userId: userData.id || userData.uid, 
        userName: userData.name || 'Usuario', 
        userImage: userData.image || '',      
        createdAt: serverTimestamp(),       
        description: text,
        sector: sector, // Guardamos el sector seleccionado
        likesCount: 0,
        commentsCount: 0,
        commentsData: [],                     
        sharesCount: 0,
        media: imageUrl ? [imageUrl] : [],   
        type: 'jobs',
        // AQUÍ GUARDAMOS LA UBICACIÓN PARA EL MAPA
        location: location || null 
      };

      await addDoc(collection(db, "Post"), postData);
      
      // Limpiar estados
      setText('');
      setSelectedImage(null);
      setLocation(null);
      onClose();
    } catch (error) {
      console.error("Error al guardar el post: ", error);
      alert("No se pudo publicar. Intenta de nuevo.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
          
          <View style={styles.animationHeader}>
            <Image source={{ uri: QUICK_PHOTOS[currentImageIndex] }} style={StyleSheet.absoluteFill} />
            <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent']} style={StyleSheet.absoluteFill} />
            <View style={styles.overlayTextContainer}>
              <Text style={styles.searchingText}>BUSCANDO TALENTO</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={{color: 'white', fontWeight: 'bold'}}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.form} >
            <Text style={styles.label}>Descripción de la vacante</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Buscamos un diseñador UX/UI apasionado..."
              multiline
              value={text}
              onChangeText={setText}
            />

            <Text style={styles.label}>Sector de la industria</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={sector}
                onValueChange={(item) => setSector(item)}
                style={styles.picker}
              >
                <Picker.Item label="Tecnología" value="Tecnología" />
                <Picker.Item label="Salud" value="Salud" />
                <Picker.Item label="Educación" value="Educación" />
                <Picker.Item label="Finanzas" value="Finanzas" />
                <Picker.Item label="Construcción" value="Construcción" />
              </Picker>
            </View>

            {/* SECCIÓN DE UBICACIÓN */}
            <Text style={styles.label}>Ubicación del empleo</Text>
            <TouchableOpacity 
              style={[styles.locationBtn, location && styles.locationSuccess]} 
              onPress={handleOpenMap}
              disabled={isLoadingGPS}
            >
            {isLoadingGPS ? (
              <ActivityIndicator color="#2374c4" />
            ) : (
            <>
            <Ionicons name="map-outline" size={20} color={location ? "white" : "#2374c4"} />
            <Text style={[styles.locationText, location && {color: 'white'}]}>
              {location ? "Ubicación seleccionada" : "Seleccionar ubicación en mapa"}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {showMap && initialRegion && (
        <MapSelector 
          initialLocation={initialRegion} 
          onLocationSelect={(coords) => setLocation(coords)} 
        />
      )}

            {selectedImage && (
              <View style={styles.imagePreview}>
                <Image source={{ uri: selectedImage }} style={{flex: 1, borderRadius: 10}} />
                <TouchableOpacity style={styles.removeImg} onPress={() => setSelectedImage(null)}>
                  <Text style={{color: 'white'}}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.addImgBtn} onPress={pickImage}>
              <Text style={styles.addImgText}>🖼️ {selectedImage ? "Cambiar imagen" : "Añadir imagen decorativa"}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.publishBtn, (!text || isPublishing) && styles.disabledBtn]}
              onPress={handlePublish}
              disabled={!text || isPublishing}
            >
              {isPublishing ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.publishBtnText}>Publicar Oferta</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: '92%' },
  animationHeader: { height: 140, width: '100%', overflow: 'hidden', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  overlayTextContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  searchingText: { color: 'white', fontSize: 24, fontWeight: '900', letterSpacing: 3 },
  closeBtn: { position: 'absolute', top: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.5)', width: 35, height: 35, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  form: { padding: 20 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#888', marginBottom: 5, textTransform: 'uppercase' },
  input: { backgroundColor: '#f5f7fa', borderRadius: 15, padding: 15, fontSize: 16, minHeight: 100, textAlignVertical: 'top', marginBottom: 20 },
  pickerWrapper: { backgroundColor: '#f5f7fa', borderRadius: 15, marginBottom: 20, overflow: 'hidden' },
  picker: { height: 50, width: '100%' },
  // ESTILOS NUEVOS PARA UBICACIÓN
  locationBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#eef4fb', 
    padding: 15, 
    borderRadius: 15, 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2374c4',
    borderStyle: 'dashed'
  },
  locationSuccess: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
    borderStyle: 'solid'
  },
  locationText: { marginLeft: 10, color: '#2374c4', fontWeight: '600' },
  // RESTO DE ESTILOS
  imagePreview: { width: '100%', height: 150, marginBottom: 15, position: 'relative' },
  removeImg: { position: 'absolute', top: 5, right: 5, backgroundColor: 'red', borderRadius: 15, width: 25, height: 25, justifyContent: 'center', alignItems: 'center' },
  addImgBtn: { padding: 10, alignItems: 'center', marginBottom: 20 },
  addImgText: { color: '#2374c4', fontWeight: '600' },
  publishBtn: { backgroundColor: '#2374c4', padding: 18, borderRadius: 15, alignItems: 'center' },
  disabledBtn: { backgroundColor: '#ccc' },
  publishBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});