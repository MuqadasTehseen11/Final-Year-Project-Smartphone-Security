import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebase'; // Ensure firebase is correctly initialized
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Audio } from 'expo-av';
import { ref, push } from 'firebase/database'; // Import push for adding notifications
import { database } from '../firebase'; // Ensure database is initialized correctly
import { useImageContext } from './ImageContext'; // Import context to store captured image
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const LoginScreen = () => {
    const navigation = useNavigation();
    const { setCapturedImage } = useImageContext(); // Get the context setter
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [sound, setSound] = useState();
    const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);

    useEffect(() => {
        return sound
            ? () => {
                sound.unloadAsync(); // Unload sound when component unmounts
            }
            : undefined;
    }, [sound]);

    // Normalize and clean input by removing hidden spaces
    const normalizeText = (text) => {
        // Normalize the text to remove invisible characters (e.g., zero-width spaces)
        return text.replace(/\u200B/g, '').trim(); // Removing zero-width spaces (\u200B) and trimming the string
    };

    const handleLogin = async () => {
        if (attempts >= 3) {
            Alert.alert("Too many attempts", "You have exceeded the maximum number of login attempts. Redirecting to camera screen.");
            await recordUnauthorizedAccess(); // Record unauthorized access attempt
            await playAlarmSound(); // Play the alarm sound
            navigation.navigate('Splash'); // Navigate to CameraScreen
            return;
        }

        try {
            // Normalize email and password
            const cleanedEmail = normalizeText(email);
            const cleanedPassword = normalizeText(password);

            // Check if either of the inputs is empty
            if (cleanedEmail === '' || cleanedPassword === '') {
                Alert.alert("Invalid Input", "Please enter both email and password.");
                return;
            }

            // Proceed with login using the cleaned inputs
            const userCredential = await signInWithEmailAndPassword(auth, cleanedEmail, cleanedPassword);
            Alert.alert("Congratulations", "You are successfully logged in!");
            setEmail('');
            setPassword('');
            setAttempts(0);

            // Store the logged-in username (or email) in AsyncStorage
            await AsyncStorage.setItem('loggedInUsername', cleanedEmail);

            // Stop alarm if it's playing
            if (isAlarmPlaying) {
                await stopAlarmSound(); // Stop the alarm sound
            }

            navigation.navigate('Home'); // Navigate to the Home screen
        } catch (error) {
            setAttempts((prevAttempts) => prevAttempts + 1);
            console.log("Error logging in:", error);
            Alert.alert("Login Failed", "Please enter correct data");
            setEmail('');
            setPassword('');

            if (attempts + 1 >= 3) {
                await playAlarmSound(); // Play the alarm sound
                await recordUnauthorizedAccess(); // Record unauthorized access attempt
                Alert.alert("Warning", "You have 3 failed login attempts. Redirecting to camera screen.");
                navigation.navigate('CameraScreen'); // Navigate to CameraScreen
            }
        }
    };

    const recordUnauthorizedAccess = async () => {
        // Capture the image and store it in context
        const imageUri = await captureImage(); // Implement this function to capture the image
        setCapturedImage(imageUri); // Store the captured image in context

        const notificationRef = ref(database, `notifications`);
        await push(notificationRef, {
            message: 'Another user attempted to access your profile',
            timestamp: new Date().toISOString(),
        });
        console.log("Unauthorized access recorded.");
    };

    const captureImage = async () => {
        // Implement your image capturing logic here
        // Return the URI of the captured image
        return 'path/to/captured/image.jpg'; // Placeholder
    };

    const playAlarmSound = async () => {
        const { sound } = await Audio.Sound.createAsync(require('../assets/alarm.wav'));
        setSound(sound);
        await sound.playAsync();
        setIsAlarmPlaying(true);
    };

    const stopAlarmSound = async () => {
        if (isAlarmPlaying) {
            await sound.stopAsync();
            setIsAlarmPlaying(false);
        }
    };

    const handleChangeText = (field, value) => {
        if (field === 'email') {
            setEmail(value);
        } else if (field === 'password') {
            setPassword(value);
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
                        onChangeText={(value) => handleChangeText('email', value)}
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
                        onChangeText={(value) => handleChangeText('password', value)}
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

            <Text style={styles.signupText}>
                Don't have an account?
                <Text
                    style={styles.signupLink}
                    onPress={() => navigation.navigate('Signup')}
                > Signup
                </Text>
            </Text>
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
    },
    signupText: {
        marginTop: 20,
        fontSize: 16,
        color: '#666',
    },
    signupLink: {
        color: '#FFCA42',
        fontWeight: '600',
    },
});

export default LoginScreen;