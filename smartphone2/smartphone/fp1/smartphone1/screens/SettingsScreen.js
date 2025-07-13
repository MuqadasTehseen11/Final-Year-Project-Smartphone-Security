import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Alert, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from './ThemeContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const settingsOptions = [
    { id: '1', title: 'Account', icon: 'person' },
    { id: '2', title: 'Notifications', icon: 'notifications' },
    { id: '3', title: 'Appearance', icon: 'eye' },
    { id: '4', title: 'Privacy & Security', icon: 'lock-closed' },
    { id: '5', title: 'Help and Support', icon: 'headset' },
    { id: '6', title: 'About', icon: 'information-circle' },
    { id: '7', title: 'Change Password', icon: 'key' },
    { id: '8', title: 'Motion Detection', icon: 'shield-checkmark' },
    { id: '9', title: 'Dual Space', icon: 'layers' }, // Dual Space without toggle
    { id: '10', title: 'Switch Account', icon: 'swap-horizontal' },
    { id: '11', title: 'Logout', icon: 'log-out' },
];

const SettingsScreen = ({ navigation }) => {
    const { currentTheme } = useContext(ThemeContext);
    const [modalVisible, setModalVisible] = useState(false);

    const handleOptionPress = (option) => {
        switch (option) {
            case 'Change Password':
                navigation.navigate('ExistingPass');
                break;
            case 'Account':
                navigation.navigate('AccountScreen');
                break;
            case 'Notifications':
                navigation.navigate('NotificationScreen');
                break;
            case 'Appearance':
                navigation.navigate('ThemeSelectionScreen');
                break;
            case 'Privacy & Security':
                navigation.navigate('PrivacyScreen');
                break;
            case 'Help and Support':
                navigation.navigate('HelpScreen');
                break;
            case 'About':
                navigation.navigate('AboutScreen');
                break;
            case 'Motion Detection':
                navigation.navigate('MotionDetection');
                break;
            case 'Dual Space':
                navigation.navigate('DualSpace'); // Navigate to DualSpace screen
                break;
            case 'Switch Account':
                navigation.navigate('DecoyLogin'); // Navigate to DecoyLogin screen
                break;
            case 'Logout':
                setModalVisible(true);
                break;
            default:
                Alert.alert(option, `${option} pressed`);
        }
    };

    const confirmLogout = async () => {
        try {
            await signOut(auth);
            setModalVisible(false);
            navigation.navigate('Login');
            Alert.alert('Logout', 'You have been logged out.');
        } catch (error) {
            console.error("Error logging out:", error);
            Alert.alert('Logout Error', 'An error occurred while logging out. Please try again.');
        }
    };

    const cancelLogout = () => {
        setModalVisible(false);
    };

    return (
        <View style={[styles.container, { backgroundColor: currentTheme.primary }]}>
            <View style={styles.headerContainer}>
                <Text style={[styles.headerText, { color: currentTheme.accent }]}>Settings</Text>
            </View>
            <TextInput
                style={[styles.searchBar, { backgroundColor: currentTheme.accent, borderColor: currentTheme.primary, color: currentTheme.text }]}
                placeholder="Search for a setting..."
                placeholderTextColor={currentTheme.text}
            />
            <FlatList
                data={settingsOptions}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.option} onPress={() => handleOptionPress(item.title)}>
                        <Ionicons name={item.icon} size={24} color={currentTheme.accent} />
                        <Text style={[styles.optionText, { color: currentTheme.text }]}>{item.title}</Text>
                    </TouchableOpacity>
                )}
                keyExtractor={item => item.id}
            />

            {/* Logout Confirmation Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={cancelLogout}
            >
                <View style={styles.modalContainer}>
                    <View style={[styles.modalView, { backgroundColor: currentTheme.primary }]}>
                        <Text style={[styles.modalText, { color: currentTheme.accent }]}>Do you want to log out?</Text>
                        <View style={styles.buttonContainer}>
                            <Pressable style={[styles.button, { backgroundColor: currentTheme.accent }]} onPress={confirmLogout}>
                                <Text style={[styles.buttonText, { color: currentTheme.primary }]}>Logout</Text>
                            </Pressable>
                            <Pressable style={[styles.button, { backgroundColor: currentTheme.accent }]} onPress={cancelLogout}>
                                <Text style={[styles.buttonText, { color: currentTheme.primary }]}>Cancel</Text>
                            </Pressable>
                        </View>
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
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 10,
    },
    searchBar: {
        height: 50,
        borderColor: '#B0B0B0',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        width: '100%',
        alignSelf: 'center',
        marginLeft: 10,
        marginRight: 10,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#B0B0B0',
    },
    optionText: {
        fontSize: 18,
        flex: 1,
        marginLeft: 15,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        width: '85%',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
    },
    modalText: {
        fontSize: 15,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 15,
    },
    button: {
        borderRadius: 5,
        padding: 10,
        marginHorizontal: 10,
    },
    buttonText: {
        fontWeight: 'bold',
    },
});

export default SettingsScreen;