import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from './ThemeContext';
import { Accelerometer } from 'expo-sensors';
import { useNavigation, useNavigationState } from '@react-navigation/native';

const SHAKE_THRESHOLD = 2.5; // Thoda strong shake required
const MAX_SHAKE_INTERVAL = 800; // ms

const restrictedScreens = [
    'Login',
    'calculator',
    'Screen3',
    'Screen4',
    'Screen5',
    'GetStarted',
    'Splash',
];

const MotionDetection = () => {
    const { currentTheme } = useContext(ThemeContext);
    const [isShakeEnabled, setIsShakeEnabled] = useState(false);
    const [subscription, setSubscription] = useState(null);
    const navigation = useNavigation();
    const currentRoute = useNavigationState((state) => state?.routes[state.index]?.name);

    useEffect(() => {
        let lastDirection = null;
        let shakeCount = 0;
        let lastShakeTime = Date.now();

        if (isShakeEnabled) {
            const sub = Accelerometer.addListener(accelerometerData => {
                const { x, y, z } = accelerometerData;
                const totalForce = Math.sqrt(x * x + y * y + z * z);
                const direction = x > 0 ? 'right' : 'left';

                if (direction !== lastDirection) {
                    const now = Date.now();
                    if (now - lastShakeTime < MAX_SHAKE_INTERVAL) {
                        shakeCount++;
                    } else {
                        shakeCount = 1;
                    }

                    lastShakeTime = now;
                    lastDirection = direction;

                    if (shakeCount >= 4 && totalForce > SHAKE_THRESHOLD) {
                        if (!restrictedScreens.includes(currentRoute)) {
                            Vibration.vibrate(100);
                            navigation.navigate('SelectionScreen');
                            shakeCount = 0; // Reset after navigation
                        }
                    }
                }
            });

            setSubscription(sub);
        }

        return () => {
            subscription && subscription.remove();
            setSubscription(null);
        };
    }, [isShakeEnabled, currentRoute]);

    const handleEnableProtection = () => {
        Alert.alert(
            'Enable Shake Detection',
            'Do you want to enable shake detection so that shaking the device will navigate between screens?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes',
                    onPress: () => {
                        setIsShakeEnabled(true);
                        Alert.alert('Motion Detection', 'Shake detection has been enabled.');
                    },
                },
            ]
        );
    };

    const handleDisableProtection = () => {
        setIsShakeEnabled(false);
        subscription && subscription.remove();
        setSubscription(null);
        Alert.alert('Motion Detection', 'Shake detection has been disabled.');
    };

    return (
        <View style={[styles.container, { backgroundColor: currentTheme.primary }]}>
            <Text style={[styles.title, { color: currentTheme.accent }]}>Motion Detection</Text>
            <Text style={[styles.description, { color: currentTheme.text }]}>
                Enable Motion Detection to secure your device from unauthorized access.
            </Text>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: currentTheme.accent }]}
                onPress={handleEnableProtection}
            >
                <Ionicons
                    name="shield-checkmark"
                    size={24}
                    color={isShakeEnabled ? 'red' : '#FFFFFF'}
                />
                <Text style={[styles.buttonText, { color: currentTheme.buttonText }]}>
                    Enable Detection
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: currentTheme.accent }]}
                onPress={handleDisableProtection}
            >
                <Ionicons
                    name="shield-off"
                    size={24}
                    color={!isShakeEnabled ? 'gold' : '#FFFFFF'}
                />
                <Text style={[styles.buttonText, { color: currentTheme.buttonText }]}>
                    Disable Detection
                </Text>
            </TouchableOpacity>

            <Text style={[styles.statusText, { color: currentTheme.text }]}>
                Shake Detection is {isShakeEnabled ? 'Enabled' : 'Disabled'}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 5,
        marginVertical: 10,
        width: '100%',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 18,
        marginLeft: 10,
    },
    statusText: {
        fontSize: 16,
        marginTop: 20,
    },
});

export default MotionDetection;
