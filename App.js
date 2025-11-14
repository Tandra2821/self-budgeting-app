import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text, View, Image, ActivityIndicator, Modal, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from './src/context/ThemeContext';

import HomeScreen from './src/screens/HomeScreen';
import AddExpenseScreen from './src/screens/AddExpenseScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import AccountScreen from './src/screens/AccountScreen';
import DemoWalkthrough from './src/screens/DemoWalkthrough';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  const [showLogoModal, setShowLogoModal] = React.useState(false);

  return (
    <>
      <Tab.Navigator
        screenOptions={({ navigation }) => ({
          headerTitle: () => (
            <TouchableOpacity 
              onPress={() => setShowLogoModal(true)}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <Image 
                source={require('./assets/logo.png')} 
                style={{ width: 24, height: 24, marginRight: 8 }} 
                resizeMode="contain"
              />
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#1a237e' }}>
                Piggy Budget
              </Text>
            </TouchableOpacity>
          ),
          headerTitleAlign: 'left',
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => navigation.navigate('Account')} 
              style={{ paddingRight: 16 }}
            >
              <Text style={{ fontSize: 24 }}>≡</Text>
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: '#fff',
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
          }
        })}
      >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: "Home"
        }}
      />
      <Tab.Screen 
        name="Add Expense" 
        component={AddExpenseScreen}
        options={{
          title: 'Add Expense'
        }}
      />
      <Tab.Screen 
        name="Reports" 
        component={ReportsScreen}
        options={{
          title: 'Reports'
        }}
      />
    </Tab.Navigator>

    {/* Logo Modal */}
    <Modal
      visible={showLogoModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowLogoModal(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowLogoModal(false)}
      >
        <View style={styles.logoContainer}>
          <Image 
            source={require('./assets/logo.png')} 
            style={styles.logoExpanded}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
    </Modal>
  </>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [userToken, setUserToken] = React.useState(null);
  const [showDemo, setShowDemo] = React.useState(false);

  React.useEffect(() => {
    checkUserToken();
  }, []);

  // Re-check user token when app comes into focus
  React.useEffect(() => {
    const checkAuth = () => {
      checkUserToken();
    };
    
    // Check every few seconds if no user is logged in
    const interval = setInterval(() => {
      if (!userToken) {
        checkAuth();
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [userToken]);

  const checkUserToken = async () => {
    try {
      const currentUser = await AsyncStorage.getItem('currentUser');
      const shouldShowDemo = await AsyncStorage.getItem('shouldShowDemo');
      
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        console.log("🔐 Found user in storage:", userData.email);
        setUserToken(userData);
        
        // Show demo for new users
        if (shouldShowDemo === 'true') {
          console.log("🎯 Showing demo for new user");
          setShowDemo(true);
          // Remove the flag so demo doesn't show again
          await AsyncStorage.removeItem('shouldShowDemo');
        }
      } else {
        console.log("🔐 No user found in storage");
        setUserToken(null);
      }
    } catch (error) {
      console.log('Error checking user token:', error);
      setUserToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const showDemoForNewUser = async () => {
    try {
      const hasSeenDemo = await AsyncStorage.getItem('hasSeenDemo');
      if (!hasSeenDemo) {
        setShowDemo(true);
      }
    } catch (error) {
    }
  };

  const handleDemoComplete = async () => {
    try {
      await AsyncStorage.setItem('hasSeenDemo', 'true');
      setShowDemo(false);
    } catch (error) {
      console.log('Error saving demo completion:', error);
    }
  };

  const handleDemoSkip = async () => {
    try {
      await AsyncStorage.setItem('hasSeenDemo', 'true');
      setShowDemo(false);
    } catch (error) {
      console.log('Error saving demo skip:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={userToken ? "Main" : "Login"}>
          {/* Auth screens */}
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Sign Up" component={SignUpScreen} options={{ headerShown: false }} />

          {/* Main app screens */}
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="Account" component={AccountScreen} options={{ title: 'Account' }} />
        </Stack.Navigator>
      </NavigationContainer>

      {/* Demo Walkthrough */}
      <DemoWalkthrough 
        visible={showDemo}
        onComplete={handleDemoComplete}
        onSkip={handleDemoSkip}
      />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    backgroundColor: '#fff',
    borderRadius: 150,
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    overflow: 'hidden',
  },
  logoExpanded: {
    width: 400,
    height: 450,
  },
});
