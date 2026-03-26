import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, StyleSheet, 
  Dimensions,  ActivityIndicator, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../Components/Data/DataProvider';
import { useLocalSearchParams } from 'expo-router';
import { db } from '../../firebaseConfig'; 
// AGREGAMOS ESTOS IMPORTS QUE FALTABAN
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore'; 
import { SafeAreaView } from "react-native-safe-area-context";
import StatusBar_Fix from '../Components/StatusBar_fix';
import Volver from '../Components/Botones/Volver';
import * as DocumentPicker from 'expo-document-picker';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const IMGBB_API_KEY = process.env.EXPO_PUBLIC_IMGBB_API_KEY || '';


export default function Portafolio() {
  const { userData } = useUser();
  const params = useLocalSearchParams(); 
  
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    const docRef = doc(db, "Portafolio", params.id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFiles(data.files || []); 
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [params.id]);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        handleUpload(result.assets[0]);
      }
    } catch (err) {
      Alert.alert("Error", "No se pudo seleccionar el archivo");
    }
  };

  const handleUpload = async (file) => {
    setIsUploading(true);
    try {
      let finalUrl = file.uri; // Por defecto guardamos el texto plano (URI)
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension);

      // Si es imagen, intentamos subirla a ImgBB para que sea una URL real
      if (isImage && IMGBB_API_KEY !== '') {
        try {
          const formData = new FormData();
          formData.append('image', {
            uri: file.uri,
            type: `image/${fileExtension}`,
            name: file.name,
          });

          const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData,
          });
          const resData = await response.json();
          if (resData.success) finalUrl = resData.data.url;
        } catch (e) {
          console.log("Error subiendo a ImgBB, usando URI local...");
        }
      }

      // Creamos el objeto para Firestore
      const newFileObj = {
        id: Math.random().toString(36).substring(7),
        name: file.name,
        type: fileExtension,
        date: new Date().toLocaleDateString(),
        url: finalUrl, // Texto plano o URL de ImgBB
      };

      // Actualizamos Firestore
      const portfolioRef = doc(db, "Portafolio", params.id);
      await updateDoc(portfolioRef, {
        files: arrayUnion(newFileObj)
      });

      Alert.alert("¡Éxito!", "Archivo vinculado correctamente.");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo guardar en la base de datos.");
    } finally {
      setIsUploading(false);
    }
  };

  const getFileStyle = (type) => {
    switch (type) {
      case 'pdf': return { icon: 'document-text', color: '#FF5252', bg: '#FFEBEE' };
      case 'pptx': case 'ppt': return { icon: 'easel', color: '#FFAB40', bg: '#FFF3E0' };
      case 'psd': return { icon: 'color-palette', color: '#448AFF', bg: '#E3F2FD' };
      case 'jpg': case 'png': case 'jpeg': return { icon: 'image', color: '#4CAF50', bg: '#E8F5E9' };
      default: return { icon: 'file-tray-full', color: '#9E9E9E', bg: '#F5F5F5' };
    }
  };

  const renderFileItem = ({ item }) => {
    const style = getFileStyle(item.type);
    return (
      <TouchableOpacity style={styles.fileCard}>
        <View style={[styles.iconContainer, { backgroundColor: style.bg }]}>
          <Ionicons name={style.icon} size={28} color={style.color} />
        </View>
        <View style={styles.fileInfo}>
          <Text style={styles.fileName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.tagRow}>
             <View style={[styles.typeTag, { backgroundColor: style.color }]}>
                <Text style={styles.typeTagText}>{item.type.toUpperCase()}</Text>
             </View>
             <Text style={styles.fileDate}>{item.date}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => Alert.alert("Opciones", "¿Qué deseas hacer?")}>
          <Ionicons name="ellipsis-vertical" size={20} color="#A0A0A0" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{flex:1, backgroundColor: '#F8F9FA'}}>
         <StatusBar style="light" />
      <StatusBar_Fix />
      
      <View style={[styles.header, { borderBottomWidth: 4, borderBottomColor: params.color || '#000' }]}>
        <Volver style={{marginBottom: 10}} route={params.ruta} screen={params.screen}/>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10}}>
           <Ionicons name="folder-open" size={28} color={params.color || '#333'} />
           <Text style={styles.headerTitle}>{params.title || 'Portafolio'}</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          {loading ? 'Cargando archivos...' : `${files.length} archivos disponibles`}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={params.color} style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={files}
          keyExtractor={(item) => item.id}
          renderItem={renderFileItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-attach-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>Este portafolio está vacío.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: params.color || '#000' }]}
        onPress={pickDocument}
        disabled={isUploading}
      >
        {isUploading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Ionicons name="add" size={30} color="white" />
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ... Tus estilos se mantienen igual
const styles = StyleSheet.create({
  header: { padding: 25, backgroundColor: '#fff', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  headerSubtitle: { fontSize: 14, color: '#888', marginTop: 5 },
  listContent: { padding: 20, paddingBottom: 100 },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  iconContainer: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 16, fontWeight: '600', color: '#333' },
  tagRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  typeTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
  typeTagText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  fileDate: { fontSize: 12, color: '#A0A0A0' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { textAlign: 'center', marginTop: 10, color: '#999', fontSize: 16 }
});