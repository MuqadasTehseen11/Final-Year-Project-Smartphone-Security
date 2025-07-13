import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { ThemeContext } from './ThemeContext'; // Import ThemeContext
import { useNavigation } from '@react-navigation/native'; // Import the useNavigation hook

const dualSpaceSettings = [
    { id: '1', title: 'Enable Dual Space', value: false },
];

const DualSpace = () => {
    const { currentTheme } = useContext(ThemeContext); // Accessing current theme
    const [settings, setSettings] = useState(dualSpaceSettings);
    const navigation = useNavigation(); // Initialize navigation

    const toggleSwitch = (id) => {
        setSettings((prevSettings) =>
            prevSettings.map((setting) =>
                setting.id === id ? { ...setting, value: !setting.value } : setting
            )
        );

        // If Dual Space is enabled, navigate to DualSpaceEmail screen
        const isEnabled = !settings.find((s) => s.id === id).value;
        if (isEnabled) {
            navigation.navigate('Dualspaceemail'); // Navigate to the new screen
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: currentTheme.primary }]}>
            <Text style={[styles.title, { color: currentTheme.accent }]}>Dual Space</Text>
            <View style={styles.list}>
                {settings.map((item) => (
                    <View
                        key={item.id}
                        style={[
                            styles.option,
                            item.value ? styles.optionEnabled : styles.optionDisabled,
                            {
                                backgroundColor: item.value
                                    ? currentTheme.background
                                    : currentTheme.accent,
                                borderColor: currentTheme.accent,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.optionText,
                                item.value ? styles.optionTextEnabled : styles.optionTextDisabled,
                                {
                                    color: item.value
                                        ? currentTheme.accent
                                        : currentTheme.primary,
                                },
                            ]}
                        >
                            {item.title}
                        </Text>
                        <Switch
                            value={item.value}
                            onValueChange={() => toggleSwitch(item.id)}
                            thumbColor={item.value ? currentTheme.accent : '#f4f3f4'}
                            trackColor={{
                                false: '#767577',
                                true: currentTheme.accent,
                            }}
                        />
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 20,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginVertical: 5,
        borderRadius: 10,
        borderWidth: 1,
    },
    optionEnabled: {
        backgroundColor: '#c8e6c9',
    },
    optionDisabled: {
        backgroundColor: '#ffcdd2',
    },
    optionText: {
        fontSize: 18,
        flex: 1,
    },
    optionTextEnabled: {
        color: '#388e3c',
    },
    optionTextDisabled: {
        color: '#d32f2f',
    },
    list: {
        width: '100%',
    },
});

export default DualSpace;
