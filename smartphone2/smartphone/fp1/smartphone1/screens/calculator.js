import React, { useState, useRef, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, StyleSheet, BackHandler } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import * as Speech from 'expo-speech';

const Calculator = ({ navigation }) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const scrollViewRef = useRef(null);
  const [numberSequence, setNumberSequence] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setInput('');
      setResult('');
      speakInstruction();
    });
    return unsubscribe;
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  const speakInstruction = () => {
    // Speech.speak('To open the app, please enter even odd even odd even pattern.', {
    //   language: 'en',
    //   pitch: 1,
    //   rate: 0.9,
    // });
  };

  const handlePress = (value) => {
    if (value === 'C') {
      setInput('');
      setResult('');
      setNumberSequence([]);
    } else if (value === '=') {
      try {
        const evalInput = input
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/√/g, 'Math.sqrt')
          .replace(/x²/g, 'Math.pow')
          .replace(/sin/g, 'Math.sin')
          .replace(/cos/g, 'Math.cos')
          .replace(/tan/g, 'Math.tan')
          .replace(/log/g, 'Math.log10')
          .replace(/ln/g, 'Math.log')
          .replace(/EXP/g, 'Math.exp');

        let evalResult = eval(evalInput);

        if (evalResult === Infinity || isNaN(evalResult)) {
          setResult('Error');
        } else {
          evalResult = evalResult.toString();
          if (evalResult.length > 13) {
            evalResult = evalResult.slice(0, 13);
          }
          setResult(evalResult);
        }
      } catch (e) {
        setResult('Error');
      }
    } else if (value === '⌫') {
      setInput(input.slice(0, -1));
    } else {
      if (result && !isOperator(value)) {
        setInput(value);
        setResult('');
        setNumberSequence([]);
      } else if (result && isOperator(value)) {
        setInput(result + value);
        setResult('');
      } else {
        setInput(input + value);
        handleNumberInput(value);
      }
    }
  };

  const handleNumberInput = (value) => {
    if (!isNaN(value) || value === '0') {
      const number = parseInt(value, 10);
      const isEven = number % 2 === 0;

      setNumberSequence((prev) => {
        const newSequence = [...prev, isEven];
        if (newSequence.length > 5) {
          newSequence.shift();
        }
        if (
          newSequence.length === 5 &&
          newSequence[0] &&
          !newSequence[1] &&
          newSequence[2] &&
          !newSequence[3] &&
          newSequence[4]
        ) {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Splash' }],
            })
          );
        }
        return newSequence;
      });
    }
  };

  const handleScientificPress = (operation) => {
    try {
      let evalResult;
      const evalInput = input.replace(/×/g, '*').replace(/÷/g, '/');
      if (operation === 'sin') evalResult = Math.sin(toRadians(eval(evalInput)));
      else if (operation === 'cos') evalResult = Math.cos(toRadians(eval(evalInput)));
      else if (operation === 'tan') evalResult = Math.tan(toRadians(eval(evalInput)));
      else if (operation === 'log') evalResult = Math.log10(eval(evalInput));
      else if (operation === 'ln') evalResult = Math.log(eval(evalInput));
      else if (operation === '√') evalResult = Math.sqrt(eval(evalInput));
      else if (operation === 'x²') evalResult = Math.pow(eval(evalInput), 2);
      else if (operation === 'EXP') evalResult = Math.exp(eval(evalInput));

      if (isNaN(evalResult)) {
        setResult('Error');
      } else {
        evalResult = evalResult.toString();
        if (evalResult.length > 13) {
          evalResult = evalResult.slice(0, 13);
        }
        setResult(evalResult);
      }
    } catch (e) {
      setResult('Error');
    }
  };

  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const isOperator = (button) => {
    const operators = ['C', '%', '⌫', '×', '÷', '-', '+', '=', '^', '√', 'sin', 'cos', 'tan', 'log', 'ln', 'EXP'];
    return operators.includes(button);
  };

  return (
    <View style={styles.container}>
      {/* Top Bar - Only one icon now */}
      <View style={styles.topBar}>
        {/* Removed back arrow */}
        <Icon name="time-outline" size={25} color="#FFFFFF" />
      </View>

      <Text style={styles.heading}>Calculator</Text>

      <View style={styles.displayContainer}>
        <ScrollView
          horizontal
          contentContainerStyle={{ alignItems: 'flex-end' }}
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
        >
          <Text style={styles.inputText}>{input}</Text>
        </ScrollView>
        <ScrollView horizontal contentContainerStyle={{ alignItems: 'flex-end' }}>
          <Text style={styles.resultText}>{result}</Text>
        </ScrollView>
      </View>

      <View style={styles.buttonsContainer}>
        {['sin', 'cos', 'tan', 'log', 'ln', '√', 'x²', 'EXP'].map((button) => (
          <TouchableOpacity
            key={button}
            style={[styles.button, styles.sinbutton]}
            onPress={() => handleScientificPress(button)}
          >
            <LinearGradient colors={['#5e7c88', '#5e7c88']} style={styles.gradient}>
              <Text style={styles.buttonText}>{button}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
        {['C', '%', '⌫', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '00', '0', '.', '='].map(
          (button) => (
            <TouchableOpacity
              key={button}
              style={[styles.button, isOperator(button) ? styles.operatorButton : styles.numberButton]}
              onPress={() => handlePress(button)}
            >
              <LinearGradient
                colors={isOperator(button) ? ['#FFCA42', '#DDAA00'] : ['#1F5460', '#1A4B5A']}
                style={styles.gradient}
              >
                <Text style={styles.buttonText}>{button}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F5460',
    padding: 10,
    paddingTop: -14,
  },
  topBar: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  heading: {
    marginTop: 20,
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFCA42',
  },
  displayContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    marginTop: 60,
  },
  inputText: {
    fontSize: 30,
    color: '#1F5460',
  },
  resultText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFCA42',
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  button: {
    width: '22%',
    margin: 5,
    borderRadius: 15,
  },
  gradient: {
    borderRadius: 15,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  operatorButton: {
    borderColor: '#FFCA42',
  },
  sinbutton: {
    borderColor: '#5e7c88',
  },
  numberButton: {
    borderColor: '#1F5460',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
});

export default Calculator;
