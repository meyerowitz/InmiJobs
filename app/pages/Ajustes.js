import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../Components/Data/DataProvider';
import { SafeAreaView } from "react-native-safe-area-context";

export default function Ajustes() {
  const { userData, logout } = useUser();
  const [notifications, setNotifications] = React.useState(true);

  // Componente pequeño para cada fila de ajuste
  const SettingItem = ({ icon, label, onPress, rightElement, color = "#333" }) => (
    <TouchableOpacity style={styles.item} onPress={onPress} disabled={!onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.label, { color: color === '#FF3B30' ? '#FF3B30' : '#333' }]}>
        {label}
      </Text>
      {rightElement ? rightElement : <Ionicons name="chevron-forward" size={18} color="#CCC" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{flex:1}}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
         <StatusBar barStyle={'light-content'} backgroundColor={'#B85CFB'}/>
      <Text style={styles.title}>Ajustes</Text>

      {/* SECCIÓN: CUENTA */}
      <Text style={styles.sectionTitle}>Cuenta</Text>
      <View style={styles.sectionCard}>
        <SettingItem 
          icon="person-outline" 
          label="Editar Perfil" 
          onPress={() => console.log("Editar")} 
        />
        <SettingItem 
          icon="shield-checkmark-outline" 
          label="Seguridad y Contraseña" 
          onPress={() => console.log("Seguridad")} 
        />
        <SettingItem 
          icon="business-outline" 
          label={`Empresa ID: ${userData?.empresa || 'N/A'}`} 
        />
      </View>

      {/* SECCIÓN: PREFERENCIAS */}
      <Text style={styles.sectionTitle}>Preferencias</Text>
      <View style={styles.sectionCard}>
        <SettingItem 
          icon="notifications-outline" 
          label="Notificaciones Push" 
          rightElement={
            <Switch 
              value={notifications} 
              onValueChange={setNotifications}
              trackColor={{ false: "#767577", true: "#000" }}
              thumbColor="#fff"
            />
          }
        />
        <SettingItem 
          icon="language-outline" 
          label="Idioma" 
          onPress={() => console.log("Idioma")} 
        />
        <SettingItem 
          icon="moon-outline" 
          label="Modo Oscuro" 
          onPress={() => console.log("Tema")} 
        />
      </View>

      {/* SECCIÓN: SOPORTE Y SALIR */}
      <Text style={styles.sectionTitle}>Otros</Text>
      <View style={styles.sectionCard}>
        <SettingItem 
          icon="help-circle-outline" 
          label="Centro de Ayuda" 
          onPress={() => console.log("Ayuda")} 
        />
        <SettingItem 
          icon="log-out-outline" 
          label="Cerrar Sesión" 
          color="#FF3B30"
          onPress={logout} 
        />
      </View>

      <Text style={styles.footerText}>Versión 1.0.2 - 2026</Text>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 20, paddingTop: 60 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#000', marginBottom: 30 },
  sectionTitle: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#A0A0A0', 
    textTransform: 'uppercase', 
    letterSpacing: 1, 
    marginBottom: 10,
    marginLeft: 5
  },
  sectionCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    paddingVertical: 5, 
    marginBottom: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  item: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 15,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  label: { flex: 1, fontSize: 16, fontWeight: '500' },
  footerText: { textAlign: 'center', color: '#CCC', fontSize: 12, marginTop: 10, marginBottom: 30 }
});