import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaView} from 'react-native-safe-area-context';
import useUser from '../hooks/userHooks';
import {useAuth} from '../context/AuthContext';

const LoginScreen = ({navigation}: any) => {
  const [nameEmail, setNameEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const {login} = useUser(); // Use the hook's login function
  const {setIsAuthenticated, updateUser} = useAuth();

  interface LoginResponse {
    token: string;
    isFirstLogin: boolean;
    user?: {
      id: string;
      name: string;
      email: string;
    };
  }

  const handleLogin = async () => {
    try {
      // Log values to verify they're not empty
      console.log(
        'Attempting login with username/email:',
        nameEmail || 'EMPTY',
      );

      if (
        !nameEmail ||
        !password ||
        nameEmail.trim() === '' ||
        password.trim() === ''
      ) {
        Alert.alert('Error', 'Username/email and password are required');
        return;
      }

      setLoading(true);
      const data = await login(nameEmail, password);

      // Store token
      await AsyncStorage.setItem('token', data.token);

      console.log('Login response:', {isFirstLogin: data.isFirstLogin}); // Debug

      // Store first login flag (IMPORTANT)
      if (data.isFirstLogin) {
        await AsyncStorage.setItem('isFirstLogin', 'true');
        await AsyncStorage.removeItem('onboardingComplete'); // Make sure onboardingComplete is NOT set for new users
        console.log('First login detected, saving flag');
      }

      // IMPORTANT: Force state refresh
      await AsyncStorage.setItem('isLoggedIn', 'true');

      // Update BOTH auth states
      setIsAuthenticated(true);

      // Update full user object with API data
      updateUser({
        id: data.user?.id,
        name: data.user?.name,
        email: data.user?.email,
        onboarded: !data.isFirstLogin, // Critical property for navigation
      });

      if (data.isFirstLogin) {
        // Update the user object in context for new users
        updateUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          onboarded: false, // Critical flag for navigation
        });
      }

      // Wait a moment for state to propagate (helps on slower devices)
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Reset navigation state completely
      navigation.reset({
        index: 0,
        routes: [{name: 'Main'}], // CORRECT screen name from Navigator.tsx
      });
    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert(
        'Login Failed',
        (error as any).response?.data?.error || 'Invalid credentials',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.loginText}>WELCOME TO POWERLOG</Text>
        <TextInput
          style={styles.input}
          placeholder="Email or Username"
          placeholderTextColor="white"
          onChangeText={setNameEmail}
          value={nameEmail || ''}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="white"
          onChangeText={setPassword}
          secureTextEntry
          value={password || ''}
        />
        {loading ? (
          <ActivityIndicator size="large" color="#00D0FF" />
        ) : (
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.buttonText}>Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#414141',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: 'black',
    color: 'white',
  },
  loginText: {fontSize: 24, marginBottom: 20, color: 'white'},
  loginButton: {
    color: 'white',
    gap: 10,
    backgroundColor: '#6200EE',
    padding: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  signupButton: {
    color: 'white',
    gap: 10,
    backgroundColor: '#6200EE',
    padding: 10,
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {color: 'white', fontSize: 16},
});

export default LoginScreen;
