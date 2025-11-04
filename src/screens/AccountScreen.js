import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AccountScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const renderMenuItem = (icon, title, onPress) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuText}>{title}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  console.log('Render state:', { isLoading, user });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.title}>Menu</Text>
        <Text style={styles.small}>Loading...</Text>
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
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.profileCard}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.joinDate}>Joined {new Date(user.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        {renderMenuItem('⚙️', 'Account Settings', () => Alert.alert('Coming Soon', 'Account settings will be available soon.'))}
        {renderMenuItem('🔔', 'Notifications', () => Alert.alert('Coming Soon', 'Notification settings will be available soon.'))}
        {renderMenuItem('🔒', 'Privacy', () => Alert.alert('Coming Soon', 'Privacy settings will be available soon.'))}
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        {renderMenuItem('❓', 'Help Center', () => Alert.alert('Help Center', 'Need help? Contact us at support@piggybudget.com'))}
        {renderMenuItem('📄', 'Terms of Service', () => Alert.alert('Terms', 'Terms of service content will be available soon.'))}
        {renderMenuItem('🔐', 'Privacy Policy', () => Alert.alert('Privacy', 'Privacy policy content will be available soon.'))}
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      {/* Version Info */}
      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    color: '#666',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  profileCard: {
    backgroundColor: '#fff',
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
    color: '#1a237e',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
    color: '#888',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  chevron: {
    fontSize: 20,
    color: '#ccc',
  },
  signOutButton: {
    margin: 16,
    backgroundColor: '#ff5252',
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
    color: '#999',
    fontSize: 14,
    marginBottom: 24
  }
});