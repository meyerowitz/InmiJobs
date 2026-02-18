import { Stack } from "expo-router";
import { ThemeProvider } from './Components/Temas_y_colores/ThemeContext';
import { UserProvider } from './Components/Data/DataProvider';
import React from "react";
export default function RootLayout() {
  return (
  
    <ThemeProvider>
      <UserProvider>
        <Stack screenOptions={{headerShown:false}} >
        <Stack.Screen
        name="index"
        options={{
          animation: "none", // Animación suave para la entrada
        }}
      />
        <Stack.Screen
        name="Login"
        options={{
          animation: "slide_from_right", // Esta subirá como un panel
        }}
      />
       <Stack.Screen
        name="Register"
        options={{
          animation: "slide_from_right", // Esta subirá como un panel
        }}
      />
       <Stack.Screen
        name="ChooseaRol"
        options={{
          animation: "slide_from_right", // Esta subirá como un panel
        }}
      />
       <Stack.Screen
        name="pages/Navigation"
        options={{
          animation: "slide_from_right", // Esta subirá como un panel
        }}
      />
      <Stack.Screen
        name="pages/home"
        options={{
          animation: "slide_from_right", // Esta subirá como un panel
        }}
      />
       <Stack.Screen
        name="pages/profile"
        options={{
          animation: "slide_from_right", // Esta subirá como un panel
        }}
      />
       <Stack.Screen
        name="pages/feed"
        options={{
          animation: "slide_from_right", // Esta subirá como un panel
        }}
      />
       <Stack.Screen
        name="pages/home/post"
        options={{
          animation: "slide_from_right", // Esta subirá como un panel
        }}
      />
       <Stack.Screen
        name="pages/olvide/forgot_password"
        options={{
          animation: "slide_from_right", // Esta subirá como un panel
        }}
      />
      <Stack.Screen
        name="pages/olvide/code_password"
        options={{
          animation: "slide_from_right", // Esta subirá como un panel
        }}
      />
      <Stack.Screen
        name="pages/olvide/reset_password"
        options={{
          animation: "slide_from_right", // Esta subirá como un panel
        }}
      />
        </Stack>
      </UserProvider>
     </ThemeProvider>
  );
}
