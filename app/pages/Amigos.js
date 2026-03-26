import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TextInput, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import StatusBar_Fix from '../Components/StatusBar_fix'
import { userData, useUser } from '../Components/Data/DataProvider';
import {useRouter} from 'expo-router'
// Firebase imports
import { db } from '../../firebaseConfig'; 
import { 
  collection, query, where, onSnapshot, getDoc, doc, setDoc // <--- Agrega setDoc aquí
} from 'firebase/firestore';

export default function Amigos() {
  const { userData, logout } = useUser();
   const router = useRouter(); // Asegúrate de importar useRouter de expo-router
  const [search, setSearch] = useState('');
  const [amigos, setAmigos] = useState([]); // Ahora empieza vacío
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData) return;
    const myId = userData.id || userData.uid;

    // 1. Escuchar la tabla "Amistad" en tiempo real
    const q = query(
      collection(db, "Amistad"),
      where("user_id_seguidor", "==", myId)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        // Obtenemos los IDs de las personas a las que sigues
        const followedIds = snapshot.docs.map(d => d.data().user_id_seguido);
        
        // 2. Traer los datos de perfil de cada ID
        const profilePromises = followedIds.map(async (targetId) => {
          const userDoc = await getDoc(doc(db, "Usuarios", targetId));
          if (userDoc.exists()) {
            const data = userDoc.data();
            return {
              id: userDoc.id,
              name: data.name || 'Usuario',
              role: data.role || 'Miembro',
              status: data.status || 'Offline', // Opcional según tu lógica
              image: data.image || 'https://via.placeholder.com/150',
            };
          }
          return null;
        });

        const profiles = (await Promise.all(profilePromises)).filter(p => p !== null);
        
        // 3. Mezclar con datos locales (opcional) o solo usar los de Firebase
        setAmigos(profiles);
        setLoading(false);
      } catch (error) {
        console.error("Error cargando amigos:", error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [userData]);

  const filteredAmigos = amigos.filter(amigo => 
    amigo.name.toLowerCase().includes(search.toLowerCase())
  );

 

const abrirChat = async (amigo) => {
  const myId = userData.id || userData.uid;
  const targetId = amigo.id;

  // Generamos un ID único para el chat (siempre igual para los mismos dos usuarios)
  const chatId = myId < targetId ? `${myId}_${targetId}` : `${targetId}_${myId}`;
  
  const chatRef = doc(db, "Chats", chatId);
  const chatSnap = await getDoc(chatRef);

  if (!chatSnap.exists()) {
    // Si el chat no existe, lo creamos
    await setDoc(chatRef, {
      chatId: chatId,
      users: [myId, targetId],
      lastMessage: "",
      updatedAt: new Date(),
      // Guardamos nombres e imágenes para no tener que buscarlos cada vez en la lista de chats
      userNames: { [myId]: userData.name, [targetId]: amigo.name },
      userImages: { [myId]: userData.image, [targetId]: amigo.image }
    });
  }

  // Navegamos a la pantalla de chat pasando el ID
  router.push({
    pathname: '/pages/Chat', 
    params: { chatId, targetId }
  });
};

  const renderAmigo = ({ item }) => (
    <TouchableOpacity style={styles.friendCard}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.image }} style={styles.avatar} />
        {item.status === 'Online' && <View style={styles.onlineBadge} />}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.nameText}>{item.name}</Text>
        <Text style={styles.roleText}>{item.role}</Text>
      </View>

      <TouchableOpacity onPress={() => abrirChat(item)} style={styles.messageButton}>
        <Ionicons name="chatbubble-ellipses-outline" size={22} color="#000" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{flex:1}}>
    <View style={styles.container}>
      {/* HEADER CON BARRA DE NAVEGACIÓN/BÚSQUEDA */}
       <StatusBar barStyle={'light-content'} />
        <StatusBar_Fix></StatusBar_Fix>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Amigos</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#A0A0A0" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="Buscar amigos..."
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#A0A0A0"
          />
        </View>
      </View>

     {loading ? (
          <ActivityIndicator size="large" color="#1877F2" style={{marginTop: 50}} />
        ) : (
          <FlatList
            data={filteredAmigos}
            keyExtractor={(item) => item.id}
            renderItem={renderAmigo}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Aún no sigues a nadie.</Text>
            }
          />
        )}
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#000', marginBottom: 15 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F5',
    paddingHorizontal: 15,
    borderRadius: 15,
    height: 45,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  listContent: { padding: 20 },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  avatarContainer: { position: 'relative' },
  avatar: { width: 55, height: 55, borderRadius: 27.5 },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CD964',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  infoContainer: { flex: 1, marginLeft: 15 },
  nameText: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  roleText: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F3F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 }
});