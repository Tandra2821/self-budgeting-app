import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { db } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';

const { width: screenWidth } = Dimensions.get('window');
const isDesktop = screenWidth > 768;

export default function AddExpenseScreen({ route, navigation }) {
  const { colors } = useTheme();
  const existingExpense = route.params?.expense;
  const isFocused = useIsFocused();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [category, setCategory] = useState(""); // No default - user must select

  const expenseCategories = [
    "Food", "Shopping", "Bills", "Alcohol", "Rides", 
    "Entertainment", "Medical", "Education", "Car", "Other"
  ];

  useEffect(() => {
    if (isFocused) {
      if (existingExpense) {
        setTitle(existingExpense.title);
        setAmount(String(existingExpense.amount));
        setPaymentMethod(existingExpense.paymentMethod);
        setCategory(existingExpense.category); // Set category if editing
      } else {
        // Reset form when navigating to add new expense
        setTitle("");
        setAmount("");
        setPaymentMethod("Cash");
        setCategory("");
      }
    }
  }, [isFocused, existingExpense]);

  const saveExpense = async () => {
    if (!title || !amount || !category) {
      Alert.alert("Error", "Please enter all fields including category");
      return;
    }

    console.log("💰 Starting expense save...");
    
    // Get current user from local storage
    let userId = "anonymous";
    
    try {
      const storedUser = await AsyncStorage.getItem("currentUser");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userId = userData.id || "local_" + Date.now();
        console.log("👤 Saving expense for local user:", userId);
      }
    } catch (error) {
      console.log("⚠️ Could not get user info, using anonymous");
    }
    
    const expenseData = {
      title: title.trim(),
      amount: parseFloat(amount),
      paymentMethod,
      category,
      userId: userId, // Associate expense with the actual user
      createdAt: new Date(),
      timestamp: new Date().toISOString(),
    };

    console.log("💰 Expense data:", expenseData);

    try {
      // Save to Firestore first (if available)
      if (db) {
        console.log("💰 Saving to Firestore...");
        const docRef = await addDoc(collection(db, 'expenses'), expenseData);
        console.log("✅ Expense saved to Firestore with ID:", docRef.id);
      
      // Also save to AsyncStorage as backup
      try {
        const existingExpenses = await AsyncStorage.getItem("expenses");
        const expenses = existingExpenses ? JSON.parse(existingExpenses) : [];
        const expenseWithId = { ...expenseData, id: docRef.id };
        expenses.push(expenseWithId);
        await AsyncStorage.setItem("expenses", JSON.stringify(expenses));
        console.log("✅ Expense also saved to local storage as backup");
      } catch (localError) {
        console.warn("⚠️ Failed to save to local storage:", localError);
      }
      
      // Reset form
      setTitle("");
      setAmount("");
      setPaymentMethod("Cash");
      setCategory("");
      
        Alert.alert("Success", "Expense saved successfully!");
        navigation.goBack();
      } else {
        console.warn("📄 Firestore not available, saving to local storage only");
        
        // Save to AsyncStorage only
        const existingExpenses = await AsyncStorage.getItem("expenses");
        const expenses = existingExpenses ? JSON.parse(existingExpenses) : [];
        const expenseWithId = { ...expenseData, id: Date.now().toString() };
        expenses.push(expenseWithId);
        await AsyncStorage.setItem("expenses", JSON.stringify(expenses));
        
        setTitle("");
        setAmount("");
        setPaymentMethod("Cash");
        setCategory("");
        
        Alert.alert("Saved Locally", "Expense saved to device storage.");
        navigation.goBack();
      }
    } catch (error) {
      console.error("❌ Save expense error:", error);
      
      // Fallback: save to AsyncStorage only
      try {
        console.log("💾 Fallback: Saving to local storage only...");
        const existingExpenses = await AsyncStorage.getItem("expenses");
        const expenses = existingExpenses ? JSON.parse(existingExpenses) : [];
        const expenseWithId = { ...expenseData, id: Date.now().toString() };
        expenses.push(expenseWithId);
        await AsyncStorage.setItem("expenses", JSON.stringify(expenses));
        
        // Reset form
        setTitle("");
        setAmount("");
        setPaymentMethod("Cash");
        setCategory("");
        
        Alert.alert("Saved Locally", "Expense saved to device storage. Will sync to cloud when connection is restored.");
        navigation.goBack();
      } catch (fallbackError) {
        console.error("❌ Fallback save failed:", fallbackError);
        Alert.alert("Error", "Failed to save expense. Please try again.");
      }
    }
  };

  const renderCategoryOption = (categoryOption) => (
    <TouchableOpacity
      key={categoryOption}
      style={[
        styles.optionButton, 
        { backgroundColor: colors.background },
        category === categoryOption && { backgroundColor: colors.primary }
      ]}
      onPress={() => setCategory(categoryOption)}
    >
      <Text style={[
        styles.optionText, 
        { color: colors.text },
        category === categoryOption && { color: '#fff' }
      ]}>
        {categoryOption}
      </Text>
    </TouchableOpacity>
  );

  const renderPaymentOption = (method) => (
    <TouchableOpacity
      key={method}
      style={[
        styles.optionButton, 
        { backgroundColor: colors.background },
        paymentMethod === method && { backgroundColor: colors.primary }
      ]}
      onPress={() => setPaymentMethod(method)}
    >
      <Text style={[
        styles.optionText, 
        { color: colors.text },
        paymentMethod === method && { color: '#fff' }
      ]}>
        {method}
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop && styles.desktopContainer
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[
          styles.formContainer,
          isDesktop && styles.desktopForm
        ]}>
          {/* Back button */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>

      <Text style={[styles.label, { color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 5 }]}>
        Category <Text style={{ color: '#FF6B6B' }}>*</Text>
      </Text>
      {!category && (
        <Text style={[styles.helperText, { color: '#FF6B6B', marginBottom: 10 }]}>
          Please select a category
        </Text>
      )}
      <View style={[
        styles.categoryContainer,
        isDesktop && styles.desktopCategoryContainer
      ]}>
        {expenseCategories.map(renderCategoryOption)}
      </View>

      <Text style={[styles.label, { color: colors.text }]}>Title</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Enter expense title"
        placeholderTextColor={colors.textTertiary}
        style={[styles.input, { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }]}
      />

      <Text style={[styles.label, { color: colors.text }]}>Amount</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        placeholder="Enter amount"
        placeholderTextColor={colors.textTertiary}
        keyboardType="numeric"
        style={[styles.input, { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }]}
      />

      <Text style={[styles.label, { color: colors.text }]}>Payment Method</Text>
      <View style={styles.paymentContainer}>{["Cash", "Credit Card", "Debit Card"].map(renderPaymentOption)}</View>

        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={saveExpense}
        >
          <Text style={styles.addButtonText}>
            {existingExpense ? "Update Expense" : "Add Expense"}
          </Text>
        </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  scrollContent: {
    flexGrow: 1,
    padding: 15,
    paddingBottom: 40,
  },
  desktopContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  formContainer: {
    width: '100%',
  },
  desktopForm: {
    maxWidth: 600,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  backButton: { 
    marginBottom: 15 
  },
  backButtonText: { fontSize: 16, fontWeight: "600" },
  label: { fontSize: 16, fontWeight: "500", marginTop: 10, marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  paymentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 25,
    gap: 8,
  },
  desktopCategoryContainer: {
    justifyContent: 'flex-start',
    gap: 12,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 6,
    marginHorizontal: 2,
    borderRadius: 8,
    alignItems: "center",
    minWidth: isDesktop ? 100 : "30%",
    maxWidth: isDesktop ? 150 : "32%",
    marginBottom: 8,
    flexShrink: 1,
  },
  optionText: { 
    fontWeight: "500", 
    fontSize: isDesktop ? 14 : 12,
    textAlign: "center",
    flexWrap: "wrap",
  },
  helperText: {
    fontSize: 12,
    fontStyle: "italic",
  },
  addButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20, // Add bottom margin for keyboard
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
