import React, { useState } from 'react';
import { View, TouchableOpacity, Image, TextInput, Platform, UIManager, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from './Data/DataProvider';

const { width } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HeaderMap() {
  const router = useRouter();
  const { userData } = useUser();
  const [searchText, setSearchText] = useState('');

  return (
    <View style={{
      paddingHorizontal: 15,
      paddingTop: 0, // Ajustado para el notch
      paddingBottom: 0,
      backgroundColor: '#FFD32D', // Para que no tape el mapa si es flotante
      alignItems: 'center',
      elevation:10
    }}>
      
      {/* CONTENEDOR PRINCIPAL AMARILLO (Estilo Píldora) */}
      <View style={{ 
        flexDirection: 'row', 
        backgroundColor: '#FFD32D', // El amarillo vibrante de la imagen
        width: width * 0.9,
        height: 70,
        borderRadius: 20, // Bordes redondeados pero no circulares (estilo card)
        alignItems: 'center',
        paddingHorizontal: 15,
        marginLeft:31
      }}>
        
        {/* ICONO IZQUIERDO (Simulando la lámpara o Logo) */}
        <View style={{ width: 50, alignItems: 'center' }}>
           <Ionicons name="flashlight" size={28} color="black" /> 
           {/* ^ Aquí podrías poner una imagen de tu logo si prefieres */}
        </View>

        {/* BARRA DE BÚSQUEDA BLANCA */}
        <View style={{ 
          flex: 1, 
          flexDirection: 'row',
          backgroundColor: '#FFF',
          height: 45,
          borderRadius: 25,
          alignItems: 'center',
          paddingHorizontal: 15,
          marginHorizontal: 10
        }}>
          <TextInput
            placeholder="Search"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
            style={{ 
              flex: 1, 
              fontSize: 16, 
              color: '#000',
              fontWeight: '500'
            }}
          />
          <TouchableOpacity>
            <Ionicons name="search" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {/* BOTÓN DE MENÚ (Círculo Negro) */}
        <TouchableOpacity 
          style={{
            backgroundColor: '#000',
            width: 50,
            height: 50,
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onPress={() => {/* Abrir cajón o menú */}}
        >
          <Ionicons name="reorder-three" size={30} color="white" />
        </TouchableOpacity>

      </View>
    </View>
  );
}