import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, Modal, Image, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { storage, auth } from '../firebase'; // Ensure you have your Firebase setup correctly
import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { useNavigation } from '@react-navigation/native';
import CryptoJS from 'react-native-crypto-js';
import { ThemeContext } from './ThemeContext'; // Import ThemeContext

const ImagesScreen = ({ route }) => {
    const { currentTheme } = useContext(ThemeContext); // Access the current theme
    const [media, setMedia] = useState([]);
    const [menuVisible, setMenuVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const numColumns = 3;
    const navigation = useNavigation();

    const loginType = route?.params?.loginType || "real";
    const encryptionKey = 'mycustomkeyjaveria';

    useEffect(() => {
        const user = auth.currentUser ;
        if (user) {
            console.log('User  logged in:', user.email);
            loadMediaFromStorage();
        } else {
            console.log('No user logged in, navigating to DecoyLogin');
            navigation.navigate('DecoyLogin');
        }
    }, []);

    const loadMediaFromStorage = async () => {
        const user = auth.currentUser ;
        if (!user) {
            console.error('No user is logged in.');
            setLoading(false);
            return;
        }

        const userEmail = user.email.replace('@', '').replace('.', '');
        const userFolderRef = ref(storage, `users/${userEmail}/Images/`);

        try {
            console.log('Loading media from:', userFolderRef.fullPath);
            const dataResult = await listAll(userFolderRef);
            console.log('Found items:', dataResult.items.length);

            const decryptedMedia = await Promise.all(dataResult.items.map(async (item) => {
                const url = await getDownloadURL(item);
                console.log('Downloading from URL:', url);

                const response = await FileSystem.downloadAsync(url, FileSystem.cacheDirectory + `/${item.name}`);
                const encryptedData = await FileSystem.readAsStringAsync(response.uri);
                console.log('Encrypted data length:', encryptedData.length);

                // Decrypt
                const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
                const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
                if (!decryptedData || decryptedData.length < 100) {
                    console.error('Decryption failed or invalid data for:', item.name);
                    return null;
                }

                const localUri = `${FileSystem.cacheDirectory}/${item.name.split('.')[0]}_decrypted.jpg`;
                await FileSystem.writeAsStringAsync(localUri, decryptedData, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                console.log('Decrypted image saved to:', localUri);

                return {
                    uri: localUri,
                    userName: user.displayName || "Anonymous",
                    userEmail: user.email,
                    userId: user.uid,
                    realData: loginType === "real",
                    decoyData: loginType === "decoy"
                };
            }));

            const validMedia = decryptedMedia.filter(item => item !== null);
            console.log('Valid media items:', validMedia.length);
            setMedia(validMedia);
        } catch (e) {
            console.error('Error loading media:', e);
            Alert.alert('Error', 'Failed to load images: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const pickMedia = async () => {
        console.log('Picking media...');
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                console.log('Permission denied');
                Alert.alert('Permission Denied', 'Permission to access gallery is required!');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
            });

            console.log('Image picker result:', result);

            if (!result.canceled && result.assets && result.assets.length > 0) {
                console.log('Image selected:', result.assets[0].uri);
                await uploadImageToFirebase(result.assets[0].uri);
            } else {
                console.log('Image picking canceled or no assets');
            }
        } catch (error) {
            console.error('Error in pickMedia:', error);
            Alert.alert('Error', 'Failed to pick image: ' + error.message);
        }
    };

    const uploadImageToFirebase = async (uri) => {
        const user = auth.currentUser ;
        if (!user) {
            console.log('No user logged in');
            Alert.alert('Error', 'You need to log in first!');
            return;
        }

        const userEmail = user.email.replace('@', '').replace('.', '');
        const userFolderRef = ref(storage, `users/${userEmail}/Images/`);
        const imageRef = ref(userFolderRef, `${Date.now()}.jpg`);

        try {
            console.log('Reading image from URI:', uri);
            const binaryData = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            console.log('Original base64 length:', binaryData.length);

            // Encrypt
            const encrypted = CryptoJS.AES.encrypt(binaryData, encryptionKey);
            const encryptedData = encrypted.toString();
            console.log('Encrypted data length:', encryptedData.length);

            // Verify encryption
            const decryptedTest = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
            const decryptedTestData = decryptedTest.toString(CryptoJS.enc.Utf8);
            console.log('Decrypted test data length:', decryptedTestData.length);
            if (decryptedTestData !== binaryData) {
                console.error('Encryption/Decryption mismatch detected!');
            }

            // Convert to Blob
            const encryptedBlob = new Blob([encryptedData], { type: 'application/octet-stream' });

            // Upload
            console.log('Uploading to:', imageRef.fullPath);
            await uploadBytes(imageRef, encryptedBlob);

            const newImageUri = await getDownloadURL(imageRef);
            console.log('Uploaded image URL:', newImageUri);

            // Decrypt for display
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
            const decryptedBase64 = decryptedBytes.toString(CryptoJS.enc.Utf8);
            if (!decryptedBase64 || decryptedBase64.length < 100) {
                console.error('Decryption failed or invalid data for new image');
                return;
            }

            const localUri = `${FileSystem.cacheDirectory}new_decrypted_${Date.now()}.jpg`;
            await FileSystem.writeAsStringAsync(localUri, decryptedBase64, {
                encoding: FileSystem.EncodingType.Base64,
            });
            console.log('Decrypted image saved to:', localUri);

            const newImage = {
                uri: localUri,
                userName: user.displayName || "Anonymous",
                userEmail: user.email,
                userId: user.uid,
                realData: loginType === "real",
                decoyData: loginType === "decoy"
            };

            setMedia(prevMedia => {
                const updatedMedia = [...prevMedia, newImage];
                console.log('Updated media:', updatedMedia.map(item => ({ uri: item.uri, name: item.userName })));
                return updatedMedia;
            });
            Alert.alert('Success', 'Image uploaded successfully!');
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Error', 'Failed to upload image: ' + error.message);
        }
    };

    const openFullScreenImage = (uri) => {
        console.log('Opening full screen image:', uri);
        setSelectedImage(uri);
        setModalVisible(true);
    };

    const closeFullScreenImage = () => {
        setModalVisible(false);
        setSelectedImage(null);
    };

    const handleDualImagesPress = () => {
        Alert.alert(
            "Dual Images",
            "Do you want to view dual space images? You need to first log in.",
            [
                { text: "Cancel", onPress: () => setMenuVisible(false), style: "cancel" },
                { text: "OK", onPress: () => navigation.navigate('DecoyLogin') }
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: currentTheme.primary }]}>
            <View style={styles.header}>
                <Text style={[styles.appName, { color: currentTheme.accent }]}>Images</Text>
                <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
                    <MaterialIcons name="more-vert" size={24} color={currentTheme.accent} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                media.length > 0 ? (
                    <FlatList
                        data={media}
                        keyExtractor={(item, index) => `${item.userId}-${index}`}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => openFullScreenImage(item.uri)}
                                style={styles.mediaContainer}
                            >
                                <Image
                                    source={{ uri: item.uri }}
                                    style={styles.image}
                                    onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                                    onLoadStart={() => console.log('Image loading started for:', item.uri)}
                                    onLoadEnd={() => console.log('Image load ended for:', item.uri)}
                                    onLoad={() => console.log('Image loaded successfully:', item.uri)}
                                />
                            </TouchableOpacity>
                        )}
                        numColumns={numColumns}
                        extraData={media}
                    />
                ) : (
                    <View style={styles.noImagesContainer}>
                        <Text style={[styles.noImagesText, { color: currentTheme.accent }]}>No images available yet.</Text>
                    </View>
                )
            )}

            <Modal visible={modalVisible} transparent={true} animationType="fade">
                <View style={styles.fullScreenModal}>
                    <TouchableOpacity onPress={closeFullScreenImage} style={styles.closeModalButton}>
                        <MaterialIcons name="close" size={30} color="#FFFFFF" />
                    </TouchableOpacity>
                    {selectedImage && (
                        <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} resizeMode="contain" />
                    )}
                </View>
            </Modal>

            <Modal visible={menuVisible} transparent={true} animationType="fade">
                <View style={styles.popupBackground}>
                    <View style={styles.popupMenu}>
                        <TouchableOpacity onPress={pickMedia} style={styles.popupOption}>
                            <Text style={[styles.popupText, { color: currentTheme.accent }]}>Add Image</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDualImagesPress} style={styles.popupOption}>
                            <Text style={[styles.popupText, { color: currentTheme.accent }]}>Dual Images</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setMenuVisible(false)} style={styles.closeButton}>
                            <Text style={[styles.closeButtonText, { color: currentTheme.accent }]}>Close</Text>
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
        padding: 30,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    menuButton: {
        alignSelf: 'flex-end',
    },
    mediaContainer: {
        flex: 1,
        margin: 5,
    },
    image: {
        width: '100%',
        height: 100,
        borderRadius: 10,
    },
    fullScreenModal: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    closeModalButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 1,
    },
    fullScreenImage: {
        width: '100%',
        height: '100%',
    },
    popupBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    popupMenu: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    popupOption: {
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#1F5460',
        borderRadius: 10,
    },
 popupText: {
        color: '#FFF',
        fontSize: 16,
    },
    closeButton: {
        padding: 10,
        marginTop: 10,
        backgroundColor: '#FF5F5F',
        borderRadius: 10,
    },
    closeButtonText: {
        color: '#FFF',
        fontSize: 16,
    },
    noImagesContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
    },
    noImagesText: {
        fontSize: 18,
        color: '#888',
    },
});

export default ImagesScreen;