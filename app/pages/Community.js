import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TextInput, TouchableOpacity , StatusBar, Keyboard,Modal} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../Components/Temas_y_colores/ThemeContext';
import {useRouter} from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { userData, useUser } from '../Components/Data/DataProvider';
import NewPost from '../Components/Modales/newPost'
import { db } from '../../firebaseConfig'; 
import { collection, query, where, onSnapshot, orderBy, doc, deleteDoc,updateDoc, increment,arrayUnion, arrayRemov } from 'firebase/firestore';

// Datos de ejemplo para los posts
const POSTS = [
  {
    id: '1',
    user: 'Gemini AI',
    time: '2 h',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    content: '¡Hola! Estoy construyendo mi primera app con React Native y Expo. 🚀 #CodingLife',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500',
    likes: 124,
    comments: 18,
    commentsData: [
      { id: 'c1', user: 'Ana', text: '¡Qué buen proyecto!' },
      { id: 'c2', user: 'Carlos', text: 'React Native es lo mejor.' },
    ],
  },
  {
    id: '2',
    user: 'React Native Dev',
    time: '5 h',
    avatar: 'https://randomuser.me/api/portraits/women/66.jpg',
    content: '¿Alguien sabe cómo mejorar el rendimiento de las FlatLists?',
    image: null,
    likes: 45,
    comments: 32,
    commentsData: [
      { id: 'c1', user: 'Ana', text: '¡Qué buen proyecto!' },
      { id: 'c2', user: 'Carlos', text: 'React Native es lo mejor.' },
    ],
  },
];

export default function Community() {
   const router = useRouter();
   const { userData, logout } = useUser();
   const [newPostModal, setnewPostModal] = useState(false);
   const [posts, setPosts] = useState([]); // Nuevo estado para los posts de Firebase

    const [expandedPostId, setExpandedPostId] = useState(null);

    const [menuVisible, setMenuVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

const openMenu = (event, post) => {
  // Obtenemos la posición del clic en la pantalla
  const { pageY, pageX } = event.nativeEvent;
  
  setSelectedPost(post);
  // Ajustamos la posición para que el menú salga un poco abajo y a la izquierda del dedo
  setMenuPosition({ top: pageY + 10, right: 20 }); 
  setMenuVisible(true);
};
    const toggleComments = (postId) => {
  if (expandedPostId === postId) {
    setExpandedPostId(null); // Si ya estaba abierto, lo cerramos
  } else {
    setExpandedPostId(postId); // Si no, abrimos los de este post
  }
};
const handleDeletePost = async () => {
  if (!selectedPost) return;

  try {
    // Referencia al documento específico en la colección "Post"
    const postRef = doc(db, "Post", selectedPost.id);
    await deleteDoc(postRef);
    
    // Cerramos el menú
    setMenuVisible(false);
    setSelectedPost(null);
    console.log("Post eliminado con éxito");
  } catch (error) {
    console.error("Error al eliminar el post: ", error);
    alert("No se pudo eliminar la publicación.");
  }
};
const handleLike = async (postId, likedByArray = []) => {
  if (!userData) return;
  
  // El ID del usuario actual (tú)
  const myId = userData.id || userData.uid;
  const postRef = doc(db, "Post", postId);

  // ¿Ya le di like?
  const hasLiked = likedByArray.includes(myId);

  try {
    if (hasLiked) {
      // Si ya tiene mi like, lo quito
      await updateDoc(postRef, {
        likedBy: arrayRemove(myId),
        likesCount: increment(-1) // Bajamos el contador
      });
    } else {
      // Si no tiene mi like, lo pongo
      await updateDoc(postRef, {
        likedBy: arrayUnion(myId),
        likesCount: increment(1) // Subimos el contador
      });
    }
  } catch (error) {
    console.error("Error en el Like:", error);
  }
};
  if (!userData) return <Text>No hay sesión activa</Text>;

  const renderPost = ({ item }) => {
    const isExpanded = expandedPostId === item.id;
    return(
    <View style={styles.postContainer}>
      {/* Cabecera del Post */}
      <View style={styles.postHeader}>
        <TouchableOpacity onPress={()=>{router.replace('/pages/feed')}}>
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


      {/* Botones de Acción */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="thumbs-up-outline" size={20} color="#65676b" />
          <Text style={styles.actionText}>{ item.likes ? item.likes : 'Me gusta'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => toggleComments(item.id)}>
          <Ionicons name="chatbubble-outline" size={20} color="#65676b" />
          <Text style={styles.actionText}>Comentar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-social-outline" size={20} color="#65676b" />
          <Text style={styles.actionText}>Compartir</Text>
        </TouchableOpacity>
      </View>
      {/* SECCIÓN DESPLEGABLE DE COMENTARIOS */}
      {isExpanded && (
        <View style={styles.commentsSection}>
          {/* Ejemplo de lista de comentarios (puedes usar un .map aquí) */}
          <View style={styles.commentItem}>
            <Image source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} style={styles.commentAvatar} />
            <View style={styles.commentBubble}>
              <Text style={styles.commentUser}>Juan Pérez</Text>
              <Text style={styles.commentText}>¡Excelente post! Me sirvió mucho.</Text>
            </View>
          </View>
          
          <View style={styles.commentItem}>
            <Image source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }} style={styles.commentAvatar} />
            <View style={styles.commentBubble}>
              <Text style={styles.commentUser}>Maria dev</Text>
              <Text style={styles.commentText}>¿Usaste Expo SDK 50?</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )};
const renderPost2 = ({ item }) => {
  const isExpanded = expandedPostId === item.id; 
  const isMyPost = item.userId === (userData?.id || userData?.uid);
  
  return (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <Image source={{ uri: item.userImage }} style={styles.avatar} />
        <View>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.postTime}>
            {item.createdAt?.toDate().toLocaleDateString() || 'Reciente'} • <Ionicons name="earth" size={12} />
          </Text>
        </View>
         {isMyPost && (
          <TouchableOpacity onPress={(event) => openMenu(event, item)} style={{ padding: 5,marginLeft:'50%' }}>
              <Ionicons name="ellipsis-vertical" size={22} color="#65676b" />
          </TouchableOpacity>
          )}
      </View>

      <Text style={styles.postContent}>{item.description}</Text>

      {/* --- NUEVA SECCIÓN DE IMAGEN --- */}
      {/* Verificamos si item.media existe y tiene al menos una URL */}
      {item.media && item.media.length > 0 && item.media[0] ? (
        <Image 
          source={{ uri: item.media[0] }} 
          style={styles.postImage} 
          resizeMode="cover"
        />
      ) : null}
      {/* ------------------------------- */}

      <View style={styles.actionButtons}>
        <TouchableOpacity 
  style={styles.actionButton} 
  onPress={() => handleLike(item.id, item.likedBy)}
>
  <Ionicons 
    name={item.likesCount > 0 ? "thumbs-up" : "thumbs-up-outline"} 
    size={20} 
    color={item.likesCount > 0 ? "#1877f2" : "#65676b"} 
  />
  <Text style={[
    styles.actionText, 
    { color: item.likesCount > 0 ? "#1877f2" : "#65676b" }
  ]}>
    {item.likesCount > 0 ? item.likesCount : 'Me gusta'}
  </Text>
</TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => toggleComments(item.id)}>
          <Ionicons name="chatbubble-outline" size={20} color="#65676b" />
          <Text style={styles.actionText}>
            {item.commentsCount > 0 ? item.commentsCount : 'Comentar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-social-outline" size={20} color="#65676b" />
          <Text style={styles.actionText}>Compartir</Text>
        </TouchableOpacity>
      </View>
     
      {isExpanded && (
        <View style={styles.commentsSection}>
          {item.commentsData && item.commentsData.length > 0 ? (
            item.commentsData.map((comment, index) => (
              <View key={index} style={styles.commentItem}>
                <View style={styles.commentBubble}>
                  <Text style={styles.commentUser}>{comment.user}</Text>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={{padding: 10, color: '#65676b'}}>No hay comentarios aún.</Text>
          )}
        </View>
      )}
{/* Submenú Desplegable */}
<Modal
  visible={menuVisible}
  transparent={true}
  animationType="fade"
  onRequestClose={() => setMenuVisible(false)}
>
  {/* Este Touchable ocupa toda la pantalla para que al tocar fuera se cierre */}
  <TouchableOpacity 
    style={styles.invisibleOverlay} 
    activeOpacity={1} 
    onPress={() => setMenuVisible(false)}
  >
    <View style={[styles.subMenu, { top: menuPosition.top, right: menuPosition.right }]}>
      <TouchableOpacity 
        style={styles.subMenuOption} 
        onPress={() => { /* Tu lógica de editar */ setMenuVisible(false); }}
      >
        <Ionicons name="pencil-outline" size={18} color="#1c1e21" />
        <Text style={styles.subMenuText}>Editar</Text>
      </TouchableOpacity>

      <View style={styles.subMenuDivider} />

      <TouchableOpacity 
        style={styles.subMenuOption} 
        onPress={handleDeletePost}
      >
        <Ionicons name="trash-outline" size={18} color="#e11d48" />
        <Text style={[styles.subMenuText, { color: '#e11d48' }]}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
</Modal>
    </View>
  );
};
  useEffect(() => {
    if (!userData) return;

    // 1. Creamos la consulta (Query)
    // Filtramos donde userId != al usuario actual
    const q = query(
  collection(db, "Post"),
 
  
  orderBy("createdAt", "desc")
);

    // 2. Escuchamos en tiempo real
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsArray = [];
      querySnapshot.forEach((doc) => {
        postsArray.push({ id: doc.id, ...doc.data() });
      });
      setPosts(postsArray);
    }, (error) => {
      console.error("Error al obtener posts: ", error);
    });

    // 3. Limpiamos la escucha al salir de la pantalla
    return () => unsubscribe();
  }, [userData]);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
      <StatusBar barStyle={'light-content'} backgroundColor={'#B85CFB'}/>
       {/* Header Superior */}
         <View style={{flexDirection: 'row',paddingHorizontal: 15,paddingTop: 18.5,paddingBottom: 10,elevation:20}}>
           <Text style={{fontSize: 28, fontWeight: 'bold', color: '#1877f2', letterSpacing: -1 , marginLeft:50, marginRight:10}}>InmiJobs</Text>
           <View style={{ flexDirection: 'row' }}>
             <TouchableOpacity style={{backgroundColor: '#e4e6eb', padding: 12, borderRadius: 90, marginLeft: 10}}><Ionicons name="search" size={19} /></TouchableOpacity>
             <TouchableOpacity style={{backgroundColor: '#e4e6eb', padding: 12, borderRadius: 20, marginLeft: 10}}><Ionicons name="chatbubble-ellipses" size={19} /></TouchableOpacity>
             <TouchableOpacity onPress={()=>{router.replace('/pages/profile')}} style={{padding:3, backgroundColor:'white', borderRadius:90, elevation:10, marginLeft:10}}><Image source={{ uri: userData.image}} style={styles.avatar} /></TouchableOpacity>
           </View>
         </View>
     <FlatList
  data={[...posts, ...POSTS]} // Une los datos de Firebase con los estáticos
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    // Si tiene 'description' viene de Firebase, si no, es del array POSTS
    item.description ? renderPost2({ item }) : renderPost({ item })
  )}
         ListHeaderComponent={() => (
          /* Sección "¿Qué estás pensando?" */
          <View style={styles.inputSection}>
             <View style={{padding:4, backgroundColor:'white', borderRadius:90, elevation:5}}><Image source={{ uri: userData.image }} style={styles.avatar} /></View>
          
            <TextInput style={styles.inputFake} placeholder='¿En que estas pensando?' placeholderTextColor={'#65676b'} onFocus={() => {
    setnewPostModal(true);
    Keyboard.dismiss(); 
  }}>
              
            </TextInput>
          </View>
        )}
      
/>

    
      <NewPost visible={newPostModal} onClose={() =>{ setnewPostModal(false)}} ></NewPost>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  logo: { fontSize: 28, fontWeight: 'bold', color: '#1877f2', letterSpacing: -1 },
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
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)', // Fondo oscuro traslúcido
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  menuOptionText: {
    fontSize: 16,
    marginLeft: 15,
    fontWeight: '500',
    color: '#1c1e21',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: 10,
  },
  invisibleOverlay: {
    flex: 1,
    backgroundColor: 'transparent', // Sin fondo oscuro para que parezca un submenú real
  },
  subMenu: {
    position: 'absolute',
    width: 150,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 5,
    // Sombra para que resalte sobre el post
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
    marginTop:-19
  },
  subMenuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    
  },
  subMenuText: {
    fontSize: 15,
    marginLeft: 10,
    fontWeight: '500',
    color: '#1c1e21',
  },
  subMenuDivider: {
    height: 1,
    backgroundColor: '#f0f2f5',
    marginHorizontal: 10,
  },
});
