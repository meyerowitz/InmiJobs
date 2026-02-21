import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../Components/Temas_y_colores/ThemeContext';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TextInput, TouchableOpacity , StatusBar, Keyboard,Modal} from 'react-native';
import { SafeAreaView,useSafeAreaInsets } from "react-native-safe-area-context";
export default function StatusBar_Fix(light){
    const { theme, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const[Light,SetLight]= useState(light);
    return(<>
                    <LinearGradient
                      colors={[theme.gradient[0], theme.gradient[1]]}
                      style={{backgroundColor:'red', height:insets.top+1, width:'100%', marginTop:-insets.top}}
                    ></LinearGradient>
    </>
    
);
}