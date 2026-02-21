import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Image, StatusBar } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import {useRouter} from 'expo-router';

const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Opacidad inicial 0
    const router = useRouter();
  useEffect(() => {
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => {
          
          router.replace('/Login'); 
        });
      }, 1000);
    });
  }, []);

  return (
    <>
       <StatusBar 
              barStyle={'dark-content'}
              backgroundColor={'red'} 
            />
    <SafeAreaView style={styles.container}>
           
      <Animated.Image
        source={require('../assets/img/imagotipo.png')} // Tu imagen aquí
        style={[{ width: 200,height: 300,}, { opacity: fadeAnim }]}
      />
    </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  image: {
    width: 200,
    height: 200,
  },
});

export default SplashScreen;