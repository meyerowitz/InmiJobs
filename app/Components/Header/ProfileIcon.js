import React, { useMemo } from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Canvas, Circle, Paint, LinearGradient, vec } from "@shopify/react-native-skia";

// Añadimos la prop hasStories (por defecto false)
export default function Icon({ uri, size = 34, hasStories = true, onPress }) {
  const strokeWidth = 5;
  const whiteRingWidth = 5;
  const containerSize = size + strokeWidth + whiteRingWidth;
  const center = containerSize / 2;
  const radiusColor = (containerSize - strokeWidth) / 2;
  const radiusWhite = radiusColor - (strokeWidth / 2);

  const randomGradient = useMemo(() => {
    const colorPalettes = [
      ["#ff4b2b", "#ff9f43", "#fecb2e"],
      ["#8E2DE2", "#4A00E0", "#00d4ff"],
      ["#fc466b", "#3f5efb", "#a8c0ff"],
      ["#FDBb2D", "#22C1C3", "#fccb90"],
    ];
    return colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
  }, []);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={{ width: containerSize, height: containerSize }}>
      <View style={styles.container}>
        
        <Canvas style={{ width: containerSize, height: containerSize, position: 'absolute' }}>
          {/* Fondo blanco para evitar transparencias negras */}
          <Circle cx={center} cy={center} r={radiusColor} color="white" />

          {/* Círculo de color (Degradado) */}
          <Circle cx={center} cy={center} r={radiusColor}>
            <Paint style="stroke" strokeWidth={strokeWidth} strokeCap="round">
              <LinearGradient
                start={vec(0, 0)}
                end={vec(containerSize, containerSize)}
                colors={randomGradient}
              />
              {/* LÓGICA CONDICIONAL: Solo aplica el punteado si hasStories es true */}
              {hasStories && <dashPathEffect intervals={[10, 6]} />}
            </Paint>
          </Circle>

          {/* Anillo de separación blanco */}
          <Circle cx={center} cy={center} r={radiusWhite}>
            <Paint style="stroke" strokeWidth={whiteRingWidth} color="white" />
          </Circle>
        </Canvas>

        <Image 
          source={{ uri: uri || 'https://via.placeholder.com/150' }} 
          style={{ 
            width: size, 
            height: size, 
            borderRadius: size / 2,
            backgroundColor: 'white',
          }} 
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});