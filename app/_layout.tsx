import { Stack } from "expo-router";
import { ThemeProvider } from './Components/Temas_y_colores/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{headerShown:false}} />
    </ThemeProvider>
  );
}
