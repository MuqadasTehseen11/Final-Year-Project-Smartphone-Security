import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Animated,
    Easing,
    Modal,
    TextInput,
    Linking,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getStorage, ref, uploadBytes, listAll, getDownloadURL, deleteObject } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from './ThemeContext';

const FilesScreen = () => {
    const { currentTheme } = useContext(ThemeContext);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [unlockModalVisible, setUnlockModalVisible] = useState(false);
    const [renameModalVisible, setRenameModalVisible] = useState(false);
    const [removePasswordModalVisible, setRemovePasswordModalVisible] = useState(false);
    const [password, setPassword] = useState('');
    const [hint, setHint] = useState('');
    const [enteredPassword, setEnteredPassword] = useState('');
    const [wrongAttempts, setWrongAttempts] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [removePasswordHintVisible, setRemovePasswordHintVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [newFileName, setNewFileName] = useState('');

    const auth = getAuth();
    const storage = getStorage();
    const user = auth.currentUser;
    const sanitizedEmail = user?.email.replace('@', '').replace('.', '');
    const messagePosition = useState(new Animated.Value(0))[0];

    useEffect(() => {
        if (sanitizedEmail) {
            fetchUserFiles(sanitizedEmail);
            setMessage(`Here ${user.email} is logged in. You can view files and upload documents.`);
        } else {
            setMessage('Please log in to view and upload your documents.');
        }
    }, [sanitizedEmail]);

    useEffect(() => {
        Animated.loop(
            Animated.timing(messagePosition, {
                toValue: -300,
                duration: 5000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, [messagePosition]);

    const fetchUserFiles = async (email) => {
        const filesRef = ref(storage, `users/${email}/files/`);
        try {
            const result = await listAll(filesRef);
            const fileList = await Promise.all(
                result.items.map(async (itemRef) => {
                    const url = await getDownloadURL(itemRef);
                    const fileKey = `${sanitizedEmail}_${itemRef.name}`;
                    const storedData = await AsyncStorage.getItem(fileKey);
                    const isLocked = !!storedData;
                    return { name: itemRef.name, url, isLocked };
                })
            );
            setFiles(fileList);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch files.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const pick = async () => {
        const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
        if (!result.canceled) {
            const { name, uri } = result.assets[0];
            if (!sanitizedEmail) {
                Alert.alert('Error', 'User not logged in');
                return;
            }
            const fileRef = ref(storage, `users/${sanitizedEmail}/files/${Date.now()}_${name}`);
            const response = await fetch(uri);
            const blob = await response.blob();

            uploadBytes(fileRef, blob)
                .then(() => {
                    Alert.alert('Success', 'Document uploaded successfully!');
                    fetchUserFiles(sanitizedEmail);
                })
                .catch((error) => {
                    Alert.alert('Error', 'Error uploading document');
                    console.error(error);
                });
        }
    };

    const openFile = (file) => {
        if (file.isLocked) {
            setSelectedFile(file);
            setUnlockModalVisible(true);
        } else {
            Linking.openURL(file.url).catch(() => Alert.alert('Error', 'This document cannot be opened.'));
        }
    };

    const confirmDelete = (index) => {
        Alert.alert('Delete Document', 'Are you sure you want to delete this document?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', onPress: () => deleteFile(index), style: 'destructive' },
        ]);
    };

    const deleteFile = async (index) => {
        const fileToDelete = files[index];
        const fileRef = ref(storage, `users/${sanitizedEmail}/files/${fileToDelete.name}`);
        const fileKey = `${sanitizedEmail}_${fileToDelete.name}`;

        try {
            await deleteObject(fileRef);
            await AsyncStorage.removeItem(fileKey);
            setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
            Alert.alert('Success', 'The document has been deleted.');
        } catch (error) {
            Alert.alert('Error', 'Failed to delete document');
            console.error(error);
        }
    };

    const showContextMenu = (file) => {
        setSelectedFile(file);
        const options = [
            {
                text: 'Add Password',
                onPress: () => setModalVisible(true),
                style: 'default',
            },
            {
                text: 'Rename File',
                onPress: () => {
                    setNewFileName(file.name);
                    setRenameModalVisible(true);
                },
                style: 'default',
            },
            {
                text: 'Delete',
                onPress: () => confirmDelete(files.findIndex((f) => f.name === file.name)),
                style: 'destructive',
            },
        ];

        if (file.isLocked) {
            options.splice(2, 0, {
                text: 'Remove Password',
                onPress: () => setRemovePasswordModalVisible(true),
                style: 'default',
            });
        }

        options.push({
            text: 'Cancel',
            style: 'cancel',
        });

        Alert.alert('File Options', 'Choose an action for this file', options, { cancelable: true });
    };

    const addPassword = async () => {
        if (!password) {
            Alert.alert('Error', 'Please enter a password');
            return;
        }
        const fileKey = `${sanitizedEmail}_${selectedFile.name}`;
        const passwordData = { password, hint };

        try {
            await AsyncStorage.setItem(fileKey, JSON.stringify(passwordData));
            setFiles((prevFiles) =>
                prevFiles.map((file) =>
                    file.name === selectedFile.name ? { ...file, isLocked: true } : file
                )
            );
            setModalVisible(false);
            setPassword('');
            setHint('');
            Alert.alert('Success', 'Password added to the file.');
        } catch (error) {
            Alert.alert('Error', 'Failed to save password');
            console.error(error);
        }
    };

    const unlockFile = async () => {
        const fileKey = `${sanitizedEmail}_${selectedFile.name}`;
        try {
            const storedData = await AsyncStorage.getItem(fileKey);
            const { password: correctPassword, hint: storedHint } = JSON.parse(storedData);

            if (enteredPassword === correctPassword) {
                setUnlockModalVisible(false);
                setEnteredPassword('');
                setWrongAttempts(0);
                setShowHint(false);
                setErrorMessage('');
                Linking.openURL(selectedFile.url).catch(() =>
                    Alert.alert('Error', 'This document cannot be opened.')
                );
            } else {
                setWrongAttempts((prev) => prev + 1);
                setErrorMessage('Incorrect password');
                setEnteredPassword('');
                if (wrongAttempts + 1 >= 3) {
                    setShowHint(true);
                    setHint(storedHint);
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to retrieve password');
            console.error(error);
        }
    };

    const removePassword = async () => {
        const fileKey = `${sanitizedEmail}_${selectedFile.name}`;
        try {
            const storedData = await AsyncStorage.getItem(fileKey);
            const { password: correctPassword, hint: storedHint } = JSON.parse(storedData);

            if (enteredPassword === correctPassword) {
                await AsyncStorage.removeItem(fileKey);
                setFiles((prevFiles) =>
                    prevFiles.map((file) =>
                        file.name === selectedFile.name ? { ...file, isLocked: false } : file
                    )
                );
                setRemovePasswordModalVisible(false);
                setEnteredPassword('');
                setErrorMessage('');
                setRemovePasswordHintVisible(false);
                setWrongAttempts(0);
                Alert.alert('Success', 'Password removed from the file.');
            } else {
                setWrongAttempts((prev) => prev + 1);
                setErrorMessage('Incorrect password');
                setEnteredPassword('');
                if (wrongAttempts + 1 >= 3) {
                    setRemovePasswordHintVisible(true);
                    setHint(storedHint);
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to remove password');
            console.error(error);
        }
    };

    const renameFile = async () => {
        if (!newFileName || newFileName === selectedFile.name) {
            Alert.alert('Error', 'Please enter a new file name');
            return;
        }

        const oldFileNameParts = selectedFile.name.split('.');
        const extension = oldFileNameParts.length > 1 ? `.${oldFileNameParts.pop()}` : '';
        const newFileNameWithExtension = newFileName.includes('.') ? newFileName : `${newFileName}${extension}`;

        const oldFileRef = ref(storage, `users/${sanitizedEmail}/files/${selectedFile.name}`);
        const newFileRef = ref(storage, `users/${sanitizedEmail}/files/${newFileNameWithExtension}`);
        const fileKeyOld = `${sanitizedEmail}_${selectedFile.name}`;
        const fileKeyNew = `${sanitizedEmail}_${newFileNameWithExtension}`;

        try {
            const response = await fetch(selectedFile.url);
            const blob = await response.blob();

            await uploadBytes(newFileRef, blob);
            const newUrl = await getDownloadURL(newFileRef);

            const storedData = await AsyncStorage.getItem(fileKeyOld);
            if (storedData) {
                await AsyncStorage.setItem(fileKeyNew, storedData);
                await AsyncStorage.removeItem(fileKeyOld);
            }

            await deleteObject(oldFileRef);

            setFiles((prevFiles) =>
                prevFiles.map((file) =>
                    file.name === selectedFile.name ? { ...file, name: newFileNameWithExtension, url: newUrl } : file
                )
            );
            setRenameModalVisible(false);
            setNewFileName('');
            Alert.alert('Success', 'File renamed successfully.');
        } catch (error) {
            Alert.alert('Error', 'Failed to rename file');
            console.error(error);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={[styles.header, { color: currentTheme.accent }]}>Loading files...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: currentTheme.primary }]}>
            <Text style={[styles.header, { color: currentTheme.accent }]}>Files Screen</Text>
            <Animated.View style={{ ...styles.loggedInTextContainer, transform: [{ translateX: messagePosition }] }}>
                <Text style={[styles.loggedInText, { color: currentTheme.accent }]}>{message}</Text>
            </Animated.View>

            <ScrollView contentContainerStyle={styles.fileContainer}>
                {files.length > 0 ? (
                    files.map((file, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.fileItem}
                            onPress={() => openFile(file)}
                            onLongPress={() => showContextMenu(file)}
                        >
                            <MaterialCommunityIcons
                                name={file.isLocked ? 'lock' : 'file-document-outline'}
                                size={30}
                                color={currentTheme.accent}
                                style={styles.fileIcon}
                            />
                            <Text style={[styles.fileName, { color: currentTheme.accent }]}>{file.name}</Text>
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={[styles.noFilesText, { color: currentTheme.accent }]}>No documents found</Text>
                )}
            </ScrollView>

            <TouchableOpacity onPress={pick} style={[styles.uploadButton, { backgroundColor: currentTheme.accent }]}>
                <Text style={styles.uploadButtonText}>Upload Documents</Text>
            </TouchableOpacity>

            {/* Modal for Adding Password */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Password"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Hint"
                            value={hint}
                            onChangeText={setHint}
                        />
                        <TouchableOpacity onPress={addPassword} style={styles.modalButton}>
                            <Text style={styles.modalButtonText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
                            <Text style={styles.modalButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal for Unlocking File */}
            <Modal visible={unlockModalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Unlock File</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Password"
                            secureTextEntry
                            value={enteredPassword}
                            onChangeText={setEnteredPassword}
                        />
                        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                        {showHint && <Text style={styles.hintText}>Hint: {hint}</Text>}
                        <TouchableOpacity onPress={unlockFile} style={styles.modalButton}>
                            <Text style={styles.modalButtonText}>Unlock</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setUnlockModalVisible(false)} style={styles.modalButton}>
                            <Text style={styles.modalButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal for Renaming File */}
            <Modal visible={renameModalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Rename File</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter New File Name"
                            value={newFileName}
                            onChangeText={setNewFileName}
                        />
                        <TouchableOpacity onPress={renameFile} style={styles.modalButton}>
                            <Text style={styles.modalButtonText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setRenameModalVisible(false)} style={styles.modalButton}>
                            <Text style={styles.modalButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal for Removing Password */}
            <Modal visible={removePasswordModalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Remove Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Current Password"
                            secureTextEntry
                            value={enteredPassword}
                            onChangeText={setEnteredPassword}
                        />
                        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                        {removePasswordHintVisible && <Text style={styles.hintText}>Hint: {hint}</Text>}
                        <TouchableOpacity onPress={removePassword} style={styles.modalButton}>
                            <Text style={styles.modalButtonText}>Remove</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => {
                                setRemovePasswordModalVisible(false);
                                setEnteredPassword('');
                                setErrorMessage('');
                                setRemovePasswordHintVisible(false);
                                setWrongAttempts(0);
                            }} 
                            style={styles.modalButton}
                        >
                            <Text style={styles.modalButtonText}>Cancel</Text>
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
        padding: 16,
        backgroundColor: '#1F5460',
    },
    header: {
        fontSize: 20,
        color: '#FFCA42',
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        marginTop: 50,
    },
    loggedInTextContainer: {
        overflow: 'hidden',
        width: '100%',
    },
    loggedInText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    uploadButton: {
        backgroundColor: '#FFCA42',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    uploadButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    fileContainer: {
        flexDirection: 'column',
    },
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        marginBottom: 10,
    },
    fileIcon: {
        marginRight: 10,
    },
    fileName: {
        fontSize: 14,
        fontWeight: '500',
    },
    noFilesText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginTop: 20,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#1F5460',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    hintText: {
        color: '#888',
        marginBottom: 10,
    },
    modalButton: {
        backgroundColor: '#FFCA42',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    modalButtonText: {
        color: 'white',
        fontWeight: '600',
    },
});

export default FilesScreen;