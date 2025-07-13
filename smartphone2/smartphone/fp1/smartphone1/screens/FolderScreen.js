import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from './ThemeContext';

const FolderScreen = () => {
    const { currentTheme } = useContext(ThemeContext);
    const [modalVisible, setModalVisible] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [albumName, setAlbumName] = useState('');
    const [folders, setFolders] = useState([]);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [passwordMenuVisible, setPasswordMenuVisible] = useState(false);
    const [verifyPasswordModal, setVerifyPasswordModal] = useState(false);
    const [removePasswordModal, setRemovePasswordModal] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordHint, setPasswordHint] = useState('');
    const [inputPassword, setInputPassword] = useState('');
    const [selectedFolder, setSelectedFolder] = useState('');
    const [storedPasswords, setStoredPasswords] = useState({
        images: null,
        videos: null,
        myfolder: null
    });
    const [storedHints, setStoredHints] = useState({
        images: '',
        videos: '',
        myfolder: ''
    });
    const [wrongAttempts, setWrongAttempts] = useState({
        images: 0,
        videos: 0,
        myfolder: 0
    });
    const navigation = useNavigation();

    useEffect(() => {
        const loadData = async () => {
            try {
                const storedFolders = await AsyncStorage.getItem('folders');
                const storedImagePassword = await AsyncStorage.getItem('imagePassword');
                const storedVideoPassword = await AsyncStorage.getItem('videoPassword');
                const storedFolderPassword = await AsyncStorage.getItem('folderPassword');
                const storedImageHint = await AsyncStorage.getItem('imagePasswordHint');
                const storedVideoHint = await AsyncStorage.getItem('videoPasswordHint');
                const storedFolderHint = await AsyncStorage.getItem('folderPasswordHint');

                if (storedFolders) {
                    const parsedFolders = JSON.parse(storedFolders);
                    const activeFolders = parsedFolders.filter(folder => !folder.deleted);
                    setFolders(activeFolders);
                }
                
                setStoredPasswords({
                    images: storedImagePassword,
                    videos: storedVideoPassword,
                    myfolder: storedFolderPassword
                });

                setStoredHints({
                    images: storedImageHint || '',
                    videos: storedVideoHint || '',
                    myfolder: storedFolderHint || ''
                });
            } catch (error) {
                console.error("Error loading data", error);
            }
        };

        loadData();
    }, []);

    const openModal = () => setModalVisible(true);
    const closeModal = () => setModalVisible(false);
    const openCreateModal = () => {
        setCreateModalVisible(true);
        closeModal();
    };
    const closeCreateModal = () => {
        setCreateModalVisible(false);
        setAlbumName('');
    };

    const createAlbum = async () => {
        if (albumName.trim() === '') {
            Alert.alert('Error', 'Please enter a valid album name');
            return;
        }

        const isDuplicate = folders.some(folder => folder.name.toLowerCase() === albumName.toLowerCase());
        if (isDuplicate) {
            Alert.alert('Error', `A folder with the name "${albumName}" already exists.`);
            return;
        }

        const newFolder = { name: albumName, deleted: false };
        const newFolders = [...folders, newFolder];
        setFolders(newFolders);

        try {
            await AsyncStorage.setItem('folders', JSON.stringify(newFolders));
            Alert.alert('Success', 'Folder created successfully');
            navigation.navigate('CreationFolder', { folderName: albumName });
        } catch (error) {
            console.error("Error saving folders", error);
        }

        closeCreateModal();
    };

    const handleLongPress = (folder) => {
        setSelectedFolder(folder);
        setPasswordMenuVisible(true);
    };

    const savePassword = async () => {
        if (!password.trim()) {
            Alert.alert('Error', 'Please enter a password');
            return;
        }
        try {
            const passwordKey = `${selectedFolder}Password`;
            const hintKey = `${selectedFolder}PasswordHint`;
            
            await AsyncStorage.setItem(passwordKey, password);
            await AsyncStorage.setItem(hintKey, passwordHint);
            
            setStoredPasswords(prev => ({
                ...prev,
                [selectedFolder]: password
            }));
            setStoredHints(prev => ({
                ...prev,
                [selectedFolder]: passwordHint
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
        if (inputPassword === storedPasswords[selectedFolder]) {
            setVerifyPasswordModal(false);
            setInputPassword('');
            setWrongAttempts(prev => ({ ...prev, [selectedFolder]: 0 }));
            navigation.navigate({
                images: 'ImagesScreen',
                videos: 'VideosScreen',
                myfolder: 'FilesScreen'
            }[selectedFolder]);
        } else {
            setWrongAttempts(prev => ({
                ...prev,
                [selectedFolder]: prev[selectedFolder] + 1
            }));
            Alert.alert('Error', 'Incorrect password');
            setInputPassword('');
        }
    };

    const handleFolderPress = (folder) => {
        setSelectedFolder(folder);
        if (storedPasswords[folder]) {
            setVerifyPasswordModal(true);
        } else {
            navigation.navigate({
                images: 'ImagesScreen',
                videos: 'VideosScreen',
                myfolder: 'FilesScreen'
            }[folder]);
        }
    };

    const removePassword = async () => {
        if (inputPassword === storedPasswords[selectedFolder]) {
            try {
                const passwordKey = `${selectedFolder}Password`;
                const hintKey = `${selectedFolder}PasswordHint`;
                
                await AsyncStorage.removeItem(passwordKey);
                await AsyncStorage.removeItem(hintKey);
                
                setStoredPasswords(prev => ({
                    ...prev,
                    [selectedFolder]: null
                }));
                setStoredHints(prev => ({
                    ...prev,
                    [selectedFolder]: ''
                }));
                setWrongAttempts(prev => ({
                    ...prev,
                    [selectedFolder]: 0
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
                [selectedFolder]: prev[selectedFolder] + 1
            }));
            Alert.alert('Error', 'Incorrect password');
            setInputPassword('');
        }
    };

    return (
        <KeyboardAvoidingView style={[styles.container, { backgroundColor: currentTheme.primary }]} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={[styles.header, { backgroundColor: currentTheme.accent }]}>
                <Text style={[styles.headerTitle, { color: currentTheme.primary }]}>Folder</Text>
                <TouchableOpacity onPress={openModal}>
                    <Icon name="more-vert" size={30} color={currentTheme.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.boxContainer}>
                {/* Images Box */}
                <View style={[styles.box, { backgroundColor: currentTheme.accent }]}>
                    <TouchableOpacity 
                        style={styles.navItem} 
                        onPress={() => handleFolderPress('images')}
                        onLongPress={() => handleLongPress('images')}
                    >
                        <View style={styles.folderContainer}>
                            <View style={[styles.iconContainer, { backgroundColor: currentTheme.primary }]}>
                                <Icon name="image" size={40} color="#FFFFFF" />
                            </View>
                            {storedPasswords.images && (
                                <Icon 
                                    name="lock" 
                                    size={30} 
                                    color={currentTheme.primary} 
                                    style={styles.lockIcon}
                                />
                            )}
                        </View>
                        <Text style={[styles.navTitle, { color: currentTheme.primary }]}>Images</Text>
                    </TouchableOpacity>
                </View>

                {/* Videos Box */}
                <View style={[styles.box, { backgroundColor: currentTheme.accent }]}>
                    <TouchableOpacity 
                        style={styles.navItem} 
                        onPress={() => handleFolderPress('videos')}
                        onLongPress={() => handleLongPress('videos')}
                    >
                        <View style={styles.folderContainer}>
                            <View style={[styles.iconContainer, { backgroundColor: currentTheme.primary }]}>
                                <Icon name="videocam" size={40} color="#FFFFFF" />
                            </View>
                            {storedPasswords.videos && (
                                <Icon 
                                    name="lock" 
                                    size={30} 
                                    color={currentTheme.primary} 
                                    style={styles.lockIcon}
                                />
                            )}
                        </View>
                        <Text style={[styles.navTitle, { color: currentTheme.primary }]}>Videos</Text>
                    </TouchableOpacity>
                </View>

                {/* My Folder Box */}
                <View style={[styles.box, { backgroundColor: currentTheme.accent }]}>
                    <TouchableOpacity 
                        style={styles.navItem} 
                        onPress={() => handleFolderPress('myfolder')}
                        onLongPress={() => handleLongPress('myfolder')}
                    >
                        <View style={styles.folderContainer}>
                            <View style={[styles.iconContainer, { backgroundColor: currentTheme.primary }]}>
                                <Icon name="folder" size={40} color="#FFFFFF" />
                            </View>
                            {storedPasswords.myfolder && (
                                <Icon 
                                    name="lock" 
                                    size={30} 
                                    color={currentTheme.primary} 
                                    style={styles.lockIcon}
                                />
                            )}
                        </View>
                        <Text style={[styles.navTitle, { color: currentTheme.primary }]}>My Files</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

           
        </KeyboardAvoidingView>
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
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    boxContainer: {
        flexGrow: 1,
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
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    navItem: {
        alignItems: 'center',
    },
    folderContainer: {
        position: 'relative',
    },
    iconContainer: {
        borderRadius: 50,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    lockIcon: {
        position: 'absolute',
        right: -105,
        top: -5,
    },
    navTitle: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 5,
    },
    modalView: {
        position: 'absolute',
        right: 10,
        top: '-1%',
        margin: 0,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        marginBottom: 15,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 18,
    },
    option: {
        marginVertical: 10,
    },
    optionText: {
        fontSize: 16,
    },
    closeButton: {
        padding: 10,
        borderRadius: 5,
        marginTop: 15,
    },
    closeButtonText: {
        fontSize: 16,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 10,
        borderRadius: 5,
        width: '100%',
    },
});

export default FolderScreen;