import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { ThemeContext } from './ThemeContext'; // Import ThemeContext

const PrivacyScreen = () => {
    const { currentTheme } = useContext(ThemeContext); // Accessing current theme

    return (
        <ScrollView style={[styles.container, { backgroundColor: currentTheme.primary }]}>
            <View style={[styles.header, { backgroundColor: currentTheme.secondary }]}>
                <Text style={[styles.appName, { color: currentTheme.primary }]}>Privacy and Security</Text>
               
            </View>
            <View style={styles.iconContainer}>
                <Image 
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/890/890132.png' }} 
                    style={styles.icon} 
                />
            </View>
            <Text style={[styles.title, { color: currentTheme.accent }]}>Smartphone Security</Text>

            <Text style={[styles.content, { color: currentTheme.text }]}>
                In an age where personal data is increasingly vulnerable, advanced smartphone security features are crucial for ensuring user privacy and safeguarding sensitive information. Below are key features that enhance smartphone security:
            </Text>

            {/* Dual Space Feature */}
            <View style={styles.featureContainer}>
                <Image 
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/892/892325.png' }} 
                    style={styles.featureIcon} 
                />
                <Text style={[styles.featureText, { color: currentTheme.accent }]}>Dual Spaces for Enhanced Privacy</Text>
            </View>
            <Text style={[styles.featureDescription, { color: currentTheme.text }]}>
                Create a separate environment on your smartphone to isolate personal and work-related data, ensuring enhanced privacy control.
            </Text>

            {/* Theft Deterrents Feature */}
            <View style={styles.featureContainer}>
                <Image 
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3640/3640123.png' }} 
                    style={styles.featureIcon} 
                />
                <Text style={[styles.featureText, { color: currentTheme.accent }]}>Theft Deterrents</Text>
            </View>
            <Text style={[styles.featureDescription, { color: currentTheme.text }]}>
                Utilize remote locking, location tracking, and anti-theft alerts to minimize the risk of unauthorized access.
            </Text>

            {/* Intruder Alerts Feature */}
            <View style={styles.featureContainer}>
                <Image 
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1865/1865005.png' }} 
                    style={styles.featureIcon} 
                />
                <Text style={[styles.featureText, { color: currentTheme.accent }]}>Intruder Alerts</Text>
            </View>
            <Text style={[styles.featureDescription, { color: currentTheme.text }]}>
                Receive notifications for unauthorized attempts to access your device, enhancing your security awareness.
            </Text>

            {/* Hide Images/Videos/Folders Feature */}
            <View style={styles.featureContainer}>
                <Image 
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/271/271225.png' }} 
                    style={styles.featureIcon} 
                />
                <Text style={[styles.featureText, { color: currentTheme.accent }]}>Hide Sensitive Content</Text>
            </View>
            <Text style={[styles.featureDescription, { color: currentTheme.text }]}>
                Secure your private images, videos, and folders from unauthorized access with this feature.
            </Text>

            {/* Encryption Feature */}
            <View style={styles.featureContainer}>
                <Image 
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2728/2728118.png' }} 
                    style={styles.featureIcon} 
                />
                <Text style={[styles.featureText, { color: currentTheme.accent }]}>High-Security Encryption</Text>
            </View>
            <Text style={[styles.featureDescription, { color: currentTheme.text }]}>
                Protect sensitive information through end-to-end encryption and secure messaging apps.
            </Text>

            {/* Keep Notes Safe Feature */}
            <View style={styles.featureContainer}>
                <Image 
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1001/1001674.png' }} 
                    style={styles.featureIcon} 
                />
                <Text style={[styles.featureText, { color: currentTheme.accent }]}>Keep Notes Safe</Text>
            </View>
            <Text style={[styles.featureDescription, { color: currentTheme .text }]}>
                Secure your personal notes with password protection, ensuring only you have access to sensitive information.
            </Text>

            {/* Email Recovery Feature */}
            <View style={styles.featureContainer}>
                <Image 
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1055/1055648.png' }} 
                    style={styles.featureIcon} 
                />
                <Text style={[styles.featureText, { color: currentTheme.accent }]}>Email Recovery</Text>
            </View>
            <Text style={[styles.featureDescription, { color: currentTheme.text }]}>
                Implement an email recovery system to regain access to your account easily, ensuring peace of mind if you forget your password.
            </Text>
        </ScrollView>
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
        justifyContent: 'center',
        width: 360,  
        height: 250, 
        marginBottom: 30, 
        borderRadius: 60, 
        overflow: 'hidden', 
    },
    icon: {
        width: 150, 
        height: 170,
        borderRadius: 50, 
        marginLeft:30
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        marginTop: -30,
        paddingLeft:20,
        paddingRight:20
    },
    content: {
        fontSize: 16,
        marginBottom: 10,
        lineHeight: 24, 
        paddingLeft:20,
        paddingRight:20,
    },
    featureContainer: {
        flexDirection: 'row', 
        alignItems: 'center', 
        marginVertical: 10, 
        paddingLeft:20,
        paddingRight:20
    },
    featureIcon: {
        width: 30, 
        height: 30,
        marginRight: 10, 
    },
    featureText: {
        fontSize: 18,
        fontWeight: 'bold', 
    },
    featureDescription: {
        fontSize: 14,
        marginBottom: 20,
        marginLeft: 40, 
        lineHeight: 20, 
    },
});

export default PrivacyScreen;