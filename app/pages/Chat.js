import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TextInput, 
  TouchableOpacity, KeyboardAvoidingView, Platform, Image 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../firebaseConfig';
import { useUser } from '../Components/Data/DataProvider';
import { 
  collection, query, orderBy, onSnapshot, addDoc, 
  serverTimestamp, doc, updateDoc, getDoc, setDoc 
} from 'firebase/firestore';
import StatusBar_Fix from '../Components/StatusBar_fix'
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from 'expo-status-bar';

export default function Chat() {
  const { chatId, targetId } = useLocalSearchParams();
  const { userData } = useUser();
  const router = useRouter();
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [targetUser, setTargetUser] = useState(null);

  const myId = userData?.id || userData?.uid;

  // 1. Cargar info del usuario con el que hablamos
  useEffect(() => {
    const fetchTarget = async () => {
      const docRef = doc(db, "Usuarios", targetId);
      const snap = await getDoc(docRef);
      if (snap.exists()) setTargetUser(snap.data());
    };
    fetchTarget();
  }, [targetId]);

  // 2. Escuchar mensajes dentro de la colección "Chats/[chatId]/Mensajes_Directos" 
  // O en la raíz si prefieres, pero aquí los filtramos por el chatId actual
  useEffect(() => {
    const q = query(
      collection(db, "Chat", chatId, "Mensajes_Historial"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    const isUser1 = myId < targetId;
    const messageData = {
      text: inputText,
      senderId: myId,
      createdAt: serverTimestamp(),
      [isUser1 ? "media_msg_user1" : "media_msg_user2"]: inputText,
    };

    try {
      // 1. Añadimos el mensaje a la subcolección de historial
      // Usamos "Chat" en singular como indicaste
      await addDoc(collection(db, "Chat", chatId, "Mensajes_Historial"), messageData);

      // 2. Usamos SET con MERGE en lugar de UPDATE
      // Esto crea el documento si no existe o lo actualiza si ya existe
      const chatRef = doc(db, "Chat", chatId);
      await setDoc(chatRef, {
        lastMessage: inputText,
        updatedAt: serverTimestamp(),
        lastSender: myId,
        users: [myId, targetId], // Aseguramos que los IDs estén para que aparezca en ChatsList
        userNames: {
          [myId]: userData?.name || "Usuario",
          [targetId]: targetUser?.Name || targetUser?.name || "Amigo"
        },
        userImages: {
          [myId]: userData?.image || "",
          [targetId]: targetUser?.image || ""
        }
      }, { merge: true }); // <--- CLAVE: Crea el doc si falta

      setInputText('');
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    }
  };

  return (
    <SafeAreaView style={{flex:1, backgroundColor: '#fff'}}>
        <StatusBar style="light" />
      <StatusBar_Fix />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        
        {/* Header con estilo similar a tus referencias */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={28} color="#615ef0" />
          </TouchableOpacity>
          {/* ENVOLVEMOS LA IMAGEN Y EL NOMBRE PARA IR AL PERFIL */}
  <TouchableOpacity 
    style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
    onPress={() => router.push({
      pathname: '/pages/feed', // Asegúrate de que esta sea la ruta correcta en tu app
      params: { profileId: targetId }     // Pasamos el ID del usuario
    })}
  >
          <Image source={{ uri: targetUser?.image }} style={styles.headerAvatar} />
          
          <View style={{ flex: 1 }}>
            <Text style={styles.headerName}>{targetUser?.Name || targetUser?.name || "Cargando..."}</Text>
            <Text style={styles.headerStatus}>En línea</Text>
          </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="call-outline" size={22} color="#615ef0" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 15, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={[
              styles.bubble, 
              item.senderId === myId ? styles.myBubble : styles.theirBubble
            ]}>
              <Text style={[
                styles.messageText, 
                item.senderId === myId ? styles.myText : styles.theirText
              ]}>
                {/* Mostramos el texto independientemente de en qué campo se guardó */}
                {item.text}
              </Text>
            </View>
          )}
        />

        {/* Input de Mensaje estilo moderno */}
        <View style={styles.inputArea}>
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="add" size={24} color="#666" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Escribe algo..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, { backgroundColor: inputText.trim() ? '#615ef0' : '#E4E6EB' }]} 
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F9' },
  header: { 
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn: { marginRight: 5 },
  headerAvatar: { width: 45, height: 45, borderRadius: 22.5, marginRight: 12 },
  headerName: { fontWeight: 'bold', fontSize: 17, color: '#1A1A1A' },
  headerStatus: { fontSize: 13, color: '#4CD964', fontWeight: '500' },
  headerIcon: { padding: 8 },
  
  bubble: { maxWidth: '75%', padding: 14, borderRadius: 24, marginBottom: 12 },
  myBubble: { 
    alignSelf: 'flex-end', 
    backgroundColor: '#615ef0', 
    borderBottomRightRadius: 4,
    elevation: 2,
    shadowColor: '#615ef0',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  theirBubble: { 
    alignSelf: 'flex-start', 
    backgroundColor: '#fff', 
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  messageText: { fontSize: 15, lineHeight: 20 },
  myText: { color: '#fff' },
  theirText: { color: '#333' },

  inputArea: { 
    flexDirection: 'row', 
    padding: 12, 
    backgroundColor: '#fff', 
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0'
  },
  attachBtn: { marginRight: 10 },
  input: { 
    flex: 1, 
    backgroundColor: '#F1F3F5', 
    borderRadius: 25, 
    paddingHorizontal: 18, 
    paddingVertical: 10, 
    marginRight: 10,
    maxHeight: 100,
    fontSize: 15
  },
  sendBtn: { 
    width: 42, 
    height: 42, 
    borderRadius: 21, 
    justifyContent: 'center', 
    alignItems: 'center' 
  }
});