import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TextInput, TouchableOpacity , Keyboard,Modal, Share} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../Components/Temas_y_colores/ThemeContext';
import {useRouter} from 'expo-router';
import { SafeAreaView,useSafeAreaInsets } from "react-native-safe-area-context";
import { userData, useUser } from '../Components/Data/DataProvider';
import { db } from '../../firebaseConfig'; 
import { StatusBar } from 'expo-status-bar';
import { collection, query, where, onSnapshot, orderBy, doc, deleteDoc,updateDoc, increment,arrayUnion, arrayRemov } from 'firebase/firestore';
import * as Network from 'expo-network';
import Diamond from '../Components/Botones/Diamond';
import StatusBar_Fix from '../Components/StatusBar_fix'
import NewJob from '../Components/Modales/newJob';
import NewJobPost from '../Components/Modales/newOffer';
import Header from '../Components/Header';
import Icon from '../Components/Header/ProfileIcon';
import Gradient from '../Components/Header/Gradient';



const PostUserInfo = ({ userId, createdAt, type, isMyPost, openMenu, item, goToUserProfile }) => {
  const [userData, setUserData] = useState({ name: 'Cargando...', image: null, role: '', empresa: 'independiente' });
  const [empresaData, setEmpresaData] = useState(null);

  useEffect(() => {
    if (!userId) return;

    // 1. Escuchar datos del usuario
    const userRef = doc(db, "Usuarios", userId);
    const unsubUser = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const info = {
          name: data.Name || 'Usuario',
          image: data.image,
          role: data.role,
          empresa: data.empresa
        };
        setUserData(info);

        // 2. BUSCAR EMPRESA AQUÍ ADENTRO (Usando el ID fresco de la DB)
        if (info.empresa && info.empresa !== 'independiente') {
          const empRef = doc(db, "Empresas", info.empresa);
          // Retornamos el unsub para limpiarlo luego
          return onSnapshot(empRef, (empSnap) => {
            if (empSnap.exists()) {
              setEmpresaData({
                name: empSnap.data().Name,
                img: empSnap.data().img
              });
            }
          });
        } else {
          setEmpresaData(null); // Limpiar si es independiente
        }
      }
    });

    return () => unsubUser();
  }, [userId]); // Quitamos empresaIid (tenía un typo con doble 'i')

  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 15, marginBottom: 10, alignItems: 'center' }}>
      <View style={{ position: 'relative', width: 45, height: 45 }}>
        <Icon uri={userData.image} onPress={goToUserProfile} />
        {empresaData?.img && (
          <View style={{
            position: 'absolute', bottom: -4, right: -4, backgroundColor: '#fff',
            borderRadius: 20, padding: 2, elevation: 3, shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1
          }}>
            <Image source={{ uri: empresaData.img }} style={{ width: 22, height: 22, borderRadius: 20 }} />
          </View>
        )}
      </View>

      <View style={{ marginLeft: 10, flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#1c1e21' }}>{userData.name}</Text>
          {empresaData?.name && (
            <Text style={{ fontSize: 13, color: '#65676b', fontWeight: '400' }}> • {empresaData.name}</Text>
          )}
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {type === 'jobs' && (
            <View style={{ backgroundColor: '#e7f3ff', paddingHorizontal: 6, borderRadius: 4, marginRight: 5 }}>
              <Text style={{ color: '#1877f2', fontSize: 10, fontWeight: 'bold' }}>RECLUTADOR</Text>
            </View>
          )}
          <Text style={{ color: '#65676b', fontSize: 12 }}>
            {createdAt?.toDate().toLocaleDateString() || 'Reciente'} • <Ionicons name="earth" size={12} />
          </Text>
        </View>
      </View>

      {isMyPost && (
        <TouchableOpacity onPress={(event) => openMenu(event, item)} style={{ padding: 5 }}>
          <Ionicons name="ellipsis-vertical" size={22} color="#65676b" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function Jobs() {
   const router = useRouter();
   const { userData, logout } = useUser();
   const [newPostModal, setnewPostModal] = useState(false);
   const [newJobModal, setnewJobModal] = useState(false);
   const [posts, setPosts] = useState([]);

    const [expandedPostId, setExpandedPostId] = useState(null);
    const { theme, isDark } = useTheme();
    const [menuVisible, setMenuVisible] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
    const [isConnected, setIsConnected] = useState(true);
    const [menuType, setMenuType] = useState('options'); // 'options' o 'portfolio'
    const [commentText, setCommentText] = useState('');


    useEffect(() => {
    const checkConnection = async () => {
      const status = await Network.getNetworkStateAsync();
    // status.isConnected nos dice si el dispositivo tiene el switch de red activo
    // status.isInternetReachable nos dice si realmente hay internet (Google, etc)
      setIsConnected(status.isConnected && status.isInternetReachable);
      };

      checkConnection();
    }, []);   
    useEffect(() => {
      if (!userData) return;

    // 1. Creamos la consulta (Query)
    // Filtramos donde userId != al usuario actual
      const q = query(
      collection(db, "Post"),where("type", "==", "jobs"),
      orderBy("createdAt", "desc"));

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
    if (!userData) return <Text>No hay sesión activa</Text>;
    if(!isConnected){
        return(
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80, paddingHorizontal: 40 }}>
            <Ionicons name="cloud-offline-outline" size={80} color="#ff4444" />
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1c1e21', marginTop: 15 }}>
                ¡Ups! Sin conexión
              </Text>
              <Text style={{ fontSize: 14, color: '#65676b', textAlign: 'center', marginTop: 8 }}>
                Parece que no tienes internet disponible ahora. Revisa tu configuración y vuelve a intentarlo.
              </Text>
            <TouchableOpacity 
                onPress={() => {/* Aquí podrías reintentar la carga */}}
                style={{ marginTop: 20, backgroundColor: '#1877f2', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Reintentar</Text>
            </TouchableOpacity>
          </View>
      )}
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

    const EmptyPostsMessage = () => (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 50, paddingHorizontal: 40 }}>
        <Ionicons name="newspaper-outline" size={80} color="#ccc" />
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#65676b', marginTop: 10, textAlign: 'center' }}>
          No hay publicaciones aún
        </Text>
        <Text style={{ fontSize: 14, color: '#8a8d91', textAlign: 'center', marginTop: 5 }}>
          ¡Sé el primero en compartir algo con la comunidad!
        </Text>
      </View>
    );
    const renderPost2 = ({ item }) => {
      const isExpanded = expandedPostId === item.id; 
      const isMyPost = String(item.userId).trim() === String(userData?.id || userData?.uid).trim();
      const isReclutador = item.type === 'jobs';
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
            userId={item.userId}
            empresaId={item.empresa}
            createdAt={item.createdAt}
            type={item.type}
            isMyPost={isMyPost}
            openMenu={openMenu}
            item={item}
            goToUserProfile={goToUserProfile}
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
                alert('Portafolio enviado correctamente') // Tu función para enviar
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


  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
      <Gradient/>
                    <StatusBar 
                                      style="light" 
                                   />
             <StatusBar_Fix></StatusBar_Fix>
       <Header/>
            <FlatList
              data={posts} // Une los datos de Firebase con los estáticos
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
              renderPost2({ item }) )
            }
            ListEmptyComponent={EmptyPostsMessage}     
            />

        {userData.role === 'reclutador' ? (<><Diamond newPost={setnewJobModal}></Diamond></>):(<><Diamond newPost={()=>{alert('whops, tu no eres un reclutador, lo sentimos')}}></Diamond></>)}
        
   
      <NewJob
        visible={newJobModal} 
        onClose={() => setnewJobModal(false)} 
        onConfirm={() => {
            setnewJobModal(false);
            setnewPostModal(true)
          }} 
        />
        <NewJobPost
        visible={newPostModal} 
        onClose={() => setnewPostModal(false)} 
        onConfirm={() => {
            setnewJobModal(false);
            setnewPostModal(true)
          }} 
          type={'jobs'}
        />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  iconGroup: {
  position: 'relative',
  width: 45,
  height: 45,
},
businessBadgeContainer: {
  position: 'absolute',
  bottom: -4,
  right: -4,
  backgroundColor: '#f10000',
  borderRadius: 10,
  padding: 2,
  elevation: 3, // Elevación para que resalte en Android
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.2,
  shadowRadius: 1,
},
businessBadgeImage: {
  width: 18,
  height: 18,
  borderRadius: 9,
},
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