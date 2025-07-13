import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { auth, database } from '../firebase'; // Firebase import
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';

const SignUpScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [address, setAddress] = useState('');

    const isValidEmail = (email) => {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    };

    const handleSignUp = async () => {
        if (password !== confirmPassword) {
            Alert.alert("Passwords do not match!");
            return;
        }
        if (!isValidEmail(email)) {
            Alert.alert("Please enter a valid email address.");
            return;
        }

        try {
            // Check if username already exists
            const userRef = ref(database, `users/${name}`);
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
                Alert.alert("Username already taken. Please choose another.");
                return;
            }

            // Create user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Save Real Data in Realtime Database
            await set(ref(database, `users/${name}/real_data`), {
                name: name,
                email: email,
                address: address,
                password: password,
            });

            // Save Decoy Data in Realtime Database
            await set(ref(database, `users/${name}/decoy_data`), {
                name: "Unknown",
                email: "hidden@unknown.com",
                address: "Confidential",
                password: "********",
            });

            Alert.alert('User created successfully!');
            setName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setAddress('');
        } catch (error) {
            console.log("Error creating user:", error);
            if (error.code === 'auth/email-already-in-use') {
                Alert.alert('Email already in use.');
            } else {
                Alert.alert(error.message);
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>Create an Account</Text>
            <Text style={styles.subText}>Please fill in the details below</Text>
            
            <TextInput placeholder="Name" onChangeText={setName} value={name} style={styles.input} />
            <TextInput placeholder="Email" onChangeText={setEmail} value={email} style={styles.input} />
            <TextInput placeholder="Address" onChangeText={setAddress} value={address} style={styles.input} />
            <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} value={password} style={styles.input} />
            <TextInput placeholder="Confirm Password" secureTextEntry onChangeText={setConfirmPassword} value={confirmPassword} style={styles.input} />
            
            <TouchableOpacity style={styles.buttonSignUp} onPress={handleSignUp}>
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            <Text style={styles.loginPrompt}>
                Already have an account? 
                <Text style={styles.loginLink} onPress={() => navigation.navigate('Login')}> Log In</Text>
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#F5F5F5',
    },
    welcomeText: {
        fontWeight: '600',
        fontSize: 36,
        color: '#1F5460',
        marginBottom: 20,
        textAlign: 'center',
    },
    subText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 40,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderColor: '#CCCCCC',
        borderWidth: 1,
        marginBottom: 12,
        borderRadius: 8,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
    },
    buttonSignUp: {
        backgroundColor: '#FFCA42',
        height: 50,
        justifyContent: 'center',
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    loginPrompt: {
        marginTop: 20,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    loginLink: {
        color: '#FFCA42',
        fontWeight: '600',
    },
});

export default SignUpScreen;
