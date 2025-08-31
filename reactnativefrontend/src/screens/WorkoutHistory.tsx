import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

const WorkoutHistory = ({navigation}) => {
  const [workouts, setWorkouts] = useState([]);

  // Load workouts when component mounts
  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        const workoutsJSON = await AsyncStorage.getItem('workouts');
        if (workoutsJSON) {
          setWorkouts(JSON.parse(workoutsJSON));
        }
      } catch (error) {
        console.error('Error loading workouts:', error);
      }
    };

    loadWorkouts();

    // Add a listener to reload data when the screen comes into focus
    const unsubscribe = navigation.addListener('focus', loadWorkouts);
    return unsubscribe;
  }, [navigation]);

  // Format time from milliseconds
  const formatTime = (ms) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 60000) % 60);
    const hours = Math.floor(ms / 3600000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top button */}

      {/* Workout data container */}
      <View style={styles.workoutContainer}>
        <Text style={styles.header}>Workout History</Text>
        <ScrollView style={styles.workoutScrollView}>
          {workouts.length === 0 ? (
            <Text style={styles.text}>
              No workout history yet. Start a workout!
            </Text>
          ) : (
            workouts.map((workout) => (
              <View key={workout.id} style={styles.workoutItem}>
                <Text style={styles.workoutDate}>
                  {formatDate(workout.date)}
                </Text>
                <Text style={styles.workoutDuration}>
                  Duration: {formatTime(workout.duration)}
                </Text>
                <Text style={styles.exercisesHeader}>Exercises:</Text>
                {workout.exercises.map((exercise) => (
                  <Text key={exercise.id} style={styles.exerciseText}>
                    • {exercise.name} ({exercise.muscle})
                  </Text>
                ))}
              </View>
            ))
          )}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={styles.topButton}
        onPress={() => navigation.navigate('Live Workout')}
      >
        <Text style={styles.buttonText}>Start Workout</Text>
      </TouchableOpacity>

      {/* Streak counter */}
      <View style={styles.streakContainer}>
        <Text style={styles.subHeader}>Current Streak</Text>
        <Text style={styles.streakText}>5 days 🔥</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#414141',
    padding: 16,
  },
  topButton: {
    backgroundColor: '#00D0FF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  workoutContainer: {
    backgroundColor: '#000000',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    flex: 3,
  },
  workoutScrollView: {
    flex: 1,
  },
  streakContainer: {
    backgroundColor: '#000000',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: 'white',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  streakText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00D0FF',
  },
  workoutItem: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  workoutDate: {
    color: '#00D0FF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  workoutDuration: {
    color: 'white',
    fontSize: 14,
    marginBottom: 10,
  },
  exercisesHeader: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  exerciseText: {
    color: 'white',
    fontSize: 14,
    paddingLeft: 10,
    marginTop: 2,
  },
});

export default WorkoutHistory;
