import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Image, StyleSheet, Alert, BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Navigation import
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';

const DualImages = () => {
  const [media, setMedia] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const userFolderName = 'fakeData';
  const navigation = useNavigation(); // Navigation instance

  const fetchImages = async () => {
    const userFolderRef = ref(storage, `users/${userFolderName}/`);
    try {
      const result = await listAll(userFolderRef);
      const imageUrls = await Promise.all(result.items.map((itemRef) => getDownloadURL(itemRef)));
      setMedia(imageUrls);
    } catch (error) {
      console.error('Error fetching images:', error);
      Alert.alert('Error', 'Failed to fetch images. Please try again.', [{ text: 'OK' }]);
    }
  };

  const pickImage = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission to access gallery is required!");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      uploadImageToFirebase(result.assets[0].uri);
    }
  };

  const uploadImageToFirebase = async (uri) => {
    const userFolderRef = ref(storage, `users/${userFolderName}/`);
    const imageRef = ref(userFolderRef, `${Date.now()}.jpg`);
    const response = await fetch(uri);
    const blob = await response.blob();
    try {
      await uploadBytes(imageRef, blob);
      fetchImages();
      Alert.alert('Success', 'Image uploaded successfully!', [{ text: 'OK' }]);
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.', [{ text: 'OK' }]);
    }
  };

  useEffect(() => {
    fetchImages();

    // BackHandler for going back to SelectionScreen
    const backAction = () => {
      navigation.navigate('SelectionScreen');
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove(); // Cleanup on unmount
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dual Images</Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
          <MaterialIcons name="more-vert" size={24} color="#00FF00" />
        </TouchableOpacity>
      </View>

      <View style={styles.imagesContainer}>
        {media.length === 0 ? (
          <Text style={styles.noImagesText}>No images added yet.</Text>
        ) : (
          media.map((item, index) => (
            <Image key={index} source={{ uri: item }} style={styles.image} />
          ))
        )}
      </View>

      <Modal visible={menuVisible} transparent={true} animationType="fade">
        <View style={styles.popupBackground}>
          <View style={styles.popupMenu}>
            <TouchableOpacity onPress={pickImage} style={styles.popupOption}>
              <Text style={styles.popupText}>Add Image</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMenuVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'black',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00FF00',
    marginTop: 44,
  },
  menuButton: {
    marginRight: 10,
    marginTop: 44,
  },
  imagesContainer: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  noImagesText: {
    textAlign: 'center',
    color: '#00FF00',
    fontSize: 16,
  },
  popupBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  popupMenu: {
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    backgroundColor: 'black',
    borderWidth: 2,
    borderColor: '#00FF00',
  },
  popupOption: {
    padding: 10,
    backgroundColor: '#00FF00',
    borderRadius: 10,
    marginBottom: 10,
  },
  popupText: {
    color: 'black',
    fontSize: 16,
  },
  closeButton: {
    padding: 10,
    marginTop: 10,
    backgroundColor: 'red',
    borderRadius: 10,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  }
});

export default DualImages;
