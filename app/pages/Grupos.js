import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ImageBackground, TouchableOpacity, TextInput , StatusBar} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../Components/Data/DataProvider';
import { SafeAreaView } from "react-native-safe-area-context";
import StatusBar_Fix from '../Components/StatusBar_fix'

export default function Grupos() {
  const { userData } = useUser();
  const [joinedGroups, setJoinedGroups] = useState([]); // Para simular la unión en tiempo real

  const [grupos] = useState([
    { id: '1', name: 'Inversionistas Latam', members: '1.2k', category: 'Negocios', image: 'https://images.unsplash.com/photo-1526303328184-bf71597dff9a?q=80&w=400' },
    { id: '2', name: 'Desarrolladores React', members: '850', category: 'Tecnología', image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=400' },
    { id: '3', name: 'Emprendedores Pro', members: '2.5k', category: 'Negocios', image: 'https://images.unsplash.com/photo-1519389403163-4986139a0166?q=80&w=400' },
    { id: '4', name: 'Diseño UX/UI', members: '500', category: 'Diseño', image: 'https://images.unsplash.com/photo-1586717791821-3f44a563cc4c?q=80&w=400' },
  ]);

  const toggleJoin = (groupId) => {
    if (joinedGroups.includes(groupId)) {
      setJoinedGroups(joinedGroups.filter(id => id !== groupId));
    } else {
      setJoinedGroups([...joinedGroups, groupId]);
    }
  };

  const renderGrupo = ({ item }) => {
    const isJoined = joinedGroups.includes(item.id);

    return (
      <View style={styles.card}>

        <ImageBackground source={{ uri: item.image }} style={styles.cardImage} imageStyle={{ borderRadius: 20 }}>
          <View style={styles.overlay}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.cardInfo}>
          <View style={{ flex: 1 }}>
            <Text style={styles.groupName}>{item.name}</Text>
            <Text style={styles.memberCount}>
              <Ionicons name="people" size={14} color="#888" /> {item.members} miembros
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.joinButton, isJoined && styles.joinedButton]} 
            onPress={() => toggleJoin(item.id)}
          >
            <Text style={[styles.joinButtonText, isJoined && styles.joinedButtonText]}>
              {isJoined ? 'Unido' : 'Unirme'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{flex:1}}>
    <View style={styles.container}>
      {/* Header con bienvenida */}
       <StatusBar barStyle={'light-content'} backgroundColor={'#B85CFB'}/>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>Explorar</Text>
        <Text style={styles.headerTitle}>Comunidades</Text>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#A0A0A0" />
          <TextInput placeholder="Buscar nuevos grupos..." style={styles.searchInput} placeholderTextColor="#A0A0A0" />
        </View>
      </View>

      <FlatList
        data={grupos}
        keyExtractor={(item) => item.id}
        renderItem={renderGrupo}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 25, paddingTop: 60, backgroundColor: '#FFF' },
  headerSubtitle: { fontSize: 16, color: '#888', fontWeight: '500' },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#000', marginBottom: 20 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F5',
    paddingHorizontal: 15,
    borderRadius: 15,
    height: 50
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  listContent: { padding: 20 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginBottom: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardImage: { height: 160, width: '100%', justifyContent: 'flex-end' },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    height: '100%',
    width: '100%',
    borderRadius: 20,
    padding: 15,
    justifyContent: 'flex-start'
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10
  },
  categoryText: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  cardInfo: { flexDirection: 'row', padding: 15, alignItems: 'center' },
  groupName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  memberCount: { fontSize: 14, color: '#888', marginTop: 3 },
  joinButton: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  joinedButton: { backgroundColor: '#E1E1E1' },
  joinButtonText: { color: '#FFF', fontWeight: 'bold' },
  joinedButtonText: { color: '#888' }
});