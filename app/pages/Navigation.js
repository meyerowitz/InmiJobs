import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StatusBar, 
  StyleSheet, 
  Dimensions 
} from 'react-native';
import { 
  createDrawerNavigator, 
  DrawerContentScrollView, 
  DrawerItem 
} from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// Imports de tus contextos y datos
import Jobs from './Jobs';
import Community from './Community';
import Portafolio from './Portafolio';
import Grupos from './Grupos';
import Amigos from './Amigos';
import Ajustes from './Ajustes';

import { useTheme } from '../Components/Temas_y_colores/ThemeContext';
import { useUser } from '../Components/Data/DataProvider';

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

// --- 1. CONTENIDO PERSONALIZADO DEL DRAWER ---
function CustomDrawerContent(props) {
  const { userData } = useUser();
  const router = useRouter();

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContainer}>
      {/* Header: Avatar, Nombre y Banderas */}
      <View style={styles.headerSection}>
        <View style={styles.avatarWrapper}>
          <Image 
            source={{ uri: userData?.image || 'https://via.placeholder.com/100' }} 
            style={styles.drawerAvatar} 
          />
          <View style={styles.flagsOverlay}>
            <Text style={styles.flagEmoji}>🇻🇪</Text>
            <Text style={styles.flagEmoji}>🇨🇦</Text>
          </View>
        </View>
        <Text style={styles.userNameText}>{userData?.name || 'Bogdan Nikitin'}</Text>
        <Text style={styles.userTagText}>@{userData?.NickName || 'nikitinteam'}</Text>
      </View>

      {/* Items del Menú (Estilo de la imagen) */}
      <View style={styles.menuItemsSection}>
        <DrawerItem
    label="News Feed"
    icon={({ color, size }) => <Ionicons name="newspaper" color={color} size={size} />}
    onPress={() => props.navigation.navigate('AppPrincipal')}
    focused={props.state.index === 0} // Se activa si el índice es 0
    activeTintColor="#fff"
    activeBackgroundColor="#000"
    labelStyle={styles.drawerLabel}
  />

  {/* ITEM 1: Amigos */}
  <DrawerItem
    label="Amigos"
    icon={({ color, size }) => <Ionicons name="people" color={color} size={size} />}
    onPress={() => props.navigation.navigate('Amigos')} // Cambia 'Amigos' por el nombre real de tu ruta
    focused={props.state.index === 1}
    activeTintColor="#fff"
    activeBackgroundColor="#000"
    labelStyle={styles.drawerLabel}
  />

  {/* ITEM 2: Grupos */}
  <DrawerItem
    label="Grupos"
    icon={({ color, size }) => <Ionicons name="image" color={color} size={size} />}
    onPress={() => props.navigation.navigate('Grupos')}
    focused={props.state.index === 2}
    activeTintColor="#fff"
    activeBackgroundColor="#000"
    labelStyle={styles.drawerLabel}
    
  />

  {/* ITEM 3: Portafolio */}
  <DrawerItem
    label="Portafolio"
    icon={({ color, size }) => <Ionicons name="briefcase" color={color} size={size} />}
    onPress={() => props.navigation.navigate('Portafolio')}
    focused={props.state.index === 3}
    activeTintColor="#fff"
    activeBackgroundColor="#000"
    labelStyle={styles.drawerLabel}
  />

  {/* ITEM 4: Ajustes */}
  <DrawerItem
    label="Ajustes"
    icon={({ color, size }) => <Ionicons name="settings" color={color} size={size} />}
    onPress={() => props.navigation.navigate('Ajustes')}
    focused={props.state.index === 4}
    activeTintColor="#fff"
    activeBackgroundColor="#000"
    labelStyle={styles.drawerLabel}
  />
      </View>

      {/* Botón de Logout al final */}
      <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace('/Login')}>
        <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

// --- 2. TABS INFERIORES ---
function MyTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator 
      screenOptions={{
        headerShown: false,
        tabBarStyle: { 
          height: 60 + insets.bottom, 
          borderTopLeftRadius: 25, 
          borderTopRightRadius: 25, 
          paddingBottom: insets.bottom,
          elevation: 10,
          shadowColor: '#000',
        }
      }}
    >
      <Tab.Screen 
        name="Community" 
        component={Community} 
        options={{ tabBarIcon: ({color}) => <Ionicons name="home" size={24} color={color}/> }}
      />
      <Tab.Screen 
        name="Jobs" 
        component={Jobs} 
        options={{ tabBarIcon: ({color}) => <Ionicons name="briefcase" size={24} color={color}/> }}
      />
    </Tab.Navigator>
  );
}

// --- 3. LAYOUT PRINCIPAL (DRAWER) ---
export default function MainLayout() {
  return (
    <>
     
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={({ navigation }) => ({
          headerTransparent: true, 
          headerTitle: '',
          drawerStyle: { 
            width: width * 0.65, // Ocupa el 75% de la pantalla
            borderTopRightRadius: 35,
            borderBottomRightRadius: 35,
          },
          headerLeft: () => (
      <TouchableOpacity 
        style={{ marginLeft: 15, marginTop: 10 }} 
        onPress={() => navigation.toggleDrawer()}
      >
        <Ionicons name="menu" size={32} color="#4A4A4A" />
      </TouchableOpacity>
    ),
        })}
      >
        <Drawer.Screen name="AppPrincipal" component={MyTabs} />
        <Drawer.Screen name="Amigos" component={Amigos} />
        <Drawer.Screen name="Grupos" component={Grupos} />
        <Drawer.Screen name="Portafolio" component={Portafolio} />
        <Drawer.Screen name="Ajustes" component={Ajustes} />
      </Drawer.Navigator>
    </>
  );
}

// --- 4. ESTILOS ---
const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
  },
  headerSection: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 15,
  },
  drawerAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#E1E1E1',
  },
  flagsOverlay: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 4,
    elevation: 3,
  },
  flagEmoji: {
    fontSize: 18,
    marginHorizontal: 1,
  },
  userNameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  userTagText: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  menuItemsSection: {
    flex: 1,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  drawerLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: -10, // Acerca el texto al icono
  },
  menuIconButton: {
    marginLeft: 20,
    marginTop: 45, // Ajuste para que no choque con el notch
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 5,
    elevation: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginBottom: 20,
  },
  logoutText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
  }
});