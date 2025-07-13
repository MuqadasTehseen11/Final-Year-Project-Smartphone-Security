import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

const SelectionScreen = () => {
    const navigation = useNavigation();

    // Glitch Effect for Title
    const glitchOffset = useSharedValue(0);
    const glitchOpacity = useSharedValue(1);

    // Threat Alert Blinking Effect
    const alertOpacity = useSharedValue(1);

    useEffect(() => {
        // BackHandler event listener
        const backAction = () => {
            navigation.navigate('Splash'); // Jab user back kare to LoginScreen par chala jaye
            return true; // Default back action ko prevent karega
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => backHandler.remove(); // Cleanup on unmount
    }, [navigation]);

    useEffect(() => {
        // Glitch Text Effect
        glitchOffset.value = withRepeat(
            withSequence(
                withTiming(4, { duration: 60 }),
                withTiming(-4, { duration: 60 }),
                withTiming(0, { duration: 60 })
            ),
            -1,
            true
        );

        glitchOpacity.value = withRepeat(
            withSequence(
                withTiming(0.8, { duration: 100 }),
                withTiming(1, { duration: 100 })
            ),
            -1,
            true
        );

        // Threat Alert Blinking Effect
        alertOpacity.value = withRepeat(
            withSequence(
                withTiming(0, { duration: 500 }),
                withTiming(1, { duration: 500 })
            ),
            -1,
            true
        );
    }, []);

    // Animated Styles
    const glitchStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: glitchOffset.value }],
        opacity: glitchOpacity.value,
    }));

    return (
        <View style={styles.container}>
            <Animated.Text style={[styles.title, glitchStyle]}>
                Welcome to HavenHub
            </Animated.Text>

            <View style={styles.buttonsContainer}>
                <TouchableOpacity style={[styles.button, styles.images]} onPress={() => navigation.navigate('DualImages')}>
                    <Icon name="image" size={24} color="#0F0" />
                    <Text style={styles.buttonText}>Images</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.videos]} onPress={() => navigation.navigate('DualVideos')}>
                    <Icon name="video" size={24} color="#0F0" />
                    <Text style={styles.buttonText}>Videos</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.files]} onPress={() => navigation.navigate('DualFiles')}>
                    <Icon name="file" size={24} color="#0F0" />
                    <Text style={styles.buttonText}>Files</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.notes]} onPress={() => navigation.navigate('DualNotes')}>
                    <Icon name="note-text" size={24} color="#0F0" />
                    <Text style={styles.buttonText}>Notes</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0F0',
        textTransform: 'uppercase',
        textAlign: 'center',
        fontFamily: 'monospace',
        marginBottom: 20,
        textShadowColor: '#0F0',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 10,
    },
    buttonsContainer: {
        width: '100%',
        alignItems: 'center',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        marginVertical: 10,
        borderRadius: 10,
        width: '90%',
        gap: 10,
        borderWidth: 1,
        borderColor: '#0F0',
        shadowColor: '#0F0',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 15,
    },
    buttonText: {
        color: '#0F0',
        fontSize: 18,
        fontWeight: 'bold',
        textShadowColor: '#0F0',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 10,
    },
    images: { backgroundColor: 'rgba(51, 255, 51, 0.2)' },
    videos: { backgroundColor: 'rgba(0, 255, 0, 0.2)' },
    files: { backgroundColor: 'rgba(0, 153, 0, 0.2)' },
    notes: { backgroundColor: 'rgba(0, 102, 0, 0.2)' },
});

export default SelectionScreen;
