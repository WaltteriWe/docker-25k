import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import useUser from '../hooks/userHooks';
import {useAuth} from '../context/AuthContext';
import {useNavigation} from '@react-navigation/native';

const ProfileScreen = () => {
  const {BASE_URL} = useUser();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({});
  const {logout} = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      // Get token
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      // Fetch basic user data
      const userResponse = await axios.get(`${BASE_URL}/user/profile`, {
        headers: {Authorization: `Bearer ${token}`},
      });

      // Fetch form answers
      const formResponse = await axios.get(
        `${BASE_URL}/forms-answers/user-answers`,
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );

      // Merge user data with form answers
      const userData = userResponse.data;
      const formAnswers = formResponse.data || [];

      // Create labeled answers object
      const labeledAnswers = {};
      formAnswers.forEach((answer) => {
        // Map question IDs to readable labels
        switch (answer.questionId) {
          case 1:
            labeledAnswers.gender = answer.answerText;
            break;
          case 2:
            labeledAnswers.age = answer.answerText;
            break;
          case 3:
            labeledAnswers.height = answer.answerText;
            break;
          case 4:
            labeledAnswers.weight = answer.answerText;
            break;
          case 7:
            labeledAnswers.fitnessLevel = answer.answerText;
            break;
          case 8:
            labeledAnswers.fitnessGoal = answer.answerText;
            break;
          default:
            labeledAnswers[`question${answer.questionId}`] = answer.answerText;
        }
      });

      // Set combined profile data
      setProfile({
        ...userData,
        ...labeledAnswers,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // After logout, navigation will update automatically due to auth context
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00D0FF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Your Profile</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <InfoItem label="Username" value={profile.username} />
        <InfoItem label="Email" value={profile.email} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <InfoItem label="Gender" value={profile.gender} />
        <InfoItem label="Age" value={profile.age} />
        <InfoItem label="Height" value={profile.height} />
        <InfoItem label="Weight" value={profile.weight} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fitness Profile</Text>
        <InfoItem label="Fitness Level" value={profile.fitnessLevel} />
        <InfoItem label="Fitness Goal" value={profile.fitnessGoal} />
      </View>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const InfoItem = ({label, value}) => (
  <View style={styles.infoItem}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value || 'Not provided'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#00D0FF',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  section: {
    backgroundColor: 'white',
    marginVertical: 10,
    padding: 15,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    flex: 1,
    fontWeight: '500',
    color: '#666',
  },
  value: {
    flex: 2,
  },
  logoutContainer: {
    padding: 20,
    marginVertical: 10,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProfileScreen;
