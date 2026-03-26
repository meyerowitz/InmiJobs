import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, Image, TouchableOpacity, 
  ImageBackground, Dimensions, FlatList, ScrollView, ActivityIndicator, Share, Modal,TextInput, Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from '../Components/Data/DataProvider';
import { db } from '../../firebaseConfig'; 
import { 
  collection, query, where, onSnapshot, orderBy, doc, getDoc, 
  updateDoc, arrayUnion, arrayRemove, addDoc, deleteDoc, getDocs, limit 
} from 'firebase/firestore';
import StatusBar_Fix from '../Components/StatusBar_fix';
import { StatusBar } from 'expo-status-bar';
import Icon from '../Components/Header/ProfileIcon';

const { width } = Dimensions.get('window');

// --- SUB-COMPONENTE PARA EL HEADER DEL POST ---
const PostUserInfo = ({ authorData, empresaData, createdAt, type, isMyPost, openMenu, item }) => {
  const router = useRouter();

  const goToUserProfile = () => {
    router.push({ pathname: '/UserProfileFeed', params: { profileId: item.userId } });
  };

  return (
    <View style={styles.userInfoContainer}>
      <View style={{ position: 'relative', width: 45, height: 45 }}>
        <Icon uri={authorData?.image} onPress={goToUserProfile} />
        {empresaData?.img && (
          <View style={styles.empresaBadge}>
            <Image source={{ uri: empresaData.img }} style={styles.empresaIconSmall} />
          </View>
        )}
      </View>

      <View style={{ marginLeft: 10, flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
          <Text style={styles.postAuthorName}>{authorData?.Name || 'Usuario'}</Text>
          {empresaData?.name && (
            <Text style={styles.empresaNameText}> • {empresaData.name}</Text>
          )}
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {type === 'jobs' && (
            <View style={styles.recruiterBadge}>
              <Text style={styles.recruiterText}>RECLUTADOR</Text>
            </View>
          )}
          <Text style={styles.postDateText}>
            {createdAt?.toDate().toLocaleDateString() || 'Reciente'} • <Ionicons name="earth" size={12} />
          </Text>
        </View>
      </View>

      {isMyPost && (
        <TouchableOpacity onPress={(e) => openMenu && openMenu(e, item)} style={{ padding: 5 }}>
          <Ionicons name="ellipsis-vertical" size={20} color="#65676b" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function UserProfileFeed() {
  const { userData: myUserData } = useUser();
  const router = useRouter();
  const { profileId } = useLocalSearchParams(); // Recibimos el ID del usuario a ver
  const { userData } = useUser(); // Mi usuario (para la lógica de seguir)
  const [targetUser, setTargetUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userPortfolio, setUserPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [menuType, setMenuType] = useState('options'); // 'options' o 'portfolio'
  const [isConnected, setIsConnected] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [empresaData, setEmpresaData] = useState(null);

useEffect(() => {
  if (!profileId) return;

  // 1. FUNCIÓN PARA CARGAR PERFIL Y EMPRESA (Solo una vez)
  const fetchProfileAndCompany = async () => {
    try {
      const docRef = doc(db, "Usuarios", profileId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Guardamos el usuario objetivo
        setTargetUser({ id: docSnap.id, ...data });

        // Lógica de Seguimiento: ¿Yo sigo a este usuario?
        const myId = myUserData?.id || myUserData?.uid;
        if (data.followers?.includes(myId)) {
          setIsFollowing(true);
        } else {
          setIsFollowing(false);
        }

        // --- BÚSQUEDA DE EMPRESA (UNA SOLA VEZ) ---
        if (data.empresa && data.empresa !== 'independiente') {
          const empRef = doc(db, "Empresas", data.empresa);
          const empSnap = await getDoc(empRef);
          
          if (empSnap.exists()) {
            setEmpresaData({
              name: empSnap.data().Name,
              img: empSnap.data().img
            });
          }
        } else {
          setEmpresaData(null); // Es independiente
        }
      }
    } catch (error) {
      console.error("Error al cargar perfil/empresa:", error);
    } finally {
      setLoading(false);
    }
  };

  // Ejecutamos la carga inicial
  fetchProfileAndCompany();

  // 2. LISTENER DE PUBLICACIONES (Tiempo real)
  const qPosts = query(
    collection(db, "Post"), 
    where("userId", "==", profileId), 
    orderBy("createdAt", "desc")
  );
  
  const unsubPosts = onSnapshot(qPosts, (snap) => {
    setUserPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });

  // 3. LISTENER DE PORTAFOLIO (Tiempo real)
  const qPort = query(
    collection(db, "Portafolio"), 
    where("userId", "==", profileId), 
    orderBy("createdAt", "desc")
  );

  const unsubPort = onSnapshot(qPort, (snap) => {
    setUserPortfolio(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });

  // LIMPIEZA DE LISTENERS
  return () => {
    unsubPosts();
    unsubPort();
  };

}, [profileId, myUserData]);



   const handleFollow = async () => {
    if (!userData || !targetUser) return;
    const myId = userData.id || userData.uid;
    const targetId = targetUser.id;
    const userRef = doc(db, "Usuarios", targetId);
    try {
      if (isFollowing) {
        await updateDoc(userRef, { followers: arrayRemove(myId) });
        // Lógica de Amistad omitida por brevedad, pero se mantiene igual a tu código
        setIsFollowing(false);
      } else {
        await updateDoc(userRef, { followers: arrayUnion(myId) });
        setIsFollowing(true);
      }
    } catch (e) { console.error(e); }
  };

 //----1) function Abrir comentarios----------------
     const toggleComments = (postId) => {
         if (expandedPostId === postId) {
           setExpandedPostId(null); // Si ya estaba abierto, lo cerramos
         } else {
           setExpandedPostId(postId); // Si no, abrimos los de este post
       }
     };
 
 //---2) function Agregar comentario------------
     const handleAddComment = async (postId) => {
         if (!commentText.trim()) return;
 
           try {
             const postRef = doc(db, "Post", postId);
               await updateDoc(postRef, {
                 commentsCount: increment(1),
                 commentsData: arrayUnion({
                   user: userData.name,
                   userImage: userData.image, // Importante para el diseño circular
                   text: commentText,
                   createdAt: new Date().toISOString(),
                 })
               });
               setCommentText('');
               Keyboard.dismiss();
           } catch (error) {
             console.error("Error al comentar:", error);
         }
     };
 
 //---function Compartir publicacion-----------
     const onShare = async (post) => {
       try {
         const result = await Share.share({
         message: `${post.userName} publicó en InmiJobs: \n\n"${post.description}"\n\n¡Mira esta oferta y más en la app!`,
         // Si tienes un link de la app o web puedes ponerlo aquí:
         // url: 'https://tuapp.com/post/' + post.id 
         });
 
       if (result.action === Share.sharedAction) {
       if (result.activityType) {
         // compartido con éxito en un tipo de actividad específica
       } else {
         // compartido con éxito
       }
       } else if (result.action === Share.dismissedAction) {
       // cancelado
       }
       } catch (error) {
         alert("No se pudo compartir el contenido.");
       }
     };
 
 //---3) function Borrar Post----------
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
 
 //---4) function Dejar Me gusta-------- 
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
             likedBy: arrayRemov(myId),
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

     const handleStartChat = async () => {
  if (!userData || !targetUser) return;

  const myId = userData.id || userData.uid;
  const otherId = targetUser.id;

  // Creamos un ID único para el chat basado en ambos usuarios
  // Esto evita que se creen chats duplicados entre las mismas dos personas
  const combinedId = myId < otherId ? `${myId}_${otherId}` : `${otherId}_${myId}`;

  try {
    const chatRef = doc(db, "Chat", combinedId);
    const chatSnap = await getDoc(chatRef);

    // Si el chat no existe, lo creamos
    if (!chatSnap.exists()) {
      await setDoc(chatRef, {
        users: [myId, otherId],
        lastMessage: "",
        updatedAt: new Date(),
        // Guardamos los nombres para mostrarlos en la lista de chats fácilmente
        participants: {
          [myId]: { name: userData.name, image: userData.image },
          [otherId]: { name: targetUser.Name, image: targetUser.image }
        }
      });
    }

    // Navegamos a la pantalla de Chat con los parámetros que pediste
    router.push({
      pathname: '/pages/Chat',
      params: { 
        chatId: combinedId, 
        targetId: otherId 
      }
    });

  } catch (error) {
    console.error("Error al iniciar el chat:", error);
    alert("No se pudo abrir el chat en este momento.");
  }
};
 
  const renderItem = ({ item }) => {
      const isExpanded = expandedPostId === item.id; 
      const isMyPost = String(item.userId).trim() === String(userData?.id || userData?.uid).trim();
      const isReclutador = item.type === 'jobs' || userData.role === 'reclutador';
      const IamCivil = userData.role === 'civil'
  
        const openMenu = (event, post, type = 'options') => {
          const { pageY, pageX } = event.nativeEvent; 
          setSelectedPost(post);
          setMenuPosition({ top: pageY + 10, right: 20 }); 
          setMenuType(type);
          setSelectedPost(item); // Asumo que guardas el item seleccionado
          setMenuVisible(true);
          setMenuVisible(true);
        };
  
        const goToUserProfile = () => {
          if (!isMyPost) {
            router.push({
              pathname: '/pages/feed', // Asegúrate de que este sea el nombre de tu archivo/ruta
              params: { 
                profileId: item.userId,
                profileName: item.userName,
                profileImage: item.userImage 
              }
            });
          }
        };
  
        return (
      <View style={styles.postContainer}>
        {/* Header Dinámico buscando en Usuarios y Empresas */}
            <PostUserInfo 
        authorData={targetUser}   // <--- Datos del perfil cargados arriba
        empresaData={empresaData} // <--- Datos de la empresa cargados arriba
        createdAt={item.createdAt}
        type={item.type}
        isMyPost={isMyPost}
        openMenu={openMenu}
        item={item}
      />
  
        <Text style={styles.postContent}>{item.description}</Text>
  
        {/* --- NUEVA SECCIÓN DE IMAGEN --- */}
        {/* Verificamos si item.media existe y tiene al menos una URL */}
        {item.media && item.media.length > 0 && item.media[0] ? (
          <View style={{width: '100%',
      paddingHorizontal: 12, // Espacio a los lados para que no toque los bordes del cel
      marginVertical: 8,     // Espacio arriba y abajo del texto/acciones
      alignItems: 'center',}}>
          <Image 
            source={{ uri: item.media[0] }} 
            style={{width: '100%',         // Se adapta al ancho del contenedor
      height: 300,           // Altura fija o puedes usar aspectRatios
      borderRadius: 16,      // Bordes más curvos se ven más modernos
      backgroundColor: '#f2f0f5', shadowColor: '#8E2DE2',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 15,
  
      // --- EFECTO DE ELEVACIÓN (Android) ---
      elevation: 10,}} 
            resizeMode="cover"
          />
          </View>
          ) : null}
        {/* ------------------------------- */}
  
        <View style={{flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 9}}>
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
  
          <TouchableOpacity style={styles.actionButton} onPress={() => onShare(item)}>
            <Ionicons name="share-social-outline" size={20} color="#65676b" />
            <Text style={styles.actionText}>Compartir</Text>
          </TouchableOpacity>
            {isReclutador && IamCivil ?  (
            <TouchableOpacity onPress={(event) => openMenu(event, item, 'portfolio')} style={{ padding: 5 }}>
                <Ionicons name="briefcase" size={22} color="#65676b" />
            </TouchableOpacity>
            ):(<></>)}
        </View>
       
        {isExpanded &&  (
          <View style={{ backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f2f5' }}>
            {/* HEADER DE COMENTARIOS */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 15 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>Comments</Text>
            <View style={{ 
                backgroundColor: '#FFD700', 
          borderRadius: 15, 
          paddingHorizontal: 10, 
          paddingVertical: 2, 
          marginLeft: 10 
        }}>
          <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#000' }}>
            {item.commentsCount || 0}
          </Text>
        </View>
        <TouchableOpacity onPress={() => toggleComments(item.id)} style={{ marginLeft: 'auto' }}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>
  
      {/* LISTA DE COMENTARIOS O ESTADO VACÍO */}
      <View style={{ minHeight: 100 }}>
        {item.commentsData && item.commentsData.length > 0 ? (
          item.commentsData.map((comment, index) => (
            <View key={index} style={{ flexDirection: 'row', paddingHorizontal: 15, marginBottom: 20 }}>
              <Image 
                source={{ uri: comment.userImage || 'https://via.placeholder.com/40' }} 
                style={{ width: 45, height: 45, borderRadius: 22.5, marginRight: 12 }} 
              />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ fontWeight: '700', fontSize: 15, color: '#1c1e21' }}>{comment.user}</Text>
                  <Text style={{ fontSize: 12, color: '#8a8d91', marginLeft: 8 }}>• Reciente</Text>
                </View>
                <Text style={{ fontSize: 14, color: '#444', lineHeight: 20, marginBottom: 8 }}>{comment.text}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity><Text style={{ fontSize: 12, color: '#8a8d91', marginRight: 15 }}>Reply</Text></TouchableOpacity>
                  <TouchableOpacity><Text style={{ fontSize: 12, color: '#8a8d91', marginRight: 15 }}>Like</Text></TouchableOpacity>
                  <Ionicons name="heart-outline" size={16} color="#65676b" style={{ marginLeft: 'auto' }} />
                </View>
              </View>
            </View>
          ))
        ) : (
          /* --- ESTADO VACÍO REDISEÑADO --- */
          <View style={{ paddingVertical: 0, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="chatbubbles-outline" size={50} color="#e4e6eb" />
            <Text style={{ marginTop: 1, color: '#8a8d91', fontSize: 15, fontWeight: '500' }}>
              Sé el primero en comentar
            </Text>
          </View>
        )}
      </View>
  
      {/* CAJA DE INPUT FIJA AL FINAL */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        borderTopWidth: 1, 
        borderTopColor: '#eee',
        backgroundColor: '#fff' 
      }}>
        <TextInput
          style={{ 
            flex: 1, 
            paddingHorizontal: 20, 
            paddingVertical: 1, 
            fontSize: 16, 
            color: '#333',
            maxHeight: 100
          }}
          placeholder="Escribe un comentario..."
          placeholderTextColor="#999"
          value={commentText}
          onChangeText={setCommentText}
          multiline
        />
        <TouchableOpacity 
          onPress={() => handleAddComment(item.id)}
          style={{ 
            backgroundColor: '#4ECCCC', 
            width: 70, 
            height: 60, 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}
        >
          <Ionicons name="arrow-forward" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  )}
  
  {/* Submenú Desplegable */}
  <Modal
    visible={menuVisible}
    transparent={true}
    animationType="fade"
    onRequestClose={() => setMenuVisible(false)}
  >
    <TouchableOpacity 
      style={styles.invisibleOverlay} 
      activeOpacity={1} 
      onPress={() => setMenuVisible(false)}
    >
      <View style={[styles.subMenu, { top: menuPosition.top, right: menuPosition.right }]}>
        
        {/* --- SI EL TIPO ES PORTAFOLIO --- */}
        {menuType === 'portfolio' ? (
          <TouchableOpacity 
            style={styles.subMenuOption} 
            onPress={() => {
              handleSendPortfolio(selectedPost); // Tu función para enviar
              setMenuVisible(false);
            }}
          >
            <Ionicons name="document-text-outline" size={18} color="#1c1e21" />
            <Text style={styles.subMenuText}>Enviar portafolio</Text>
          </TouchableOpacity>
        ) : (
          /* --- SI EL TIPO ES OPCIONES (EDITAR/ELIMINAR) --- */
          <>
            <TouchableOpacity 
              style={styles.subMenuOption} 
              onPress={() => { /* lógica editar */ setMenuVisible(false); }}
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
          </>
        )}
        
      </View>
    </TouchableOpacity>
  </Modal>
      </View>
        );
      }; 

  if (loading) return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color="#1877f2" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
                        style="light" 
                     />
      <StatusBar_Fix />
      
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <FlatList
        data={userPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        scrollEnabled={false}
        ListHeaderComponent={
          <View>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={30} color={'#fff'} />
            </TouchableOpacity>

            <ImageBackground source={{ uri: targetUser?.banner }} style={styles.coverImage} resizeMode="cover" />

            <View style={styles.avatarWrapper}>
              <Image source={{ uri: targetUser?.image }} style={styles.profileAvatar} />
            </View>

            <View style={styles.mainInfo}>
              <Text style={styles.userName}>{targetUser?.Name}</Text>
              <Text style={styles.statsSummary}>
                {userPosts.length} publicaciones · {targetUser?.followers?.length || 0} seguidores
              </Text>
              <Text style={styles.bioText}>{targetUser?.description || "Sin descripción profesional..."}</Text>

              <View style={styles.actionButtonsRow}>
                <TouchableOpacity 
                  style={[styles.blueButton, isFollowing && styles.grayButton]} 
                  onPress={handleFollow}
                >
                  <Ionicons name={isFollowing ? "checkmark" : "person-add"} size={20} color={isFollowing ? "#000" : "#fff"} />
                  <Text style={[styles.blueButtonText, isFollowing && styles.grayButtonText]}>
                    {isFollowing ? "Siguiendo" : "Seguir"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleStartChat} style={styles.messageButton}>
                  <Ionicons name="chatbubble-ellipses" size={18} color="#000" />
                  <Text style={styles.grayButtonText}>Mensaje</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.portfolioSection}>
              <Text style={[styles.sectionTitle, { marginLeft: 20 }]}>Portafolio</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 20, marginTop: 10 }}>
                {userPortfolio.map((item) => (
                  <View key={item.id} style={[styles.portfolioCard, { backgroundColor: item.color || '#B85CFB' }]}>
                    <Ionicons name={item.icon || 'briefcase'} size={25} color="#fff" />
                    <Text style={styles.portfolioCardText}>{item.title}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={styles.divider} />
            <Text style={[styles.sectionTitle, { marginLeft: 20, marginBottom: 10 }]}>Publicaciones</Text>
          </View>
        }
      />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  coverImage: { width: '100%', height: 180, backgroundColor: '#ccc' },
  backButton: { position: 'absolute', top: 20, left: 10, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20 },
  avatarWrapper: { marginTop: -60, marginLeft: 20 },
  profileAvatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#fff' },
  mainInfo: { paddingHorizontal: 20, marginTop: 10 },
  userName: { fontSize: 24, fontWeight: 'bold' },
  statsSummary: { color: '#65676B', fontSize: 14, marginVertical: 4 },
  bioText: { fontSize: 15, color: '#333', lineHeight: 20 },
  actionButtonsRow: { flexDirection: 'row', marginTop: 15, gap: 10 },
  blueButton: { backgroundColor: '#1877F2', flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8, flex: 1, justifyContent: 'center' },
  blueButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 5 },
  grayButton: { backgroundColor: '#E4E6EB' },
  grayButtonText: { color: '#000', fontWeight: 'bold', marginLeft: 5 },
  messageButton: { backgroundColor: '#E4E6EB', flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8, flex: 1, justifyContent: 'center' },
  portfolioSection: { marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  portfolioCard: { width: 130, height: 90, borderRadius: 15, padding: 12, marginRight: 10, justifyContent: 'space-between' },
  portfolioCardText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  divider: { height: 6, backgroundColor: '#F0F2F5', marginVertical: 15 },
  postContainer: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f2f5' },
  postHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
  avatarSmall: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  postAuthor: { fontWeight: 'bold' },
  postDate: { color: '#65676B', fontSize: 12 },
  postContent: { paddingHorizontal: 20, fontSize: 15, marginBottom: 10 },

  postImage: { width: '100%', height: 250, resizeMode: 'cover' },
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
  actionButtons: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 9 },
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
  // Agrega esto a tu StyleSheet.create
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  postAuthorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1c1e21',
  },
  empresaNameText: {
    fontSize: 14,
    color: '#65676b',
    fontWeight: '500',
  },
  empresaBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  empresaIconSmall: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  recruiterBadge: {
    backgroundColor: '#E7F3FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  recruiterText: {
    color: '#1877F2',
    fontSize: 10,
    fontWeight: 'bold',
  },
  postDateText: {
    fontSize: 12,
    color: '#65676b',
  },
});