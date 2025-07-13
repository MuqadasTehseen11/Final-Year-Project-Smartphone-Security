import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, TextInput, Alert, Animated, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { Accelerometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from './ThemeContext';
import * as ImagePicker from 'expo-image-picker';

const HomeScreen = () => {
    const { currentTheme } = useContext(ThemeContext);
    const [modalVisible, setModalVisible] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [passwordMenuVisible, setPasswordMenuVisible] = useState(false);
    const [verifyPasswordModal, setVerifyPasswordModal] = useState(false);
    const [removePasswordModal, setRemovePasswordModal] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordHint, setPasswordHint] = useState('');
    const [inputPassword, setInputPassword] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [storedPasswords, setStoredPasswords] = useState({
        folder: null,
        notes: null,
        intruder: null
    });
    const [storedHints, setStoredHints] = useState({
        folder: '',
        notes: '',
        intruder: ''
    });
    const [wrongAttempts, setWrongAttempts] = useState({
        folder: 0,
        notes: 0,
        intruder: 0
    });
    const [shakeDetected, setShakeDetected] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);
    const intruderAnimation = useState(new Animated.Value(1))[0]; // Start with yellow
    const navigation = useNavigation();

    useEffect(() => {
        loadProfileImage();
        loadData();
    }, []);

    const loadProfileImage = async () => {
        try {
            const image = await AsyncStorage.getItem('profileImage');
            if (image !== null) {
                setProfilePicture(image);
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
            setProfilePicture(selectedImageUri);
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

    const loadData = async () => {
        try {
            const storedFolderPassword = await AsyncStorage.getItem('folderPasswordHome');
            const storedNotesPassword = await AsyncStorage.getItem('notesPassword');
            const storedIntruderPassword = await AsyncStorage.getItem('intruderPassword');
            const storedFolderHint = await AsyncStorage.getItem('folderPasswordHintHome');
            const storedNotesHint = await AsyncStorage.getItem('notesPasswordHint');
            const storedIntruderHint = await AsyncStorage.getItem('intruderPasswordHint');
            const intruderSelfie = await AsyncStorage.getItem('intruderImage');

            setStoredPasswords({
                folder: storedFolderPassword,
                notes: storedNotesPassword,
                intruder: storedIntruderPassword
            });

            setStoredHints({
                folder: storedFolderHint || '',
                notes: storedNotesHint || '',
                intruder: storedIntruderHint || ''
            });

            // Set the intruder box color based on the presence of a selfie
            if (intruderSelfie) {
                intruderAnimation.setValue(0); // Set to red if a selfie exists
            } else {
                intruderAnimation.setValue(1); // Set to yellow if no selfie exists
            }
        } catch (error) {
            console.error("Error loading data", error);
        }
    };

    const handleShake = ({ x, y, z }) => {
        const acceleration = Math.sqrt(x * x + y * y + z * z);
        if (acceleration > 2 && !shakeDetected) {
            setShakeDetected(true);
            
            navigation.navigate('SelectionScreen');
            setTimeout(() => setShakeDetected(false), 2000);
        }
    };

    useEffect(() => {
        const subscribe = () => {
            const currentRoute = navigation.getState()?.routes?.slice(-1)[0]?.name;
            if (currentRoute !== 'Calculator' && currentRoute !== 'Login' && currentRoute !== 'Signup') {
                const subscription = Accelerometer.addListener(handleShake);
                return () => subscription.remove();
            }
        };

        subscribe();
    }, [navigation, shakeDetected]);

    const captureIntruderSelfie = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission required', 'Camera access is required to capture intruder selfies.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.cancelled) {
            await AsyncStorage.setItem('intruderImage', result.uri);
            intruderAnimation.setValue(0); // Change color to red after capturing selfie
        }
    };

    const handleLongPress = (section) => {
        setSelectedSection(section);
        setPasswordMenuVisible(true);
    };

    const savePassword = async () => {
        if (!password.trim()) {
            Alert.alert('Error', 'Please enter a password');
            return;
        }
        try {
           const passwordKey = `${selectedSection}Password${selectedSection === 'folder' ? 'Home' : ''}`;
const hintKey = `${selectedSection}PasswordHint${selectedSection === 'folder' ? 'Home' : ''}`;
            
            await AsyncStorage.setItem(passwordKey, password);
            await AsyncStorage.setItem(hintKey, passwordHint);
            
            setStoredPasswords(prev => ({
                ...prev,
                [selectedSection]: password
            }));
            setStoredHints(prev => ({
                ...prev,
                [selectedSection]: passwordHint
            }));
            
            Alert.alert('Success', 'Password set successfully');
            setPassword('');
            setPasswordHint('');
            setPasswordModalVisible(false);
        } catch (error) {
            console.error('Error saving password', error);
        }
    };

    const verifyPassword = () => {
        if (inputPassword === storedPasswords[selectedSection]) {
            setVerifyPasswordModal(false);
            setInputPassword('');
            setWrongAttempts(prev => ({ ...prev, [selectedSection]: 0 }));
            navigation.navigate({
                folder: 'FolderScreen',
                notes: 'NotesScreen',
                intruder: 'IntruderScreen'
            }[selectedSection]);
        } else {
            setWrongAttempts(prev => ({
                ...prev,
                [selectedSection]: prev[selectedSection] + 1
            }));
            Alert.alert('Error', 'Incorrect password');
            setInputPassword('');
        }
    };

    const handleSectionPress = (section) => {
        setSelectedSection(section);
        if (storedPasswords[section]) {
            setVerifyPasswordModal(true);
        } else {
            if (section === 'intruder') {
                intruderAnimation.setValue(1); // Change to yellow when opened
            }
            navigation.navigate({
                folder: 'FolderScreen', // Navigate to FolderScreen
                notes: 'NotesScreen',
                intruder: 'IntruderScreen'
            }[section]);
        }
    };

    const removePassword = async () => {
        if (inputPassword === storedPasswords[selectedSection]) {
            try {
                const passwordKey = `${selectedSection}Password${selectedSection === 'folder' ? 'Home' : ''}`;
                const hintKey = `${selectedSection}PasswordHint${selectedSection === 'folder' ? 'Home' : ''}`;
                
                await AsyncStorage.removeItem(passwordKey);
                await AsyncStorage.removeItem(hintKey);
                
                setStoredPasswords(prev => ({
                    ...prev,
                    [selectedSection]: null
                }));
                setStoredHints(prev => ({
                    ...prev,
                    [selectedSection]: ''
                }));
                setWrongAttempts(prev => ({
                    ...prev,
                    [selectedSection]: 0
                }));
                
                Alert.alert('Success', 'Password removed successfully');
                setRemovePasswordModal(false);
                setInputPassword('');
            } catch (error) {
                console.error('Error removing password', error);
            }
        } else {
            setWrongAttempts(prev => ({
                ...prev,
                [selectedSection]: prev[selectedSection] + 1
            }));
            Alert.alert('Error', 'Incorrect password');
            setInputPassword('');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: currentTheme.primary }]}>
            <View style={[styles.header, { backgroundColor: currentTheme.secondary }]}>
                <View style={styles.profileContainer}>
                    {profilePicture && (
                        <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
                    )}
                    <TouchableOpacity onPress={pickImage} style={styles.cameraIconContainer}>
                        <Icon name="camera-alt" size={20} color="#FFFFFF" style={styles.cameraIcon} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Icon name="more-vert" size={30} color={currentTheme.primary} style={styles.menuIcon} />
                </TouchableOpacity>
            </View>

            <View style={styles.boxContainer}>
                <View style={[styles.box, { backgroundColor: currentTheme.secondary }]}>
                    <TouchableOpacity 
                        style={styles.navItem} 
                        onPress={() => handleSectionPress('folder')}
                        onLongPress={() => handleLongPress('folder')}
                    >
                        <View style={styles.folderContainer}>
                            <View style={styles.iconContainer}>
                                <Icon name="folder" size={40} color="#FFFFFF" />
                            </View>
                            {storedPasswords.folder && (
                                <Icon 
                                    name="lock" 
                                    size={30} 
                                    color="#FFFFFF" 
                                    style={styles.lockIcon}
                                />
                            )}
                        </View>
                        <Text style={styles.navTitle}>Folder</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.box, { backgroundColor: currentTheme.secondary }]}>
                    <TouchableOpacity 
                        style={styles.navItem} 
                        onPress={() => handleSectionPress('notes')}
                        onLongPress={() => handleLongPress('notes')}
                    >
                        <View style={styles.folderContainer}>
                            <View style={styles.iconContainer}>
                                <Icon name="note" size={40} color="#FFFFFF" />
                            </View>
                            {storedPasswords.notes && (
                                <Icon 
                                    name="lock" 
                                    size={30} 
                                    color="#FFFFFF" 
                                    style={styles.lockIcon}
                                />
                            )}
                        </View>
                        <Text style={styles.navTitle}>My Notes</Text>
                    </TouchableOpacity>
                </View>

                <Animated.View style={[styles.box, {
                    backgroundColor: intruderAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['#FF0000', currentTheme.secondary] // Red when selfie exists, theme color when not
                    })
                }]}>
                    <TouchableOpacity 
                        style={styles.navItem} 
                        onPress={() => {
                            handleSectionPress('intruder');
                        }}
                        onLongPress={() => handleLongPress('intruder')}
                    >
                        <View style={styles.folderContainer}>
                            <View style={styles.iconContainer}>
                                <Icon name="warning" size={40} color="#FFFFFF" />
                            </View>
                            {storedPasswords.intruder && (
                                <Icon 
                                    name="lock" 
                                    size={30} 
                                    color="#FFFFFF" 
                                    style={styles.lockIcon}
                                />
                            )}
                        </View>
                        <Text style={styles.navTitle}>Unauthorized Access</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>

            {/* Main Options Modal */}
            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <Text style={[styles.modalTitle, { color: currentTheme.secondary }]}>Options</Text>
                        <Pressable 
                            style={styles.option} 
                            onPress={() => {
                                setModalVisible(false);
                                pickImage(); // Call the function to pick an image
                            }}
                        >
                            <Text style={[styles.optionText]}>Set Profile Picture</Text>
                        </Pressable>
                        <Pressable style={styles.option} onPress={() => { navigation.navigate('SettingsScreen'); setModalVisible(false); }}>
                            <Text style={[styles.optionText]}>Settings</Text>
                        </Pressable>
                        <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
                            <Text style={[styles.closeButtonText, { color: currentTheme.secondary }]}>Close</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* Password Menu Modal */}
            <Modal animationType="slide" transparent={true} visible={passwordMenuVisible} onRequestClose={() => setPasswordMenuVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <Text style={[styles.modalTitle, { color: currentTheme.primary }]}>Options</Text>
                        <Pressable 
                            style={styles.option} 
                            onPress={() => {
                                setPasswordMenuVisible(false);
                                setPasswordModalVisible(true);
                            }}
                        >
                            <Text style={[styles.optionText]}>Add Password</Text>
                        </Pressable>
                        {storedPasswords[selectedSection] && (
                            <Pressable 
                                style={styles.option} 
                                onPress={() => {
                                    setPasswordMenuVisible(false);
                                    setRemovePasswordModal(true);
                                }}
                            >
                                <Text style={[styles.optionText]}>Remove Password</Text>
                            </Pressable>
                        )}
                        <Pressable style={styles.closeButton} onPress={() => setPasswordMenuVisible(false)}>
                            <Text style={[styles.closeButtonText, { color: currentTheme.primary }]}>Close</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* Password Input Modal */}
            <Modal animationType="slide" transparent={true} visible={passwordModalVisible} onRequestClose={() => setPasswordModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <Text style={[styles.modalTitle, { color: currentTheme.primary }]}>Set Password </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Password Hint (optional)"
                            value={passwordHint}
                            onChangeText={setPasswordHint}
                        />
                        <Pressable style={styles.option} onPress={savePassword}>
                            <Text style={[styles.optionText]}>Save</Text>
                        </Pressable>
                        <Pressable style={styles.closeButton} onPress={() => setPasswordModalVisible(false)}>
                            <Text style={[styles.closeButtonText, { color: currentTheme.primary }]}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* Password Verification Modal */}
            <Modal animationType="slide" transparent={true} visible={verifyPasswordModal} onRequestClose={() => setVerifyPasswordModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <Text style={[styles.modalTitle, { color: currentTheme.primary }]}>Enter Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            value={inputPassword}
                            onChangeText={setInputPassword}
                            secureTextEntry
                        />
                        {wrongAttempts[selectedSection] >= 3 && storedHints[selectedSection] && (
                            <Text style={{ color: 'gray', marginBottom: 10 }}>
                                Hint: {storedHints[selectedSection]}
                            </Text>
                        )}
                        <Pressable style={styles.option} onPress={verifyPassword}>
                            <Text style={[styles.optionText]}>Submit</Text>
                        </Pressable>
                        <Pressable style={styles.closeButton} onPress={() => setVerifyPasswordModal(false)}>
                            <Text style={[styles.closeButtonText, { color: currentTheme.primary }]}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* Remove Password Modal */}
            <Modal animationType="slide" transparent={true} visible={removePasswordModal} onRequestClose={() => setRemovePasswordModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <Text style={[styles.modalTitle, { color: currentTheme.primary }]}>Remove Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Current Password"
                            value={inputPassword}
                            onChangeText={setInputPassword}
                            secureTextEntry
                        />
                        {wrongAttempts[selectedSection] >= 3 && storedHints[selectedSection] && (
                            <Text style={{ color: 'gray', marginBottom: 10 }}>
                                Hint: {storedHints[selectedSection]}
                            </Text>
                        )}
                        <Pressable style={styles.option} onPress={removePassword}>
                            <Text style={[styles.optionText]}>Remove</Text>
                        </Pressable>
                        <Pressable style={styles.closeButton} onPress={() => setRemovePasswordModal(false)}>
                            <Text style={[styles.closeButtonText, { color: currentTheme.primary }]}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIcon: {
        padding: 10,
        marginTop: '30',
    },
    profilePicture: {
        width: 80,
        height: 80,
        borderRadius: 35,
        marginRight: 10,
        marginTop: '30',
    },
    cameraIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
        padding: 5,
    },
    cameraIcon: {
        color: '#FFFFFF',
    },
    boxContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20,
    },
    box: {
        paddingVertical: 20,
        alignItems: 'center',
        borderRadius: 20,
        marginBottom: 20,
        width: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        position: 'relative',
    },
    navItem: {
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: 10,
        padding: 20,
        width: '100%',
    },
    folderContainer: {
        position: 'relative',
    },
    iconContainer: {
        marginBottom: 10,
    },
    lockIcon: {
        position: 'absolute',
        right: -105,
        top: -25,
    },
    navTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: 200,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginRight: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    option: {
        marginVertical: 10,
    },
    optionText: {
        fontSize: 16,
    },
    closeButton: {
        marginTop: 20,
        borderRadius: 5,
        padding: 10,
    },
    closeButtonText: {
        fontSize: 16,
    },
    input: {
        height: 40,
        borderColor: 'transparent',  // Fixed here to remove red underline
        borderWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 10,
        borderRadius: 5,
        width: '100%',
    },
});

export default HomeScreen;

