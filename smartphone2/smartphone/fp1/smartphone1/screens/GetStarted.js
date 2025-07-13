import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from "react-native";
import { FontAwesome5 } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const GetStarted = ({ navigation }) => {
  const [showButton, setShowButton] = useState(false);
  const [lockOpened, setLockOpened] = useState(false);
  const iconScale = useRef(new Animated.Value(0)).current;
  const welcomeOpacity = useRef(new Animated.Value(0)).current;
  const welcomeScale = useRef(new Animated.Value(0.5)).current;

  // Array to hold Animated.Values for confetti animations
  const confettiCount = 30;
  const confettiAnimations = useRef(
    Array.from({ length: confettiCount }).map(() => ({
      translateY: new Animated.Value(-50),
      translateX: new Animated.Value(Math.random() < 0.5 ? Math.random() * SCREEN_WIDTH * 0.2 : SCREEN_WIDTH * 0.8 + Math.random() * SCREEN_WIDTH * 0.2),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  const confettiColors = ['#02968a', '#e1e5cf', 'white'];

  useEffect(() => {
    // Animate the lock icon
    Animated.timing(iconScale, {
      toValue: 1,
      duration: 4000,
      useNativeDriver: true,
    }).start(() => {
      setLockOpened(true);
      setShowButton(true);

      // Animate the welcome text
      Animated.parallel([
        Animated.timing(welcomeOpacity, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(welcomeScale, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start();
    });

    // Start continuous confetti animations
    confettiAnimations.forEach((anim, index) => {
      const duration = 3000 + Math.random() * 2000;
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim.translateY, {
            toValue: -50,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateX, {
            toValue: Math.random() < 0.5 ? Math.random() * SCREEN_WIDTH * 0.2 : SCREEN_WIDTH * 0.8 + Math.random() * SCREEN_WIDTH * 0.2,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotate, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.parallel([
            Animated.timing(anim.translateY, {
              toValue: SCREEN_HEIGHT + 50,
              duration,
              useNativeDriver: true,
            }),
            Animated.timing(anim.translateX, {
              toValue: (Math.random() < 0.5 ? Math.random() * SCREEN_WIDTH * 0.4 : SCREEN_WIDTH * 0.6 + Math.random() * SCREEN_WIDTH * 0.4),
              duration,
              useNativeDriver: true,
            }),
            Animated.timing(anim.rotate, {
              toValue: Math.random() * 720,
              duration,
              useNativeDriver: true,
            }),
            Animated.timing(anim.opacity, {
              toValue: 0,
              duration: duration * 0.8,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    });

    return () => {
      confettiAnimations.forEach((anim) => {
        anim.translateY.stopAnimation();
        anim.translateX.stopAnimation();
        anim.rotate.stopAnimation();
        anim.opacity.stopAnimation();
      });
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.confettiContainer} pointerEvents="none">
        {confettiAnimations.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.confetti,
              {
                backgroundColor: confettiColors[Math.floor(Math.random() * confettiColors.length)],
                transform: [
                  { translateY: anim.translateY },
                  { translateX: anim.translateX },
                  {
                    rotate: anim.rotate.interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
                opacity: anim.opacity,
              },
            ]}
          />
        ))}
      </View>

      <Animated.View
        style={[
          styles.iconContainer,
          { transform: [{ scale: iconScale }] },
        ]}
      >
        <View style={styles.circle}>
          <FontAwesome5 
            name={lockOpened ? "unlock" : "lock"} 
            size={120} 
            color="#e1e5cf" 
          />
        </View>
      </Animated.View>

      {showButton && (
        <TouchableOpacity 
          style={[styles.button, { zIndex: 2 }]} 
          onPress={() => navigation.navigate('SecurePrivate')}
        >
          <Text style={styles.buttonText}>Let's Get Started</Text>
        </TouchableOpacity>
      )}

      <Animated.View style={[styles.welcomeBox, { opacity: welcomeOpacity, transform: [{ scale: welcomeScale }] }]}>
        <Text style={styles.welcomeText}>Welcome To HavenHub</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#e1e5cf',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  confetti: {
    width: 8,
    height: 16,
    borderRadius: 4,
    position: 'absolute',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#02968a",
    textAlign: "center",
    marginTop: 40,
  },
  iconContainer: {
    marginBottom: 40,
    zIndex: 2, // Ensure icon is above confetti
  },
  circle: {
    width: 250,
    height: 250,
    borderRadius: 60, // Corrected to make it fully circular
    backgroundColor: '#02968a',
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  button: {
    backgroundColor: "#02968a",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFF",
  },
  welcomeBox: {
    marginTop: 20,
    zIndex: 2, // Ensure welcome text is above confetti
  },
});

export default GetStarted;