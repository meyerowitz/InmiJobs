import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context"; // Importado
import StatusBar_Fix from '../Components/StatusBar_fix'; // Importado
import { db } from '../../firebaseConfig';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useUser } from '../Components/Data/DataProvider';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function ChatsList() {
  const { userData } = useUser();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const myId = userData?.id || userData?.uid;

  useEffect(() => {
    if (!myId) return;

    // Asegúrate de que la colección se llame "Chats" (en plural) como en tu lógica de creación
    const q = query(
      collection(db, "Chat"), 
      where("users", "array-contains", myId),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatData = snapshot.docs.map(doc => {
        const data = doc.data();
        const targetId = data.users.find(id => id !== myId);
        
        return {
          id: doc.id,
          targetId,
          name: data.userNames ? data.userNames[targetId] : 'Usuario', 
          image: data.userImages ? data.userImages[targetId] : 'https://via.placeholder.com/150',
          updatedAt: data.updatedAt?.toDate(),
          lastMessage: data.lastMessage || "",
          ...data
        };
      });
      setChats(chatData);
      setLoading(false);
    }, (error) => {
      console.error("Error en el listener de chats: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [myId]);

  const renderChatItem = ({ item }) =>{ 
    const formatTime = (date) => {
      if (!date || typeof date.toLocaleTimeString !== 'function') {
        return "Reciente"; // Texto temporal mientras Firebase calcula la fecha
      }
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    return(
    
    <TouchableOpacity 
      style={styles.chatCard}
      onPress={() => router.push({
        pathname: '/pages/Chat', 
        params: { chatId: item.id, targetId: item.targetId }
      })}
    >
      <Image source={{ uri: item.image }} style={styles.avatar} />
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.nameText}>{item.name}</Text>
          <Text style={styles.timeText}>
          {formatTime(item.updatedAt)}
          </Text>
        </View>
        <Text style={styles.lastMsgText} numberOfLines={1}>
          {item.lastMessage || "Enviar un mensaje..."}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#ccc" />
    </TouchableOpacity>
  )};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar style="light" />
      <StatusBar_Fix />
      
      <View style={styles.container}>
        <View style={styles.screenHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Mensajes</Text>
        </View>
        
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#615ef0" />
          </View>
        ) : (
          <FlatList
            data={chats}
            keyExtractor={(item) => item.id}
            renderItem={renderChatItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No tienes conversaciones activas todavía.</Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  screenHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  backButton: { padding: 5 },
  screenTitle: { fontSize: 22, fontWeight: 'bold', marginLeft: 15 },
  chatCard: { 
    flexDirection: 'row', 
    padding: 15, 
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9'
  },
  avatar: { width: 55, height: 55, borderRadius: 27.5 },
  chatInfo: { flex: 1, marginLeft: 15 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  nameText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  timeText: { fontSize: 12, color: '#999' },
  lastMsgText: { color: '#666', marginTop: 4, fontSize: 14 },
  emptyText: { textAlign: 'center', marginTop: 100, color: '#999', fontSize: 16 }
});