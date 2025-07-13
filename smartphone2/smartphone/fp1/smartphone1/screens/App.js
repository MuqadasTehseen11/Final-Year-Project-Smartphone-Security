import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider } from './screens/ThemeContext';
import ThemeSelectionScreen from './screens/ThemeSelectionScreen';

// Import your other screens here
import HomeScreen from './screens/HomeScreen';
import FolderScreen from './screens/FolderScreen';
import NotesScreen from './screens/NotesScreen';
import ImagesScreen from './screens/ImagesScreen';
import VideosScreen from './screens/VideosScreen';
import IntruderScreen from './screens/IntruderScreen';
import SettingsScreen from './screens/SettingsScreen';
import AccountScreen from './screens/AccountScreen';
import NotificationsScreen from './screens/NotificationScreen';
import PrivacyScreen from './screens/PrivacyScreen';
import AboutScreen from './screens/AboutScreen';
import ExistingPass from './screens/ExistingPass';
import NewPassword from './screens/NewPassword';
import HelpScreen from './screens/HelpScreen';
import TheftScreen from './screens/TheftScreen';
import MyFolderScreen from './screens/MyFolderScreen';
import CreationFolder from './screens/CreationFolder';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignupScreen';
import calculator from './screens/calculator';
import { auth, db } from './firebase';  // Importing auth and db from firebase.js
import { onAuthStateChanged } from 'firebase/auth';
import { ref, set, onValue } from 'firebase/database';

const Stack = createStackNavigator();

function App() {
    return (
        <ThemeProvider>
            <NavigationContainer>
                <Stack.Navigator initialRouteName={"calculator"}>
                    {/* Add your screens here */}
                    <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="FolderScreen" component={FolderScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="ImagesScreen" component={ImagesScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="VideosScreen" component={VideosScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="NotesScreen" component={NotesScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="IntruderScreen" component={IntruderScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="SettingsScreen" component={SettingsScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="AccountScreen" component={AccountScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="NotificationScreen" component={NotificationsScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="ThemeSelectionScreen" component={ThemeSelectionScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="PrivacyScreen" component={PrivacyScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="AboutScreen" component={AboutScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="ExistingPass" component={ExistingPass} options={{ headerShown: false }} />
                    <Stack.Screen name="NewPassword" component={NewPassword} options={{ headerShown: false }} />
                    <Stack.Screen name="HelpScreen" component={HelpScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="TheftScreen" component={TheftScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="MyFolderScreen" component={MyFolderScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="CreationFolder" component={CreationFolder} options={{ headerShown: false }} />
                    <Stack.Screen name="Calculator" component={CalculatorApp} options={{ headerShown: false }} />
                    <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Signup" component={SignUpScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </ThemeProvider>
    );
}

export default App;
