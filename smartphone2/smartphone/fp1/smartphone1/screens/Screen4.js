import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  ImageBackground, 
  StyleSheet, 
  TouchableOpacity, 
  Animated 
} from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome'; 
import { useNavigation } from '@react-navigation/native';

const Screen4 = () => {  
  const navigation = useNavigation();
  const [slideAnim] = useState(new Animated.Value(-500));  // Initial position off-screen
  const [fadeAnim] = useState(new Animated.Value(0)); // Initial opacity is 0

  useEffect(() => {
    // Animate slide-in and fade-in effects together
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0, // Slide to the center
        duration: 800, // Duration of the sliding effect
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1, // Fade to opacity 1
        duration: 1000, // Duration of fade-in effect
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <ImageBackground
      source={{ uri: 'https://www.ssl2buy.com/wp-content/uploads/2022/04/mobile-application-security.jpg' }} 
      style={styles.background}
    >
      <View style={styles.overlay}>
        {/* Animated Box with Slide-in effect */}
        <Animated.View
          style={[styles.container, { transform: [{ translateX: slideAnim }], opacity: fadeAnim }]} // Apply sliding and fade effect
        >
          <Icon name="lock" size={80} color="#e1e5cf" style={styles.icon} />
          
          <Text style={styles.title}>Image Encryption</Text>
          
          <Text style={styles.description}>
            This app protects your data by encrypting it.Unauthorized users will see images in an encrypted format. 
            Only authorized users can decrypt and view the actual images.The image will be shown only when the user logs in 
            with the correct credentials.
          </Text>
        </Animated.View>

        <TouchableOpacity 
          style={styles.circleButton} 
          onPress={() => navigation.navigate("Screen6")} 
        >
          <Icon name="arrow-right" size={30} color="#e1e5cf" />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

// Styles
const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e1e5cf",
    width: "100%",
    height: "100%", 
    paddingBottom: 20, 
  },
  container: {
    padding: 20,
    borderRadius: 10,
    marginTop: 110,
    alignItems: "center",
    backgroundColor: "#02968a", 
    width: "80%",  
    marginHorizontal: "10%", 
  },
  icon: {
    marginBottom: 20, 
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#e1e5cf",
    textAlign: "center",
    marginBottom: 15, 
  },
  description: {
    fontSize: 18,
    color: "#e1e5cf",
    textAlign: "center",
    marginVertical: 15,
  },
  circleButton: {
    backgroundColor: "#02968a",
    padding: 20,
    borderRadius: 50, 
    marginTop: 80, 
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#FFCA42",
    marginTop: 15,
    textAlign: "center",
    marginBottom: 10, 
  },
});

export default Screen4;