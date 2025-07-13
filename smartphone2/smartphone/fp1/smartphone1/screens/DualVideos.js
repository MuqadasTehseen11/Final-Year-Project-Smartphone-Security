import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Modal, ActivityIndicator, BackHandler } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, listAll } from "firebase/storage";
import { storage } from '../firebase';
import { useNavigation } from '@react-navigation/native'; // ✅ Navigation Import

const DualVideos = () => {
    const [videos, setVideos] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation(); // ✅ Navigation Hook

    useEffect(() => {
        fetchVideos();

        // ✅ Android Hardware Back Button Handle karo
        const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
        return () => backHandler.remove();
    }, []);

    const handleBackPress = () => {
        if (modalVisible) {
            setModalVisible(false);
            return true; // Stops default back action
        }
        navigation.navigate('SelectionScreen'); // ✅ Back press pe redirect
        return true;
    };

    const pickVideo = async () => {
        let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("Permission to access gallery is required!");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            quality: 1,
        });

        if (!result.canceled) {
            const videoUri = result.assets[0].uri;
            uploadVideo(videoUri);
        }
    };

    const uploadVideo = async (uri) => {
        setLoading(true);
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const filename = `videos/${Date.now()}.mp4`;
            const storageRef = ref(storage, filename);
            const uploadTask = uploadBytesResumable(storageRef, blob);

            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`);
                },
                (error) => {
                    console.error("Upload failed:", error);
                    Alert.alert("Upload failed", error.message);
                    setLoading(false);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    setVideos((prevVideos) => [...prevVideos, { uri: downloadURL }]);
                    Alert.alert("Success", "Video uploaded successfully!");
                    setLoading(false);
                }
            );
        } catch (error) {
            console.error("Error uploading video:", error);
            Alert.alert("Error", "Could not upload video");
            setLoading(false);
        }
    };

    const fetchVideos = async () => {
        setLoading(true);
        try {
            const storageRef = ref(storage, "videos/");
            const result = await listAll(storageRef);
            const urls = await Promise.all(result.items.map(async (item) => {
                const downloadURL = await getDownloadURL(item);
                return { uri: downloadURL };
            }));

            setVideos(urls);
        } catch (error) {
            console.error("Error fetching videos:", error);
            Alert.alert("Error", "Could not fetch videos");
        }
        setLoading(false);
    };

    const renderVideoItem = ({ item }) => (
        <TouchableOpacity onPress={() => playVideo(item.uri)} style={styles.videoItem}>
            <Video source={{ uri: item.uri }} style={styles.videoPlayer} resizeMode="contain" shouldPlay={false} isLooping />
        </TouchableOpacity>
    );

    const playVideo = (uri) => {
        setSelectedVideo(uri);
        setModalVisible(true);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={pickVideo} style={styles.menuButton}>
                <MaterialIcons name="more-vert" size={24} color="#FFCA42" />
            </TouchableOpacity>

            <Text style={styles.title}>Dual Videos</Text>

            {loading && <ActivityIndicator size="large" color="#FFCA42" style={{ marginBottom: 10 }} />}

            <FlatList
                data={videos}
                renderItem={renderVideoItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.videoList}
                numColumns={3}
            />

            {/* Video Modal */}
            <Modal visible={modalVisible} transparent={true} animationType="slide">
                <View style={styles.modalContainer}>
                    <Video source={{ uri: selectedVideo }} style={styles.modalVideoPlayer} resizeMode="contain" shouldPlay isLooping />
                    <TouchableOpacity onPress={() => { setModalVisible(false); navigation.navigate('SelectionScreen'); }} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'flex-start', alignItems: 'flex-start', backgroundColor: '#0D0D0D', padding: 20 },
    menuButton: { position: 'absolute', top: 40, right: 20, marginTop: 40 },
    title: { color: '#00FF00', fontSize: 28, marginTop: 50, marginBottom: 20, fontFamily: 'monospace' },
    videoList: { padding: 14, width: '100%' },
    videoItem: { marginBottom: 20, borderRadius: 10, padding: 5, marginRight: 15, width: '30%' },
    videoPlayer: { width: '100%', height: 100 },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
    modalVideoPlayer: { width: '90%', height: 300 },
    closeButton: { position: 'absolute', top: 40, right: 20 },
    closeButtonText: { color: '#FFCA42', fontSize: 18 },
});

export default DualVideos;
