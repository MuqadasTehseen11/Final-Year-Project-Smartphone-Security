import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebase'; // Ensure firebase is correctly initialized
import { ref, get, set } from 'firebase/database'; // Import set for creating nodes
import { database } from '../firebase'; // Ensure database is initialized correctly
import { useImageContext } from './ImageContext'; // Import context to store captured image

const DecoyLogin = () => {
    const navigation = useNavigation();
    const { setCapturedImage } = useImageContext(); // Get the context setter
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [attempts, setAttempts] = useState(0);

    const handleLogin = async () => {
        if (attempts >= 3) {
            Alert.alert("Too many attempts", "You have exceeded the maximum number of login attempts. Redirecting to camera screen.");
            navigation.navigate('CameraScreen'); // Navigate to CameraScreen
            return;
        }

        try {
            // Fetch user data from DecoyData node
            const userRef = ref(database, 'DecoyData');
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
                const users = snapshot.val();
                const userKeys = Object.keys(users);
                let validUser  = false;

                // Check if the entered credentials match any user
                for (let key of userKeys) {
                    const user = users[key];
                    if (user.email === email && user.password === password) {
                        validUser  = true;

                        // Create node in Firebase Storage structure
                        const fakeDataRef = ref(database, `fakeData/${user.username}`);
                        await set(fakeDataRef, {
                            images: {},
                            videos: {}
                        });

                        break;
                    }
                }

                if (validUser ) {
                    Alert.alert("Congratulations", "You are successfully logged in!");
                    setEmail('');
                    setPassword('');
                    setAttempts(0);
                    navigation.navigate('SelectionScreen'); // Navigate to Home screen
                } else {
                    setAttempts((prevAttempts) => prevAttempts + 1);
                    Alert.alert("Login Failed", "Please enter correct data");
                    setEmail('');
                    setPassword('');
                }
            } else {
                Alert.alert("Error", "No user data found.");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            Alert.alert("Error", "An error occurred while trying to log in.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subText}>Enter your credentials to continue</Text>

            <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                    <Icon name="user" size={20} color="#A9A9A9" style={styles.icon} />
                    <TextInput 
                        style={styles.input} 
                        placeholder="Email or Username" 
                        placeholderTextColor="#A9A9A9"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>
                <View style={styles.inputWrapper}>
                    <Icon name="lock" size={20} color="#A9A9A9" style={styles.icon} />
                    <TextInput 
                        style={styles.input} 
                        placeholder="Password" 
                        secureTextEntry={true} 
                        placeholderTextColor="#A9A9A9"
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={styles.buttonLogin} 
                    onPress={handleLogin}
                >
                    <Text style={styles.buttonText}>Log In</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F5F5F5',
    },
    welcomeText: {
        fontWeight: '600',
        fontSize: 36,
        color: '#1F5460',
        marginBottom: 20,
    },
    subText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 40,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 20,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#CCCCCC',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        backgroundColor: '#FFFFFF',
    },
    input: {
        height: 50,
        flex: 1,
        paddingLeft: 15,
        fontSize: 16,
    },
    icon: {
        padding: 10,
    },
    forgotPasswordText: {
        textAlign: 'right',
        color: '#1F5460',
        marginBottom: 10,
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
    },
    buttonLogin: {
        backgroundColor: '#FFCA42',
        width: '100%',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    }
});

export default DecoyLogin;