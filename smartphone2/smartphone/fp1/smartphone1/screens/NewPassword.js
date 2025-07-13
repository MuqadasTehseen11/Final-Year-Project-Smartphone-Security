import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { ThemeContext } from './ThemeContext'; // Import ThemeContext
import { auth } from '../firebase'; // Adjust the path if firebase.js is in a different directory
import { updatePassword } from 'firebase/auth';
import { getDatabase, ref, update } from 'firebase/database'; // Import necessary functions
import { useNavigation } from '@react-navigation/native'; // Import useNavigation for navigation

const NewPassword = () => {
    const { currentTheme } = useContext(ThemeContext); // Access current theme
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigation = useNavigation(); // Initialize navigation

    const handleSubmit = () => {
        // Check if fields are empty
        if (!newPassword || !confirmPassword) {
            alert('Please fill in both fields.');
            return; // Exit the function if fields are empty
        }

        if (newPassword === confirmPassword) {
            const user = auth.currentUser;
            if (user) {
                // Update password in Firebase Auth
                updatePassword(user, newPassword)
                    .then(() => {
                        // Update password in Realtime Database
                        const db = getDatabase(); // Get database reference
                        const userRef = ref(db, 'users/' + user.uid); // Reference to the user's node in the database

                        update(userRef, { password: newPassword }) // Update password in the database
                            .then(() => {
                                alert('Password changed successfully!');
                                // Clear input fields
                                setNewPassword('');
                                setConfirmPassword('');
                                // Navigate to SettingsScreen
                                navigation.navigate('SettingsScreen');
                            })
                            .catch(error => {
                                alert(`Error updating password in database: ${error.message}`);
                            });
                    })
                    .catch(error => {
                        alert(`Error changing password: ${error.message}`);
                    });
            } else {
                alert('No user is signed in.');
            }
        } else {
            alert('Passwords do not match. Please try again.');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: currentTheme.primary }]}>
            <View style={[styles.header, { backgroundColor: currentTheme.secondary }]}>
                <Text style={[styles.appName, { color: currentTheme.primary }]}>Change Password</Text>
            </View>
            <View style={styles.iconContainer}>
                <Image
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/256/257/257418.png' }}
                    style={styles.lockIcon}
                />
            </View>
            <Text style={[styles.description, { color: currentTheme.accent }]}>
                Please enter your new password.
            </Text>
            <TextInput
                style={[styles.input, { borderColor: currentTheme.accent, backgroundColor: currentTheme.inputBackground }]}
                placeholder="New Password"
                secureTextEntry={true}
                value={newPassword}
                onChangeText={setNewPassword}
            />
            <TextInput
                style={[styles.input, { borderColor: currentTheme.accent, backgroundColor: currentTheme.inputBackground }]}
                placeholder="Confirm Password"
                secureTextEntry={true}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />
            <TouchableOpacity style={[styles.button, { backgroundColor: currentTheme.accent }]} onPress={handleSubmit}>
                <Text style={[styles.buttonText, { color: currentTheme.primary }]}>Submit</Text>
            </TouchableOpacity>
            <View style={styles.alternateMethod}>
                <TouchableOpacity onPress={() => navigation.navigate('HelpScreen')}>
                    <Text style={[styles.alternateText, { color: currentTheme.accent }]}>Need help?</Text>
                </TouchableOpacity>
            </View>
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
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 30,
    },
    iconContainer: {
        alignItems: 'center',
    },
    lockIcon: {
        width: 120,
        height: 120,
        tintColor: '#FFCA42',
        resizeMode: 'contain',
        marginTop: 70,
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 25,
        paddingHorizontal: 20,
        fontSize: 16,
        marginBottom: 20,
        color: '#333',
        marginTop: 10,
        marginLeft: 20,
        marginRight: 20,
    },
    button: {
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginLeft: 20,
        marginRight: 20,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    alternateMethod: {
        marginTop: 20,
        alignItems: 'center',
    },
    alternateText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default NewPassword;
