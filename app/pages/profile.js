import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, Image, TouchableOpacity, 
  ImageBackground, Dimensions, FlatList, StatusBar, Keyboard 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from '../Components/Data/DataProvider';
import { db } from '../../firebaseConfig'; 
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

const { width } = Dimensions.get('window');

export default function Profile() {
  const router = useRouter();
  const { userData } = useUser();
  const [myPosts, setMyPosts] = useState([]);
  const [expandedPostId, setExpandedPostId] = useState(null);

  if (!userData) return <Text>No hay sesión activa</Text>;

  // 1. Cargar solo MIS publicaciones de Firebase
  useEffect(() => {
    const q = query(
      collection(db, "Post"),
      where("userId", "==", userData.id || userData.uid), // Filtro: solo mis posts
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsArray = [];
      querySnapshot.forEach((doc) => {
        postsArray.push({ id: doc.id, ...doc.data() });
      });
      setMyPosts(postsArray);
    });

    return () => unsubscribe();
  }, [userData]);

  const toggleComments = (postId) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  // 2. Render de cada Post (usando tu lógica de Community)
  const renderMyPost = ({ item }) => {
    const isExpanded = expandedPostId === item.id;
    return (
      <View style={styles.postContainer}>
        <View style={styles.postHeader}>
          <Image source={{ uri: item.userImage }} style={styles.avatarSmall} />
          <View>
            <Text style={styles.postAuthor}>{item.userName}</Text>
            <Text style={styles.postDate}>
              {item.createdAt?.toDate().toLocaleDateString() || 'Reciente'} · 🌎
            </Text>
          </View>
        </View>
        <Text style={styles.postContent}>{item.description}</Text>
        
        {/* Botones de Acción */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="thumbs-up-outline" size={20} color="#65676b" />
            <Text style={styles.actionText}>{item.likesCount || 'Me gusta'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => toggleComments(item.id)}>
            <Ionicons name="chatbubble-outline" size={20} color="#65676b" />
            <Text style={styles.actionText}>Comentar</Text>
          </TouchableOpacity>
        </View>

        {isExpanded && (
          <View style={styles.commentsSection}>
            <Text style={{color: '#65676b', fontSize: 13}}>No hay comentarios aún.</Text>
          </View>
        )}
      </View>
    );
  };

  // 3. Componente de Cabecera (Todo tu diseño anterior)
  const ProfileHeader = () => (
    <View>
      <ImageBackground 
        source={{ uri: 'https://picsum.photos/id/122/800/400' }} 
        style={styles.coverImage}
      >
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.replace('/pages/Navigation')}
        >
          <Ionicons name="chevron-back" size={30} color={'#fff'} />
        </TouchableOpacity>

        <View style={styles.avatarWrapper}>
          <Image source={{ uri: userData.image }} style={styles.profileAvatar} />
          <TouchableOpacity style={styles.cameraIcon}>
            <Ionicons name="camera" size={18} color="#000" />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <View style={styles.mainInfo}>
        <Text style={styles.userName}>{userData.name} <Ionicons name="chevron-down" size={18} /></Text>
        <Text style={styles.statsSummary}>{myPosts.length} publicaciones · 7 amigos</Text>
        <TouchableOpacity>
        <Text style={styles.bioText}>
          UI/UX Designer & Frontend Developer 💻 ✨{"\n"}
          Especialista en Figma... <TouchableOpacity><Text style={styles.seeMore}>Ver más</Text></TouchableOpacity>
        </Text>
        </TouchableOpacity>

        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.blueButton}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.blueButtonText}>Agregar Publicación</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.grayButton}>
            <Ionicons name="pencil" size={18} color="#000" />
            <Text style={styles.grayButtonText}>Editar perfil</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />
      <Text style={[styles.sectionTitle, {marginLeft: 20, marginBottom: 10}]}>Tus publicaciones</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={'light-content'} backgroundColor={'#B85CFB'}/>
      <FlatList
        data={myPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderMyPost}
        ListHeaderComponent={ProfileHeader}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20}}>No has publicado nada todavía.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  coverImage: { width: '100%', height: 180, justifyContent: 'flex-end' },
  backButton: { position: 'absolute', top: 20, left: 10, zIndex: 10 },
  avatarWrapper: { marginBottom: -50, marginLeft: 20, width: 120, height: 120 },
  profileAvatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#fff' },
  cameraIcon: { position: 'absolute', bottom: 5, right: 5, backgroundColor: '#E4E6EB', padding: 8, borderRadius: 20 },
  mainInfo: { marginTop: 60, paddingHorizontal: 20 },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  statsSummary: { color: '#65676B', fontSize: 16, marginVertical: 5 },
  bioText: { fontSize: 15, color: '#050505', lineHeight: 20 },
  seeMore: { color: '#65676B', fontWeight: 'bold' },
  actionButtonsRow: { flexDirection: 'row', marginTop: 15, justifyContent: 'space-between' },
  blueButton: { backgroundColor: '#1877F2', flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8, width: '58%', justifyContent: 'center' },
  blueButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 5 },
  grayButton: { backgroundColor: '#E4E6EB', flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8, width: '38%', justifyContent: 'center' },
  grayButtonText: { color: '#000', fontWeight: 'bold', marginLeft: 5 },
  divider: { height: 6, backgroundColor: '#F0F2F5', marginVertical: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  // Estilos de Posts
  postContainer: { backgroundColor: '#fff', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f2f5' },
  postHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
  avatarSmall: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  postAuthor: { fontWeight: 'bold', fontSize: 16 },
  postDate: { color: '#65676B', fontSize: 12 },
  postContent: { paddingHorizontal: 20, fontSize: 15, marginBottom: 10 },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#f0f2f5' },
  actionButton: { flexDirection: 'row', alignItems: 'center' },
  actionText: { marginLeft: 5, color: '#65676b', fontWeight: '600' },
  commentsSection: { padding: 15, backgroundColor: '#f9f9f9', marginHorizontal: 20, borderRadius: 10 }
});