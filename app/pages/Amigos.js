import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../Components/Data/DataProvider';
import { SafeAreaView } from "react-native-safe-area-context";
import StatusBar_Fix from '../Components/StatusBar_fix'
export default function Amigos() {
  const { theme } = useUser(); // Si tienes el tema en el context, si no usa colores fijos
  const [search, setSearch] = useState('');

  // Datos simulados de amigos
  const [amigos] = useState([
    { id: '1', name: 'Alexander Pierce', role: 'Propietario', status: 'Online', image: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { id: '2', name: 'Milena Smith', role: 'Reclutador', status: 'Offline', image: 'https://randomuser.me/api/portraits/women/2.jpg' },
    { id: '3', name: 'George Clooney', role: 'Civil', status: 'Online', image: 'https://randomuser.me/api/portraits/men/3.jpg' },
    { id: '4', name: 'Elena Rodriguez', role: 'Reclutador', status: 'Online', image: 'https://randomuser.me/api/portraits/women/4.jpg' },
    { id: '5', name: 'Robert De Niro', role: 'Propietario', status: 'Busy', image: 'https://randomuser.me/api/portraits/men/5.jpg' },
  ]);

  // Filtrado por búsqueda
  const filteredAmigos = amigos.filter(amigo => 
    amigo.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderAmigo = ({ item }) => (
    <TouchableOpacity style={styles.friendCard}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.image }} style={styles.avatar} />
        {item.status === 'Online' && <View style={styles.onlineBadge} />}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.nameText}>{item.name}</Text>
        <Text style={styles.roleText}>{item.role}</Text>
      </View>

      <TouchableOpacity style={styles.messageButton}>
        <Ionicons name="chatbubble-ellipses-outline" size={22} color="#000" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{flex:1}}>
    <View style={styles.container}>
      {/* HEADER CON BARRA DE NAVEGACIÓN/BÚSQUEDA */}
       <StatusBar barStyle={'light-content'} backgroundColor={'#B85CFB'}/>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Amigos</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#A0A0A0" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="Buscar amigos..."
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#A0A0A0"
          />
        </View>
      </View>

      {/* LISTA DE AMIGOS */}
      <FlatList
        data={filteredAmigos}
        keyExtractor={(item) => item.id}
        renderItem={renderAmigo}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No se encontraron amigos.</Text>
        }
      />
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#000', marginBottom: 15 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F5',
    paddingHorizontal: 15,
    borderRadius: 15,
    height: 45,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  listContent: { padding: 20 },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  avatarContainer: { position: 'relative' },
  avatar: { width: 55, height: 55, borderRadius: 27.5 },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CD964',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  infoContainer: { flex: 1, marginLeft: 15 },
  nameText: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  roleText: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F3F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 }
});