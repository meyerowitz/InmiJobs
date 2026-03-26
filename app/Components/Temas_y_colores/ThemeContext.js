import React, { createContext, useState, useContext } from 'react';
import { useColorScheme } from 'react-native';
import {lightTheme, darkTheme} from './Themes';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const deviceTheme = useColorScheme(); // Detecta el modo del sistema (iOS/Android)
  const [isDark, setIsDark] = useState(deviceTheme === 'dark');

  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);