import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './src/screens/HomeScreen'; 
import AddExpenseScreen from './src/screens/AddExpenseScreen';
import ReportsScreen from './src/screens/ReportsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Add Expense" component={AddExpenseScreen} />
        <Tab.Screen name="Reports" component={ReportsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
