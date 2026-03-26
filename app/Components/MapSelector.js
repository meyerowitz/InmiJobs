import React, { useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

export default function MapSelector({ initialLocation, onLocationSelect }) {
  const webViewRef = useRef(null);

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; touch-action: none; }
        #map { height: 100vh; width: 100vw; background: #f0f0f0; }
        /* Estilo para que el marcador se vea bien en móviles */
        .leaflet-marker-icon { filter: drop-shadow(0px 3px 3px rgba(0,0,0,0.4)); }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {
          zoomControl: false,
          attributionControl: false,
          dragging: true,
          touchZoom: true,
          scrollWheelZoom: true,
          tap: false // Importante para evitar conflictos de gestos en móviles
        }).setView([${initialLocation.latitude}, ${initialLocation.longitude}], 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        var marker = L.marker([${initialLocation.latitude}, ${initialLocation.longitude}], {
          draggable: true
        }).addTo(map);

        function sendCoords(lat, lng) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            latitude: lat,
            longitude: lng
          }));
        }

        map.on('click', function(e) {
          var lat = e.latlng.lat;
          var lng = e.latlng.lng;
          marker.setLatLng([lat, lng]);
          sendCoords(lat, lng);
        });

        marker.on('dragend', function(e) {
          var lat = marker.getLatLng().lat;
          var lng = marker.getLatLng().lng;
          sendCoords(lat, lng);
        });

        sendCoords(${initialLocation.latitude}, ${initialLocation.longitude});
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            onLocationSelect(data);
          } catch (e) {
            console.error(e);
          }
        }}
        style={styles.map}
        // PROPIEDADES CLAVE PARA MOVIMIENTO:
        scrollEnabled={false} 
        nestedScrollEnabled={true} // Permite que funcione dentro del ScrollView del modal
        domStorageEnabled={true}
        javaScriptEnabled={true}
        startInLoadingState={true}
        renderLoading={() => <ActivityIndicator style={StyleSheet.absoluteFill} size="large" color="#2374c4" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    height: 300, // Aumenté un poco el alto para que sea más fácil manipularlo
    width: '100%', 
    borderRadius: 20, 
    overflow: 'hidden', 
    backgroundColor: '#f0f0f0', 
    borderWidth: 1, 
    borderColor: '#ccc',
    marginBottom: 10
  },
  map: { flex: 1 }
});