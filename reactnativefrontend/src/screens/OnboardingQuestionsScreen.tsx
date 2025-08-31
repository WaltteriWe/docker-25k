// src/screens/OnboardingQuestionsScreen.tsx
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  TextInput, // Add this import
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import useUser from '../hooks/userHooks';
import {useAuth} from '../context/AuthContext'; // Add this import

const OnboardingQuestionsScreen = ({navigation}) => {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Record<string, any[]>>({});
  const [currentCategory, setCurrentCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [questionChoices, setQuestionChoices] = useState<
    Record<string, string[]>
  >({});
  const {BASE_URL, saveOnboardingResponses} = useUser();
  const [error, setError] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const {updateUser, updateAuthState} = useAuth(); // Get this from context

  // Navigation functions
  const goToNextQuestion = () => {
    const currentQuestions = questions[currentCategory] || [];
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Find next category
      const categoryIndex = categories.indexOf(currentCategory);
      if (categoryIndex < categories.length - 1) {
        setCurrentCategory(categories[categoryIndex + 1]);
        setCurrentQuestionIndex(0);
      } else {
        // End of questions - submit
        handleSubmit();
      }
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      // Go to previous category
      const categoryIndex = categories.indexOf(currentCategory);
      if (categoryIndex > 0) {
        setCurrentCategory(categories[categoryIndex - 1]);
        const prevCategoryQuestions =
          questions[categories[categoryIndex - 1]] || [];
        setCurrentQuestionIndex(Math.max(0, prevCategoryQuestions.length - 1));
      }
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      console.log('1. Starting to fetch questions...');
      setLoading(true);
      setError(false);

      const token = await AsyncStorage.getItem('token');
      console.log('2. Token retrieved:', !!token);

      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('3. About to fetch questions from API');
      let questionsArray = [];
      try {
        console.log(`Requesting questions from: ${BASE_URL}/forms-questions`);
        const questionsResponse = await axios.get(
          `${BASE_URL}/forms-questions`,
          {
            headers: {Authorization: `Bearer ${token}`},
          },
        );

        console.log('Questions response status:', questionsResponse.status);
        console.log(
          'Questions data:',
          JSON.stringify(questionsResponse.data).substring(0, 200),
        ); // Don't log everything

        // Handle both array and single object responses
        if (Array.isArray(questionsResponse.data)) {
          questionsArray = questionsResponse.data;
          console.log(`Found ${questionsArray.length} questions in array`);
        } else if (questionsResponse.data && questionsResponse.data.id) {
          questionsArray = [questionsResponse.data];
          console.log('Found a single question, wrapped in array');
        } else {
          throw new Error('Invalid question data format');
        }
      } catch (questionsError) {
        console.error('Error fetching questions:', questionsError);
        setError(true);
        setLoading(false);
        return; // Exit early - can't continue without questions
      }

      const choicesMap: Record<string, string[]> = {};
      try {
        console.log(
          'Requesting choices from:',
          `${BASE_URL}/forms-answers/choices`,
        );
        const choicesResponse = await axios.get(
          `${BASE_URL}/forms-answers/choices`,
          {
            headers: {Authorization: `Bearer ${token}`},
          },
        );

        console.log('Choices response status:', choicesResponse.status);
        console.log('Raw choices data type:', typeof choicesResponse.data);
        console.log(
          'Is choices data array:',
          Array.isArray(choicesResponse.data),
        );

        // IMPORTANT: Check data carefully
        if (
          typeof choicesResponse.data === 'object' &&
          !Array.isArray(choicesResponse.data)
        ) {
          // Got a single object instead of array
          console.log('Single choice object detected, converting to array');
          if (choicesResponse.data.id) {
            const singleChoice = choicesResponse.data;
            choicesData = [singleChoice];
          } else {
            console.warn('Unexpected data format in choices response');
            choicesData = [];
          }
        } else {
          // Should be an array
          choicesData = choicesResponse.data || [];
        }

        console.log(`Processing ${choicesData.length} choices`);
        console.log('First few choices:', choicesData.slice(0, 3));

        // FALLBACK: If nothing came back from API, use hardcoded data
        if (choicesData.length <= 1) {
          console.log('Too few choices returned, using hardcoded data');

          // Minimal hardcoded choices
          const hardcodedChoices = [
            {id: 1, question_id: 1, answer_text: 'Male'},
            {id: 2, question_id: 1, answer_text: 'Female'},
            {id: 3, question_id: 5, answer_text: 'Athletic'},
            {id: 4, question_id: 5, answer_text: 'Average'},
            // Add more choices here...
          ];

          choicesData = hardcodedChoices;
        }

        // Group choices by question_id
        choicesData.forEach((choice) => {
          if (!choice || !choice.question_id) return;

          const questionId = choice.question_id.toString();
          if (!choicesMap[questionId]) {
            choicesMap[questionId] = [];
          }

          if (!choicesMap[questionId].includes(choice.answer_text)) {
            choicesMap[questionId].push(choice.answer_text);
          }
        });

        console.log('Choices map after processing:', choicesMap);
      } catch (choicesError) {
        console.error('Error fetching choices:', choicesError);
      }

      // Process questions and assign choices
      const processedQuestions: {
        id: string;
        category: string;
        text: string;
        choices: string[];
      }[] = [];

      if (Array.isArray(questionsArray)) {
        questionsArray.forEach((question) => {
          const questionId = question.id.toString();
          processedQuestions.push({
            id: questionId,
            category: question.category,
            text: question.question,
            choices: choicesMap[questionId] || [], // Assign choices from the map
          });
        });

        console.log(
          'Final processed questions:',
          processedQuestions.map((q) => ({
            id: q.id,
            category: q.category,
            text: q.text,
            choicesCount: q.choices.length,
          })),
        );

        // ONLY CREATE questionsByCategory ONCE
        const questionsByCategory: Record<
          string,
          {id: string; category: string; text: string; choices: string[]}[]
        > = {};

        processedQuestions.forEach((q) => {
          if (!q || !q.category) return;
          if (!questionsByCategory[q.category]) {
            questionsByCategory[q.category] = [];
          }
          questionsByCategory[q.category].push(q);
        });

        console.log(
          'Questions by category:',
          Object.keys(questionsByCategory).map((cat) => ({
            category: cat,
            questionCount: questionsByCategory[cat].length,
            questions: questionsByCategory[cat].map((q) => q.id),
          })),
        );

        const categoryList = Object.keys(questionsByCategory);
        if (categoryList.length === 0) {
          throw new Error('No question categories found');
        }

        // Update state all at once
        setQuestionChoices(choicesMap);
        setCategories(categoryList);
        setCurrentCategory(categoryList[0]);
        setQuestions(questionsByCategory);
      }
    } catch (error) {
      console.error('Overall error in fetchQuestions:', error);
      setError(true);
      setLoading(false); // IMPORTANT: Make sure loading is set to false here too

      Alert.alert('Error', 'Failed to load questions. Please try again.', [
        {
          text: 'Go Back',
          onPress: () => navigation.navigate('OnboardingWelcome'),
        },
      ]);
    } finally {
      console.log('5. Finally block reached');
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, answer) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      console.log('Submitting form answers...');

      // Get token for authentication
      const token = await AsyncStorage.getItem('token');

      // Format answers for submission
      const answersArray = Object.keys(responses).map((questionId) => ({
        questionId: parseInt(questionId),
        answerText: responses[questionId],
      }));

      // Submit answers to backend
      console.log(`Sending to: ${BASE_URL}/forms-answers/user-answers`);
      const result = await axios.post(
        `${BASE_URL}/forms-answers/user-answers`,
        answersArray,
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );

      console.log('Answers submitted successfully:', result.status);

      // Update profile stats
      await updateProfileStats(token, answersArray);

      // CRITICAL: Update AsyncStorage flags
      console.log('Setting onboarding flags in AsyncStorage');
      await AsyncStorage.setItem('onboardingComplete', 'true');
      await AsyncStorage.setItem('isFirstLogin', 'false');

      // IMPROVED: Single auth state update instead of multiple
      await updateAuthState({
        isAuthenticated: true,
        onboarded: true,
      });

      console.log('Auth state updated, navigating to Main');

      // Navigate without reset - the navigation container will handle it
      navigation.navigate('Main');
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert('Error', 'Failed to submit form');
    } finally {
      setLoading(false);
    }
  };

  const updateProfileStats = async (token, answers) => {
    try {
      // Extract stats from answers
      const stats = {
        gender: answers.find((a) => a.questionId === 1)?.answerText || '',
        // other fields...
      };

      // Use one of these endpoints based on what your backend supports:

      // Option 1: Try the /users/profile endpoint
      await axios.post(`${BASE_URL}/users/profile`, stats, {
        headers: {Authorization: `Bearer ${token}`},
      });

      // OR Option 2: Use put method if it's for updates
      // await axios.put(`${BASE_URL}/users/profile`, stats, {
      //   headers: {Authorization: `Bearer ${token}`}
      // });

      console.log('Profile stats updated successfully');
    } catch (error) {
      console.error('Error updating profile stats:', error);
      // Don't let this error block navigation
    }
  };

  // Add safety checks in your render method
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#00D0FF" />
      </SafeAreaView>
    );
  }

  if (error || !currentCategory || Object.keys(questions).length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>
          Something went wrong loading the questions.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('OnboardingWelcome')}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Safe to continue with rendering questions
  const currentQuestions = questions[currentCategory] || [];
  const currentQuestion = currentQuestions[currentQuestionIndex];

  // Check if we have a valid question
  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>
          No questions found for this category.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('OnboardingWelcome')}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{currentCategory}</Text>
        <Text style={styles.progress}>
          Question {currentQuestionIndex + 1} of {currentQuestions.length}
        </Text>

        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion.text}</Text>

          {currentQuestion.choices && currentQuestion.choices.length > 0 ? (
            // For questions with predefined choices (like gender, fitness level)
            currentQuestion.choices.map((choice, choiceIndex) => (
              <TouchableOpacity
                key={`${currentQuestion.id}-${choiceIndex}`}
                style={[
                  styles.choiceButton,
                  responses[currentQuestion.id] === choice &&
                    styles.selectedChoice,
                ]}
                onPress={() => handleAnswer(currentQuestion.id, choice)}
              >
                <Text style={styles.choiceText}>{choice}</Text>
              </TouchableOpacity>
            ))
          ) : (
            // For free-form questions (age, height, weight)
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your answer..."
                placeholderTextColor="#999"
                value={responses[currentQuestion.id] || ''}
                onChangeText={(text) => handleAnswer(currentQuestion.id, text)}
              />
            </View>
          )}
        </View>

        {/* Navigation buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentQuestionIndex === 0 && styles.disabledButton,
            ]}
            onPress={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>

          {currentQuestionIndex < currentQuestions.length - 1 ? (
            <TouchableOpacity
              style={[
                styles.navButton,
                !responses[currentQuestion.id] && styles.disabledButton,
              ]}
              onPress={() => {
                if (responses[currentQuestion.id]) {
                  goToNextQuestion();
                } else {
                  Alert.alert('Please select an answer to continue');
                }
              }}
              disabled={!responses[currentQuestion.id]}
            >
              <Text style={styles.navButtonText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.submitButton,
                !responses[currentQuestion.id] && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={!responses[currentQuestion.id]}
            >
              <Text style={styles.submitButtonText}>Complete</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Category navigation */}
        <View style={styles.categoryNavigation}>
          {categories.map((category, index) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                currentCategory === category && styles.activeCategoryButton,
              ]}
              onPress={() => {
                setCurrentCategory(category);
                setCurrentQuestionIndex(0); // Reset to first question in category
              }}
            >
              <Text style={styles.categoryText}>{index + 1}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00D0FF',
    marginBottom: 20,
  },
  questionContainer: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  questionText: {
    fontSize: 16,
    color: 'white',
    marginBottom: 15,
  },
  answerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 10,
  },
  answerButton: {
    backgroundColor: '#414141',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
    margin: 5,
  },
  selectedButton: {
    backgroundColor: '#00D0FF',
  },
  answerText: {
    color: 'white',
    fontWeight: 'bold',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  categoryButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#414141',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  activeCategoryButton: {
    backgroundColor: '#00D0FF',
  },
  categoryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#00D0FF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#00D0FF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  choiceButton: {
    backgroundColor: '#414141',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
    margin: 5,
  },
  selectedChoice: {
    backgroundColor: '#00D0FF',
  },
  choiceText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noChoicesText: {
    color: 'white',
    fontStyle: 'italic',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  navButton: {
    backgroundColor: '#00D0FF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  navButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  progress: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  categoryNavigation: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  textInputContainer: {
    width: '100%',
    marginVertical: 10,
  },
  textInput: {
    backgroundColor: '#414141',
    color: 'white',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#666',
  },
});

export default OnboardingQuestionsScreen;
