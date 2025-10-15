import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AddExpenseScreen({ route, navigation }) {
  const existingExpense = route.params?.expense;
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  useEffect(() => {
    if (existingExpense) {
      setTitle(existingExpense.title);
      setAmount(String(existingExpense.amount));
      setPaymentMethod(existingExpense.paymentMethod);
    }
  }, [existingExpense]);

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
    };

    try {
      const stored = await AsyncStorage.getItem("expenses");
      const data = stored ? JSON.parse(stored) : [];

      let updated;
      if (existingExpense) {
        updated = data.map((e) => (e.id === existingExpense.id ? newExpense : e));
      } else {
        updated = [...data, newExpense];
      }

      await AsyncStorage.setItem("expenses", JSON.stringify(updated));
      navigation.navigate("Home");
    } catch (error) {
      console.log("Error saving expense:", error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Title</Text>
      <TextInput value={title} onChangeText={setTitle} style={{ borderWidth: 1, marginBottom: 10 }} />
      <Text>Amount</Text>
      <TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" style={{ borderWidth: 1, marginBottom: 10 }} />
      <Text>Payment Method</Text>
      <TextInput value={paymentMethod} onChangeText={setPaymentMethod} style={{ borderWidth: 1, marginBottom: 10 }} />
      <Button title={existingExpense ? "Update Expense" : "Add Expense"} onPress={saveExpense} />
    </View>
  );
}




