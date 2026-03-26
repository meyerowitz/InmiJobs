import React,{useEffect} from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import { Canvas, RadialGradient, Rect, vec, Group } from "@shopify/react-native-skia";

const { width } = Dimensions.get('window');

export default function Gradient() {
  // Configuración Izquierda (Naranja)
  const leftCenter = vec(0, 150); // Pegado al borde 0 de la izquierda
  const leftRadius = width * 0.8;

  // Configuración Derecha (Morado/Azul)
  const rightCenter = vec(width, 170); // Pegado al borde final de la derecha
  const rightRadius = width * 0.5;

  return (
    <View style={styles.container} pointerEvents="none"> 
      <Canvas style={{ flex: 1 }}>
        {/* Usamos un Rect para cada gradiente para que se mezclen correctamente */}
        
        {/* 1. GRADIENTE IZQUIERDA (Capa inferior) */}
        <Rect x={0} y={0} width={width} height={200}>
          <RadialGradient
            c={leftCenter}
            r={leftRadius}
            colors={["rgba(21, 250, 238, 0.36)", "rgba(255, 158, 67, 0)", "transparent"]}
            positions={[0, 0.5, 1]} 
          />
        </Rect>

        {/* 2. GRADIENTE DERECHA (Se mezcla con el anterior) */}
        <Rect x={0} y={0} width={width} height={200}>
          <RadialGradient
            c={rightCenter}
            r={rightRadius}
            colors={["rgba(202, 46, 254, 0.4)", "rgba(67, 224, 255, 0.15)", "transparent"]}
            positions={[0, 0.5, 1]} 
          />
        </Rect>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: -40, // Bajado para que solo suba el resplandor
    left: 0,
    right: 0,
    height: 180,
    zIndex: 5,
  },
});