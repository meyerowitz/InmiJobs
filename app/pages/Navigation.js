import React from 'react';
import { TouchableOpacity, StatusBar } from 'react-native';
// Cambiamos la importación aquí
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Jobs from './Jobs';
import Community from './Community';
import { useTheme } from '../Components/Temas_y_colores/ThemeContext';

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

function MyTabs() {
    const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator 
      screenOptions={{
        headerShown: false,
        tabBarStyle: { height: 60 , borderTopLeftRadius: 20, borderTopRightRadius: 20 , paddingBottom:insets}
      }}
    >
      <Tab.Screen 
        name="Community" 
        component={Community} 
        options={{ tabBarIcon: ({color}) => <Ionicons name="home" size={20} color={color}/> }}
      />
      <Tab.Screen 
        name="Jobs" 
        component={Jobs} 
        options={{ tabBarIcon: ({color}) => <Ionicons name="shield-checkmark" size={20} color={color}/> }}
      />
    </Tab.Navigator>
  );
}

export default function MainLayout() {
    const { theme, isDark } = useTheme();
  return (
    <><StatusBar barStyle={'light-content'} backgroundColor={theme.gradient[0]}/>
    <Drawer.Navigator
     screenOptions={({ navigation }) => ({
    headerTransparent: true, 
    headerTitle: '',
    // Forzamos que el encabezado no tenga altura física que empuje el contenido
    headerStyle: {
      elevation: 0, // Quita sombra en Android
      shadowOpacity: 0, // Quita sombra en iOS
    },
    headerLeftContainerStyle: {
      paddingLeft: 0, // Ajusta la posición del botón si queda muy pegado
    },
    headerLeft: () => (
      <TouchableOpacity 
        style={{ marginLeft: 15, marginTop: 10 }} 
        onPress={() => navigation.toggleDrawer()}
      >
        <Ionicons name="menu" size={32} color="#4A4A4A" />
      </TouchableOpacity>
    ),
    drawerStyle: { width: 280 },
    swipeEdgeWidth: 100,
  })}
    >
      <Drawer.Screen 
        name="AppPrincipal" 
        component={MyTabs} 
        options={{ title: 'Inicio' }} 
      />
    </Drawer.Navigator>
    </>
  );
}