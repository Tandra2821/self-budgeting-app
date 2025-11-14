// src/screens/LoginScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Dimensions,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../services/firebase";

export default function LoginScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("login"); // "login" or "signup"
  
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup state
  const [name, setName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");



  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginPassword) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoginLoading(true);
    try {
      console.log("🔐 Attempting login for:", loginEmail);
      
      // Use AsyncStorage for authentication (since Firebase Auth isn't working)
      const usersJSON = await AsyncStorage.getItem("users");
      const users = usersJSON ? JSON.parse(usersJSON) : [];

      const user = users.find(
        (u) => u.email.toLowerCase() === loginEmail.toLowerCase() && u.password === loginPassword
      );

      if (user) {
        await AsyncStorage.setItem("currentUser", JSON.stringify(user));
        Alert.alert("Success", "Logged in successfully!");
        navigation.replace("Main");
      } else {
        Alert.alert("Login Failed", "Invalid email or password.");
      }
      
    } catch (error) {
      console.error("❌ Login error:", error);
      Alert.alert("Error", "Login failed. Please check your credentials.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!name.trim() || !signupEmail.trim() || !signupPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (signupPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords don't match");
      return;
    }

    if (signupPassword.length < 6) {
      Alert.alert("Error", "Password should be at least 6 characters");
      return;
    }

    setSignupLoading(true);
    try {
      console.log("🔐 Creating user account for:", signupEmail);
      
      // Use AsyncStorage for user registration (since Firebase Auth isn't working)
      const usersJSON = await AsyncStorage.getItem("users");
      const users = usersJSON ? JSON.parse(usersJSON) : [];

      const exists = users.some((u) => u.email.toLowerCase() === signupEmail.toLowerCase());
      if (exists) {
        Alert.alert("Error", "This email is already registered");
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        name: name.trim(),
        email: signupEmail.toLowerCase().trim(),
        password: signupPassword,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      await AsyncStorage.setItem("users", JSON.stringify(users));
      await AsyncStorage.setItem("currentUser", JSON.stringify(newUser));
      
      Alert.alert("Success", "Account created successfully!");
      navigation.replace("Main");
      
    } catch (error) {
      console.error("❌ Signup error:", error);
      Alert.alert("Signup Failed", "Failed to create account. Please try again.");
    } finally {
      setSignupLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }
    
    try {
      // Since we're using local storage for auth, we'll simulate password reset
      const usersJSON = await AsyncStorage.getItem("users");
      const users = usersJSON ? JSON.parse(usersJSON) : [];
      
      const user = users.find(u => u.email.toLowerCase() === resetEmail.toLowerCase());
      
      if (user) {
        Alert.alert("Password Reset", `Your password is: ${user.password}\n\nIn a real app, a reset link would be sent to your email.`);
      } else {
        Alert.alert("Error", "No account found with this email address.");
      }
      
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error) {
      console.error("Password reset error:", error);
      Alert.alert("Error", "Failed to process password reset request.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
    >
      <View style={styles.backgroundLogoContainer}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.backgroundLogo}
          resizeMode="contain"
        />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Piggy Budget</Text>
          <Text style={styles.subtitle}>Manage your expenses easily</Text>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "login" && styles.activeTab]}
            onPress={() => setActiveTab("login")}
          >
            <Text style={[styles.tabText, activeTab === "login" && styles.activeTabText]}>
              Sign In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "signup" && styles.activeTab]}
            onPress={() => setActiveTab("signup")}
          >
            <Text style={[styles.tabText, activeTab === "signup" && styles.activeTabText]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {activeTab === "login" ? (
            // Login Form
            <>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                value={loginEmail}
                onChangeText={setLoginEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                value={loginPassword}
                onChangeText={setLoginPassword}
                secureTextEntry
              />
              <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={loginLoading}
              >
                <Text style={styles.buttonText}>
                  {loginLoading ? "Signing in..." : "Sign In"}
                </Text>
              </TouchableOpacity>

              {/* Forgot Password Button */}
              <TouchableOpacity 
                onPress={() => setShowForgotPassword(true)}
                style={{ padding: 10, marginTop: 10 }}
              >
                <Text style={{ color: '#1a237e', fontSize: 14, textAlign: 'center', textDecorationLine: 'underline' }}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            // Signup Form
            <>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                value={signupEmail}
                onChangeText={setSignupEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                value={signupPassword}
                onChangeText={setSignupPassword}
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              <TouchableOpacity
                style={styles.button}
                onPress={handleSignUp}
                disabled={signupLoading}
              >
                <Text style={styles.buttonText}>
                  {signupLoading ? "Creating Account..." : "Create Account"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      {/* Forgot Password Modal */}
      <Modal
        visible={showForgotPassword}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowForgotPassword(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 20, margin: 20, minWidth: 300 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 }}>Reset Password</Text>
            <TextInput
              placeholder="Enter your email"
              value={resetEmail}
              onChangeText={setResetEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 15 }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity 
                onPress={() => { setShowForgotPassword(false); setResetEmail(''); }}
                style={{ flex: 1, padding: 10, marginRight: 5, borderWidth: 1, borderColor: '#ddd', borderRadius: 5 }}
              >
                <Text style={{ textAlign: 'center' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleForgotPassword}
                style={{ flex: 1, padding: 10, marginLeft: 5, backgroundColor: '#1a237e', borderRadius: 5 }}
              >
                <Text style={{ textAlign: 'center', color: 'white' }}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backgroundLogoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  backgroundLogo: {
    width: width * 0.8,
    height: width * 0.8,
    opacity: 0.05,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    zIndex: 1,
  },
  header: {
    alignItems: "center",
    marginVertical: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a237e",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  tabs: {
    flexDirection: "row",
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#1a237e",
    fontWeight: "600",
  },
  form: {
    marginTop: 20,
  },
  input: {
    backgroundColor: "#f5f7fa",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#1a237e",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  testButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    borderWidth: 2,
    borderColor: "#FF8555",
  },
  testButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
