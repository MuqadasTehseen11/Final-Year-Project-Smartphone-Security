import React, { useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons'; // Ensure this package is installed

const { width, height } = Dimensions.get('window');
const BUTTON_SIZE = 60; // Button width and height

const FloatingButton = () => {
    const navigation = useNavigation();
    const pan = useRef(new Animated.ValueXY({ x: width - BUTTON_SIZE - 30, y: height - BUTTON_SIZE - 100 })).current; // Start lower on the screen

    // PanResponder for dragging
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true, // Enable dragging on touch
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                // Only activate if moved more than 5px to avoid tap conflict
                return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
            },
            onPanResponderGrant: () => {
                // Reset offset when drag starts to current position
                pan.setOffset({ x: pan.x._value, y: pan.y._value });
                pan.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x, dy: pan.y }], // Update position during drag
                { useNativeDriver: false }
            ),
            onPanResponderRelease: () => {
                // Flatten offset to keep button at released position
                pan.flattenOffset();

                // Ensure button stays within screen bounds
                const newX = Math.max(0, Math.min(pan.x._value, width - BUTTON_SIZE));
                const newY = Math.max(0, Math.min(pan.y._value, height - BUTTON_SIZE - 50)); // Adjust for status bar/bottom padding
                pan.setValue({ x: newX, y: newY });
            },
        })
    ).current;

    const handlePress = () => {
        navigation.navigate('calculator'); // Navigate to calculator screen
    };

    return (
        <Animated.View
            style={[
                styles.floatingButton,
                {
                    transform: [{ translateX: pan.x }, { translateY: pan.y }],
                },
            ]}
            {...panResponder.panHandlers} // Attach drag handlers
        >
            <TouchableOpacity onPress={handlePress}>
                <MaterialIcons name="notifications" size={30} color="white" />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    floatingButton: {
        position: 'absolute',
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        borderRadius: BUTTON_SIZE / 2,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
});

export default FloatingButton;