// SplashScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SplashScreen = () => {
    const navigation = useNavigation();

    useEffect(() => {
        const timer = setTimeout(() => {
            if (navigation && typeof navigation.replace === 'function') {
                navigation.replace('Login'); // Navigate to Login screen after 2 seconds
            }
        }, 2000);

        return () => clearTimeout(timer); // Clear timer on unmount
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image
                    source={{ uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUoNw01q0001NnLw_rHeL_6cVd24RQy8hM-A&s" }}
                    style={styles.logo}
                    onError={(e) => console.log('Error loading image:', e.nativeEvent.error)}
                />
            </View>
            <Text style={styles.titleText}>HavenHub</Text>
            <Text style={styles.subtitleText}>Let’s get started</Text>
            <Text style={styles.subText}>Everything starts from here</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1F5460',
        padding: 20,
    },
    logoContainer: {
        marginBottom: 60,
    },
    logo: {
        width: 250,
        height: 250,
        borderRadius: 125,
    },
    titleText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#FFCA42',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitleText: {
        fontSize: 36,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 5,
    },
    subText: {
        fontSize: 18,
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 50,
    },
});

export default SplashScreen;
