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
      if (data) setExpenses(JSON.parse(data));
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
    navigation.navigate("Add Expense", { expense });
  };

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
    <View style={styles.expenseItem}>
      <View>
        <Text style={styles.expenseTitle}>{item.title}</Text>
        <Text style={styles.expenseAmount}>${item.amount}</Text>
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

  const Section = ({ title, data, color }) => (
    <View style={[styles.section, { backgroundColor: color }]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={data}
        renderItem={renderExpense}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No expenses yet</Text>}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Section title="Cash" data={categorized.cash} color="#9ACD32" />      {/* Pear Green */}
      <Section title="Credit Card" data={categorized.credit} color="#78c4dfff" />     {/* Cerulean Blue */}
      <Section title="Debit Card" data={categorized.debit} color="#e78deaff" />       {/* Coral */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa", padding: 15 },
  section: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10, color: "#fff" },
  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.3)", // slight transparency for inner items
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  expenseTitle: { fontSize: 16, fontWeight: "500", color: "#fff" },
  expenseAmount: { fontSize: 14, color: "#fff", marginTop: 2 },
  buttons: { flexDirection: "row", alignItems: "center" },
  edit: { color: "#595e5cff", marginRight: 15, fontWeight: "500" },  // gold-ish for edit
  delete: { color: "#FF4500", fontWeight: "500" },                  // reddish for delete
  emptyText: { textAlign: "center", color: "rgba(255,255,255,0.7)", marginTop: 5 },
});
