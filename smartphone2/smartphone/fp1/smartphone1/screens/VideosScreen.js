import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Modal,
    FlatList,
    TextInput,
    Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video } from 'expo-av';
import { storage, auth } from './firebaseConfiguration';
import { ref, uploadBytes, listAll, getDownloadURL, deleteObject } from 'firebase/storage';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const VideosScreen = () => {
    const navigation = useNavigation();
    const [media, setMedia] = useState([]);
    const [menuVisible, setMenuVisible] = useState(false);
    const [contextMenuVisible, setContextMenuVisible] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [videoModalVisible, setVideoModalVisible] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [removePasswordVisible, setRemovePasswordVisible] = useState(false);
    const [enteredPassword, setEnteredPassword] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentVideo, setCurrentVideo] = useState({ uri: '', name: '', password: '', hint: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const [hintMessage, setHintMessage] = useState('');

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            const sanitizedEmail = user.email.replace('@', '').replace('.', '');
            setUserEmail(sanitizedEmail);
            loadVideosFromStorage(sanitizedEmail);
        } else {
            Alert.alert('Error', 'No user is logged in');
        }
    }, []);

    const saveVideosToStorage = async (videos) => {
        try {
            const jsonVideos = JSON.stringify(videos);
            await AsyncStorage.setItem('userVideos', jsonVideos);
        } catch (e) {
            console.error('Error saving videos:', e);
        }
    };

    const loadVideosFromStorage = async (email) => {
        try {
            const folderRef = ref(storage, `users/${email}/Videos/`);
            const videoList = await listAll(folderRef);

            const videos = await Promise.all(
                videoList.items
                    .filter(item => item.name.endsWith('.mp4') || item.name.endsWith('.mov'))
                    .map(async (videoRef) => {
                        const url = await getDownloadURL(videoRef);
                        const metadataRef = ref(storage, `users/${email}/Videos/${videoRef.name}.metadata`);
                        let password = '';
                        let hint = '';
                        try {
                            const metadataUrl = await getDownloadURL(metadataRef);
                            const metadata = await fetch(metadataUrl).then(res => res.json());
                            password = metadata.password || '';
                            hint = metadata.hint || '';
                        } catch (e) {
                            // No metadata file means no password
                        }
                        return { uri: url, name: videoRef.name, password, hint };
                    })
            );

            setMedia(videos);
        } catch (e) {
            console.error('Error loading videos:', e);
        }
    };

    const pickMedia = async () => {
        let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            alert("Permission to access gallery is required!");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            quality: 1,
        });

        if (!result.canceled) {
            const selectedMedia = result.assets.map(item => ({
                uri: item.uri,
                name: `${Date.now()}_${item.uri.split('/').pop()}`,
                password: '',
                hint: '',
            }));
            const updatedMedia = [...media, ...selectedMedia];
            setMedia(updatedMedia);
            saveVideosToStorage(updatedMedia);
            uploadVideosToFirebase(selectedMedia);
        }
    };

    const uploadVideosToFirebase = async (selectedMedia) => {
        const user = auth.currentUser;
        if (user) {
            const sanitizedEmail = user.email.replace('@', '').replace('.', '');
            for (const mediaItem of selectedMedia) {
                const response = await fetch(mediaItem.uri);
                const blob = await response.blob();
                const storageRef = ref(storage, `users/${sanitizedEmail}/Videos/${mediaItem.name}`);
                await uploadBytes(storageRef, blob);

                if (mediaItem.password) {
                    const metadataRef = ref(storage, `users/${sanitizedEmail}/Videos/${mediaItem.name}.metadata`);
                    const metadataBlob = new Blob([JSON.stringify({ password: mediaItem.password, hint: mediaItem.hint })], { type: 'application/json' });
                    await uploadBytes(metadataRef, metadataBlob);
                }
            }
            loadVideosFromStorage(sanitizedEmail);
        }
    };

    const deleteMedia = async (uri) => {
        if (!uri) return;
        try {
            const user = auth.currentUser;
            if (user) {
                const sanitizedEmail = user.email.replace('@', '').replace('.', '');
                const videoRef = ref(storage, `users/${sanitizedEmail}/Videos/${uri.split('/').pop()}`);
                const metadataRef = ref(storage, `users/${sanitizedEmail}/Videos/${uri.split('/').pop()}.metadata`);
                await deleteObject(videoRef);
                try {
                    await deleteObject(metadataRef);
                } catch (e) {
                    // Metadata might not exist
                }
                const updatedMedia = media.filter(item => item.uri !== uri);
                setMedia(updatedMedia);
                saveVideosToStorage(updatedMedia);
            }
        } catch (error) {
            console.error('Error deleting video:', error);
        }
    };

    const deleteAllMedia = () => {
        Alert.alert(
            'Delete All Videos',
            'Are you sure you want to delete all videos?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    onPress: async () => {
                        try {
                            const user = auth.currentUser;
                            if (user) {
                                const sanitizedEmail = user.email.replace('@', '').replace('.', '');
                                const folderRef = ref(storage, `users/${sanitizedEmail}/Videos/`);
                                const videoList = await listAll(folderRef);
                                await Promise.all(videoList.items.map(item => deleteObject(item)));
                                setMedia([]);
                                saveVideosToStorage([]);
                            }
                        } catch (error) {
                            console.error('Error deleting all videos:', error);
                        }
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    const toggleMenu = () => setMenuVisible(!menuVisible);

    const openContextMenu = (video) => {
        setSelectedVideo(video);
        setCurrentVideo(video);
        setContextMenuVisible(true);
    };

    const renderVideoItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => handleOpenVideo(item)}
            onLongPress={() => openContextMenu(item)}
            style={styles.videoItem}
        >
            {item.password ? (
                <View style={styles.lockedVideo}>
                    <MaterialIcons name="lock" size={width * 0.08} color="#fff" />
                </View>
            ) : (
                <Video
                    source={{ uri: item.uri }}
                    style={styles.videoThumbnail}
                    resizeMode="cover"
                    isLooping
                    shouldPlay={false}
                />
            )}
        </TouchableOpacity>
    );

    const handleOpenVideo = (video) => {
        setSelectedVideo(video);
        setCurrentVideo(video);
        setErrorMessage('');
        setHintMessage('');
        setAttempts(0);
        setEnteredPassword('');
        if (video?.password) {
            setPasswordVisible(true);
        } else {
            setVideoModalVisible(true);
        }
    };

    const handlePasswordSubmit = () => {
        if (!selectedVideo) return;
        if (enteredPassword === selectedVideo.password) {
            setVideoModalVisible(true);
            setPasswordVisible(false);
            setEnteredPassword('');
            setAttempts(0);
            setErrorMessage('');
            setHintMessage('');
        } else {
            setAttempts(attempts + 1);
            setErrorMessage('Wrong password!');
            if ((attempts + 1) % 4 === 0) {
                setHintMessage(`Hint: ${selectedVideo.hint || 'No hint available'}`);
            } else {
                setHintMessage('');
            }
            setEnteredPassword('');
        }
    };

    const handleAddPassword = () => {
        if (!selectedVideo) return;
        setModalVisible(true);
        setContextMenuVisible(false);
    };

    const handleRemovePassword = () => {
        if (!selectedVideo) return;
        setContextMenuVisible(false);
        setRemovePasswordVisible(true);
        setErrorMessage('');
        setHintMessage('');
        setAttempts(0);
        setEnteredPassword('');
    };

    const handleRemovePasswordSubmit = () => {
        if (!selectedVideo) return;
        if (enteredPassword === selectedVideo.password) {
            const updatedVideo = { ...selectedVideo, password: '', hint: '' };
            setMedia(media.map(item => (item.uri === selectedVideo.uri ? updatedVideo : item)));
            saveVideosToStorage(media);
            uploadVideosToFirebase([updatedVideo]);
            setRemovePasswordVisible(false);
            setEnteredPassword('');
            setAttempts(0);
            setErrorMessage('');
            setHintMessage('');
            setSelectedVideo(updatedVideo);
        } else {
            setAttempts(attempts + 1);
            setErrorMessage('Wrong password!');
            if ((attempts + 1) % 4 === 0) {
                setHintMessage(`Hint: ${selectedVideo.hint || 'No hint available'}`);
            } else {
                setHintMessage('');
            }
            setEnteredPassword('');
        }
    };

    const updateVideo = () => {
        if (!selectedVideo) return;
        const updatedVideo = { ...currentVideo, uri: selectedVideo.uri, name: selectedVideo.name };
        setMedia(media.map(item => (item.uri === selectedVideo.uri ? updatedVideo : item)));
        saveVideosToStorage(media);
        uploadVideosToFirebase([updatedVideo]);
        setModalVisible(false);
        setSelectedVideo(updatedVideo);
    };

    const handleDualVideosPress = () => {
        Alert.alert(
            "Login Required",
            "You need to log in to view Dual Videos.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "OK", onPress: () => navigation.navigate('DecoyLogin') },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
                <MaterialIcons name="more-vert" size={24} color="#FFCA42" />
            </TouchableOpacity>

            <Text style={styles.title}>Videos</Text>

            <FlatList
                data={media}
                renderItem={renderVideoItem}
                keyExtractor={item => item.uri}
                numColumns={width > 600 ? 4 : 3}
                contentContainerStyle={styles.videoList}
            />

            {/* Main Menu Modal */}
            <Modal visible={menuVisible} transparent={true} animationType="fade">
                <View style={styles.popupBackground}>
                    <View style={styles.popupMenu}>
                        <TouchableOpacity onPress={pickMedia} style={styles.popupOption}>
                            <Text style={styles.popupText}>Add Videos</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={deleteAllMedia} style={styles.popupOption}>
                            <Text style={styles.popupText}>Delete All Videos</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDualVideosPress} style={styles.popupOption}>
                            <Text style={styles.popupText}>Dual Videos</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={toggleMenu} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Context Menu Modal */}
            <Modal visible={contextMenuVisible} transparent={true} animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <TouchableOpacity onPress={() => deleteMedia(selectedVideo?.uri)}>
                            <Text style={styles.menuOption}>Delete Video</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleOpenVideo(selectedVideo)}>
                            <Text style={styles.menuOption}>Play Video</Text>
                        </TouchableOpacity>
                        {!selectedVideo?.password && (
                            <TouchableOpacity onPress={handleAddPassword}>
                                <Text style={styles.menuOption}>Add Password</Text>
                            </TouchableOpacity>
                        )}
                        {selectedVideo?.password && (
                            <TouchableOpacity onPress={handleRemovePassword}>
                                <Text style={styles.menuOption}>Remove Password</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={() => setContextMenuVisible(false)}>
                            <Text style={styles.menuOption}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Password Input Modal */}
            <Modal visible={passwordVisible} transparent={true} animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <TextInput
                            style={styles.input}
                            value={enteredPassword}
                            onChangeText={setEnteredPassword}
                            placeholder="Enter Password"
                            secureTextEntry={true}
                        />
                        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                        {hintMessage ? <Text style={styles.hintText}>{hintMessage}</Text> : null}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handlePasswordSubmit}
                            >
                                <Text style={styles.saveButtonText}>Submit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setPasswordVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Remove Password Modal */}
            <Modal visible={removePasswordVisible} transparent={true} animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <TextInput
                            style={styles.input}
                            value={enteredPassword}
                            onChangeText={setEnteredPassword}
                            placeholder="Enter Password to Remove"
                            secureTextEntry={true}
                        />
                        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                        {hintMessage ? <Text style={styles.hintText}>{hintMessage}</Text> : null}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleRemovePasswordSubmit}
                            >
                                <Text style={styles.saveButtonText}>Remove Password</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setRemovePasswordVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Add Password Modal */}
            <Modal visible={modalVisible} transparent={true} animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <TextInput
                            style={styles.input}
                            value={currentVideo.password}
                            onChangeText={(text) => setCurrentVideo({ ...currentVideo, password: text })}
                            placeholder="Password"
                            secureTextEntry={true}
                        />
                        <TextInput
                            style={styles.input}
                            value={currentVideo.hint}
                            onChangeText={(text) => setCurrentVideo({ ...currentVideo, hint: text })}
                            placeholder="Hint"
                        />
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.saveButton} onPress={updateVideo}>
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Video Playback Modal */}
            <Modal visible={videoModalVisible} transparent={true} animationType="slide">
                <View style={styles.videoModal}>
                    <Video
                        source={{ uri: selectedVideo?.uri || '' }}
                        style={styles.videoPlayer}
                        shouldPlay
                        resizeMode="contain"
                        isLooping
                    />
                    <TouchableOpacity
                        onPress={() => setVideoModalVisible(false)}
                        style={styles.closeModalButton}
                    >
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1F5460',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuButton: {
        position: 'absolute',
        top: height * 0.1,
        right: width * 0.05,
    },
    title: {
        color: '#FFCA42',
        fontSize: width * 0.06,
        marginTop: height * 0.08,
        marginLeft: -width * 0.7,
    },
    videoList: {
        padding: width * 0.06,
        width: '100%',
    },
    videoItem: {
        width: width > 600 ? width / 4 - width * 0.06 : width / 3 - width * 0.06,
        height: width > 600 ? width / 4 - width * 0.06 : width / 3 - width * 0.06,
        margin: width * 0.015,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    videoThumbnail: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    lockedVideo: {
        width: '100%',
        height: '100%',
        backgroundColor: '#FFCA42',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lockIcon: {
        position: 'absolute',
        top: 5,
        right: 5,
    },
    popupBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    popupMenu: {
        backgroundColor: '#fff',
        padding: width * 0.05,
        borderRadius: 10,
        width: width * 0.6,
    },
    popupOption: {
        marginBottom: height * 0.02,
    },
    popupText: {
        color: '#1F5460',
        fontSize: width * 0.045,
    },
    closeButton: {
        alignSelf: 'center',
        marginTop: height * 0.02,
    },
    closeButtonText: {
        color: '#1F5460',
        fontSize: width * 0.045,
    },
    videoModal: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    videoPlayer: {
        width: '90%',
        height: '70%',
    },
    closeModalButton: {
        position: 'absolute',
        top: height * 0.02,
        right: width * 0.05,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        backgroundColor: 'white',
        padding: width * 0.05,
        borderRadius: 10,
        width: width * 0.85,
        maxHeight: height * 0.7,
    },
    input: {
        height: height * 0.06,
        borderBottomWidth: 1,
        borderColor: '#FFCA42',
        marginBottom: height * 0.02,
        paddingLeft: width * 0.03,
        fontSize: width * 0.04,
    },
    errorText: {
        color: 'red',
        fontSize: width * 0.04,
        marginBottom: height * 0.02,
    },
    hintText: {
        color: '#666',
        fontSize: width * 0.04,
        marginBottom: height * 0.02,
    },
    menuOption: {
        fontSize: width * 0.045,
        padding: width * 0.03,
        textAlign: 'center',
    },
    saveButton: {
        padding: width * 0.03,
        backgroundColor: '#FFCA42',
        borderRadius: 5,
        flex: 1,
        marginHorizontal: width * 0.01,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: width * 0.045,
        textAlign: 'center',
    },
    cancelButton: {
        padding: width * 0.03,
        flex: 1,
        marginHorizontal: width * 0.01,
    },
    cancelButtonText: {
        color: '#1F5460',
        fontSize: width * 0.045,
        textAlign: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});

export default VideosScreen;