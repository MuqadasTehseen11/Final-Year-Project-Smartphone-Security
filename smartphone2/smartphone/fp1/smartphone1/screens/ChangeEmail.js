import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { auth, database } from '../firebase'; // Ensure database is initialized correctly
import { ref, set } from 'firebase/database'; // Import Firebase database functions

const ChangeEmail = () => {
    const [newEmail, setNewEmail] = useState('');

    const handleChange = async () => {
        if (newEmail === '') {
            Alert.alert('Error', 'Please enter a new email.');
            return;
        }

        const user = auth.currentUser;

        if (user) {
            try {
                // Directly store the new email in Firebase Realtime Database
                const userId = user.uid;
                await set(ref(database, 'Email/' + userId), {
                    email: newEmail
                });

                Alert.alert('Success', 'Your email has been saved successfully!');
                
                // Clear the email field after successful update
                setNewEmail('');
            } catch (error) {
                Alert.alert('Error', error.message);
            }
        } else {
            Alert.alert('Error', 'No user is currently signed in.');
        }
    };

    return (
        <View style={styles.wrapper}>
            <View style={styles.container}>
                <Text style={styles.title}>Change Email</Text>
                <Text style={styles.subtitle}>Please enter your new email</Text>
                
                <TextInput
                    style={styles.input}
                    placeholder="New Email"
                    value={newEmail}
                    onChangeText={setNewEmail}
                />
                
                <TouchableOpacity style={styles.button} onPress={handleChange}>
                    <Text style={styles.buttonText}>Change Now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        backgroundColor: '#1F5460',
        borderRadius: 20,
        padding: 60,
        width: '90%',
        elevation: 5,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#fff',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#FFCA42',
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 15,
        width: '100%',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ChangeEmail;
