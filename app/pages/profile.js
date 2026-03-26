import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, Image, TouchableOpacity, 
  ImageBackground, Dimensions, FlatList,  Keyboard,ScrollView, TextInput, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from '../Components/Data/DataProvider';
import { db } from '../../firebaseConfig'; 
import { collection, query, where, onSnapshot, orderBy , doc , updateDoc} from 'firebase/firestore';
import StatusBar_Fix from '../Components/StatusBar_fix'
import NewPost from '../Components/Modales/newPost';
import NewPortrait from '../Components/Modales/newPortrait';
import NewPortfolioModal from '../Components/Modales/NewPortfolioModal';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function Profile() {
  const router = useRouter();
  const { userData } = useUser();
  const [myPosts, setMyPosts] = useState([]);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [newPostModal, setnewPostModal] = useState(false);
  const [mediaModal, setMediaModal] = useState(false);
  const [mediaMode, setMediaMode] = useState('profile'); // 'profile' o 'cover'
  const [showDropdown, setShowDropdown] = useState(false);
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  const [portfolioModal, setPortfolioModal] = useState(false);
  const [DataPortafolio, setDataPortafolio] = useState([]);

  const [newBio, setNewBio] = useState(userData?.description || "");
  const [isUpdating, setIsUpdating] = useState(false);

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

 useEffect(() => {
  if (!userData) return;

  const q = query(
    collection(db, "Portafolio"), // Asegúrate que el nombre sea igual al del addDoc (Portafolios o Portafolio)
    where("userId", "==", userData.id || userData.uid),
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const portfolioArray = [];
    querySnapshot.forEach((doc) => {
      portfolioArray.push({ id: doc.id, ...doc.data() });
    });
    setDataPortafolio(portfolioArray);
  });

  return () => unsubscribe();
}, [userData])

  const PortfolioWidget = ({ onManage, projects = [] }) => {
    return (
      <View style={styles.portfolioWrapper}>
        <View style={styles.portfolioHeader}>
          <Text style={styles.sectionTitle}>Portafolio</Text>
          <TouchableOpacity onPress={() => setPortfolioModal(true)}>
            <Text style={styles.seeMore}>Agregar</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{paddingLeft: 20}}>
          {/* Mapeamos los proyectos que vienen de Firebase (userData.portfolio) */}
          {projects.map((item) => (
  <TouchableOpacity 
    key={item.id} 
    style={[styles.portfolioCard, { backgroundColor: item.color }]}
    onPress={() => router.push({
      pathname: '/pages/Portafolio',
      params: { 
        id: item.id, 
        title: item.title, 
        color: item.color,
        ruta: '/pages/profile'
      }
      
    })}
  >
    <Ionicons name={item.icon || 'briefcase'} size={30} color="#fff" />
    <Text style={styles.portfolioCardText}>{item.title}</Text>
  </TouchableOpacity>
))}
          <FlatList
            renderItem={(item)=>{return(<TouchableOpacity 
              key={item.id} 
              style={[styles.portfolioCard, { backgroundColor: item.color }]}
              onPress={onManage}
            >
              <Ionicons name={item.icon || 'briefcase'} size={30} color="#fff" />
              <Text style={styles.portfolioCardText}>{item.title}</Text>
            </TouchableOpacity>)}}
           scrollEnabled={false}
          ></FlatList>
          
          <TouchableOpacity style={styles.addCard} onPress={() => setPortfolioModal(true)}>
            <Ionicons name="add" size={30} color="#B85CFB" />
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  const openEditMedia = (mode) => {
    setMediaMode(mode);
    setMediaModal(true);
  };

  if (!userData) return <Text>No hay sesión activa</Text>;



  const toggleComments = (postId) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  // 2. Render de cada Post (usando tu lógica de Community)
  const renderMyPost = ({ item }) => {
    const isMyPost = item.userId === (userData?.id || userData?.uid);
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
         {/* --- NUEVA SECCIÓN DE IMAGEN --- */}
              {/* Verificamos si item.media existe y tiene al menos una URL */}
              {item.media && item.media.length > 0 && item.media[0] ? (
                <Image 
                  source={{ uri: item.media[0] }} 
                  style={{ width: '100%', height: 300}} 
                  resizeMode="cover"
                />
              ) : null}
              {/* ------------------------------- */}
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

  return (
    <SafeAreaView style={styles.container}>
          <StatusBar 
                                             style="light" 
                                          />
                   <StatusBar_Fix></StatusBar_Fix>
      <ScrollView contentContainerStyle={{minHeight:'110%',flexGrow: 1}}>
        
      <FlatList
        data={myPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderMyPost}
        ListHeaderComponent={ <View>
       <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.replace('/pages/Navigation')}
        >
          <Ionicons name="chevron-back" size={30} color={'#fff'} />
        </TouchableOpacity>
    <TouchableOpacity onPress={() => openEditMedia('cover')}>
      <ImageBackground 
        source={{ uri: userData.banner }}
        style={[{borderBottomRightRadius:10, borderBottomLeftRadius:10, overflow:'hidden',marginHorizontal:1,borderColor:'#B85CFB', borderLeftWidth:4,width: '99%', height: 180, justifyContent: 'flex-end',borderRightWidth:4, borderBottomWidth:4, borderTopWidth:0 }]}
        resizeMode="cover"
        imageStyle={{
          width:'100%'
        }}
      >
      </ImageBackground>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => openEditMedia('profile')}>
       <View style={{ marginBottom: -50, marginLeft: 20, width: 120, height: 120, marginTop:'-22%' }}>
          <Image source={{ uri: userData.image }} style={styles.profileAvatar} />
          <TouchableOpacity style={styles.cameraIcon}>
            <Ionicons name="camera" size={18} color="#000" />
          </TouchableOpacity>
        </View>
    </TouchableOpacity>
      <View style={styles.mainInfo}>
        <Text style={styles.userName}>{userData.name} <Ionicons name="chevron-down" size={18} /></Text>
        <Text style={styles.statsSummary}>{myPosts.length} publicaciones · {userData.countFriends} amigos</Text>
        {/* BIO CON FUNCIONALIDAD VER MÁS */}
        
          <Text 
            style={styles.bioText} 
            numberOfLines={isBioExpanded ? undefined : 2}
          >
            {newBio || userData.description || "Sin descripción profesional..."}
          </Text>
        <TouchableOpacity onPress={() => setIsBioExpanded(!isBioExpanded)}>
          {userData.description?.length > 60 && (
            <Text style={[styles.seeMore, {marginTop: 2}]}>
              {isBioExpanded ? "Ver menos" : "Ver más"}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.blueButton} onPress={() =>{ setnewPostModal(true)}}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.blueButtonText}>Agregar Publicación</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.grayButton} onPress={() => setShowDropdown(!showDropdown)}>
            <Ionicons name="pencil" size={18} color="#000" />
            <Text style={styles.grayButtonText}>Editar perfil</Text>
          </TouchableOpacity>
        </View>
      </View>
        {showDropdown && (
          <View style={styles.dropdownContainer}>
    <Text style={styles.editLabel}>Editar Biografía Profesional</Text>
    
    <TextInput
      style={styles.bioInput}
      multiline
      numberOfLines={4}
      value={newBio}
      onChangeText={setNewBio}
      placeholder="Escribe algo sobre ti para los reclutadores..."
    />

    <View style={styles.editActions}>
      <TouchableOpacity 
        style={styles.cancelButton} 
        onPress={() => {
          setShowDropdown(false);
          setNewBio(userData.description); // Revertir cambios si cancela
        }}
      >
        <Text style={styles.cancelText}>Cancelar</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.saveBioButton, isUpdating && { opacity: 0.7 }]} 
        onPress={async () => {
          if (isUpdating) return;
          setIsUpdating(true);
          try {
            // Actualizamos en Firestore
            const userRef = doc(db, "Usuarios", userData.id || userData.uid);
            await updateDoc(userRef, { description: newBio });
            
            setShowDropdown(false);
            alert("¡Biografía actualizada!");
          } catch (error) {
            console.error(error);
            alert("Error al actualizar");
          } finally {
            setIsUpdating(false);
          }
        }}
      >
        {isUpdating ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.saveBioText}>Guardar cambios</Text>
        )}
      </TouchableOpacity>
    </View>
  </View>
)}
          <PortfolioWidget projects={DataPortafolio || []} onManage={() => router.push('/pages/Portafolio')} />
      <View style={styles.divider} />

      <Text style={[styles.sectionTitle, {marginLeft: 20, marginBottom: 10}]}>Tus publicaciones</Text>
    </View>}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20}}>No has publicado nada todavía.</Text>}
      />
       <NewPost visible={newPostModal} onClose={() =>{ setnewPostModal(false)}} type={'post'}></NewPost>
      <NewPortrait
        visible={mediaModal} 
        onClose={() => setMediaModal(false)} 
        mode={mediaMode}
      />
      <NewPortfolioModal 
         visible={portfolioModal} 
         onClose={() => setPortfolioModal(false)} 
         userId={userData.id || userData.uid}
       />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  dropdownContainer: {
    backgroundColor: '#f9f9f9',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E4E6EB',
  },
  editLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#65676b',
    marginBottom: 10,
  },
  bioInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    textAlignVertical: 'top',
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 10,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  cancelText: {
    color: '#65676b',
    fontWeight: '600',
  },
  saveBioButton: {
    backgroundColor: '#1877f2',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120
  },
  saveBioText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  container: { flex: 1, backgroundColor: '#fff' },
  coverImage: { width: '99%', height: 180, justifyContent: 'flex-end' },
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
  commentsSection: { padding: 15, backgroundColor: '#f9f9f9', marginHorizontal: 20, borderRadius: 10 },
  portfolioWrapper: {
    marginVertical: 10,
    paddingBottom: 10,
  },
  portfolioHeader: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    marginBottom: 15
  },
  portfolioCard: {
    width: 140,
    height: 100,
    borderRadius: 20,
    padding: 15,
    marginRight: 12,
    justifyContent: 'space-between',
    elevation: 4, // Sombra en Android
    shadowColor: '#000', // Sombra en iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  portfolioCardText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  },
  addCard: {
    width: 100,
    height: 100,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E4E6EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 40
  }
});