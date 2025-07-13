import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function IntruderScreen() {
    const [intruderImage, setIntruderImage] = useState(null);
    const [blinkAnim] = useState(new Animated.Value(0));
    const [shakeAnim] = useState(new Animated.Value(0));
    const [scrollAnim] = useState(new Animated.Value(-width));

    useEffect(() => {
        const loadIntruderData = async () => {
            const storedImage = await AsyncStorage.getItem('intruderImage');
            if (storedImage) {
                setIntruderImage(storedImage);
            }
        };

        loadIntruderData();

        // Blinking effect for "Unauthorized Access Detected"
        Animated.loop(
            Animated.sequence([
                Animated.timing(blinkAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.timing(blinkAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
            ])
        ).start();

        // Shaking effect for alert text
        Animated.loop(
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 5, duration: 100, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -5, duration: 100, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
            ])
        ).start();

        // Moving red alert bar
        Animated.loop(
            Animated.timing(scrollAnim, {
                toValue: width,
                duration: 3000,
                useNativeDriver: true,
            })
        ).start();

        // Clear intruder data after loading
        const clearIntruderData = async () => {
            await AsyncStorage.removeItem('intruderImage');
        };

        clearIntruderData();

    }, []);

    return (
        <View style={styles.container}>
            {/* Red Moving Alert Bar */}
            <Animated.View style={[styles.alertBar, { transform: [{ translateX: scrollAnim }] }]}>
                <Text style={styles.alertBarText}>⚠️ SECURITY BREACH DETECTED ⚠️</Text>
            </Animated.View>

            {/* Glitch Effect on Unauthorized Access Text */}
            <Animated.Text style={[styles.title, { opacity: blinkAnim, transform: [{ translateX: shakeAnim }] }]}>
                {intruderImage ? '⚠️ UNAUTHORIZED ACCESS DETECTED ⚠️' : '✅ No Unauthorized Activity Detected'}
            </Animated.Text>

            {intruderImage ? (
                <>
                    <Image source={{ uri: intruderImage }} style={styles.image} />
                    <Animated.Text style={[styles.alertText, { opacity: blinkAnim }]}>
                        🚨 Intruder Detected - Data Compromised 🚨
                    </Animated.Text>
                </>
            ) : (
                <Text style={styles.noImage}>✅ No Unauthorized Activity Detected</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
        padding: 20,
    },
    alertBar: {
        position: 'absolute',
        top: 40,
        width: '100%',
        paddingVertical: 5,
        backgroundColor: 'red',
        opacity: 0.8,
    },
    alertBarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
         color: '#ff0000',
        textAlign: 'center',
        textShadowColor: 'rgba(255, 0, 0, 1)',
        textShadowOffset: { width: 3, height: 3 },
        textShadowRadius: 5,
        marginBottom: 20,
    },
    image: {
        width: 300,
        height: 400,
        borderRadius: 10,
        marginBottom: 20,
    },
    alertText: {
        fontSize: 18,
        color: '#ff0000',
        textAlign: 'center',
        marginTop: 10,
    },
    noImage: {
        fontSize: 18,
        color: '#00ff00',
        textAlign: 'center',
    },
});