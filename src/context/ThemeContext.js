import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeSetting, setThemeSetting] = useState('automatic');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    // Determine if dark mode should be active
    if (themeSetting === 'automatic') {
      setIsDark(systemColorScheme === 'dark');
    } else if (themeSetting === 'dark') {
      setIsDark(true);
    } else {
      setIsDark(false);
    }
  }, [themeSetting, systemColorScheme]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('appTheme');
      if (savedTheme) {
        setThemeSetting(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const changeTheme = async (newTheme) => {
    try {
      await AsyncStorage.setItem('appTheme', newTheme);
      setThemeSetting(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const theme = {
    isDark,
    themeSetting,
    colors: {
      background: isDark ? '#121212' : '#f5f7fa',
      cardBackground: isDark ? '#1e1e1e' : '#ffffff',
      text: isDark ? '#ffffff' : '#333333',
      textSecondary: isDark ? '#b0b0b0' : '#666666',
      textTertiary: isDark ? '#808080' : '#888888',
      primary: isDark ? '#90caf9' : '#1a237e',
      border: isDark ? '#333333' : '#e0e0e0',
      headerBackground: isDark ? '#1e1e1e' : '#ffffff',
      shadow: isDark ? '#000000' : '#000000',
      error: '#ff5252',
      success: '#4caf50',
      // Card colors
      cashCard: isDark ? '#6b8e23' : '#9ACD32',
      creditCard: isDark ? '#4a8fa8' : '#78c4dfff',
      debitCard: isDark ? '#b55fb8' : '#e78deaff',
    },
  };

  return (
    <ThemeContext.Provider value={{ ...theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
