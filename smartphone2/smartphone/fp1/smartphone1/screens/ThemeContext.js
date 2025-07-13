import React, { createContext, useState } from 'react';
import { StatusBar } from 'react-native';

// Create a Theme Context
export const ThemeContext = createContext();

// Create a provider component
export const ThemeProvider = ({ children }) => {
    const themes = [
        { id: 1, primary: '#e1e5cf', secondary: '#02968a', accent: '#02968a' },
        { id: 2, primary: '#1F5460', secondary: '#FFCA42', accent: '#FFCA42' },
        { id: 3, primary: '#f6efab', secondary: '#efad2b', accent: '#efad2b' },
        { id: 4, primary: '#f6efab', secondary: '#a3deb5', accent: '#a3deb5' },
        { id: 5, primary: '#5c4887', secondary: '#df9589', accent: '#df9589' },
        { id: 6, primary: '#f7f5c9', secondary: '#f7c6a1', accent: '#f7c6a1' },
        { id: 7, primary: '#cbd2cd', secondary: '#748c92', accent: '#748c92' },
        { id: 8, primary: '#f7e6ca', secondary: '#ad9b8d', accent: '#ad9b8d' },
        { id: 9, primary: '#edd8e1', secondary: '#bf7896', accent: '#bf7896' },
        { id: 10, primary: '#cfbcb6', secondary: '#89889a', accent: '#89889a' },
        { id: 11, primary: '#faf6f2', secondary: '#46000c', accent: '#46000c' },
        { id: 12, primary: '#faf6f2', secondary: '#b08401', accent: '#b08401' },
    ];

    const [currentTheme, setCurrentTheme] = useState(themes[0]);

    // Function to determine barStyle based on background color luminance
    const getBarStyle = (color) => {
        // Extract RGB values from hex color
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        // Calculate luminance (perceived brightness)
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        // Use light-content for dark backgrounds, dark-content for light backgrounds
        return luminance > 0.5 ? 'dark-content' : 'light-content';
    };

    const changeTheme = (theme) => {
        setCurrentTheme(theme);
    };

    return (
        <ThemeContext.Provider value={{ currentTheme, changeTheme, themes }}>
            <StatusBar
                backgroundColor={currentTheme.primary}
                barStyle={getBarStyle(currentTheme.primary)}
                translucent={false}
            />
            {children}
        </ThemeContext.Provider>
    );
};