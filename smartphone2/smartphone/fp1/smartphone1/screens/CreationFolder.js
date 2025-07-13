import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ThemeContext } from './ThemeContext'; // Adjust the path as necessary

const CreationFolder = () => {
    const { currentTheme } = useContext(ThemeContext); // Accessing current theme
    const [folders, setFolders] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [renameModalVisible, setRenameModalVisible] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [openPasswordModalVisible, setOpenPasswordModalVisible] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [folderPassword, setFolderPassword] = useState('');
    const [folderHint, setFolderHint] = useState(''); // New state for password hint
    const [inputPassword, setInputPassword] = useState('');
    const [longPressedFolder, setLongPressedFolder] = useState(null);
    const [incorrectAttempts, setIncorrectAttempts] = useState(0); // New state to track incorrect attempts

    // Load folders from AsyncStorage
    const loadFolders = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('folders');
            if (jsonValue != null) {
                const storedFolders = JSON.parse(jsonValue);
                const filteredFolders = storedFolders.filter(folder => !folder.deleted); // Filter out deleted folders
                setFolders(filteredFolders);
            } else {
                setFolders([]);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        loadFolders();
    }, []);

    const renderItem = ({ item }) => {
        return (
            <View style={styles.folderItem}>
                <TouchableOpacity
                    onLongPress={() => {
                        setLongPressedFolder(item.name);
                        setModalVisible(true);
                    }}
                    onPress={() => handleOpenFolder(item)}
                >
                    <Icon name="folder" size={28} color={currentTheme.accent} style={styles.icon} />
                    <Text style={styles.folderName}>{item.name}</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const handleOpenFolder = (folder) => {
        if (folder.password) {
            setLongPressedFolder(folder.name);
            setOpenPasswordModalVisible(true);
            setIncorrectAttempts(0); // Reset attempts when opening the password modal
        } else {
            Alert.alert('Folder Opened', `${folder.name} opened successfully!`);
        }
    };

    const handleSetPassword = async () => {
        const updatedFolders = folders.map(folder => {
            if (folder.name === longPressedFolder) {
                return { ...folder, password: folderPassword, hint: folderHint };
            }
            return folder;
        });
        try {
            await AsyncStorage.setItem('folders', JSON.stringify(updatedFolders));
            setFolders(updatedFolders);
            setPasswordModalVisible(false);
            Alert.alert('Password Set', `Password has been set for ${longPressedFolder}.`);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreateFolder = async () => {
        // Check for duplicate folder name
        const isDuplicate = folders.some(folder => folder.name.toLowerCase() === newFolderName.toLowerCase());
        if (isDuplicate) {
            Alert.alert('Error', `A folder with the name "${newFolderName}" already exists.`);
            return;
        }

        const newFolder = {
            name: newFolderName,
            deleted: false,
            password: null,
            hint: null,
        };

        const updatedFolders = [...folders, newFolder];
        try {
            await AsyncStorage.setItem('folders', JSON.stringify(updatedFolders));
            setFolders(updatedFolders);
            setNewFolderName(''); // Clear input
            Alert.alert('Folder Created', `Folder "${newFolderName}" created successfully.`);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteFolder = async () => {
        if (longPressedFolder) {
            const updatedFolders = folders.map(folder => {
                if (folder.name === longPressedFolder) {
                    return { ...folder, deleted: true }; // Mark the folder as deleted
                }
                return folder;
            });
            try {
                await AsyncStorage.setItem('folders', JSON.stringify(updatedFolders));
                setFolders(updatedFolders); // Update state to reflect the deletion
                Alert.alert('Deleted', `${longPressedFolder} has been deleted.`);
            } catch (e) {
                console.error(e);
            }
            setModalVisible(false);
        }
    };

    const handleRenameFolder = async () => {
        const updatedFolders = folders.map(folder => {
            if (folder.name === longPressedFolder) {
                return { ...folder, name: newFolderName };
            }
            return folder;
        });
        try {
            await AsyncStorage.setItem('folders', JSON.stringify(updatedFolders));
            setFolders(updatedFolders);
            setRenameModalVisible(false);
            Alert.alert('Renamed', `${longPressedFolder} has been renamed to ${newFolderName}.`);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteAllFolders = async () => {
        try {
            await AsyncStorage.removeItem('folders');
            setFolders([]);
            Alert.alert('Deleted', 'All folders have been deleted.');
        } catch (e) {
            console.error(e);
        }
        setModalVisible(false);
    };

    const handleDeleteConfirmation = () => {
        Alert.alert(
            'Delete Folder',
            `Are you sure you want to delete "${longPressedFolder}"?`,
            [
                {
                    text: 'Cancel',
                    onPress: () => setModalVisible(false),
                    style: 'cancel'
                },
                {
                    text: 'OK',
                    onPress: handleDeleteFolder
                }
            ],
            { cancelable: false }
        );
    };

    const handleOpenPassword = () => {
        if (longPressedFolder) {
            const folder = folders.find(f => f.name === longPressedFolder);
            if (folder && inputPassword === folder.password) {
                setOpenPasswordModalVisible(false);
                Alert.alert('Access Granted', `${folder.name} opened successfully!`);
            } else {
                setIncorrectAttempts(prev => prev + 1); // Increment incorrect attempts
                setInputPassword(''); // Clear the input field on wrong password
                if (incorrectAttempts >= 2) { // If this is the 3rd incorrect attempt
                    Alert.alert('Access Denied', `Incorrect password. Hint: ${folder.hint || 'No hint available.'}`);
                } else {
                    Alert.alert('Access Denied', `Incorrect password. Try again.`);
                }
            }
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: currentTheme.primary }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: currentTheme.accent }]}>My Folders</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Icon name="more-vert" size={24} color={currentTheme.accent} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={folders}
                renderItem={renderItem}
                keyExtractor={(item) => item.name || Math.random().toString(36).substring(7)}
                contentContainerStyle={styles.list}
                numColumns={3}
            />

            {/* Action Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={[styles.modalTitle, { color: currentTheme.accent }]}>Select Action</Text>
                        <TouchableOpacity onPress={handleDeleteConfirmation} style={[styles.modalButton, { backgroundColor: currentTheme.accent }]}>
                            <Text style={[styles.modalButtonText, { color: currentTheme.primary }]}>Delete Folder: {longPressedFolder}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setRenameModalVisible(true);
                                setModalVisible(false);
                            }}
                            style={[styles.modalButton, { backgroundColor: currentTheme.accent }]}>
                            <Text style={[styles.modalButtonText, { color: currentTheme.primary }]}>Rename Folder: {longPressedFolder}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setPasswordModalVisible(true);
                                setModalVisible(false);
                            }}
                            style={[styles.modalButton, { backgroundColor: currentTheme.accent }]}>
                            <Text style={[styles.modalButtonText, { color: currentTheme.primary }]}>Add Password</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDeleteAllFolders} style={[styles.modalButton, { backgroundColor: currentTheme.accent }]}>
                            <Text style={[styles.modalButtonText, { color: currentTheme.primary }]}>Delete All Folders</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.modalButton, { backgroundColor: currentTheme.accent }]}>
                            <Text style={[styles.modalButtonText, { color: currentTheme.primary }]}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Create Folder Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={renameModalVisible}
                onRequestClose={() => setRenameModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={[styles.modalTitle, { color: currentTheme.accent }]}>Create Folder</Text>
                        <TextInput
                            placeholder="Enter new folder name"
                            style={[styles.textInput, { backgroundColor: currentTheme.primary, borderColor: currentTheme.accent, color: currentTheme.accent }]}
                            value={newFolderName}
                            onChangeText={setNewFolderName}
                        />
                        <TouchableOpacity onPress={handleCreateFolder} style={[styles.modalButton, { backgroundColor: currentTheme.accent }]}>
                            <Text style={[styles.modalButtonText, { color: currentTheme.primary }]}>Create Folder</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setRenameModalVisible(false)} style={[styles.modalButton, { backgroundColor: currentTheme.accent }]}>
                            <Text style={[styles.modalButtonText, { color: currentTheme.primary }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Add Password Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={passwordModalVisible}
                onRequestClose={() => setPasswordModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={[styles.modalTitle, { color: currentTheme.accent }]}>Set Password</Text>
                        <TextInput
                            placeholder="Enter new password"
                            style={[styles.textInput, { backgroundColor: currentTheme.primary, borderColor: currentTheme.accent, color: currentTheme.accent }]}
                            value={folderPassword}
                            onChangeText={setFolderPassword}
                            secureTextEntry
                        />
                        <TextInput
                            placeholder="Enter password hint"
                            style={[styles.textInput, { backgroundColor: currentTheme.primary, borderColor: currentTheme.accent, color: currentTheme.accent }]}
                            value={folderHint}
                            onChangeText={setFolderHint}
                        />
                        <TouchableOpacity onPress={handleSetPassword} style={[styles.modalButton, { backgroundColor: currentTheme.accent }]}>
                            <Text style={[styles.modalButtonText, { color: currentTheme.primary }]}>Set Password</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setPasswordModalVisible(false)} style={[styles.modalButton, { backgroundColor: currentTheme.accent }]}>
                            <Text style={[styles.modalButtonText, { color: currentTheme.primary }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Open Password Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={openPasswordModalVisible}
                onRequestClose={() => setOpenPasswordModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={[styles.modalTitle, { color: currentTheme.accent }]}>Enter Password</Text>
                        <TextInput
                            placeholder="Enter folder password"
                            style={[styles.textInput, { backgroundColor: currentTheme.primary, borderColor: currentTheme.accent, color: currentTheme.accent }]}
                            value={inputPassword}
                            onChangeText={setInputPassword}
                            secureTextEntry
                        />
                        <TouchableOpacity onPress={handleOpenPassword} style={[styles.modalButton, { backgroundColor: currentTheme.accent }]}>
                            <Text style={[styles.modalButtonText, { color: currentTheme.primary }]}>Open Folder</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setOpenPasswordModalVisible(false)} style={[styles.modalButton, { backgroundColor: currentTheme.accent }]}>
                            <Text style={[styles.modalButtonText, { color: currentTheme.primary }]}>Cancel</Text>
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
        paddingTop: 20,
        paddingHorizontal: 15,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 45,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    list: {
        paddingBottom: 20,
    },
    folderItem: {
        flex: 1,
        margin: 10,
        alignItems: 'center',
    },
    folderName: {
        marginTop: 5,
        textAlign: 'center',
    },
    icon : {
        backgroundColor: '#1E1E1E',
        borderRadius: 10,
        padding: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    modalContent: {
        backgroundColor: '#1E1E1E',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    modalTitle: {
        fontSize: 20,
        marginBottom: 10,
        textAlign: 'center',
    },
    modalButton: {
        padding: 10,
        borderRadius: 5,
        marginVertical: 5,
    },
    modalButtonText: {
        textAlign: 'center',
    },
    textInput: {
        borderColor: '#FFCA42',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginVertical: 10,
    },
});

export default CreationFolder;