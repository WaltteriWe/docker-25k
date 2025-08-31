import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {NavigationProp} from '@react-navigation/native';
import useUser from '../hooks/userHooks';
import {SafeAreaView} from 'react-native-safe-area-context';

type Props = {
  navigation: NavigationProp<any>;
};

const SignupScreen = ({navigation}: Props) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const {postUser} = useUser();

  const handleSignup = async () => {
    console.log('Signup button pressed');

    // Check for empty fields
    if (!name || !email || !password || !confirmPassword) {
      console.log('Validation failed: Missing fields');
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      console.log('Validation failed: Password too short');
      if (Platform.OS === 'web') {
        alert('Password must be at least 8 characters long');
      } else {
        Alert.alert('Error', 'Password must be at least 8 characters long');
      }
      return;
    }

    if (password !== confirmPassword) {
      console.log('Validation failed: Passwords do not match');
      if (Platform.OS === 'web') {
        alert('Passwords do not match');
      } else {
        Alert.alert('Error', 'Passwords do not match');
      }
      return;
    }

    console.log('Preparing to send API request'); // Log before API call
    try {
      const {data, ok} = await postUser('/user/signup', {
        name,
        email,
        password,
        confirm_password: confirmPassword,
      });
      console.log('API request completed'); // Log after API call

      if (ok) {
        Alert.alert('Success', 'Account created successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]);
      } else {
        console.log('Signup failed:', data.error || 'Unknown error'); // Log error from API
        Alert.alert('Error', data.error || 'Something went wrong');
      }
    } catch (error) {
      console.log('Error during API request:', error); // Log unexpected errors
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <Text style={styles.loginText}>Welcome to PowerLog!</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          onChangeText={setName}
          placeholderTextColor={'white'}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={'white'}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={'white'}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholderTextColor={'white'}
        />
        <TouchableOpacity
          style={styles.loginButtonStyle}
          onPress={handleSignup} // Handles signup and navigation
        >
          <Text style={styles.buttonText}>Signup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonStyle}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>
            Already have an account? Go to Login
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#414141'},
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#414141',
  },
  input: {
    padding: 10,
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: 'black',
    color: 'white',
  },
  loginText: {fontSize: 24, marginBottom: 20, color: 'white'},
  loginButtonStyle: {
    color: 'white',
    gap: 10,
    backgroundColor: '#6200EE',
    padding: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonStyle: {
    color: 'white',
    gap: 10,
    backgroundColor: '#6200EE',
    padding: 10,
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default SignupScreen;
