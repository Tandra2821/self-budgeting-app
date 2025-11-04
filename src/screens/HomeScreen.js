import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen({ navigation }) {
  const [expenses, setExpenses] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
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

  Object.keys(categorized).forEach((key) => {
    categorized[key].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  });

  const totalCash = categorized.cash.reduce((sum, item) => sum + item.amount, 0);
  const totalCredit = categorized.credit.reduce((sum, item) => sum + item.amount, 0);
  const totalDebit = categorized.debit.reduce((sum, item) => sum + item.amount, 0);

  const formatDateTime = (timestamp) => {
    const d = new Date(timestamp);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2);
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  const renderExpense = ({ item }) => (
    <View style={styles.expenseItem}>
      <View>
        <Text style={styles.expenseTitle}>{item.title}</Text>
        <Text style={styles.expenseAmount}>${item.amount}</Text>
        <Text style={styles.expenseDate}>{formatDateTime(item.timestamp)}</Text>
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

  const Section = ({ title, data, color, total }) => (
    <View style={[styles.section, { backgroundColor: color }]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionTotal}>${total.toFixed(2)}</Text>
      </View>

      <FlatList
        data={data}
        renderItem={renderExpense}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No expenses yet</Text>}
        style={styles.list}
        nestedScrollEnabled={true}
      />
    </View>
  );

  const currentYear = new Date().getFullYear();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Section title="Cash" data={categorized.cash} color="#9ACD32" total={totalCash} />
        <Section title="Credit Card" data={categorized.credit} color="#78c4dfff" total={totalCredit} />
        <Section title="Debit Card" data={categorized.debit} color="#e78deaff" total={totalDebit} />
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© {currentYear} Piggy Budget</Text>
      </View>

      {/* MENU MODAL */}
      <Modal transparent visible={menuVisible} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        <View style={styles.menuBox}>
          <TouchableOpacity onPress={() => Alert.alert("Account Details", "Your account info here.")}>
            <Text style={styles.menuItem}>Account Details</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Alert.alert("Settings", "Settings coming soon!")}>
            <Text style={styles.menuItem}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Alert.alert("Support", "Support page coming soon!")}>
            <Text style={styles.menuItem}>Support</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              await AsyncStorage.removeItem("currentUser");
              setMenuVisible(false);
              navigation.replace("Login");
            }}
          >
            <Text style={[styles.menuItem, { color: "red" }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f5f7fa"
  },
  content: {
    flex: 1,
    padding: 15
  },
  footer: {
    paddingVertical: 10,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#fff",
    marginTop: 10
  },
  footerText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500"
  },

  section: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    height: 250,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#fff" },
  sectionTotal: { fontSize: 18, fontWeight: "600", color: "#fff" },
  list: { flexGrow: 0 },
  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  expenseTitle: { fontSize: 16, fontWeight: "500", color: "#fff" },
  expenseAmount: { fontSize: 14, color: "#fff", marginTop: 2 },
  expenseDate: { fontSize: 12, color: "#fff", marginTop: 2 },
  buttons: { flexDirection: "row", alignItems: "center" },
  edit: { color: "#595e5cff", marginRight: 15, fontWeight: "500" },
  delete: { color: "#FF4500", fontWeight: "500" },
  emptyText: { textAlign: "center", color: "rgba(255,255,255,0.7)", marginTop: 5 },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },
  menuBox: {
    position: "absolute",
    top: 60,
    right: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: "#333",
  },
  content: {
    flex: 1,
    padding: 15,
  },
  footer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  footerText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
  },
});
