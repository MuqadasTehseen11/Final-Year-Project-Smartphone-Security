import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function CameraScreen() {
  const navigation = useNavigation();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaLibraryPermissionResponse, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const [image, setImage] = useState(null);
  const cameraRef = useRef(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [hasCaptured, setHasCaptured] = useState(false); // prevent multiple captures

  const onCameraReady = () => {
    setIsCameraReady(true);
  };

  useEffect(() => {
    const autoCapture = async () => {
      if (
        isCameraReady &&
        cameraPermission?.granted &&
        mediaLibraryPermissionResponse?.status === 'granted' &&
        !hasCaptured
      ) {
        setHasCaptured(true); // Avoid multiple captures
        await takePicture();
      }
    };
    autoCapture();
  }, [isCameraReady, cameraPermission, mediaLibraryPermissionResponse]);

  if (!cameraPermission || !mediaLibraryPermissionResponse) {
    return <View />;
  }

  if (!cameraPermission.granted || mediaLibraryPermissionResponse.status !== 'granted') {
    return (
      <View style={styles.container}>
        <Text>We need camera and gallery permissions to continue.</Text>
        <TouchableOpacity style={styles.button} onPress={() => {
          requestCameraPermission();
          requestMediaLibraryPermission();
        }}>
          <Text style={styles.buttonText}>Grant Permissions</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const picture = await cameraRef.current.takePictureAsync();
        setImage(picture.uri);
        await AsyncStorage.setItem('intruderImage', picture.uri);
        navigation.replace('Login');
      } catch (err) {
        console.log('Error while taking the picture:', err);
      }
    }
  };

  return (
    <View style={styles.container}>
      {!image ? (
        <CameraView
          style={styles.camera}
          facing='front'
          ref={cameraRef}
          onCameraReady={onCameraReady}
        />
      ) : (
        <Image source={{ uri: image }} style={styles.camera} />
      )}
      <View style={styles.bottomControlsContainer}>
        {image && (
          <TouchableOpacity onPress={() => {
            setImage(null);
            setHasCaptured(false); // allow retake
          }}>
            <Text style={styles.buttonText}>Retake</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 30,
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  bottomControlsContainer: {
    height: 100,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
