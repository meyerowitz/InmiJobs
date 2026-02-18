import React from 'react';
import { View, Text, StyleSheet, Image, FlatList, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../Components/Temas_y_colores/ThemeContext';
import {useRouter} from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { userData , useUser} from '../Components/Data/DataProvider';
// Datos de ejemplo para los posts
const POSTS = [
  {
    id: '1',
    user: 'Reclutadora de Gemini AI',
    time: '2 h',
    avatar: 'https://randomuser.me/api/portraits/women/51.jpg',
    content: '¡Hola! Soy una reclutadora de Google , y estoy buscando talento nuevo en latinoamerica alguien se ofrece? 🚀 #CodingLife',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500',
    likes: 124,
    comments: 18,
  },
  {
    id: '2',
    user: 'React Native Dev Reclutador',
    time: '5 h',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    content: '¿Alguien me puede hacer una pagina web rapido y seguro?',
    image: null,
    likes: 45,
    comments: 32,
  },
];

export default function Jobs(){
  const { userData, logout } = useUser();

  if (!userData) return <Text>No hay sesión activa</Text>;
  const router = useRouter();
  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      {/* Cabecera del Post */}
      <View style={styles.postHeader}>
        <TouchableOpacity onPress={()=>{()=>{router.replace('/pages/feed')}}}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        </TouchableOpacity>
        <View>
          <Text style={styles.userName}>{item.user}</Text>
          <Text style={styles.postTime}>{item.time} • <Ionicons name="earth" size={12} /></Text>
        </View>
      </View>

      {/* Contenido del Post */}
      <Text style={styles.postContent}>{item.content}</Text>
      {item.image && <Image source={{ uri: item.image }} style={styles.postImage} />}

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>👍 {item.likes}</Text>
        <Text style={styles.statsText}>{item.comments} comentarios</Text>
      </View>

      {/* Botones de Acción */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="thumbs-up-outline" size={20} color="#65676b" />
          <Text style={styles.actionText}>Me gusta</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#65676b" />
          <Text style={styles.actionText}>Comentar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-social-outline" size={20} color="#65676b" />
          <Text style={styles.actionText}>Compartir</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-social-outline" size={20} color="#65676b" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>

            <StatusBar barStyle={'light-content'} backgroundColor={'#B85CFB'}/>
      {/* Header Superior */}
      <View style={{flexDirection: 'row',paddingHorizontal: 15,paddingTop: 18.5,paddingBottom: 10, elevation:20}}>
        <Text style={{fontSize: 28, fontWeight: 'bold', color: '#1877f2', letterSpacing: -1 , marginLeft:50, marginRight:10}}>InmiJobs</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={{backgroundColor: '#e4e6eb', padding: 12, borderRadius: 90, marginLeft: 10}}><Ionicons name="search" size={19} /></TouchableOpacity>
          <TouchableOpacity style={{backgroundColor: '#e4e6eb', padding: 12, borderRadius: 20, marginLeft: 10}}><Ionicons name="chatbubble-ellipses" size={19} /></TouchableOpacity>
          <TouchableOpacity onPress={()=>{router.replace('/pages/profile')}} style={{padding:3, backgroundColor:'white', borderRadius:90, elevation:10, marginLeft:10}}><Image source={{ uri: userData.image}} style={styles.avatar} /></TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={POSTS}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
     
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {flexDirection: 'row',paddingHorizontal: 15,paddingTop: 18.5,paddingBottom: 10,backgroundColor: '#ff0000',
  },
  logo: { fontSize: 28, fontWeight: 'bold', color: '#1877f2', letterSpacing: -1 , marginLeft:50},
  headerIcons: { flexDirection: 'row' },
  iconCircle: { backgroundColor: '#e4e6eb', padding: 8, borderRadius: 20, marginLeft: 10 },
  inputSection: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputFake: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginLeft: 10,
  },
  postContainer: { backgroundColor: '#fff', marginBottom: 10, paddingVertical: 12 },
  postHeader: { flexDirection: 'row', paddingHorizontal: 15, marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  userName: { fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
  postTime: { color: '#65676b', fontSize: 12, marginLeft: 10 },
  postContent: { paddingHorizontal: 15, marginBottom: 10, fontSize: 15, lineHeight: 20 },
  postImage: { width: '100%', height: 300 },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  statsText: { color: '#65676b', fontSize: 13 },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 5 },
  actionButton: { flexDirection: 'row', alignItems: 'center' },
  actionText: { marginLeft: 5, color: '#65676b', fontWeight: '600' },
});