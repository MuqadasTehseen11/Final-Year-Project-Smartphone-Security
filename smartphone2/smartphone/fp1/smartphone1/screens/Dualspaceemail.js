import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { database } from '../firebase';
import { ref, get, set } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';

const Dualspaceemail = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showFields, setShowFields] = useState(false);
  const navigation = useNavigation();

  // ✅ Function to Check If User Exists
  const checkUserExists = async () => {
    if (!name) {
      Alert.alert('Error', 'Please enter your name.');
      return;
    }

    try {
      const usersRef = ref(database, `users/${name}`);
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        Alert.alert('Success', 'User exists! You can create dual space.', [
          { text: 'OK', onPress: () => setShowFields(true) }
        ]);
      } else {
        Alert.alert(
          'Error',
          'User does not exist. Please register first.',
          [
            {
              text: 'Register Now',
              onPress: () => navigation.navigate('Signup'), // Navigate to Signup screen
            },
            { text: 'Cancel' }
          ]
        );
      }
    } catch (error) {
      console.error('Error checking user:', error);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  // ✅ Submit Data to DecoyData Node & Navigate to DecoyLogin
  const submitData = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }

    try {
      const decoyRef = ref(database, `DecoyData/${name}`);
      await set(decoyRef, { email, password });
      Alert.alert('Congratulations', 'Dual space created successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('DecoyLogin') }
      ]);
    } catch (error) {
      console.error('Error saving data:', error);
      Alert.alert('Error', 'Something went wrong while saving data.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dual Space Login</Text>

      {/* ✅ Name Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />

      {/* ✅ Check User Button */}
      <TouchableOpacity style={styles.button} onPress={checkUserExists}>
        <Text style={styles.buttonText}>Check User</Text>
      </TouchableOpacity>

      {showFields && (
        <>
          {/* ✅ Email Input */}
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* ✅ Password Input */}
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* ✅ Submit Button */}
          <TouchableOpacity style={styles.button} onPress={submitData}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f3f4f6',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 40,
    color: '#2f2f2f',
  },
  input: {
    width: '100%',
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#ddd',
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: '#4caf50',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  }
});

export default Dualspaceemail;
