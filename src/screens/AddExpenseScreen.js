import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";

export default function AddExpenseScreen({ route, navigation }) {
  const existingExpense = route.params?.expense;
  const isFocused = useIsFocused();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  useEffect(() => {
    if (isFocused) {
      if (existingExpense) {
        setTitle(existingExpense.title);
        setAmount(String(existingExpense.amount));
        setPaymentMethod(existingExpense.paymentMethod);
      } else {
        // Reset form when navigating to add new expense
        setTitle("");
        setAmount("");
        setPaymentMethod("Cash");
      }
    }
  }, [isFocused, existingExpense]);

  const saveExpense = async () => {
    if (!title || !amount) {
      Alert.alert("Error", "Please enter all fields");
      return;
    }

    const newExpense = {
      id: existingExpense ? existingExpense.id : Date.now().toString(),
      title,
      amount: parseFloat(amount),
      paymentMethod,
      timestamp: existingExpense ? existingExpense.timestamp : new Date().toISOString(),
    };

    try {
      const stored = await AsyncStorage.getItem("expenses");
      const data = stored ? JSON.parse(stored) : [];

      const updated = existingExpense
        ? data.map((e) => (e.id === existingExpense.id ? newExpense : e))
        : [...data, newExpense];

      await AsyncStorage.setItem("expenses", JSON.stringify(updated));
      
      // Reset form if adding new expense (not editing)
      if (!existingExpense) {
        setTitle("");
        setAmount("");
        setPaymentMethod("Cash");
        Alert.alert("Success", "Expense added successfully!");
      } else {
        navigation.navigate("Home");
      }
    } catch (error) {
      console.log("Error saving expense:", error);
    }
  };

  const renderPaymentOption = (method) => (
    <TouchableOpacity
      key={method}
      style={[styles.optionButton, paymentMethod === method && styles.optionSelected]}
      onPress={() => setPaymentMethod(method)}
    >
      <Text style={[styles.optionText, paymentMethod === method && styles.optionTextSelected]}>
        {method}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Title</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Enter expense title"
        style={styles.input}
      />

      <Text style={styles.label}>Amount</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        placeholder="Enter amount"
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Payment Method</Text>
      <View style={styles.paymentContainer}>{["Cash", "Credit Card", "Debit Card"].map(renderPaymentOption)}</View>

      <Button
        title={existingExpense ? "Update Expense" : "Add Expense"}
        onPress={saveExpense}
        color="#2196F3"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  backButton: { marginBottom: 15 },
  backButtonText: { fontSize: 16, color: "#2196F3", fontWeight: "600" },
  label: { fontSize: 16, fontWeight: "500", marginTop: 10, marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
  },
  paymentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  optionSelected: { backgroundColor: "#2196F3" },
  optionText: { color: "#333", fontWeight: "500" },
  optionTextSelected: { color: "#fff", fontWeight: "600" },
});
