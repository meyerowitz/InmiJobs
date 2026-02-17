import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../Components/Data/DataProvider';
// import * as DocumentPicker from 'expo-document-picker'; // Opcional para subir archivos reales
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get('window');

export default function Portafolio() {
  const { userData } = useUser();
  
  // Mock data de ejemplo (esto vendría de tu backend o base de datos)
  const [files, setFiles] = useState([
    { id: '1', name: 'Curriculum_Vitae.pdf', type: 'pdf', date: '12/02/2026' },
    { id: '2', name: 'Presentacion_Proyecto.pptx', type: 'pptx', date: '10/02/2026' },
    { id: '3', name: 'Diseño_Logo_Final.psd', type: 'psd', date: '05/02/2026' },
  ]);

  // Función para obtener el icono según el tipo de archivo
  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return { name: 'document-text', color: '#FF5252' };
      case 'pptx': return { name: 'easel', color: '#FFAB40' };
      case 'psd': return { name: 'color-palette', color: '#448AFF' };
      default: return { name: 'file-tray-full', color: '#9E9E9E' };
    }
  };

  const renderFileItem = ({ item }) => {
    const icon = getFileIcon(item.type);
    return (
      <TouchableOpacity style={styles.fileCard}>
        <View style={[styles.iconContainer, { backgroundColor: icon.color + '15' }]}>
          <Ionicons name={icon.name} size={30} color={icon.color} />
        </View>
        <View style={styles.fileInfo}>
          <Text style={styles.fileName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.fileDate}>{item.date} • {item.type.toUpperCase()}</Text>
        </View>
        <Ionicons name="ellipsis-vertical" size={20} color="#A0A0A0" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{flex:1}}>
    <View style={styles.container}>
         <StatusBar barStyle={'light-content'} backgroundColor={'#B85CFB'}/>
      {/* Header Personalizado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Portafolio</Text>
        <Text style={styles.headerSubtitle}>Gestiona tus documentos de {userData?.name}</Text>
      </View>

      <FlatList
        data={files}
        keyExtractor={(item) => item.id}
        renderItem={renderFileItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay archivos cargados aún.</Text>
        }
      />

      {/* Botón Flotante para Agregar */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => console.log("Abrir selector de archivos")}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 25, paddingTop: 60, backgroundColor: '#fff' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  headerSubtitle: { fontSize: 14, color: '#888', marginTop: 5 },
  listContent: { padding: 20, paddingBottom: 100 },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3, // Sombra en Android
    shadowColor: '#000', // Sombra en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 16, fontWeight: '600', color: '#333' },
  fileDate: { fontSize: 12, color: '#A0A0A0', marginTop: 4 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#000', // Color negro para hacer juego con tu menú
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' }
});