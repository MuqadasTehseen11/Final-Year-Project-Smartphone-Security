import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Linking,
    Animated,
    Easing,
    BackHandler
} from 'react-native';
import { useNavigation } from '@react-navigation/native';  // Import navigation
import * as DocumentPicker from 'expo-document-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getStorage, ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const DualFiles = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const auth = getAuth();
    const storage = getStorage();
    const navigation = useNavigation();  // Get navigation object
    const userId = auth.currentUser ?.email;
    const messagePosition = useState(new Animated.Value(0))[0];

    useEffect(() => {
        if (userId) {
            fetchUserFiles();
            setMessage(`Here ${userId} is logged in. You can view files and upload documents.`);
        } else {
            setMessage('Please log in to view and upload your documents.');
        }
    }, [userId]);

    useEffect(() => {
        Animated.loop(
            Animated.timing(messagePosition, {
                toValue: -390,
                duration: 5000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, [messagePosition]);

    useEffect(() => {
        const backAction = () => {
            navigation.navigate('SelectionScreen'); // Navigate to SelectionScreen on back press
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, [navigation]);

    const fetchUserFiles = async () => {
        const filesRef = ref(storage, `Fake Documents/`);
        try {
            const result = await listAll(filesRef);
            const fileList = await Promise.all(
                result.items.map(async (itemRef) => {
                    const url = await getDownloadURL(itemRef);
                    return { name: itemRef.name, url };
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
        const result = await DocumentPicker.getDocumentAsync({
            type: '*/*',
        });

        if (!result.canceled) {
            const { name, uri } = result.assets[0];
            if (!userId) {
                Alert.alert('Error', 'User not logged in');
                return;
            }

            const fileRef = ref(storage, `Fake Documents/${name}`);
            const response = await fetch(uri);
            const blob = await response.blob();

            uploadBytes(fileRef, blob).then(() => {
                Alert.alert('Success', 'Document uploaded successfully!');
                fetchUserFiles();
            }).catch((error) => {
                Alert.alert('Error', 'Error uploading document');
                console.error(error);
            });
        }
    };

    const openFile = async (url) => {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            Linking.openURL(url);
        } else {
            Alert.alert('Error', 'This document cannot be opened.');
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.header}>Loading files...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Files Screen</Text>

            <Animated.View
                style={{
                    ...styles.loggedInTextContainer,
                    transform: [{ translateX: messagePosition }],
                }}
            >
                <Text style={styles.loggedInText}>{message}</Text>
            </Animated.View>

            <ScrollView contentContainerStyle={styles.fileContainer}>
                {files.length > 0 ? (
                    files.map((file, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.fileItem}
                            onPress={() => openFile(file.url)}
                        >
                            <MaterialCommunityIcons
                                name="file-document-outline"
                                size={30}
                                color="green"
                                style={styles.fileIcon}
                            />
                            <View>
                                <Text style={styles.fileName}>{file.name}</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={styles.noFilesText}>No documents found</Text>
                )}
            </ScrollView>

            <TouchableOpacity onPress={pick} style={styles.uploadButton}>
                <Text style={styles.uploadButtonText}>Upload Documents</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: 'black',
    },
    header: {
        fontSize: 20,
        color: 'red',
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
        color: 'green',
        textAlign: 'center',
        marginBottom: 20,
    },
    uploadButton: {
        backgroundColor: 'green',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    uploadButtonText: {
        color: 'black',
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
        backgroundColor: 'green',
        borderRadius: 8,
        marginBottom: 10,
    },
    fileIcon: {
        marginRight: 10,
        color: 'black',
    },
    fileName: {
        fontSize: 14,
        fontWeight: '500',
    },
    noFilesText: {
        fontSize: 16,
        color: 'black',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default DualFiles;
