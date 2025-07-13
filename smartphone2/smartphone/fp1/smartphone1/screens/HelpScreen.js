import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from './ThemeContext'; // Adjust the path as necessary

const HelpScreen = () => {
    const { currentTheme } = useContext(ThemeContext); // Accessing current theme

    const handleContactUs = () => {
        const email = 'tehseenmuqadas375@gmail.com';
        const subject = 'Help and Support Request';
        const body = 'Hello,\n\nI need help with...'; // You can customize this as needed
        const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        Linking.openURL(mailtoUrl)
            .then(() => {
                Alert.alert('Success', 'Your email client has been opened. Please send your message.');
            })
            .catch(err => {
                console.error('Error opening email client:', err);
                Alert.alert('Error', 'Could not open email client. Please try again later.');
            });
    };

    return (
        <View style={[styles.container, { backgroundColor: currentTheme.primary }]}>
            <View style={styles.header}>
                <Ionicons name="help-circle" size={180} color={currentTheme.accent} /> 
                <Text style={[styles.title, { color: currentTheme.accent }]}>Help and Support</Text>
            </View>
            <TextInput 
                style={[styles.searchBar, { borderColor: currentTheme.accent, color: currentTheme.text }]} 
                placeholder="Search..." 
                placeholderTextColor={currentTheme.placeholder} // Placeholder text color
            />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.questionContainer}>
                    <Text style={[styles.question, { color: currentTheme.accent }]}>1. How to hide files?</Text>
                    <Text style={[styles.answer, { color: currentTheme.text }]}>
                        To conceal your files, navigate to the file manager within the app, select the files you wish to hide,
                        and utilize the "Hide" option from the menu. These files will be hidden from the usual view.
                    </Text>
                </View>

                <View style={styles.questionContainer}>
                    <Text style={[styles.question, { color: currentTheme.accent }]}>2. How does theft protection work?</Text>
                    <Text style={[styles.answer, { color: currentTheme.text }]}>
                        The theft protection feature locks files and folders with a password. If someone tries to access them 
                        without permission, an alert is triggered to notify you.
                    </Text>
                </View>

                <View style={styles.questionContainer}>
                    <Text style={[styles.question, { color: currentTheme.accent }]}>3. How does the threat alarm work?</Text>
                    <Text style={[styles.answer, { color: currentTheme.text }]}>
                        The threat alarm activates when an unauthorized user attempts to access your protected files, 
                        sending you an immediate notification to ensure your security.
                    </Text>
                </View>

                <View style={styles.questionContainer}>
                    <Text style={[styles.question, { color: currentTheme.accent }]}>4. How do intruder alerts work?</Text>
                    <Text style={[styles.answer, { color: currentTheme.text }]}>
                        Intruder alerts capture a selfie of any unauthorized user attempting to access your files 
                        and send you a notification, helping you identify potential threats.
                    </Text>
                </View>
            </ScrollView>
            <TouchableOpacity 
                style={[styles.contactButton, { backgroundColor: currentTheme.accent }]} 
                onPress={handleContactUs} // Add this line
            >
                <Text style={[styles.contactButtonText, { color: currentTheme.primary }]}>Contact Us</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 50
    },
    title: {
        fontSize: 24,
        marginTop: 30,
        fontWeight: 'bold',
    },
    searchBar: {
        height: 40,
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 15,
        marginBottom: 15,
        marginHorizontal: 20, // Space from left and right
    },
    scrollContainer: {
        padding: 15,
    },
    questionContainer: {
        marginBottom: 20,
    },
    question: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    answer: {
        fontSize: 16,
        textAlign: 'left',
        paddingHorizontal: 10,
    },
    contactButton: {
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignSelf: 'flex-end', // Align to the right side
        margin: 15, // Add margin for spacing
    },
    contactButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default HelpScreen;