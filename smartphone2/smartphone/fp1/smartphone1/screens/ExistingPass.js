// ExistingPass.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from './ThemeContext';
import { auth } from '../firebase'; // Adjust path based on firebase.js location
import { signInWithEmailAndPassword } from 'firebase/auth';

const ExistingPass = () => {
    const { currentTheme } = useContext(ThemeContext);
    const [currentPassword, setCurrentPassword] = useState('');
    const navigation = useNavigation();

    const handlePasswordChange = async () => {
        try {
            const user = auth.currentUser;
            const email = user.email;

            await signInWithEmailAndPassword(auth, email, currentPassword);
            setCurrentPassword(''); // Clear the password input field after successful submission
            navigation.navigate('NewPassword');
        } catch (error) {
            alert('Incorrect password. Please try again.');
            setCurrentPassword(''); // Clear the password input field on error
        }
    };

    const handleTryAnotherWay = () => {
        navigation.navigate('NewPassword');
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

            <Text style={[styles.description, { color: currentTheme.secondary }]}>
                Please Enter Your Existing Password.
            </Text>

            <TextInput
                style={[styles.input, { borderColor: currentTheme.accent, backgroundColor: currentTheme.secondary, color: currentTheme.textColor }]}
                placeholder="Current Password"
                secureTextEntry={true}
                value={currentPassword}
                onChangeText={setCurrentPassword}
            />

            <TouchableOpacity style={[styles.button, { backgroundColor: currentTheme.accent }]} onPress={handlePasswordChange}>
                <Text style={[styles.buttonText, { color: currentTheme.primary }]}>Send</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity style={styles.alternateMethod} onPress={handleTryAnotherWay}>
                <Text style={[styles.alternateText, { color: currentTheme.secondary }]}>Try another way</Text>
            </TouchableOpacity> */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
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
    iconContainer: { alignItems: 'center', marginTop: 70 },
    lockIcon: {
        width: 120,
        height: 120,
        tintColor: '#FFCA42',
        resizeMode: 'contain',
        marginTop:75,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 25,
        paddingHorizontal: 20,
        fontSize: 16,
        marginBottom: 20,
        marginTop: 20,
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

export default ExistingPass;
