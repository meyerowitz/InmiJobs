import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, TextInput, 
  Modal, ActivityIndicator, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../Components/Data/DataProvider';
import { db } from '../../firebaseConfig'; 
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';
import StatusBar_Fix from '../Components/StatusBar_fix';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

export default function GestionPortafolio() {
  const { userData } = useUser();
  const navigation = useNavigation(); // Hook para controlar el Drawer
  const router = useRouter(); // Hook para moverte entre páginas
  
  const [dataPortafolio, setDataPortafolio] = useState([]); // Usamos el mismo nombre que en profile
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState('#1877f2');

  const colores = ['#1877f2', '#B85CFB', '#FF5252', '#4CAF50', '#FFAB40', '#000000'];

  // 1. LÓGICA IDÉNTICA A TU COMPONENTE PROFILE
  useEffect(() => {
    if (!userData) return;

    // Usamos exactamente la misma consulta que te funciona en Profile
    const q = query(
      collection(db, "Portafolio"), 
      where("userId", "==", userData.id || userData.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const portfolioArray = [];
      querySnapshot.forEach((doc) => {
        portfolioArray.push({ id: doc.id, ...doc.data() });
      });
      setDataPortafolio(portfolioArray);
      setLoading(false); // Apagamos el loading cuando hay datos
    }, (error) => {
      console.error("Error en Snapshot:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData]);

  const crearPortafolio = async () => {
    if (newTitle.trim() === '') return Alert.alert("Error", "El título es obligatorio");

    try {
      await addDoc(collection(db, "Portafolio"), {
        title: newTitle,
        color: selectedColor,
        userId: userData.id || userData.uid, // Usamos el mismo ID que en la consulta
        createdAt: serverTimestamp(),
        files: [] 
      });
      setModalVisible(false);
      setNewTitle('');
    } catch (error) {
      console.error("Error al crear:", error);
      Alert.alert("Error", "No se pudo crear el portafolio");
    }
  };

  const renderPortafolioItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => router.push({
        pathname: '/pages/Portafolio', 
        params: { id: item.id, title: item.title, color: item.color, ruta: '/pages/Navigation', screen:'Porfolio' },
        
      })}
      style={{
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        borderLeftWidth: 10,
        borderLeftColor: item.color || '#1877f2'
      }}
    >
      <View style={{
        backgroundColor: (item.color || '#1877f2') + '15',
        padding: 12,
        borderRadius: 12,
        marginRight: 15
      }}>
        <Ionicons name="folder" size={30} color={item.color || '#1877f2'} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>{item.title}</Text>
        <Text style={{ fontSize: 12, color: '#888' }}>
          {item.files?.length || 0} archivos guardados
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
        <StatusBar 
                          style="light" 
                       />
      <StatusBar_Fix />
      
      <View style={{ padding: 25, backgroundColor: '#fff' }}>
        
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#333', marginTop: 0, marginLeft:50 }}>Mis Colecciones</Text>
        <Text style={{ fontSize: 14, color: '#888',marginLeft:50  }}>Gestiona tus documentos por categorías</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#1877f2" />
        </View>
      ) : (
        <FlatList
          data={dataPortafolio}
          keyExtractor={(item) => item.id}
          renderItem={renderPortafolioItem}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 50 }}>
               <Ionicons name="folder-open-outline" size={80} color="#ddd" />
               <Text style={{ textAlign: 'center', color: '#999', fontSize: 16 }}>No hay colecciones creadas.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity 
        onPress={() => setModalVisible(true)}
        style={{
          position: 'absolute', bottom: 30, right: 25,
          width: 65, height: 65, borderRadius: 32.5,
          backgroundColor: '#1877f2', justifyContent: 'center', alignItems: 'center',
          elevation: 5
        }}
      >
        <Ionicons name="add" size={35} color="white" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>Nueva Colección</Text>
            
            <TextInput 
              placeholder="Ej: Documentos Legales"
              value={newTitle}
              onChangeText={setNewTitle}
              style={{ backgroundColor: '#f0f2f5', padding: 15, borderRadius: 15, fontSize: 16, marginBottom: 20 }}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 }}>
              {colores.map(color => (
                <TouchableOpacity 
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  style={{
                    width: 40, height: 40, borderRadius: 20, backgroundColor: color,
                    borderWidth: selectedColor === color ? 4 : 0, borderColor: '#ccc'
                  }}
                />
              ))}
            </View>

            <TouchableOpacity 
              onPress={crearPortafolio}
              style={{ backgroundColor: selectedColor, padding: 18, borderRadius: 15, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Crear Portafolio</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 15, alignItems: 'center' }}>
              <Text style={{ color: '#888' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}