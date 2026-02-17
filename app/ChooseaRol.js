import React from 'react';
import { Text, View, TouchableOpacity, ScrollView, Dimensions, StatusBar, Animated } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import { User, Briefcase, Home, ChevronRight } from 'lucide-react-native';
import { useTheme } from './Components/Temas_y_colores/ThemeContext';
import { useRouter } from 'expo-router';
import Volver from './Components/Botones/Volver'
const { height } = Dimensions.get('window');

// Reutilizamos el efecto de burbujas
const FloatingOrb = ({ size, duration, delay, startPos }) => {
  const anim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration, delay, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -30] }) }],
      }, startPos]}
    />
  );
};

export default function Role() {
  const { theme } = useTheme();
  const router = useRouter();

  const roles = [
    {
      id: 'civil',
      title: 'Civil',
      desc: 'Busca y reserva alojamientos fácilmente',
      icon: <User size={30} color={theme.primary} />,
      route: '/Register'
    },
    {
      id: 'reclutador',
      title: 'Reclutador',
      desc: 'Publica tus ofertas y encuentra talento',
      icon: <Briefcase size={30} color={theme.primary} />,
      route: '/Register'
    },
    {
      id: 'propietario',
      title: 'Propietario',
      desc: 'Ofrece tus propiedades en alquiler',
      icon: <Home size={30} color={theme.primary} />,
      route: '/Register'
    }
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.gradient[0] }}>
      <StatusBar 
  barStyle={'light-content'} 
  backgroundColor={'transparent'} 
  translucent={true} 
/>
      
      <LinearGradient colors={[theme.gradient[0], theme.gradient[1]]} style={{ flex: 1 }}>
        
        {/* Burbujas de fondo */}
        <View style={{ position: 'absolute', width: '100%', height: '30%' }}>
          <FloatingOrb size={100} duration={4000} delay={0} startPos={{ top: '10%', left: '5%' }} />
          <FloatingOrb size={140} duration={5000} delay={500} startPos={{ top: '5%', right: '10%' }} />
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingTop: '20%'}}>
          
          {/* Cabecera */}
          <View style={{ paddingHorizontal: 30, marginBottom: 30 }}>
            <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>¿Qué tipo de usuario eres?</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, marginTop: 5 }}>
              Puedes cambiar de rol en tu perfil cuando quieras.
            </Text>
          </View>

          {/* Contenedor Blanco */}
          <View style={{ 
            backgroundColor: '#F8F9FA', 
            padding: 25, 
            borderTopLeftRadius: 40, 
            borderTopRightRadius: 40, 
            minHeight: height * 0.55 
          }}>
            
            {roles.map((role) => (
              <TouchableOpacity 
                key={role.id}
                onPress={() => router.push(role.route)}
                style={styles.card}
              >
                <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
                  {role.icon}
                </View>
                
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>{role.title}</Text>
                  <Text style={{ fontSize: 13, color: '#777', marginTop: 2 }}>{role.desc}</Text>
                </View>

                <ChevronRight size={20} color="#CCC" />
              </TouchableOpacity>
            ))}

            {/* Footer de Soporte */}
            <View style={{ marginTop: '12%', alignItems: 'center', paddingBottom: '40%' }}>
              <Text style={{ color: '#999', fontSize: 14 }}>¿Necesitas ayuda para ingresar?</Text>
              <TouchableOpacity>
                <Text style={{ color: theme.primary, fontWeight: 'bold', marginTop: 5 }}>Contactar con soporte</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </LinearGradient>
      <Volver route="/Login" color={'white'} style={{top:30, left:10}}/>
    </SafeAreaView>
  );
}

const styles = {
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 25,
    marginBottom: 15,
    // Sombras
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  }
};