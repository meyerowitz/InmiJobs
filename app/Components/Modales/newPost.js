import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  TouchableWithoutFeedback, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,Image,ScrollView
} from 'react-native';
import { useUser } from '../Data/DataProvider'; // Tu hook
import { db } from '../../../firebaseConfig'; // Tu archivo de config de Firebase
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';

const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

export default function NewPost({ visible, onClose }) {
 const [text, setText] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const { userData } = useUser(); // Obtenemos el usuario del Provider
  const [selectedImage, setSelectedImage] = useState(null); // URI local
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // 1. Función para seleccionar imagen de la galería
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7, // Comprimimos un poco para que suba rápido
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

    const uploadToImgBB = async (uri) => {
      console.log('inicio uploadToImgBB')
  const formData = new FormData();
  formData.append('image', {
    uri: uri,
    type: 'image/jpeg', // Asegúrate de que esto coincida con el tipo de archivo
    name: 'upload.jpg',
  });

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    const data = await response.json();

    if (data.success) {
      // display_url suele ser la versión más estable y directa para mostrar
      console.log("URL Directa generada:", data.data.display_url);
      return data.data.display_url; 
    } else {
      console.error("Error en respuesta de ImgBB:", data);
      return null;
    }
  } catch (error) {
    console.error("Error al conectar con ImgBB:", error);
    return null;
  }
};


  const handlePublish = async () => {
    if (!text.trim() || !userData) return;
    
    setIsPublishing(true);
    try {
      let imageUrl = null;

      // Si hay una imagen seleccionada, primero la subimos
      if (selectedImage) {
        setIsUploadingImage(true);
        imageUrl = await uploadToImgBB(selectedImage);
        setIsUploadingImage(false);
        
        if (!imageUrl) throw new Error("Error al subir imagen");
      }
      // Estructura de la tabla "Post"
      const postData = {
        userId: userData.id || userData.uid, // ID del autor
        userName: userData.name || 'Usuario', // Opcional: para no hacer tantos joins
        userImage: userData.image || '',      // Opcional: imagen del autor
        createdAt: serverTimestamp(),         // Fecha oficial de Firebase
        description: text,
        likesCount: 0,
        commentsCount: 0,
        commentsData: [],                     // Array de comentarios (vacío al inicio)
        sharesCount: 0,
        media: imageUrl ? [imageUrl] : [],                        // Espacio para array de imágenes/archivos
      };

      await addDoc(collection(db, "Post"), postData);
      
     // Limpiar y cerrar
      setText('');
      setSelectedImage(null);
      onClose();
    } catch (error) {
      console.error("Error al guardar el post: ", error);
      alert("No se pudo publicar. Intenta de nuevo.");
    } finally {
      setIsPublishing(false);
    }
  };


  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      {/* Overlay para cerrar al tocar fuera */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          
          {/* Contenedor del Modal con Flex-End */}
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalContent}
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={{ width: 40 }} /> {/* Espaciador */}
                <Text style={styles.headerTitle}>Crear publicación</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={{ fontSize: 18, color: '#65676b' }}>✕</Text>
                </TouchableOpacity>
              </View>
            <ScrollView>
              <View style={styles.userInfo}>
                <View style={styles.avatarPlaceholder}><Image source={{ uri: userData.image }} style={{flex:1}} /></View>
                <View>
                  <Text style={styles.userName}>{userData.name}</Text>
                </View>
              </View>
              
              <TextInput
                style={styles.input}
                placeholder={`¿Qué estás pensando, ${userData?.name?.split(' ')[0]}?`}
                multiline
                value={text}
                onChangeText={setText}
              />

              {/* Previsualización de la imagen seleccionada */}
              {selectedImage && (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                  <TouchableOpacity 
                    style={styles.removeImageBadge} 
                    onPress={() => setSelectedImage(null)}
                  >
                    <Text style={{color: 'white', fontWeight: 'bold'}}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity onPress={pickImage}>
              <View style={styles.toolbar}>
                <Text style={styles.toolbarText}>Agregar a tu publicación</Text>
                <View style={styles.iconsRow}>
                  {/* Click en la galería para abrir selector */}
                  
                    <Text style={styles.icon}>🖼️</Text>
                  
                  <Text style={styles.icon}>👤</Text>
                  <Text style={styles.icon}>😊</Text>
                </View>
              </View>
                </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.publishButton, (!text && !selectedImage || isPublishing) && styles.publishButtonDisabled]}
                onPress={handlePublish}
                disabled={(!text && !selectedImage) || isPublishing}
              >
                {isPublishing ? (
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <ActivityIndicator color="white" />
                    <Text style={{color: 'white', marginLeft: 10}}>
                      {isUploadingImage ? "Subiendo foto..." : "Publicando..."}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.publishText}>Publicar</Text>
                )}
              </TouchableOpacity>
              </ScrollView>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end', // Aquí sucede la magia del "flex end"
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    minHeight: '60%',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1c1e21',
  },
  closeButton: {
    backgroundColor: '#e4e6eb',
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  avatarPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#ddd',
    marginRight: 10, overflow: 'hidden'
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  privacyBadge: {
    backgroundColor: '#e4e6eb',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    marginTop: 2,
  },
  privacyText: {
    fontSize: 12,
  },
  input: {
    fontSize: 20,
    marginTop: 10,
    minHeight: 40,
    textAlignVertical: 'top',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ced0d4',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  toolbarText: {
    fontWeight: '600',
    color: '#4b4c4f',
  },
  iconsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  icon: {
    fontSize: 18,
  },
  gifIcon: {
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#00a400',
    color: 'white',
    padding: 2,
    borderRadius: 4,
  },
  publishButton: {
    backgroundColor: '#1877f2',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  publishButtonDisabled: {
    backgroundColor: '#e4e6eb',
  },
  publishText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  publishTextDisabled: {
    color: '#bcc0c4',
  },
  previewContainer: {
    width: '100%',
    height: 250,        // MUY IMPORTANTE: sin altura no se ve
    borderRadius: 12,
    marginVertical: 5,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f0f2f5', // Fondo gris por si tarda en cargar
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // Para que la foto llene el espacio
  },
  removeImageBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Asegura que el botón X esté arriba
  },
})
