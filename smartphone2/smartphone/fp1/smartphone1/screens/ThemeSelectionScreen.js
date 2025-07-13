import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemeContext } from './ThemeContext'; // Adjust the path as necessary

const ThemeSelectionScreen = () => {
    const { currentTheme, changeTheme, themes } = useContext(ThemeContext); // Access context

    return (
        <View style={[styles.container, { backgroundColor: currentTheme.primary }]}>
            <Text style={[styles.title, { color: currentTheme.secondary }]}>Select a Theme</Text>
            {themes.map((theme) => (
                <TouchableOpacity
                    key={theme.id}
                    style={[styles.button, { backgroundColor: currentTheme.secondary }]}
                    onPress={() => changeTheme(theme)}
                >
                    <Text style={styles.buttonText}>Theme {theme.id}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        fontWeight:'bold',
        marginTop:70
    },
    button: {
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#000',
    },
});

export default ThemeSelectionScreen;
