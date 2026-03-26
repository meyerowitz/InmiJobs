import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from './Data/DataProvider';
import Icon from './Header/ProfileIcon';

// Habilitar animaciones en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Header() {
  const router = useRouter();
  const { userData } = useUser();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSearch = () => {
    // Esto hace que el "empuje" sea suave
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={{
      flexDirection: 'row',
      paddingHorizontal: 15,
      paddingTop: 17,
      paddingBottom: 10,
      alignItems: 'center',
      backgroundColor: '#fff',
      width: '100%'
    }}>
      
      {/* Logo: Se oculta o se mantiene según prefieras, aquí lo dejamos fijo */}
      {!isExpanded && (
        <Text style={{
          fontSize: 28, 
          fontWeight: 'bold', 
          color: '#1877f2', 
          letterSpacing: -1,
          marginRight: 5,
          marginLeft:55,
          marginBottom:4
        }}>
          InmiJobs
        </Text>
      )}

      {/* Contenedor de la Barra y el Avatar */}
      <View style={{ 
        flexDirection: 'row', 
        flex: 1, 
        justifyContent: 'flex-end', 
        alignItems: 'center' 
      }}>
        
        {/* BUSCADOR */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          backgroundColor: '#e4e6eb', 
          borderRadius: 90, 
          height: 45,
          paddingHorizontal: isExpanded ? 15 : 0,
          width: isExpanded ? 160 : 45,
           marginRight:10
        }}>
            {isExpanded && (
            <TextInput
              placeholder="Buscar..."
              autoFocus={true}
              style={{ flex: 1, marginLeft: 10, fontSize: 15, color: '#000', width:100 }}
            />
          )}
          <TouchableOpacity 
            onPress={toggleSearch}
            style={{ 
              padding: isExpanded ? 0 : 12, 
              borderRadius: 90,
             
            }}
          >
            <Ionicons name={isExpanded ? "search" : "search"} size={19} color="#000" />
          </TouchableOpacity>

          
        </View>
        {/* NUEVO BOTÓN DE MENSAJES */}
        <TouchableOpacity 
          onPress={() => router.push('/pages/ChatList')}
          style={{backgroundColor: '#615ef0', // Color púrpura de tus referencias
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#615ef0',
    shadowOpacity: 0.3,
    shadowRadius: 5, marginRight:10}}
        >
          <Ionicons name="chatbubble-ellipses" size={22} color="#fff" />
          {/* Opcional: Badge de mensajes no leídos */}
          <View style={{position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff4d4d',
    borderWidth: 2,
    borderColor: '#fff'}} />
        </TouchableOpacity>
          <View >
            <Icon onPress={() => router.replace('/pages/profile')} uri={userData?.image}/>
          </View>
        
      </View>
    </View>
  );
}