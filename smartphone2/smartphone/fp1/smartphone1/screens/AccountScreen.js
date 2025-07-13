import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from './ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { getDatabase, ref, get, set } from 'firebase/database'; // Firebase integration

const AccountScreen = () => {
    const navigation = useNavigation();
    const { currentTheme } = useContext(ThemeContext);
    const [profileImage, setProfileImage] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        loadProfileImage();
    }, []);

    const loadProfileImage = async () => {
        try {
            const image = await AsyncStorage.getItem('profileImage');
            if (image !== null) {
                setProfileImage(image);
            }
        } catch (e) {
            console.error('Error loading profile image:', e);
        }
    };

    const pickImage = async () => {
        let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Gallery ko access karne ki permission chahiye!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled) {
            const selectedImageUri = result.assets[0].uri;
            setProfileImage(selectedImageUri);
            await saveProfileImage(selectedImageUri);
            Alert.alert('Image Updated', 'Profile image has been updated successfully!', [{ text: 'OK' }]);
        }
    };

    const saveProfileImage = async (uri) => {
        try {
            await AsyncStorage.setItem('profileImage', uri);
        } catch (e) {
            console.error('Error saving profile image:', e);
        }
    };

    const confirmDeleteAccount = async () => {
        try {
            const loggedInUsername = await AsyncStorage.getItem('loggedInUsername');
            if (loggedInUsername !== username) {
                Alert.alert('Error', 'You can only delete the account you are currently logged into.');
                return;
            }

            const db = getDatabase();
            const sanitizedUsername = sanitizeUsername(username);
            const userRef = ref(db, `users/${sanitizedUsername}`);
            const snapshot = await get(userRef);
            if (snapshot.exists()) {
                const userData = snapshot.val();
                if (userData.password === password) {
                    await set(ref(db, `users/${sanitizedUsername}`), null);
                    await AsyncStorage.clear();
                    Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
                    setShowDeleteModal(false);
                    navigation.navigate('Login');
                } else {
                    Alert.alert('Error', 'Invalid password. Please try again.');
                }
            } else {
                Alert.alert('Error', 'User  not found. Please check your username.');
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            Alert.alert('Error', 'There was an error deleting your account. Please try again later.');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: currentTheme.primary }]}>
            <View style={styles.profileContainer}>
                <View style={[styles.circleContainer, { borderColor: currentTheme.accent }]}>
                    {profileImage ? (
                        <Image
                            source={{ uri: profileImage }}
                            style={styles.profileImage}
                        />
                    ) : (
                        // Show only the camera icon when no profile image is set
                        <TouchableOpacity style={styles.emptyProfile} onPress={pickImage}>
                         {/* <Ionicons name="camera" size={60} color={currentTheme.accent} /> */}
                        </TouchableOpacity>
                    )}
                    {profileImage && (
                        <TouchableOpacity style={styles.cameraIcon} onPress={pickImage}>
                            <Ionicons name="camera" size={30} color={currentTheme.accent} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <Text style={[styles.name, { color: currentTheme.accent }]}>Jaas</Text>
            <Text style={[styles.appName, { color: currentTheme.accent }]}>HeavenHub</Text>
            <Text style={[styles.tagline, { color: currentTheme.accent }]}>
                Your secure haven for encrypted communication and data protection.
            </Text>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: currentTheme.accent }]}
                onPress={() => navigation.navigate('ChangeEmail')}
            >
                <Text style={[styles.buttonText, { color: currentTheme.primary }]}>Change Email</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: currentTheme.accent }]}
                onPress={() => navigation.navigate('Signup')}
            >
                <Text style={[styles.buttonText, { color: currentTheme.primary }]}>Add Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: currentTheme.accent }]}
                onPress={() => setShowDeleteModal(true)}
            >
                <Text style={[styles.buttonText, { color: currentTheme.primary }]}>Delete Account</Text>
            </TouchableOpacity>

            {/* Delete Account Modal */}
            <Modal
                transparent={true}
                visible={showDeleteModal}
                animationType="slide"
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Confirm Account Deletion</Text>
                        <TextInput
                            placeholder="Username"
                            style={styles.input}
                            value={username}
                            onChangeText={setUsername}
                        />
                        <TextInput
                            placeholder="Password"
                            style={styles.input}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: currentTheme.accent }]}
                                onPress={confirmDeleteAccount}
                            >
                                <Text style={{ color: currentTheme.primary }}>Delete</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: currentTheme.accent }]}
                                onPress={() => setShowDeleteModal(false)}
                            >
                                <Text style={{ color: currentTheme.primary }}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    profileContainer: { alignItems: 'center', marginBottom: 20, marginTop: 60 },
    circleContainer: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 3,
        overflow: 'hidden',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImage: { width: '100%', height: '100%', borderRadius: 75 },
    cameraIcon: { position: 'absolute', bottom: 10, right: 10, borderRadius: 50, padding: 8 },
    name: { fontSize: 32, fontWeight: '900', textAlign: 'center', marginTop: 10 },
    appName: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginTop: 5 },
    tagline: { fontSize: 16, textAlign: 'center', marginVertical: 20 },
    button: { borderRadius: 5, paddingVertical: 12, marginVertical: 10, alignItems: 'center' },
    buttonText: { fontSize: 18, fontWeight: 'bold' },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    input: { width: '100%', padding: 10, borderBottomWidth: 1, marginVertical: 10 },
    modalButtons: { flexDirection: 'row', marginTop: 20 },
    modalButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, marginHorizontal: 10 },
    emptyProfile: {
        width: 150,
        height: 150,
        borderRadius: 75,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AccountScreen;
