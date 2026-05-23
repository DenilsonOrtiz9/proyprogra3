import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import OrderListScreen from './src/screens/OrderListScreen';
import CreateOrderScreen from './src/screens/CreateOrderScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';
import ClientTrackingScreen from './src/screens/ClientTrackingScreen';
import LoginScreen from './src/screens/LoginScreen';
import UserManagementScreen from './src/screens/UserManagementScreen';
import { AuthProvider } from './src/services/AuthContext';
import { ThemeProvider, useTheme } from './src/services/ThemeContext';
import { StatusBar } from 'expo-status-bar';

const Stack = createNativeStackNavigator();

function Navigation() {
  const { isDark, colors } = useTheme();

  const CustomDefaultTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
    },
  };

  const CustomDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <NavigationContainer theme={isDark ? CustomDarkTheme : CustomDefaultTheme}>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerShadowVisible: false,
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'LUDERO IT', headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Iniciar Sesión' }} />
        <Stack.Screen name="UserManagement" component={UserManagementScreen} options={{ title: 'Gestión de Usuarios' }} />
        <Stack.Screen 
          name="OrderList" 
          component={OrderListScreen} 
          options={{ title: 'Gestión de Órdenes' }} 
        />
        <Stack.Screen name="CreateOrder" component={CreateOrderScreen} options={{ title: 'Nueva Orden' }} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Detalle de Orden' }} />
        <Stack.Screen name="ClientTracking" component={ClientTrackingScreen} options={{ title: 'Seguimiento' }} />
      </Stack.Navigator>
      <StatusBar style={isDark ? "light" : "dark"} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </ThemeProvider>
  );
}
