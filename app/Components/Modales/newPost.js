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
  ActivityIndicator
} from 'react-native';
import { useUser } from '../Data/DataProvider'; // Tu hook
import { db } from '../../../firebaseConfig'; // Tu archivo de config de Firebase
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function NewPost({ visible, onClose }) {
 const [text, setText] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const { userData } = useUser(); // Obtenemos el usuario del Provider

  const handlePublish = async () => {
    if (!text.trim() || !userData) return;

    setIsPublishing(true);
    try {
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
        media: [],                            // Espacio para array de imágenes/archivos
      };

      await addDoc(collection(db, "Post"), postData);
      
      setText(''); // Limpiar input
      onClose();   // Cerrar modal
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

              {/* Info del Usuario */}
              <View style={styles.userInfo}>
                <View style={styles.avatarPlaceholder} />
                <View>
                  <Text style={styles.userName}>Rebeca</Text>
                  <View style={styles.privacyBadge}>
                    <Text style={styles.privacyText}>👥 Amigos ▼</Text>
                  </View>
                </View>
              </View>

              {/* Input de Texto */}
              <TextInput
                style={styles.input}
                placeholder="¿Qué estás pensando, Rebeca?"
                placeholderTextColor="#65676b"
                multiline
                value={text}
                onChangeText={setText}
              />

              {/* Barra de Herramientas (La de la imagen) */}
              <View style={styles.toolbar}>
                <Text style={styles.toolbarText}>Agregar a tu publicación</Text>
                <View style={styles.iconsRow}>
                  <Text style={styles.icon}>🖼️</Text>
                  <Text style={styles.icon}>👤</Text>
                  <Text style={styles.icon}>😊</Text>
                  <Text style={styles.icon}>📍</Text>
                  <Text style={[styles.icon, styles.gifIcon]}>GIF</Text>
                </View>
              </View>

              {/* Botón Publicar */}
            {/* Botón Publicar */}
              <TouchableOpacity 
                style={[styles.publishButton, (!text || isPublishing) && styles.publishButtonDisabled]}
                onPress={handlePublish}
                disabled={!text || isPublishing}
              >
                {isPublishing ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={[styles.publishText, !text && styles.publishTextDisabled]}>
                    Publicar
                  </Text>
                )}
              </TouchableOpacity>
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
    marginRight: 10,
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
    marginTop: 20,
    minHeight: 150,
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
});
