import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {ScrollView} from 'react-native-gesture-handler';

const CalorieTracker = () => {
  // States for modals
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  // States for search and meals
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [meals, setMeals] = useState([]);

  // States for calorie tracking
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [tempCalorieGoal, setTempCalorieGoal] = useState('2000');
  const [consumedCalories, setConsumedCalories] = useState(0);

  // Load user data when component mounts
  useEffect(() => {
    loadUserData();
  }, []);

  // Calculate consumed calories whenever meals change
  useEffect(() => {
    calculateConsumedCalories();
  }, [meals]);

  // Load user's calorie goal and meals from storage
  const loadUserData = async () => {
    try {
      // Load calorie goal
      const storedGoal = await AsyncStorage.getItem('calorieGoal');
      if (storedGoal) {
        setCalorieGoal(parseInt(storedGoal));
        setTempCalorieGoal(storedGoal);
      }

      // Load meals
      const storedMeals = await AsyncStorage.getItem('meals');
      if (storedMeals) {
        setMeals(JSON.parse(storedMeals));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Calculate total calories consumed from meals
  const calculateConsumedCalories = () => {
    const total = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    setConsumedCalories(total);
  };

  // Save calorie goal to storage
  const saveCalorieGoal = async () => {
    try {
      const newGoal = parseInt(tempCalorieGoal);
      if (isNaN(newGoal) || newGoal <= 0) {
        Alert.alert('Invalid Input', 'Please enter a valid calorie goal');
        return;
      }

      await AsyncStorage.setItem('calorieGoal', tempCalorieGoal);
      setCalorieGoal(newGoal);
      setSettingsModalVisible(false);
    } catch (error) {
      console.error('Error saving calorie goal:', error);
      Alert.alert('Error', 'Failed to save calorie goal');
    }
  };

  // Search for food using backend API
  const searchFood = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Search query:', searchQuery);

      const response = await axios.post(
        'http://192.168.50.134:3000/api/food/search',
        {query: searchQuery},
        {headers: {Authorization: `Bearer ${token}`}},
      );

      console.log('Raw API Response:', JSON.stringify(response.data));

      // More flexible result handling:
      if (response.data) {
        // Try different possible property names
        const results =
          response.data.common ||
          response.data.branded ||
          response.data.foods ||
          response.data;

        // If results is an array, use it
        if (Array.isArray(results) && results.length > 0) {
          console.log('Found results:', results.length);
          setSearchResults(results);
        }
        // If results is an object that contains an array
        else if (typeof results === 'object' && results !== null) {
          // Try to find any array property
          const arrayProps = Object.keys(results).find(
            (key) => Array.isArray(results[key]) && results[key].length > 0,
          );

          if (arrayProps) {
            setSearchResults(results[arrayProps]);
          } else {
            setSearchResults([]);
            Alert.alert('No Results', 'No foods found matching your search');
          }
        } else {
          setSearchResults([]);
          Alert.alert('No Results', 'No foods found matching your search');
        }
      } else {
        setSearchResults([]);
        Alert.alert('No Results', 'No foods found matching your search');
      }
    } catch (error) {
      console.error('Error details:', error);

      if ((error as any).response) {
        console.error('Server response:', (error as any).response.data);
        Alert.alert(
          'Search Failed',
          (error as any).response.data.message ||
            'The server encountered an error processing your search.',
        );
      } else if ((error as any).request) {
        Alert.alert(
          'Connection Error',
          'Could not connect to the server. Please check your internet connection.',
        );
      } else {
        Alert.alert('Error', 'Failed to search for food');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add food to meals
  const addFood = async (food) => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');

      const response = await axios.post(
        `http://192.168.50.134:3000/api/food/nutrition/${encodeURIComponent(food.food_name)}`,
        {},
        {headers: {Authorization: `Bearer ${token}`}},
      );

      if (response.data.foods && response.data.foods.length > 0) {
        const foodDetails = response.data.foods[0];

        const newMeal = {
          id: Date.now().toString(),
          name: food.food_name,
          calories: foodDetails.nf_calories,
          protein: foodDetails.nf_protein || 0,
          carbs: foodDetails.nf_total_carbohydrate || 0,
          fat: foodDetails.nf_total_fat || 0,
          date: new Date().toISOString(),
          mealType: selectedMealType, // Add the meal type
        };

        const updatedMeals = [...meals, newMeal];
        await AsyncStorage.setItem('meals', JSON.stringify(updatedMeals));
        setMeals(updatedMeals);

        setSearchModalVisible(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error getting food details:', error);
      Alert.alert('Error', 'Failed to get food details');
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to your component
  const removeMeal = async (mealId) => {
    try {
      // Filter out the meal with the specified ID
      const updatedMeals = meals.filter((meal) => meal.id !== mealId);

      // Update AsyncStorage
      await AsyncStorage.setItem('meals', JSON.stringify(updatedMeals));

      // Update state
      setMeals(updatedMeals);

      // The consumed calories will automatically update due to your useEffect
    } catch (error) {
      console.error('Error removing meal:', error);
      Alert.alert('Error', 'Failed to remove meal');
    }
  };

  const resetAllMeals = () => {
    Alert.alert(
      'Reset All Meals',
      'This will clear all your meal data and reset the progress bar on your Home screen.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset All',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear meals from AsyncStorage
              await AsyncStorage.removeItem('meals');

              // Clear state
              setMeals([]);

              // Show confirmation
              Alert.alert('Reset Complete', '', [
                {
                  text: 'OK',
                  onPress: () => {
                    // Optionally navigate back to Home to see the update immediately
                    // navigation.navigate('Home');
                  },
                },
              ]);
            } catch (error) {
              console.error('Error resetting meals:', error);
              Alert.alert('Error', 'Failed to reset meals');
            }
          },
        },
      ],
    );
  };

  const renderMealSection = (title, type) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const mealsOfType = meals.filter(
      (meal) =>
        meal.mealType === type && meal.date && meal.date.startsWith(todayStr),
    );

    if (mealsOfType.length === 0) return null;

    return (
      <View style={styles.mealSection}>
        <Text style={styles.mealSectionTitle}>{title}</Text>
        {mealsOfType.map((meal) => (
          <View key={meal.id} style={styles.mealItem}>
            <Text style={styles.mealName}>{meal.name}</Text>
            <View style={styles.mealRightContainer}>
              <Text style={styles.mealCalories}>
                {meal.calories.toFixed(0)} cal
              </Text>
              <TouchableOpacity
                onPress={() => removeMeal(meal.id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <Text style={styles.mealSectionTotal}>
          Total:{' '}
          {mealsOfType.reduce((sum, meal) => sum + meal.calories, 0).toFixed(0)}{' '}
          cal
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Calorie Tracker</Text>
      </View>

      <View style={styles.topCalorieContainer}>
        <Text style={styles.text}>
          Calories remaining: {(calorieGoal - consumedCalories).toFixed(0)}
        </Text>
        <Text style={styles.text}>
          Calories consumed: {consumedCalories.toFixed(0)}
        </Text>
        <Text style={styles.goalText}>Daily goal: {calorieGoal}</Text>

        {/* Settings button moved here, inside calorie container */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setSettingsModalVisible(true)}
        >
          <Text style={styles.settingsButtonText}>Edit goals</Text>
        </TouchableOpacity>
      </View>

      {/* Meal list */}
      <View style={styles.mealListContainer}>
        <Text style={styles.sectionTitle}>Today's Meals</Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {meals.length === 0 ? (
            <Text style={styles.emptyText}>No meals added yet</Text>
          ) : (
            <>
              {/* Breakfast */}
              {renderMealSection('Breakfast', 'breakfast')}

              {/* Lunch */}
              {renderMealSection('Lunch', 'lunch')}

              {/* Dinner */}
              {renderMealSection('Dinner', 'dinner')}

              {/* Snacks */}
              {renderMealSection('Snacks', 'snack')}
            </>
          )}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={styles.mealButton}
        onPress={() => setSearchModalVisible(true)}
      >
        <Text style={styles.buttonText}>Add Meal +</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.resetButton} onPress={resetAllMeals}>
        <Text style={styles.resetButtonText}>Reset meals</Text>
      </TouchableOpacity>

      {/* Food Search Modal */}
      <Modal
        visible={searchModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSearchModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Search Food</Text>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search for a food..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={searchFood}
              >
                <Text style={styles.buttonText}>Search</Text>
              </TouchableOpacity>
            </View>

            {/* Add meal type selector */}
            <View style={styles.mealTypeContainer}>
              <Text style={styles.mealTypeLabel}>Add to:</Text>
              <View style={styles.mealTypeButtonsContainer}>
                {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.mealTypeButton,
                      selectedMealType === type &&
                        styles.mealTypeButtonSelected,
                    ]}
                    onPress={() => setSelectedMealType(type)}
                  >
                    <Text
                      style={[
                        styles.mealTypeButtonText,
                        selectedMealType === type &&
                          styles.mealTypeButtonTextSelected,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {isLoading ? (
              <ActivityIndicator size="large" color="#00D0FF" />
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(item, index) => `food-${index}`}
                style={styles.resultsList}
                ListEmptyComponent={() => (
                  <Text style={styles.emptyText}>
                    No foods found. Try a different search.
                  </Text>
                )}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.foodItem}
                    onPress={() => addFood(item)}
                  >
                    <Text style={styles.foodName}>
                      {item.food_name || item.name || 'Unknown food'}
                    </Text>
                    {item.brand_name && (
                      <Text style={styles.brandName}>{item.brand_name}</Text>
                    )}
                  </TouchableOpacity>
                )}
              />
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setSearchModalVisible(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Settings Modal for Calorie Goal */}
      <Modal
        visible={settingsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Calorie Settings</Text>

            <Text style={styles.settingsLabel}>Daily Calorie Goal:</Text>
            <TextInput
              style={styles.goalInput}
              keyboardType="numeric"
              value={tempCalorieGoal}
              onChangeText={setTempCalorieGoal}
              placeholder="Enter your daily calorie goal"
              placeholderTextColor="#999"
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveCalorieGoal}
            >
              <Text style={styles.buttonText}>Save Goal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSettingsModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 10,
    marginTop: 0,
    marginBottom: 10,
  },
  resetButtonText: {
    color: '#FF4136',
    fontWeight: 'bold',
    fontSize: 14,
  },
  settingsButton: {
    right: 0,
    padding: 5,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00D0FF',
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  settingsButtonText: {
    fontSize: 24,
    color: 'white',
  },
  topCalorieContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#414141',
    padding: 20,
    margin: 10,
    borderRadius: 10,
  },
  text: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
  },
  goalText: {
    color: '#00D0FF',
    fontSize: 20,
    marginTop: 5,
    fontWeight: 'bold',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mealButton: {
    backgroundColor: '#00D0FF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    margin: 10,
  },
  mealListContainer: {
    flex: 1,
    backgroundColor: '#414141',
    margin: 10,
    borderRadius: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00D0FF',
    marginBottom: 15,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  mealName: {
    color: 'white',
    fontSize: 16,
  },
  mealCalories: {
    color: '#00D0FF',
    fontSize: 16,
  },
  mealSection: {
    marginBottom: 20,
  },
  mealSectionTitle: {
    fontSize: 16,
    color: '#00D0FF',
    fontWeight: 'bold',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  mealSectionTotal: {
    color: '#00D0FF',
    fontSize: 14,
    textAlign: 'right',
    marginTop: 4,
    fontWeight: 'bold',
  },
  mealRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: 15,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF4136',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
    textAlign: 'center',
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 10,
    color: 'white',
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#00D0FF',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  resultsList: {
    maxHeight: 300,
  },
  foodItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  foodName: {
    color: 'white',
    fontSize: 16,
  },
  brandName: {
    color: '#999',
    fontSize: 14,
  },
  closeButton: {
    backgroundColor: '#FF4136',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#00D0FF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  settingsLabel: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
  },
  goalInput: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    fontSize: 16,
  },
  mealTypeContainer: {
    marginBottom: 15,
  },
  mealTypeLabel: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
  },
  mealTypeButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mealTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#333',
    marginRight: 8,
  },
  mealTypeButtonSelected: {
    backgroundColor: '#00D0FF',
  },
  mealTypeButtonText: {
    color: '#999',
    fontWeight: '500',
  },
  mealTypeButtonTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 10,
  },
});

export default CalorieTracker;
