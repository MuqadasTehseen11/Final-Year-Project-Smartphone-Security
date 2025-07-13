import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import * as Speech from 'expo-speech';

const tutorialSteps = [
  "To open the app, enter the pattern: even, odd, even, odd, even in calculator.",
  "Go to settings to log out anytime.",
  "You can also change themes in settings.",
  "Shake the device to switch spaces.",
  "For help, go to settings then help.",
  "You can add secret notes too.",
  "Encryption and decryption features are included.",
  "If wrong password is entered, alarm will ring and a picture will be taken.",
];

export default function Screen5({ navigation }) {
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isSkipping = useRef(false);

  const speakStep = (text) => {
    const cleanText = text.replace(/[\u{1F600}-\u{1F6FF}]/gu, '');
    Speech.stop(); // Stop any previous speech
    Speech.speak(cleanText, {
      language: 'en-US',
      pitch: 1,
      rate: 0.9,
    });
  };

  useEffect(() => {
    if (currentStep < tutorialSteps.length) {
      speakStep(tutorialSteps[currentStep]);
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        if (!isSkipping.current) {
          if (currentStep < tutorialSteps.length - 1) {
            setCurrentStep(prev => prev + 1);
          } else {
            handleStart(); // Navigate to the next screen
          }
        }
      }, 4000); // 4 seconds delay

      return () => clearTimeout(timer); // Cleanup timer
    }
  }, [currentStep]);

  const handleSkip = () => {
    isSkipping.current = true; // Mark that skip action occurred
    Speech.stop(); // Stop any ongoing speech
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1); // Skip to the next step
    } else {
      handleStart(); // If last step, go to next screen
    }
  };

  const handleStart = () => {
    // Speech.stop(); // Stop any ongoing speech
    // Speak the message with a 2-second delay
    setTimeout(() => {
      Speech.speak("Welcome To open the app please enter even odd even odd even pattern");
    }, 2000); // 2 seconds delay

    // setTimeout(() => {
    //   Speech.speak("Welcome To open the app please enter even odd even odd even pattern");
    // }, 4000); // Speak again after 2 seconds

    navigation.navigate('calculator');
  };

  return (
    <View style={styles.container}>
      {currentStep < tutorialSteps.length ? (
        <Animated.View style={[styles.tutorialBox, { opacity: fadeAnim }]}>
          <Text style={styles.tutorialText}>{tutorialSteps[currentStep]}</Text>

          {/* Show skip button only if not on first step */}
          {currentStep !== 0 && (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      ) : (
        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.buttonText}>Let’s Start</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    padding: 20,
  },
  tutorialBox: {
    backgroundColor: '#e1e5cf',
    borderRadius: 25,
    padding: 25,
    marginVertical: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    alignItems: 'center',
  },
  tutorialText: {
    fontSize: 20,
    textAlign: 'center',
    color: '#02968a',
    fontWeight: '600',
  },
  skipButton: {
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#02968a',
    borderRadius: 15,
  },
  skipText: {
    fontSize: 16,
    color: '#e1e5cf',
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#02968a',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
    elevation: 4,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#02968a',
    fontSize: 18,
    fontWeight: 'bold',
  },
});