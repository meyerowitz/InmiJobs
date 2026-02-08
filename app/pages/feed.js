import React from 'react';
import { 
  StyleSheet,Text, View, Image,ScrollView, TouchableOpacity,ImageBackground,Dimensions, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // npx expo install expo-linear-gradient
import {useRouter} from 'expo-router';
import { useTheme } from '../Components/Temas_y_colores/ThemeContext';
const { width } = Dimensions.get('window');

export default function Feed() {
    const { theme, isDark } = useTheme();
    const router = useRouter();
  return (
    <ScrollView style={styles.container} bounces={false}>
       <StatusBar barStyle={'light-content'} backgroundColor={theme.gradient[0]}/>
      {/* Header con Imagen de Fondo */}
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80' }} 
        style={styles.headerBackground}
      >
        
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)']}
          style={styles.gradient}
        />
         <TouchableOpacity 
            style={[{backgroundColor: 'rgba(255, 255, 255, 0)', position:'absolute'},{left:10, top:10}]} 
            onPress={() => router.replace('/pages/Navigation')}
        >
            <Ionicons name="chevron-back" size={30} color={'#ffff'} />
        </TouchableOpacity>
      </ImageBackground>

      {/* Contenedor Blanco (Cuerpo del perfil) */}
      <View style={styles.profileBody}>
        {/* Avatar que sobresale */}
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80' }} 
            style={styles.avatar}
          />
        </View>

        {/* Información de Usuario */}
        <View style={styles.infoSection}>
          <Text style={styles.userName}>Angelina Hall</Text>
          <Text style={styles.handle}>@angelina_hall</Text>
          
          <View style={styles.statsContainer}>
            <StatItem label="Posts" value="35" />
            <StatItem label="Followers" value="50K" />
            <StatItem label="Following" value="905" />
          </View>

          {/* Botones de Acción */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.followButton}>
              <LinearGradient 
                colors={['#7B91FF', '#B066FE']} 
                start={{x: 0, y: 0}} 
                end={{x: 1, y: 0}} 
                style={styles.gradientButton}
              >
                <Text style={styles.followText}>Follow</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.messageButton}>
              <Ionicons name="chatbubble-ellipses" size={24} color="#B066FE" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sección Stories */}
        <SectionHeader title="Stories" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesScroll}>
          
          <StoryItem image="https://picsum.photos/200/300?random=1" />
          <StoryItem image="https://picsum.photos/200/300?random=2" />
          <StoryItem image="https://picsum.photos/200/300?random=3" />
          <StoryItem image="https://picsum.photos/200/300?random=4" />
        </ScrollView>

        {/* Sección Photos */}
        <SectionHeader title="Photos" />
        <View style={styles.photosGrid}>
          <PhotoCard views="150" image="https://picsum.photos/400/500?random=4" />
          <PhotoCard views="299" image="https://picsum.photos/400/500?random=5" />
          <PhotoCard views="9K" image="https://picsum.photos/400/500?random=6" />
        </View>
      </View>
    </ScrollView>
  );
}

// Sub-componentes para organización
const StatItem = ({ label, value }) => (
  <View style={styles.statBox}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const SectionHeader = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
  </View>
);

const StoryItem = ({ image }) => (
  <Image source={{ uri: image }} style={styles.storyImage} />
);

const AddStoryItem = () => (
  <View style={[styles.storyImage, styles.addStory]}>
    <Ionicons name="add-circle" size={30} color="#B066FE" />
  </View>
);

const PhotoCard = ({ views, image }) => (
  <View style={styles.photoCardContainer}>
    <Image source={{ uri: image }} style={styles.photoCard} />
    <View style={styles.viewsOverlay}>
      <Ionicons name="eye-outline" size={14} color="#fff" />
      <Text style={styles.viewsText}>{views} Views</Text>
    </View>
  </View>
);

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  headerBackground: { width: '100%', height: 250 },
  gradient: { flex: 1 },
  profileBody: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -40, // Esto hace que el cuerpo suba sobre la imagen
    paddingBottom: 40,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginTop: -75, // La mitad del tamaño del avatar
    padding: 5,
    backgroundColor: '#fff',
    borderRadius: 100,
  },
  avatar: { width: 140, height: 140, borderRadius: 70 },
  infoSection: { alignItems: 'center', paddingVertical: 20 },
  userName: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A' },
  handle: { fontSize: 16, color: '#999', marginBottom: 25 },
  statsContainer: { flexDirection: 'row', width: '80%', justifyContent: 'space-between' },
  statBox: { alignItems: 'center' },
  statLabel: { color: '#999', fontSize: 14, marginBottom: 5 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  actionsRow: { flexDirection: 'row', marginTop: 30, alignItems: 'center' },
  followButton: { width: width * 0.6, height: 55, borderRadius: 15, overflow: 'hidden' },
  gradientButton: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  followText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  messageButton: { 
    marginLeft: 15, 
    width: 55, 
    height: 55, 
    borderRadius: 15, 
    borderWidth: 1.5, 
    borderColor: '#E0E0E0', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 25, 
    marginTop: 30, 
    marginBottom: 15 
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  seeAll: { color: '#BBB', fontSize: 14 },
  storiesScroll: { paddingLeft: 25 },
  storyImage: { width: 80, height: 100, borderRadius: 15, marginRight: 15 },
  addStory: { backgroundColor: '#F0F0FF', justifyContent: 'center', alignItems: 'center' },
  photosGrid: { 
    flexDirection: 'row', 
    paddingHorizontal: 15, 
    justifyContent: 'space-between' 
  },
  photoCardContainer: { width: (width - 60) / 3, height: 180, borderRadius: 20, overflow: 'hidden' },
  photoCard: { width: '100%', height: '100%' },
  viewsOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 5,
    borderRadius: 10,
  },
  viewsText: { color: '#fff', fontSize: 10, marginLeft: 4, fontWeight: 'bold' },
});