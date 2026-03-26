import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

export default function CompanySelector({ visible, onClose, companies, onSelect, theme }) {
  const [search, setSearch] = useState('');

  const filteredCompanies = companies.filter(c => 
    c.Name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Selecciona tu Empresa</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={28} color="#ccc" />
            </TouchableOpacity>
          </View>

          {/* Buscador */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              placeholder="Buscar empresa..."
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* Lista */}
          <FlatList
            data={filteredCompanies}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.companyItem}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <View style={styles.logoContainer}>
                  {item.img ? (
                    <Image source={{ uri: item.img }} style={styles.logo} />
                  ) : (
                    <Ionicons name="business" size={24} color={theme.primary} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.companyName}>{item.Name}</Text>
                  <Text style={styles.companyType}>Entidad verificada</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#EEE" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No encontramos esa empresa</Text>
            }
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { 
    backgroundColor: 'white', 
    height: height * 0.7, 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    padding: 20 
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  searchBar: { 
    flexDirection: 'row', 
    backgroundColor: '#F5F5F5', 
    borderRadius: 15, 
    paddingHorizontal: 15, 
    alignItems: 'center', 
    marginBottom: 20 
  },
  searchInput: { flex: 1, paddingVertical: 12, marginLeft: 10, fontSize: 16 },
  companyItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F0F0F0' 
  },
  logoContainer: { 
    width: 50, 
    height: 50, 
    borderRadius: 12, 
    backgroundColor: '#F9F9F9', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#EEE'
  },
  logo: { width: 40, height: 40, borderRadius: 8 },
  companyName: { fontSize: 16, fontWeight: '600', color: '#1c1e21' },
  companyType: { fontSize: 12, color: '#999' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#999' }
});