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
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen({ navigation }) {
  const [expenses, setExpenses] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null); // 'cash' | 'credit' | 'debit' | null
  const [menuVisible, setMenuVisible] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    loadExpenses();
  }, [isFocused]);

  useEffect(() => {
    // Enable LayoutAnimation on Android
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const loadExpenses = async () => {
    try {
      const data = await AsyncStorage.getItem("expenses");
      if (data) setExpenses(JSON.parse(data));
      else setExpenses([]);
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

  // Sort each category by timestamp (newest first)
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
      <View style={{ flex: 1 }}>
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

  const toggleCategory = (key) => {
    // Animate expand/collapse
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategory((prev) => (prev === key ? null : key));
  };

  const SectionList = ({ categoryKey }) => {
    const map = { cash: categorized.cash, credit: categorized.credit, debit: categorized.debit };
    const data = map[categoryKey] || [];
    return (
      <View style={styles.expandedSection}>
        <FlatList
          data={data}
          renderItem={renderExpense}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.emptyText}>No expenses yet</Text>}
        />
      </View>
    );
  };

  const { width } = Dimensions.get("window");
  const cardSize = Math.floor((width - 60) / 3);

  const currentYear = new Date().getFullYear();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.pageTitle}>Overview</Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={{ padding: 8 }}>
          <Ionicons name="menu" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardRow}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#9ACD32", width: cardSize, height: cardSize }]}
          onPress={() => toggleCategory("cash")}
        >
          <Text style={styles.cardTitle}>Cash</Text>
          <Text style={styles.cardTotal}>${totalCash.toFixed(2)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#78c4dfff", width: cardSize, height: cardSize }]}
          onPress={() => toggleCategory("credit")}
        >
          <Text style={styles.cardTitle}>Credit</Text>
          <Text style={styles.cardTotal}>${totalCredit.toFixed(2)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#e78deaff", width: cardSize, height: cardSize }]}
          onPress={() => toggleCategory("debit")}
        >
          <Text style={styles.cardTitle}>Debit</Text>
          <Text style={styles.cardTotal}>${totalDebit.toFixed(2)}</Text>
        </TouchableOpacity>
      </View>

      {/* Expanded category list (if any) */}
      {expandedCategory && <SectionList categoryKey={expandedCategory} />}

      {/* All expenses header */}
      <View style={styles.allExpensesHeader}>
        <Text style={styles.allExpensesTitle}>All Expenses</Text>
      </View>

      {/* All expenses flow */}
      <FlatList
        data={[...expenses].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))}
        renderItem={renderExpense}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 80 }}
        ListEmptyComponent={<Text style={{ textAlign: "center", color: "#666", marginTop: 8 }}>No expenses yet</Text>}
      />

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
              // Try to use parent navigator, otherwise replace locally
              const parent = navigation.getParent && navigation.getParent();
              if (parent && parent.reset) parent.reset({ index: 0, routes: [{ name: "Login" }] });
              else navigation.replace("Login");
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
    backgroundColor: "#f5f7fa",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 14,
    paddingBottom: 6,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a237e",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingBottom: 12,
    marginTop: 8,
  },
  card: {
    borderRadius: 12,
    padding: 12,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cardTotal: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },

  expandedSection: {
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 6,
    borderRadius: 10,
    backgroundColor: "#fff",
    padding: 8,
    maxHeight: 300,
  },

  allExpensesHeader: {
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 6,
  },
  allExpensesTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
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

  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  expenseTitle: { fontSize: 16, fontWeight: "500", color: "#222" },
  expenseAmount: { fontSize: 14, color: "#111", marginTop: 2 },
  expenseDate: { fontSize: 12, color: "#888", marginTop: 2 },
  buttons: { flexDirection: "row", alignItems: "center" },
  edit: { color: "#595e5cff", marginRight: 15, fontWeight: "500" },
  delete: { color: "#FF4500", fontWeight: "500" },
  emptyText: { textAlign: "center", color: "#666", marginTop: 5 },

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
});