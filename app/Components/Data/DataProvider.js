import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Cargar la sesión desde el almacenamiento al iniciar la app
  const loadSession = async () => {
    try {
      const session = await AsyncStorage.getItem('@session');
      if (session) {
        setUserData(JSON.parse(session));
      }
    } catch (error) {
      console.error("Error al cargar sesión:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, []);

  // 2. Función para cerrar sesión
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@session');
      setUserData(null);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <UserContext.Provider value={{ 
      userData, 
      setUserData, // Se usa en el Login al validar con éxito
      isLoading, 
      logout 
    }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook personalizado para acceder a los datos
export const useUser = () => useContext(UserContext);