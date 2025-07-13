import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For the app icon
import { ThemeContext } from './ThemeContext'; // Adjust the path as necessary
import Icon from 'react-native-vector-icons/MaterialIcons';

const AboutScreen = () => {
    const { currentTheme } = useContext(ThemeContext); // Accessing current theme
    const handlePanicButtonPress = () => {
        navigation.navigate('calculator'); // Navigate to Calculator screen
    };

    return (
        <View style={[styles.container, { backgroundColor: currentTheme.primary }]}>
            {/* HeavenHub Title */}
            <Text style={[styles.title, { color: currentTheme.secondary }]}>HeavenHub</Text>

            {/* App Icon */}
            <Ionicons name="shield-checkmark" size={100} color={currentTheme.accent} style={styles.icon} />

            {/* App Version */}
            <Text style={[styles.version, { color: currentTheme.secondary }]}>Version 1.0.0</Text>

            {/* Year of Making */}
            <Text style={[styles.year, { color: currentTheme.secondary }]}>2021-2025</Text>

            {/* Licenses Button */}
            <TouchableOpacity 
                style={[styles.licenseButton, { backgroundColor: currentTheme.accent }]} 
                onPress={() => alert('Licenses Info')}
            >
                <Text style={[styles.buttonText, { color: currentTheme.buttonTextColor || '#fff' }]}>Licenses</Text>
            </TouchableOpacity>
        </View>
        
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 32, // Increased font size for more emphasis
        fontWeight: 'bold', // Made the font bold
        marginBottom: 20,
    },
    icon: {
        marginBottom: 20, // Space between icon and title
    },
    version: {
        fontSize: 16,
        marginBottom: 10, // Space between version and year
    },
    year: {
        fontSize: 16,
        marginBottom: 30, // Space between year and button
    },
    licenseButton: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    panicButton: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
});

export default AboutScreen;