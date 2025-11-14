import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isDesktop = screenWidth > 768;

const demoSteps = [
  {
    id: 1,
    title: 'Welcome to Piggy Budget! 🐷',
    description: 'Your personal expense tracker to help you manage your finances better.',
    icon: 'wallet-outline',
    highlight: 'Get started with tracking your expenses',
  },
  {
    id: 2,
    title: 'Create Your Account',
    description: 'First, you\'ll need to create an account or log in. Your data will be securely stored and synced across devices.',
    icon: 'person-add-outline',
    highlight: 'Secure account creation with email',
  },
  {
    id: 3,
    title: 'Add Your Expenses',
    description: 'Tap the "Add Expense" tab to record your spending. Choose from 10 categories, add amount, and description.',
    icon: 'add-circle-outline',
    highlight: 'Quick and easy expense entry',
  },
  {
    id: 4,
    title: 'Track Categories',
    description: 'Organize expenses into categories like Food, Transportation, Shopping, Bills, and more for better insights.',
    icon: 'grid-outline',
    highlight: '10 colorful categories to choose from',
  },
  {
    id: 5,
    title: 'View Your Reports',
    description: 'Check the Reports tab to see beautiful charts showing your spending patterns by category and payment method.',
    icon: 'bar-chart-outline',
    highlight: 'Visual insights into your spending',
  },
  {
    id: 6,
    title: 'Monitor Your Budget',
    description: 'Use the Home screen to see your recent expenses and get an overview of your financial activity.',
    icon: 'home-outline',
    highlight: 'Quick overview of recent activity',
  },
  {
    id: 7,
    title: 'Ready to Start!',
    description: 'You\'re all set! Start tracking your expenses and take control of your finances. Happy budgeting! 🎉',
    icon: 'checkmark-circle-outline',
    highlight: 'Begin your financial journey',
  },
];

const DemoWalkthrough = ({ visible, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  if (!visible) return null;

  const step = demoSteps[currentStep];

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.stepCounter}>
            {currentStep + 1} of {demoSteps.length}
          </Text>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip Demo</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.iconContainer}>
            {step.id === 1 ? (
              <Image 
                source={require('../../assets/logo.png')} 
                style={styles.logoImage}
                resizeMode="contain"
              />
            ) : (
              <Ionicons name={step.icon} size={isDesktop ? 80 : 60} color="#6366F1" />
            )}
          </View>

          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>
          
          <View style={styles.highlightBox}>
            <Ionicons name="star" size={20} color="#F59E0B" />
            <Text style={styles.highlightText}>{step.highlight}</Text>
          </View>

          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            {demoSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentStep && styles.progressDotActive,
                  index < currentStep && styles.progressDotCompleted,
                ]}
              />
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.navigationButton, currentStep === 0 && styles.navigationButtonDisabled]}
            onPress={handlePrevious}
            disabled={currentStep === 0}
          >
            <Ionicons name="chevron-back" size={20} color={currentStep === 0 ? "#9CA3AF" : "#6366F1"} />
            <Text style={[styles.navigationButtonText, currentStep === 0 && styles.navigationButtonTextDisabled]}>
              Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentStep === demoSteps.length - 1 ? 'Get Started!' : 'Next'}
            </Text>
            {currentStep !== demoSteps.length - 1 && (
              <Ionicons name="chevron-forward" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  stepCounter: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  skipButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  skipButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: isDesktop ? 60 : 30,
    paddingVertical: 40,
  },
  iconContainer: {
    width: isDesktop ? 120 : 100,
    height: isDesktop ? 120 : 100,
    borderRadius: isDesktop ? 60 : 50,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  logoImage: {
    width: isDesktop ? 100 : 80,
    height: isDesktop ? 100 : 80,
  },
  title: {
    fontSize: isDesktop ? 28 : 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: isDesktop ? 18 : 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: isDesktop ? 26 : 24,
    marginBottom: 25,
    maxWidth: isDesktop ? 500 : 300,
  },
  highlightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 40,
  },
  highlightText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#92400E',
    marginLeft: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#6366F1',
    transform: [{ scale: 1.2 }],
  },
  progressDotCompleted: {
    backgroundColor: '#10B981',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  navigationButtonDisabled: {
    opacity: 0.5,
  },
  navigationButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6366F1',
    marginLeft: 5,
  },
  navigationButtonTextDisabled: {
    color: '#9CA3AF',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#6366F1',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 5,
  },
});

export default DemoWalkthrough;