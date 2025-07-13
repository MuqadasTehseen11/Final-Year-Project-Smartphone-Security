// import React, { useState } from 'react';
// import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';

// const SwitchAccount = () => {
//     const [username, setUsername] = useState('');
//     const [password, setPassword] = useState('');

//     const handleSwitchAccount = () => {
//         // Here, you can implement the logic to switch accounts
//         // For example, validating the username and password
//         if (username && password) {
//             // Assuming successful switch, show an alert or navigate
//             Alert.alert('Success', 'Account switched successfully!');
//             // You can add navigation logic here if needed
//         } else {
//             Alert.alert('Error', 'Please enter both username and password.');
//         }
//     };

//     return (
//         <View style={styles.container}>
//             <Text style={styles.title}>Switch Account</Text>
//             <TextInput
//                 style={styles.input}
//                 placeholder="Username"
//                 placeholderTextColor="#B0B0B0"
//                 value={username}
//                 onChangeText={setUsername}
//             />
//             <TextInput
//                 style={styles.input}
//                 placeholder="Password"
//                 placeholderTextColor="#B0B0B0"
//                 value={password}
//                 onChangeText={setPassword}
//                 secureTextEntry
//             />
//             <TouchableOpacity style={styles.button} onPress={handleSwitchAccount}>
//                 <Text style={styles.buttonText}>Switch Account</Text>
//             </TouchableOpacity>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#FFCA42',
//         padding: 20,
//         justifyContent: 'center',
//     },
//     title: {
//         fontSize: 24,
//         color: '#1F5460',
//         textAlign: 'center',
//         marginBottom: 30,
//     },
//     input: {
//         height: 50,
//         backgroundColor: '#1F5460',
//         borderColor: '#B0B0B0',
//         borderWidth: 1,
//         borderRadius: 10,
//         marginBottom: 15,
//         paddingHorizontal: 15,
//         color: '#FFFFFF',
//     },
//     button: {
//         backgroundColor: '#1F5460',
//         borderRadius: 10,
//         paddingVertical: 15,
//         alignItems: 'center',
//     },
//     buttonText: {
//         color: '#FFFFFF',
//         fontSize: 18,
//         fontWeight: 'bold',
//     },
// });

// export default SwitchAccount;
