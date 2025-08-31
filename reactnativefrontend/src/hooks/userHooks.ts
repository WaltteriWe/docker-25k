import axios from 'axios';
import {Platform} from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Automatically determine the correct API URL based on environment
const getBaseURL = () => {
  if (Platform.OS === 'web') {
    return '/api';
  }
  if (Constants.expoConfig?.hostUri) {
    const hostAddress = Constants.expoConfig.hostUri.split(':')[0];
    return `http://${hostAddress}:3000/api`;
  }
  // Fallback for development or production
  return 'http://localhost:3000/api';
};

const BASE_URL = getBaseURL();
console.log('API Base URL:', BASE_URL);

const useUser = () => {
  const postUser = async (endpoint: string, body: any) => {
    try {
      console.log('Posting to:', `${BASE_URL}${endpoint}`);

      const response = await axios.post(`${BASE_URL}${endpoint}`, body);

      console.log('Response status:', response.status);
      console.log(
        'Response data:',
        JSON.stringify(response.data).substring(0, 200),
      );

      return {data: response.data, ok: true};
    } catch (error: any) {
      console.error('API error:', error.response?.data || error.message);
      return {data: error.response?.data || {error: error.message}, ok: false};
    }
  };

  const getUser = async (endpoint: string, token?: string) => {
    try {
      console.log(`Sending GET request to: ${BASE_URL}${endpoint}`);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        headers,
        timeout: 15000,
      });

      return {data: response.data, ok: true};
    } catch (error: any) {
      console.log('API GET error details:', error);
      return {
        data: error.response?.data || {error: 'Something went wrong'},
        ok: false,
      };
    }
  };

  const login = async (nameOrEmail: string, password: string) => {
    try {
      console.log(`Attempting login for user: ${nameOrEmail}`);

      // Log EXACT request body for debugging
      const requestBody = {
        nameEmail: nameOrEmail,
        password: password,
      };
      console.log('Sending exact request body:', requestBody);

      // Make the request with explicit Content-Type
      const response = await axios.post(`${BASE_URL}/user/login`, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Login response status:', response.status);

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Add registration function
  const register = async (name: string, email: string, password: string) => {
    return await postUser('/user/signup', {
      name,
      email,
      password,
      confirm_password: password,
    });
  };

  // Add function to get onboarding status
  const getOnboardingStatus = async (token: string) => {
    return await getUser('/user/onboarding/status', token);
  };

  // Add function to save onboarding responses
  const saveOnboardingResponses = async (responses: any[], token: string) => {
    try {
      console.log('Sending to:', `${BASE_URL}/forms-answers/user-answers`);

      const response = await axios.post(
        `${BASE_URL}/forms-answers/user-answers`,
        {answers: responses},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return {data: response.data, ok: true};
    } catch (error) {
      console.error('API error details:', error);
      return {
        data: error.response?.data || {error: 'Failed to save responses'},
        ok: false,
      };
    }
  };

  // Return all functions
  return {
    postUser,
    getUser,
    login,
    register,
    getOnboardingStatus,
    saveOnboardingResponses,
    BASE_URL,
  };
};

export default useUser;
