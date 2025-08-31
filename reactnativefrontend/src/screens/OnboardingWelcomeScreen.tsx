import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {CommonActions} from '@react-navigation/native';

const OnboardingWelcomeScreen = ({navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Welcome to PowerLog!</Text>
      <Text style={styles.subtitle}>
        Let's personalize your experience by answering a few questions.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('OnboardingQuestions')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#414141',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6200EE',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OnboardingWelcomeScreen;
