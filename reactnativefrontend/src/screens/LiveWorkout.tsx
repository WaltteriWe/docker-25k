import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  ScrollView,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LiveWorkout = () => {
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const countRef = useRef(null);

  // State for exercise dialog
  const [dialogVisible, setDialogVisible] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const saveWorkoutData = async () => {
    try {
      const workoutData = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        duration: timer,
        exercises: selectedExercises,
      };

      const existingWorkoutsJSON = await AsyncStorage.getItem('workouts');
      const existingWorkouts = existingWorkoutsJSON
        ? JSON.parse(existingWorkoutsJSON)
        : [];

      // Add the new workout data to the existing workouts
      const updatedWorkouts = [...existingWorkouts, workoutData];
      // Save the updated workouts back to AsyncStorage
      await AsyncStorage.setItem('workouts', JSON.stringify(updatedWorkouts));

      // First stop the timer and clear the interval
      setIsRunning(false);
      setIsPaused(false);

      // Use setTimeout to ensure the interval is cleared before resetting the timer
      setTimeout(() => {
        setTimer(0);
        setSelectedExercises([]);
      }, 50);
    } catch (error) {
      console.error('Error saving workout data:', error);
    }
  };
  // Mock exercise data - replace with API call to your backend
  const mockExercises = [
    {id: 1, name: 'Bench Press', muscle: 'Chest'},
    {id: 2, name: 'Squat', muscle: 'Legs'},
    {id: 3, name: 'Deadlift', muscle: 'Back'},
    {id: 4, name: 'Pull-up', muscle: 'Back'},
    {id: 5, name: 'Shoulder Press', muscle: 'Shoulders'},
  ];

  // Load exercises when component mounts
  useEffect(() => {
    // Replace this with your actual API call
    setExercises(mockExercises);
  }, []);

  // Timer functions
  useEffect(() => {
    if (isRunning && !isPaused) {
      countRef.current = setInterval(() => {
        setTimer((timer) => timer + 10); // Increment by 10ms
      }, 10);
    } else {
      clearInterval(countRef.current);
    }
    return () => clearInterval(countRef.current);
  }, [isRunning, isPaused]);

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
    setIsRunning(false);
  };

  const handleResume = () => {
    setIsPaused(false);
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimer(0);
  };

  const formatTime = () => {
    const getMilliseconds = `0${(timer % 1000) / 10}`.slice(-2);
    const getSeconds = `0${Math.floor((timer / 1000) % 60)}`.slice(-2);
    const getMinutes = `0${Math.floor((timer / 60000) % 60)}`.slice(-2);
    const getHours = `0${Math.floor(timer / 3600000)}`.slice(-2);
    return `${getHours}:${getMinutes}:${getSeconds}.${getMilliseconds}`;
  };

  // Exercise functions
  const openExerciseDialog = () => {
    setDialogVisible(true);
  };

  const closeExerciseDialog = () => {
    setDialogVisible(false);
    setSearchQuery('');
  };

  const addExerciseToWorkout = (exercise) => {
    setSelectedExercises([...selectedExercises, exercise]);
    closeExerciseDialog();
  };

  const resetExerciseList = () => {
    setSelectedExercises([]);
  };

  const filteredExercises = exercises.filter((exercise) =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Live Workout</Text>

      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime()}</Text>
      </View>

      <View style={styles.buttonRow}>
        {!isRunning && !isPaused ? (
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        ) : isRunning && !isPaused ? (
          <TouchableOpacity style={styles.buttonRed} onPress={handlePause}>
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.startButton} onPress={handleResume}>
            <Text style={styles.buttonText}>Resume</Text>
          </TouchableOpacity>
        )}

        {/* Reset button always present */}
        <TouchableOpacity style={styles.buttonRed} onPress={handleReset}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Selected exercises list */}
      {selectedExercises.length > 0 && (
        <View style={styles.exerciseList}>
          <View style={styles.exerciseListHeader}>
            <Text style={styles.subHeader}>Current Exercises</Text>
            <TouchableOpacity
              style={styles.resetExercisesButton}
              onPress={resetExerciseList}
            >
              <Text style={styles.smallButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.exerciseScroll}>
            {selectedExercises.map((exercise) => (
              <View key={exercise.id} style={styles.exerciseItem}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseMuscle}>{exercise.muscle}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <TouchableOpacity style={styles.buttonBlue} onPress={openExerciseDialog}>
        <Text style={styles.buttonText}>Add Exercise</Text>
      </TouchableOpacity>

      {/* Exercise selection dialog */}
      <Modal
        visible={dialogVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeExerciseDialog}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Select Exercise</Text>

            <TextInput
              style={styles.searchInput}
              placeholder="Search exercises..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <FlatList
              data={filteredExercises}
              keyExtractor={(item) => item.id.toString()}
              style={styles.exercisesList}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.exerciseOption}
                  onPress={() => addExerciseToWorkout(item)}
                >
                  <Text style={styles.exerciseName}>{item.name}</Text>
                  <Text style={styles.exerciseMuscle}>{item.muscle}</Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeExerciseDialog}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <TouchableOpacity style={styles.saveButton} onPress={saveWorkoutData}>
        <Text style={styles.buttonText}>Save Workout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#414141',
    padding: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 30,
  },
  timerContainer: {
    backgroundColor: '#000000',
    padding: 10,
    borderRadius: 10,
    marginVertical: 15,
    minWidth: 150,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 40,
    color: '#00D0FF',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  resetExercisesButton: {
    backgroundColor: '#FF4136',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  startButton: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  buttonRed: {
    backgroundColor: '#FF4136',
    padding: 15,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: 'limegreen',
    padding: 15,
    marginTop: 25,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  buttonBlue: {
    backgroundColor: '#00D0FF',
    padding: 15,
    marginTop: 25,
    borderRadius: 8,
    width: '55%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  smallButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },

  // Exercise list styles
  exerciseList: {
    width: '100%',
    marginTop: 20,
    padding: 10,
    backgroundColor: '#000',
    borderRadius: 10,
  },
  exerciseListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  exerciseScroll: {
    maxHeight: 200, // Fixed height for scrolling
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  exerciseName: {
    color: 'white',
    fontSize: 16,
  },
  exerciseMuscle: {
    color: '#00D0FF',
    fontSize: 14,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#414141',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  searchInput: {
    backgroundColor: '#2a2a2a',
    padding: 10,
    borderRadius: 8,
    color: 'white',
    marginBottom: 15,
  },
  exercisesList: {
    maxHeight: 300,
  },
  exerciseOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  closeButton: {
    backgroundColor: '#FF4136',
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
});

export default LiveWorkout;
