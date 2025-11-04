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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert("Validation", "Please fill out all fields.");
      return;
    }
    if (password.length < 4) {
      Alert.alert("Weak password", "Password should be at least 4 characters.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Validation", "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const usersJSON = await AsyncStorage.getItem("users");
      const users = usersJSON ? JSON.parse(usersJSON) : [];

      const exists = users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (exists) {
        Alert.alert("Account exists", "An account with that email already exists.");
        setLoading(false);
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      await AsyncStorage.setItem("users", JSON.stringify(users));

      // auto-login after signup
      await AsyncStorage.setItem("currentUser", JSON.stringify(newUser));
      navigation.replace("Main");
    } catch (err) {
      console.log("Sign up error:", err);
      Alert.alert("Error", "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.box}>
        <Text style={styles.title}>Create account</Text>

        <Text style={styles.label}>Full name</Text>
        <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Jane Doe" />

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput 
          value={password} 
          onChangeText={setPassword} 
          style={styles.input} 
          secureTextEntry 
          placeholder="Enter password"
        />

        <Text style={styles.label}>Confirm password</Text>
        <TextInput 
          value={confirm} 
          onChangeText={setConfirm} 
          style={styles.input} 
          secureTextEntry 
          placeholder="Confirm password"
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleSignUp} disabled={loading}>
          <Text style={styles.primaryButtonText}>{loading ? "Creating..." : "Sign Up"}</Text>
        </TouchableOpacity>

        <View style={styles.row}>
          <Text style={styles.small}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.link}> Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", justifyContent: "center", padding: 20 },
  box: { backgroundColor: "#f7f9fc", padding: 20, borderRadius: 12, elevation: 2 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 14, color: "#1a237e" },
  label: { fontSize: 14, marginTop: 8, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    backgroundColor: "#fff",
  },
  primaryButton: {
    marginTop: 18,
    backgroundColor: "#2e7d32",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonText: { color: "#fff", fontWeight: "700" },
  row: { flexDirection: "row", justifyContent: "center", marginTop: 12 },
  small: { color: "#666" },
  link: { color: "#2196F3", fontWeight: "600" },
});