import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import ScannerScreen from './src/screens/ScannerScreen';
import CollectionScreen from './src/screens/CollectionScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Import icons
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName: keyof typeof Ionicons.glyphMap;

                if (route.name === 'Scanner') {
                  iconName = focused ? 'camera' : 'camera-outline';
                } else if (route.name === 'Collection') {
                  iconName = focused ? 'albums' : 'albums-outline';
                } else if (route.name === 'Profile') {
                  iconName = focused ? 'person' : 'person-outline';
                } else {
                  iconName = 'help-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#007AFF',
              tabBarInactiveTintColor: 'gray',
              headerStyle: {
                backgroundColor: '#007AFF',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            })}
          >
            <Tab.Screen 
              name="Scanner" 
              component={ScannerScreen}
              options={{ title: 'Scan Cards' }}
            />
            <Tab.Screen 
              name="Collection" 
              component={CollectionScreen}
              options={{ title: 'My Collection' }}
            />
            <Tab.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{ title: 'Profile' }}
            />
          </Tab.Navigator>
        </NavigationContainer>
        <StatusBar style="auto" />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
