import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import HeaderMap from '../Components/HeaderMap';
import { useUser } from '../Components/Data/DataProvider';
import { db } from '../../firebaseConfig'; 
import { collection, query, where, getDocs } from 'firebase/firestore';
import StatusBar_Fix from '../Components/StatusBar_fix';
import { SafeAreaView,useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function Map() {
  const { userData } = useUser();
  const router = useRouter();
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [htmlContent, setHtmlContent] = useState(null); // Estado para el contenido HTML

  // 1. Cargar el archivo HTML local como String (Solución para el error de Dominio)
  useEffect(() => {
    async function loadHtmlAsset() {
      try {
        const asset = Asset.fromModule(require('../../assets/map.html'));
        await asset.downloadAsync();
        const content = await FileSystem.readAsStringAsync(asset.localUri);
        setHtmlContent(content);
      } catch (error) {
        console.error("Error al cargar el asset del mapa:", error);
        Alert.alert("Error", "No se pudo cargar el archivo del mapa local.");
      }
    }
    loadHtmlAsset();
  }, []);

  // 2. Obtener ubicación
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'No podemos mostrarte en el mapa sin GPS.');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setUserLocation(location.coords);
    })();
  }, []);

  // 3. Cargar Jobs de Firebase
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const q = query(collection(db, "Post"), where("type", "==", "jobs"));
        const querySnapshot = await getDocs(q);
        const jobsArray = [];
        const coordinateTracker = {};

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.location) {
            let lat = data.location.latitude;
            let lon = data.location.longitude;

            const coordKey = `${lat.toFixed(5)},${lon.toFixed(5)}`;
            if (coordinateTracker[coordKey]) {
              coordinateTracker[coordKey] += 1;
              lon += 0.0001 * coordinateTracker[coordKey];
            } else {
              coordinateTracker[coordKey] = 1;
            }

            jobsArray.push({
              id: doc.id,
              lat: lat,
              lon: lon,
              userId: data.userId,
              title: data.description || "Oferta de trabajo",
              logo: (data.userImage || 'https://via.placeholder.com/150'),
              sector: data.sector || "General"
            });
          }
        });
        setJobs(jobsArray);
      } catch (error) {
        console.error("Error cargando empleos:", error);
      }
    };

    fetchJobs();
  }, []);

  // 4. Enviar datos al WebView cuando todo esté listo
  useEffect(() => {
    if (mapReady && userLocation && htmlContent) {
      sendInitialData();
    }
  }, [mapReady, userLocation, jobs, htmlContent]);

  const onMessage2 = (event) => {
    const message = event.nativeEvent.data;
    if (message === "MAP_LOADED") {
      setMapReady(true);
      setLoading(false);
    }
  };
  const onMessage3 = (event) => {
  const data = event.nativeEvent.data;
  
  // Si es el mensaje de carga inicial
  if (data === "MAP_LOADED") {
    setMapReady(true);
    setLoading(false);
    return;
  }

  // Si es el mensaje para ir al perfil/chat
  try {
    const message = JSON.parse(data);
    if (message.type === 'GO_TO_PROFILE') {
      const targetId = message.userId;
      const myId = userData?.id || userData?.uid;

      if (!targetId || targetId === myId) {
        Alert.alert("Aviso", "Este es tu propio post.");
        return;
      }

      // Generamos el chatId (la misma lógica que usas en otras pantallas)
      const combinedId = myId < targetId ? `${myId}_${targetId}` : `${targetId}_${myId}`;

      router.push({
        pathname: '/ChatScreen', // Asegúrate de que esta sea la ruta correcta a tu chat
        params: { 
          chatId: combinedId, 
          targetId: targetId 
        }
      });
    }
  } catch (e) {
    console.log("Mensaje de WebView no es JSON:", data);
  }
};
  const onMessage4 = (event) => {
    const rawData = event.nativeEvent.data;
    
    // 1. Manejo del mensaje simple (String)
    if (rawData === "MAP_LOADED") {
      setMapReady(true);
      setLoading(false);
      return;
    }

    // 2. Manejo del mensaje complejo (JSON)
    try {
      const message = JSON.parse(rawData);

      if (message.type === 'GO_TO_PROFILE') {
        const targetId = message.userId;
        const myId = userData?.id || userData?.uid;

        if (!targetId) {
          console.warn("No se recibió userId del marcador");
          return;
        }

        // Si el usuario es el mismo que está logueado
        if (targetId === myId) {
          Alert.alert("Tu publicación", "Estás viendo un empleo que tú mismo publicaste.");
          return;
        }

        // Lógica de ID de chat único (orden alfabilético para que sea el mismo canal para ambos)
        const combinedId = myId < targetId ? `${myId}_${targetId}` : `${targetId}_${myId}`;

        // Navegación al chat
        router.push({
          pathname: '/pages/Chat', // <-- Asegúrate de que esta ruta sea correcta en tu carpeta 'app'
          params: { 
            chatId: combinedId, 
            targetId: targetId 
          }
        });
      }
    } catch (e) {
      // Si llega algo que no es JSON y no es MAP_LOADED, lo ignoramos o lo logueamos
      console.log("Aviso: El mensaje recibido no es un objeto procesable:", rawData);
    }
  };
  const onMessage = (event) => {
    let rawData = event.nativeEvent.data;
    
    // 1. Si es el mensaje de carga, terminamos rápido
    if (rawData === "MAP_LOADED") {
      setMapReady(true);
      setLoading(false);
      return;
    }

    try {
      // Intentamos el parseo. Si rawData ya es un objeto (raro pero pasa), lo usamos directo.
      const message = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

      if (message && message.type === 'GO_TO_PROFILE') {
        const targetId = message.userId;
        const myId = userData?.id || userData?.uid;

        // Validaciones de seguridad
        if (!targetId) return;
        if (targetId === myId) {
          Alert.alert("Tu publicación", "Estás intentando contactarte a ti mismo.");
          return;
        }

        // Crear el ID de chat único (alfabético)
        const combinedId = myId < targetId ? `${myId}_${targetId}` : `${targetId}_${myId}`;

        console.log("Navegando al chat:", combinedId); // Para depuración

        router.push({
          pathname: '/pages/Chat', // Asegúrate de que esta sea la ruta real de tu archivo
          params: { 
            chatId: combinedId, 
            targetId: targetId 
          }
        });
      }
    } catch (e) {
      // Si falla el JSON.parse, intentamos buscar el ID manualmente como último recurso
      console.error("Error al procesar JSON, intentando recuperación manual:", e);
      
      if (rawData.includes("GO_TO_PROFILE")) {
        // Extracción manual del ID por si el JSON viene mal formado
        const match = rawData.match(/"userId":"([^"]+)"/);
        if (match && match[1]) {
          const targetId = match[1];
          const myId = userData?.id || userData?.uid;
          const combinedId = myId < targetId ? `${myId}_${targetId}` : `${targetId}_${myId}`;
          
          router.push({
            pathname: '/ChatScreen',
            params: { chatId: combinedId, targetId: targetId }
          });
        }
      }
    }
  };
  const sendInitialData = () => {
    if (!userLocation || !webViewRef.current) return;

    const lat = userLocation.latitude;
    const lon = userLocation.longitude;

    const currentUser = {
      id: userData?.id || userData?.uid || 'me',
      lat: lat,
      lon: lon,
      avatar: userData?.image || 'https://via.placeholder.com/150',
      color: '#1877f2',
      isMe: true 
    };

    const jsCode = `
      if (window.map) {
        map.setView([${lat}, ${lon}], 15);
        if (typeof renderUsers === 'function') renderUsers([${JSON.stringify(currentUser)}]);
        if (typeof renderJobs === 'function') renderJobs(${JSON.stringify(jobs)});
      }
      true;
    `;
    
    webViewRef.current.injectJavaScript(jsCode);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={'light-content'}/>
              <StatusBar_Fix></StatusBar_Fix>
      <HeaderMap />
      
      {htmlContent ? (
        <WebView
          ref={webViewRef}
          // Cambiamos 'source={mapHtml}' por el objeto con el string HTML
          source={{ html: htmlContent, baseUrl: '' }} 
          style={styles.map}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onMessage={onMessage}
          scrollEnabled={false} 
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          allowFileAccessFromFileURLs={true}
          mixedContentMode="always"
        />
      ) : (
        <View style={styles.loader}>
           <ActivityIndicator size="large" color="#1877f2" />
        </View>
      )}

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#1877f2" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { flex: 1, width: width, height: height },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  }
});