import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AccountScreen({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      const u = await AsyncStorage.getItem("currentUser");
      if (u) setUser(JSON.parse(u));
    };
    load();
  }, []);

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
            await AsyncStorage.removeItem("currentUser");
            navigation.replace("Login");
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

  if (!user) return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu</Text>
      <Text style={styles.small}>Loading...</Text>
    </View>
  );

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