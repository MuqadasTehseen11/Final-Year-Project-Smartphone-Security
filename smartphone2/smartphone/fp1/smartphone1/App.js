import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider } from './screens/ThemeContext';
import { ImageProvider } from './screens/ImageContext';
//import { ShakeProvider } from './ShakeDetectionContext'; 

import ThemeSelectionScreen from './screens/ThemeSelectionScreen';
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
import FilesScreen from './screens/FilesScreen';
import AboutScreen from './screens/AboutScreen';
import ExistingPass from './screens/ExistingPass';
import NewPassword from './screens/NewPassword';
import HelpScreen from './screens/HelpScreen';
import MotionDetection from './screens/MotionDetection';
import MyFolderScreen from './screens/MyFolderScreen';
import CreationFolder from './screens/CreationFolder';
import Dualspaceemail from './screens/Dualspaceemail';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import DualSpace from './screens/DualSpace';
import Calculator from './screens/calculator';
import ChangeEmail from './screens/ChangeEmail';
import CameraScreen from './screens/CameraScreen';
import DecoyLogin from './screens/DecoyLogin';
import DualImages from './screens/DualImages';
import DualVideos from './screens/DualVideos';
import DualNotes from './screens/DualNotes';
import SelectionScreen from './screens/SelectionScreen';
import DualFiles from './screens/DualFiles';
import GetStarted from './screens/GetStarted';
import Screen3 from './screens/Screen3';
import SecurePrivate from './screens/SecurePrivate';
import Screen4 from './screens/Screen4';
import Screen5 from './screens/Screen5';
import Screen6 from './screens/Screen6';
import ShakeDetectionContext from './screens/ShakeDetectionContext';
import FloatingButton from './screens/FloatingButton';

import { auth, database } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, set, onValue } from 'firebase/database';

const Stack = createStackNavigator();

function App() {
  const [user, setUser] = useState(null);
  const [isSplashVisible, setSplashVisible] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('GetStarted');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        readUserData(currentUser.uid);
      }
    });

    const timer = setTimeout(() => {
      setSplashVisible(false);
    }, 3000);

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const writeUserData = (userId, name, email) => {
    set(ref(database, 'users/' + userId), {
      username: name,
      email: email,
    });
  };

  const readUserData = (userId) => {
    const userRef = ref(database, 'users/' + userId);
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      console.log("User Data:", data);
    });
  };

  const hiddenScreens = [
    'GetStarted',
    'Screen3',
    'Screen4',
    'SecurePrivate',
    'Screen5',
    'Screen6',
    'Splash',
    'calculator',
    'Login',
    'Signup',
    'DecoyLogin',
    'DualImages',
    'DualVideos',
    'DualNotes',
    'DualFiles',
    'SelectionScreen',
    'CameraScreen',
  ];

  const shouldShowFloatingButton = () => {
    return user !== null && !hiddenScreens.includes(currentScreen);
  };

  return (
    <ThemeProvider>
      <ImageProvider>
        <NavigationContainer
          onStateChange={(state) => {
            const currentRoute = state.routes[state.index];
            setCurrentScreen(currentRoute.name);
          }}
        >
          <Stack.Navigator
            initialRouteName={isSplashVisible ? 'GetStarted' : user ? 'Home' : 'Login'}
          >
            <Stack.Screen name="GetStarted" component={GetStarted} options={{ headerShown: false }} />
            <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="calculator" component={Calculator} options={{ headerShown: false }} />
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
            <Stack.Screen name="MotionDetection" component={MotionDetection} options={{ headerShown: false }} />
            <Stack.Screen name="MyFolderScreen" component={MyFolderScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CreationFolder" component={CreationFolder} options={{ headerShown: false }} />
            <Stack.Screen name="CameraScreen" component={CameraScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ChangeEmail" component={ChangeEmail} options={{ headerShown: false }} />
            <Stack.Screen name="FilesScreen" component={FilesScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Dualspaceemail" component={Dualspaceemail} options={{ headerShown: false }} />
            <Stack.Screen name="DecoyLogin" component={DecoyLogin} options={{ headerShown: false }} />
            <Stack.Screen name="DualSpace" component={DualSpace} options={{ headerShown: false }} />
            <Stack.Screen name="DualImages" component={DualImages} options={{ headerShown: false }} />
            <Stack.Screen name="DualVideos" component={DualVideos} options={{ headerShown: false }} />
            <Stack.Screen name="SelectionScreen" component={SelectionScreen} options={{ headerShown: false }} />
            <Stack.Screen name="DualNotes" component={DualNotes} options={{ headerShown: false }} />
            <Stack.Screen name="DualFiles" component={DualFiles} options={{ headerShown: false }} />
            <Stack.Screen name="Screen3" component={Screen3} options={{ headerShown: false }} />
            <Stack.Screen name="Screen4" component={Screen4} options={{ headerShown: false }} />
            <Stack.Screen name="Screen5" component={Screen5} options={{ headerShown: false }} />
            <Stack.Screen name="SecurePrivate" component={SecurePrivate} options={{ headerShown: false }} />
            <Stack.Screen name="Screen6" component={Screen6} options={{ headerShown: false }} />
          </Stack.Navigator>

          {shouldShowFloatingButton() && <FloatingButton />}
        </NavigationContainer>
      </ImageProvider>
    </ThemeProvider>
  );
}

export default App;
