import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";

export default function AccountScreen({ navigation }) {
  const { colors, isDark, themeSetting, changeTheme: updateTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showThemeModal, setShowThemeModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    console.log('Loading user data...');
    
    const load = async () => {
      try {
        console.log('Fetching from AsyncStorage...');
        const u = await AsyncStorage.getItem("currentUser");
        console.log('AsyncStorage result:', u);
        
        if (!isMounted) return;

        if (u) {
          const userData = JSON.parse(u);
          console.log('User data parsed:', userData);
          setUser(userData);
        } else {
          console.log('No user data found, redirecting to login...');
          const parent = navigation.getParent && navigation.getParent();
          if (parent && parent.replace) parent.replace('Login');
          else navigation.replace('Login');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        if (!isMounted) return;
        
        Alert.alert(
          'Error',
          'Failed to load user data. Please try logging in again.'
        );
        const parent = navigation.getParent && navigation.getParent();
        if (parent && parent.replace) parent.replace('Login');
        else navigation.replace('Login');
      } finally {
        if (isMounted) {
          console.log('Setting loading to false');
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [navigation]);

  const signOut = async () => {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all user-related data
              const keysToRemove = ['currentUser'];
              await AsyncStorage.multiRemove(keysToRemove);
              
              // Navigate to login screen (use parent navigator if available)
              const parent = navigation.getParent && navigation.getParent();
              if (parent && parent.reset) {
                parent.reset({ index: 0, routes: [{ name: 'Login' }] });
              } else if (parent && parent.replace) {
                parent.replace('Login');
              } else {
                navigation.replace('Login');
              }
            } catch (error) {
              console.error('Error during sign out:', error);
              Alert.alert(
                'Error',
                'There was a problem signing out. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  const changeThemeHandler = async (selectedTheme) => {
    try {
      await updateTheme(selectedTheme);
      setShowThemeModal(false);
      Alert.alert('Theme Changed', `Theme set to ${selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)}`);
    } catch (error) {
      console.error('Error saving theme:', error);
      Alert.alert('Error', 'Failed to save theme preference.');
    }
  };

  const getThemeLabel = () => {
    if (themeSetting === 'light') return 'Light';
    if (themeSetting === 'dark') return 'Dark';
    return 'Automatic';
  };

  const renderMenuItem = (icon, title, onPress) => (
    <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]} onPress={onPress}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={[styles.menuText, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
    </TouchableOpacity>
  );

  console.log('Render state:', { isLoading, user });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Menu</Text>
        <Text style={[styles.small, { color: colors.textSecondary }]}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    console.log('No user data in state, redirecting...');
    // Add a small delay before navigation to ensure state updates are processed
    setTimeout(() => {
      const parent = navigation.getParent && navigation.getParent();
      if (parent && parent.reset) {
        parent.reset({ index: 0, routes: [{ name: 'Login' }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
    }, 100);
    return null;
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Profile</Text>
        <View style={[styles.profileCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.userName, { color: colors.primary }]}>{user.name}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>
          <Text style={[styles.joinDate, { color: colors.textTertiary }]}>Joined {new Date(user.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Settings</Text>
       
        {renderMenuItem('🎨', 'Theme', () => setShowThemeModal(true))}
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Support</Text>
        {renderMenuItem('❓', 'Help Center', () => Alert.alert('Help Center', 'Need help? Contact us at support@piggybudget.com'))}
        {renderMenuItem('🔐', 'Privacy Policy', () => Alert.alert('Privacy Policy','We respect your privacy. Self Budgeting App does not sell or share your personal or financial information. We collect only the data you provide to help track your budget and improve app functionality. Your data is stored securely and used only for app purposes.Thankyou.'))}
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity style={[styles.signOutButton, { backgroundColor: colors.error }]} onPress={signOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      {/* Version Info */}
      <Text style={[styles.version, { color: colors.textTertiary }]}>Version 1.0.0</Text>

      {/* Theme Modal */}
      <Modal
        visible={showThemeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.primary }]}>Choose Theme</Text>
            
            <TouchableOpacity 
              style={[
                styles.themeOption, 
                { backgroundColor: colors.background },
                themeSetting === 'light' && { backgroundColor: '#e3f2fd', borderWidth: 2, borderColor: colors.primary }
              ]}
              onPress={() => changeThemeHandler('light')}
            >
              <Text style={styles.themeIcon}>☀️</Text>
              <Text style={[styles.themeText, { color: colors.text }]}>Light</Text>
              {themeSetting === 'light' && <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.themeOption, 
                { backgroundColor: colors.background },
                themeSetting === 'dark' && { backgroundColor: '#e3f2fd', borderWidth: 2, borderColor: colors.primary }
              ]}
              onPress={() => changeThemeHandler('dark')}
            >
              <Text style={styles.themeIcon}>🌙</Text>
              <Text style={[styles.themeText, { color: colors.text }]}>Dark</Text>
              {themeSetting === 'dark' && <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.themeOption, 
                { backgroundColor: colors.background },
                themeSetting === 'automatic' && { backgroundColor: '#e3f2fd', borderWidth: 2, borderColor: colors.primary }
              ]}
              onPress={() => changeThemeHandler('automatic')}
            >
              <Text style={styles.themeIcon}>⚙️</Text>
              <Text style={[styles.themeText, { color: colors.text }]}>Automatic</Text>
              {themeSetting === 'automatic' && <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowThemeModal(false)}
            >
              <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  profileCard: {
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
  },
  chevron: {
    fontSize: 20,
  },
  signOutButton: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 24
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 350,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  themeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  themeText: {
    flex: 1,
    fontSize: 16,
  },
  checkmark: {
    fontSize: 20,
    fontWeight: '700',
  },
  cancelButton: {
    marginTop: 8,
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
  },
});