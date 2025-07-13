import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Switch, FlatList } from 'react-native';
import { ThemeContext } from './ThemeContext'; // Import ThemeContext

const notificationSettings = [
    { id: '1', title: 'Allow Notifications', value: false },
    { id: '5', title: 'Show on Lock Screen', value: false },
];

const NotificationScreen = () => {
    const { currentTheme } = useContext(ThemeContext); // Accessing current theme
    const [settings, setSettings] = useState(notificationSettings);

    const toggleSwitch = (id) => {
        setSettings((prevSettings) =>
            prevSettings.map((setting) =>
                setting.id === id ? { ...setting, value: !setting.value } : setting
            )
        );
    };

    const renderSettingItem = ({ item }) => (
        <View
            style={[
                styles.option,
                item.value ? styles.optionEnabled : styles.optionDisabled, // Change background based on switch value
                { backgroundColor: item.value ? currentTheme.background : currentTheme.accent, borderColor:currentTheme.accent }, // Apply theme colors
            ]}
        >
            <Text
                style={[
                    styles.optionText,
                    item.value ? styles.optionTextEnabled : styles.optionTextDisabled,
                    { color: item.value ? currentTheme.accent : currentTheme.primary }, // Apply theme colors
                ]}
            >
                {item.title}
            </Text>
            <Switch
                value={item.value}
                onValueChange={() => toggleSwitch(item.id)}
                thumbColor={item.value ? currentTheme.accent : '#f4f3f4'} // Thumb color updated to theme
                trackColor={{ false: '#767577', true: currentTheme.accent }} // Track color for ON state updated to theme
            />
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: currentTheme.primary }]}>
            <Text style={[styles.title, { color: currentTheme.accent }]}>Notifications</Text>
            <FlatList
                data={settings}
                renderItem={renderSettingItem}
                keyExtractor={item => item.id}
                style={styles.list}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 120,
        marginBottom: 10,
    },
    list: {
        marginTop: -330,
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexGrow: 1,
        justifyContent: 'center',
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
        borderColor: '#B0B0B0',
        // shadowColor: '#000',
        // shadowOffset: {
        //     width: 0,
        //     height: 2,
        // },
        // shadowOpacity: 0.3,
        // shadowRadius: 2,
        // elevation: 5,
    },
    optionEnabled: {
        // This style can be removed as we are applying background color dynamically
    },
    optionDisabled: {
        // This style can be removed as we are applying background color dynamically
    },
    optionText: {
        fontSize: 18,
        flex: 1,
    },
    optionTextEnabled: {
        // This style can be removed as we are applying color dynamically
    },
    optionTextDisabled: {
        // This style can be removed as we are applying color dynamically
    },
});

export default NotificationScreen;