import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";

export default function HomeScreen({ navigation }) {
  const [expenses, setExpenses] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    loadExpenses();
  }, [isFocused]);

  const loadExpenses = async () => {
    try {
      const data = await AsyncStorage.getItem("expenses");
      if (data !== null) {
        setExpenses(JSON.parse(data));
      }
    } catch (error) {
      console.log("Error loading expenses:", error);
    }
  };

  const deleteExpense = async (id) => {
    const updated = expenses.filter((item) => item.id !== id);
    await AsyncStorage.setItem("expenses", JSON.stringify(updated));
    setExpenses(updated);
  };

  const confirmDelete = (id) => {
    Alert.alert("Delete Expense", "Are you sure you want to delete this expense?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", onPress: () => deleteExpense(id) },
    ]);
  };

  const editExpense = (expense) => {
    navigation.navigate("Add Expense", { expense }); // reuse same AddExpense screen
  };

  // Group by category (payment type)
  const categorized = expenses.reduce(
    (acc, item) => {
      if (item.paymentMethod === "Cash") acc.cash.push(item);
      else if (item.paymentMethod === "Credit Card") acc.credit.push(item);
      else if (item.paymentMethod === "Debit Card") acc.debit.push(item);
      return acc;
    },
    { cash: [], credit: [], debit: [] }
  );

  const renderExpense = ({ item }) => (
    <View style={styles.item}>
      <View>
        <Text style={styles.title}>{item.title}</Text>
        <Text>${item.amount} — {item.paymentMethod}</Text>
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity onPress={() => editExpense(item)}>
          <Text style={styles.edit}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => confirmDelete(item.id)}>
          <Text style={styles.delete}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>💵 Cash Payments</Text>
      <FlatList data={categorized.cash} renderItem={renderExpense} keyExtractor={(i) => i.id} />

      <Text style={styles.header}>💳 Credit Card</Text>
      <FlatList data={categorized.credit} renderItem={renderExpense} keyExtractor={(i) => i.id} />

      <Text style={styles.header}>🏧 Debit Card</Text>
      <FlatList data={categorized.debit} renderItem={renderExpense} keyExtractor={(i) => i.id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },
  header: { fontSize: 18, fontWeight: "bold", marginVertical: 8, color: "#333" },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f8f8f8",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  title: { fontSize: 16, fontWeight: "500" },
  buttons: { flexDirection: "row" },
  edit: { color: "blue", marginRight: 15 },
  delete: { color: "red" },
});


