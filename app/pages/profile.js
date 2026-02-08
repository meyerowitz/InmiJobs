import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  ImageBackground,
  Dimensions,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Para el router.replace que mencionaste

const { width } = Dimensions.get('window');

export default function Profile() {
  const router = useRouter();

  // Datos de ejemplo basados en tus imágenes
  const friends = [
    { id: '1', name: 'Eduardo Crespo', img: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { id: '2', name: 'Lucas Salvador', img: 'https://randomuser.me/api/portraits/women/2.jpg' },
    { id: '3', name: 'Maria Herrera', img: 'https://randomuser.me/api/portraits/men/3.jpg' },
    { id: '4', name: 'Julio Martinez', img: 'https://randomuser.me/api/portraits/men/4.jpg' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* SECCIÓN 1: PORTADA Y AVATAR */}
      <ImageBackground 
        source={{ uri: 'https://picsum.photos/id/122/800/400' }} // Imagen estilo Creative Prompts
        style={styles.coverImage}
      >
        {/* BOTÓN VOLVER (Tal cual lo pediste) */}
        <TouchableOpacity 
            style={[styles.backButton, {left:10, top:40}]} // Ajusté top por el Notch
            onPress={() => router.replace('/pages/Navigation')}
        >
            <Ionicons name="chevron-back" size={30} color={'#ffff'} />
        </TouchableOpacity>

        <View style={styles.avatarWrapper}>
          <Image 
            source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }} 
            style={styles.profileAvatar}
          />
          <TouchableOpacity style={styles.cameraIcon}>
            <Ionicons name="camera" size={18} color="#000" />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {/* SECCIÓN 2: INFO PERSONAL (Basado en Meyerowitz Rebeca) */}
      <View style={styles.mainInfo}>
        <Text style={styles.userName}>Monica Velasquez <Ionicons name="chevron-down" size={18} /></Text>
        <Text style={styles.statsSummary}>7 amigos · 16 publicaciones</Text>
        
        <Text style={styles.bioText}>
          UI/UX Designer & Frontend Developer 💻 ✨{"\n"}
          Especialista en Figma & Post-producción... <Text style={styles.seeMore}>Ver más</Text>
        </Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={18} color="#666" />
          <Text style={styles.locationText}>Ciudad Guayana · </Text>
          <Ionicons name="school" size={18} color="#666" />
          <Text style={styles.locationText}> UNEGInforma</Text>
        </View>

        {/* BOTONES DE ACCIÓN */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.blueButton}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.blueButtonText}>Agregar a historia</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.grayButton}>
            <Ionicons name="pencil" size={18} color="#000" />
            <Text style={styles.grayButtonText}>Editar perfil</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />

      {/* SECCIÓN 3: AMIGOS (Horizontal Scroll) */}
      <View style={styles.sectionPadding}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Amigos</Text>
          <TouchableOpacity><Text style={styles.seeAllText}>Ver todo</Text></TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.friendsList}>
          {friends.map(friend => (
            <View key={friend.id} style={styles.friendCard}>
              <Image source={{ uri: friend.img }} style={styles.friendImage} />
              <Text style={styles.friendName} numberOfLines={2}>{friend.name}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.divider} />

      {/* SECCIÓN 4: PUBLICACIONES (Post estilo Inmifriend) */}
      <View style={styles.sectionPadding}>
        <View style={styles.postHeader}>
          <Image source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }} style={styles.postAvatar} />
          <View>
            <Text style={styles.postAuthor}>Meyerowitz Rebeca</Text>
            <Text style={styles.postDate}>29 ene. · 🌎</Text>
          </View>
        </View>
        <Text style={styles.postContent}>
          Mascota corporativa y concepts arts, para una red social dedicada a turistas e inmi... <Text style={styles.seeMore}>Ver más</Text>
        </Text>
        <Image 
          source={{ uri: 'https://i.imgur.com/your_inmifriend_image.png' }} // Aquí iría la imagen de Inmifriend
          style={styles.postMainImage}
          resizeMode="contain"
        />
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  coverImage: { width: '100%', height: 180, justifyContent: 'flex-end' },
  backButton: { backgroundColor: 'rgba(255, 255, 255, 0)', position:'absolute', zIndex: 10 },
  avatarWrapper: { 
    marginBottom: -50, 
    marginLeft: 20, 
    position: 'relative',
    width: 120,
    height: 120,
  },
  profileAvatar: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    borderWidth: 4, 
    borderColor: '#fff' 
  },
  cameraIcon: { 
    position: 'absolute', 
    bottom: 5, 
    right: 5, 
    backgroundColor: '#E4E6EB', 
    padding: 8, 
    borderRadius: 20 
  },
  mainInfo: { marginTop: 60, paddingHorizontal: 20 },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  statsSummary: { color: '#65676B', fontSize: 16, marginVertical: 5 },
  bioText: { fontSize: 15, color: '#050505', lineHeight: 20 },
  seeMore: { color: '#65676B', fontWeight: 'bold' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  locationText: { color: '#65676B', fontSize: 14 },
  actionButtonsRow: { flexDirection: 'row', marginTop: 15, justifyContent: 'space-between' },
  blueButton: { 
    backgroundColor: '#1877F2', 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 10, 
    borderRadius: 8, 
    width: '58%', 
    justifyContent: 'center' 
  },
  blueButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 5 },
  grayButton: { 
    backgroundColor: '#E4E6EB', 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 10, 
    borderRadius: 8, 
    width: '38%', 
    justifyContent: 'center' 
  },
  grayButtonText: { color: '#000', fontWeight: 'bold', marginLeft: 5 },
  divider: { height: 6, backgroundColor: '#F0F2F5', marginVertical: 15 },
  sectionPadding: { paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  seeAllText: { color: '#1877F2', fontSize: 16 },
  friendsList: { marginTop: 15 },
  friendCard: { width: 100, marginRight: 15, alignItems: 'center' },
  friendImage: { width: 90, height: 90, borderRadius: 12 },
  friendName: { fontSize: 13, fontWeight: '500', textAlign: 'center', marginTop: 5 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  postAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  postAuthor: { fontWeight: 'bold', fontSize: 16 },
  postDate: { color: '#65676B', fontSize: 12 },
  postContent: { fontSize: 15, marginBottom: 10 },
  postMainImage: { width: '100%', height: 300, borderRadius: 10, backgroundColor: '#f9f9f9' }
});