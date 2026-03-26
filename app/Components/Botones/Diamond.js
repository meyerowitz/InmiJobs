import React, { useState } from 'react'; // Importamos useState
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Alert } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  interpolate,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '../Temas_y_colores/ThemeContext';

const Diamond = ({newPost}) => {
    
    const router= useRouter();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(0);
  const { theme, isDark } = useTheme();
  const MAX_UP = -40;
    const [isOpen, setIsOpen] = useState(false); 

  const slowSpringConfig = {
    damping: 25,
    stiffness: 150,
    mass: 2, // Bajé un poco la masa de 25 a 2 para que responda mejor al click pero siga suave
  };


  // Función para manejar el Click
  const toggleMenu = () => {
    if (isOpen) {
      translateY.value = withSpring(0, slowSpringConfig);
    } else {
      translateY.value = withSpring(MAX_UP, slowSpringConfig);
    }
    setIsOpen(!isOpen);
    newPost(true)
    setIsOpen(false);
    setTimeout(() => {
        // 3. Volver a la posición original
        translateY.value = withSpring(0, slowSpringConfig);
      }, 1000);
  };

  const animatedButtonStyle = useAnimatedStyle(() => {
    const rotation = interpolate(translateY.value, [0, MAX_UP], [45, 135]);
    return {
      transform: [
        { translateY: translateY.value },
        { rotate: `${rotation}deg` }
      ],
    };
  });

  const iconStyle = useAnimatedStyle(() => {
    const rotation = interpolate(translateY.value, [0, MAX_UP], [-45, -135]);
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });


  return (
    <View style={[styles.mainContainer, { bottom: 10 + insets.bottom , right:-70}]} pointerEvents="box-none">
      <Pressable onPress={toggleMenu}>
        <Animated.View style={[styles.diamondWrapper, animatedButtonStyle]}>
          <LinearGradient colors={[theme.gradient[0],theme.gradient[1]]} style={styles.diamond}>
            <Animated.View style={iconStyle}>
                <Ionicons name="add" size={28} color="#FFF" />
            </Animated.View>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </View>
  );
};
const styles = StyleSheet.create({
  mainContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
    width: 250, // Un poco más ancho para que no se corten los botones
    height: 120,
    justifyContent: 'flex-end',
  },
  optionsWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  optionCircle: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2374c4',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  touch: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  diamondWrapper: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  diamond: {
    width: 60,
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  optionText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  }
});

export default Diamond;