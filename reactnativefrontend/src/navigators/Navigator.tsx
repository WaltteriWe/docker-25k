import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import {Icon} from '@rneui/themed';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import {createStackNavigator} from '@react-navigation/stack';
import CalorieTracker from '../screens/CalorieTracker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import LiveWorkout from '../screens/LiveWorkout';
import WorkoutHistory from '../screens/WorkoutHistory';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import React, {useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingWelcomeScreen from '../screens/OnboardingWelcomeScreen';
import OnboardingQuestionsScreen from '../screens/OnboardingQuestionsScreen';
import OnboardingCompleteScreen from '../screens/OnboardingCompleteScreen';
import {navigationRef} from './NavUtil';
import {AuthProvider} from '../context/AuthContext';
import {useAuth} from '../context/AuthContext';
import {ActivityIndicator, View} from 'react-native';

// Create navigators
const Tab = createBottomTabNavigator();
const AuthStack = createStackNavigator();
const RootStack = createStackNavigator();
const Stack = createStackNavigator();
const OnBoardingStack = createStackNavigator();

// Tab navigator (shown after login)
const TabScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({focused, color, size}) => {
          let iconName = '';
          if (route.name === 'Home') {
            return <FontAwesome name="home" size={size} color={color} />;
          } else if (route.name === 'My Profile') {
            return <FontAwesome name="user" size={size} color={color} />;
          } else if (route.name === 'Calories') {
            return <FontAwesome name="fire" size={size} color={color} />;
          } else if (route.name === 'Live Workout') {
            return <FontAwesome name="plus" size={size} color={color} />;
          } else if (route.name === 'History') {
            return <FontAwesome5 name="dumbbell" size={size} color={color} />;
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'black',
        tabBarStyle: {backgroundColor: '#00D0FF'},
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calories" component={CalorieTracker} />
      <Tab.Screen name="Live Workout" component={LiveWorkout} />
      <Tab.Screen name="History" component={WorkoutHistory} />
      <Tab.Screen name="My Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Auth navigator (login/signup screens)
const AuthScreen = () => {
  return (
    <AuthStack.Navigator screenOptions={{headerShown: false}}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
};

// Simplify the OnBoardingScreen component
const OnBoardingScreen = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="OnboardingWelcome"
        component={OnboardingWelcomeScreen}
      />
      <Stack.Screen
        name="OnboardingQuestions"
        component={OnboardingQuestionsScreen}
      />
      <Stack.Screen
        name="OnboardingComplete"
        component={OnboardingCompleteScreen}
      />
    </Stack.Navigator>
  );
};

// Navigator component with authentication and onboarding logic
const Navigator = () => {
  const {isAuthenticated, user, loading} = useAuth();

  // Debug info to track state changes
  useEffect(() => {
    console.log('Navigator auth state changed:', {
      isAuthenticated,
      onboarded: user?.onboarded,
    });
  }, [isAuthenticated, user?.onboarded]);

  // Wait for loading to complete
  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#00D0FF" />
      </View>
    );
  }

  // Simple key-based re-rendering forces Navigator to rebuild on auth changes
  return (
    <NavigationContainer key={`nav-${isAuthenticated}-${user?.onboarded}`}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {!isAuthenticated ? (
          // Auth screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : !user.onboarded ? (
          // Onboarding screens
          <>
            <Stack.Screen
              name="OnboardingWelcome"
              component={OnboardingWelcomeScreen}
            />
            <Stack.Screen
              name="OnboardingQuestions"
              component={OnboardingQuestionsScreen}
            />
          </>
        ) : (
          // Main app screen
          <Stack.Screen name="Main" component={TabScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Wrap NavigationContainer with AuthProvider
const App = () => {
  return (
    <AuthProvider>
      <Navigator />
    </AuthProvider>
  );
};

export default App;
