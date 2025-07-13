import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from './ThemeContext'; // Optional theme context if used

const MyFolderScreen = () => {
    const navigation = useNavigation();
    const { currentTheme } = useContext(ThemeContext) || { currentTheme: { primary: '#fff', accent: '#000' } };
    const [folders, setFolders] = useState([]);

    const loadFolders = async () => {
        try {
            const storedFolders = await AsyncStorage.getItem('folders');
            if (storedFolders) {
                const parsedFolders = JSON.parse(storedFolders);
                const activeFolders = parsedFolders.filter(folder => !folder.deleted);
                setFolders(activeFolders);
            } else {
                setFolders([]);
            }
        } catch (error) {
            console.error("Error loading folders", error);
            Alert.alert('Error loading folders');
        }
    };

    useEffect(() => {
        loadFolders();
    }, []);

    const items = [
        { name: 'Images', icon: 'image-outline', screen: 'ImagesScreen' },
        { name: 'Videos', icon: 'videocam-outline', screen: 'VideosScreen' },
        { name: 'Files', icon: 'document-outline', screen: 'FilesScreen' },
        { name: 'Notes', icon: 'document-text-outline', screen: 'NotesScreen' },
        { name: 'Folders', icon: 'folder-outline', screen: 'CreationFolder' },
        { name: 'Intruder Selfie', icon: 'camera-outline', screen: 'IntruderScreen' },  // Updated to navigate to IntruderScreen
    ];

    return (
        <View style={[styles.container, { backgroundColor: currentTheme.primary }]}>
            <View style={[styles.titleContainer, { backgroundColor: currentTheme.accent }]}>
                <Icon name="folder-open-outline" size={30} color={currentTheme.primary} />
                <Text style={[styles.title, { color: currentTheme.primary }]}>File Manager</Text>
            </View>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <View style={styles.outerContainer}>
                    <View style={styles.grid}>
                        {items.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.itemContainer}
                                onPress={() => {
                                    if (item.screen) {
                                        navigation.navigate(item.screen); // This will navigate to the respective screen
                                    } else {
                                        Alert.alert('Coming Soon', `${item.name} is not available yet.`);
                                    }
                                }}
                            >
                                <View style={styles.innerContainer}>
                                    <Icon name={item.icon} size={50} color={currentTheme.accent} />
                                    <Text style={[styles.itemName, { color: currentTheme.accent }]}>{item.name}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
        paddingTop: 70,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    contentContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    outerContainer: {
        borderWidth: 5,
        borderColor: '#FFCA42',
        borderRadius: 30,
        padding: 5,
        backgroundColor: '#294B5A',
        marginLeft: 1,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        width: '100%',
    },
    itemContainer: {
        margin: 10,
        width: '25%',
    },
    innerContainer: {
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#1F5460',
        borderRadius: 10,
    },
    itemName: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
    },
});

export default MyFolderScreen;
