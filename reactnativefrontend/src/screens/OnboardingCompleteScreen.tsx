import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CommonActions} from '@react-navigation/native';

const OnboardingCompleteScreen = ({navigation}) => {
  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('onboardingComplete', 'true');

      // Use CommonActions instead of navigation.reset
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: 'Main'}],
        }),
      );
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Questionnaire Complete!</Text>
        <Text style={styles.message}>
          Thanks for completing the questionnaire. Your PowerLog experience is
          now personalized!
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleComplete}>
          <Text style={styles.buttonText}>Start Using PowerLog</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00D0FF',
    marginBottom: 20,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#00D0FF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OnboardingCompleteScreen;
