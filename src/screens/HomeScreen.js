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
import { db, auth } from '../services/firebase';
import { collection, getDocs, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

const { width: screenWidth } = Dimensions.get("window");
const isDesktop = screenWidth > 768;

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
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

  // Load expenses from Firestore with real-time updates
  const loadExpenses = async () => {
    try {
      console.log("Setting up Firestore listener for expenses...");
      
      // Get current user safely
      let currentUser = null;
      
      if (auth) {
        currentUser = auth.currentUser;
      }
      
      let userId = null;
      
      if (currentUser) {
        userId = currentUser.uid;
        console.log("👤 Loading expenses for Firebase user:", userId);
      } else {
        // Try to get user from AsyncStorage
        try {
          const storedUser = await AsyncStorage.getItem("currentUser");
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            userId = userData.id;
            console.log("👤 Loading expenses for local user:", userId);
          }
        } catch (error) {
          console.log("⚠️ Could not get user info");
        }
      }
      
      // Check if database is available
      if (!db) {
        console.warn("📄 Firestore not available, falling back to local storage");
        loadExpensesFromLocal();
        return;
      }
      
      // Real-time listener for expenses
      const unsubscribe = onSnapshot(
        collection(db, 'expenses'), 
        (querySnapshot) => {
          const expensesData = [];
          querySnapshot.forEach((doc) => {
            const expense = {
              id: doc.id,
              ...doc.data()
            };
            
                      // Only show expenses for current user
          if (userId && expense.userId === userId) {
            expensesData.push(expense);
          }
          });
          
          // Sort by timestamp (newest first)
          const sortedExpenses = expensesData.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
          );
          
          setExpenses(sortedExpenses);
          console.log("✅ Loaded expenses from Firestore:", sortedExpenses.length);
        },
        (error) => {
          console.error("❌ Firestore listener error:", error);
          // Fallback to AsyncStorage if Firebase fails
          loadExpensesFromLocal();
        }
      );

      // Return unsubscribe function for cleanup
      return unsubscribe;
    } catch (error) {
      console.error("❌ Error setting up Firestore listener:", error);
      // Fallback to local storage
      loadExpensesFromLocal();
    }
  };

  // Fallback function to load from AsyncStorage
  const loadExpensesFromLocal = async () => {
    try {
      // Get current user
      let userId = null;
      const storedUser = await AsyncStorage.getItem("currentUser");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userId = userData.id;
      }
      
      if (!userId) {
        setExpenses([]);
        return;
      }
      
      const data = await AsyncStorage.getItem("expenses");
      if (data) {
        const allExpenses = JSON.parse(data);
        // Filter expenses for current user only
        const userExpenses = allExpenses.filter(expense => expense.userId === userId);
        setExpenses(userExpenses);
        console.log("📱 Loaded user expenses from local storage:", userExpenses.length);
      }
    } catch (error) {
      console.error("Error loading local expenses:", error);
    }
  };

  const deleteExpense = async (id) => {
    try {
      // Check if database is available
      if (db) {
        // Delete from Firestore
        await deleteDoc(doc(db, 'expenses', id));
        console.log("✅ Expense deleted from Firestore:", id);
      } else {
        console.warn("📄 Firestore not available for deletion");
      }
      
      // Also remove from AsyncStorage backup
      const updated = expenses.filter((item) => item.id !== id);
      await AsyncStorage.setItem("expenses", JSON.stringify(updated));
    } catch (error) {
      console.error("❌ Error deleting expense:", error);
      // Fallback: delete from local storage only
      const updated = expenses.filter((item) => item.id !== id);
      await AsyncStorage.setItem("expenses", JSON.stringify(updated));
      setExpenses(updated);
    }
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
    <View style={[styles.expenseItem, { backgroundColor: colors.cardBackground }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.expenseTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.expenseAmount, { color: colors.text }]}>${item.amount}</Text>
        <Text style={[styles.expenseDate, { color: colors.textTertiary }]}>{formatDateTime(item.timestamp)}</Text>
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
      <View style={{ flex: 1 }}>
        <FlatList
          data={data}
          renderItem={renderExpense}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 80 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No expenses yet</Text>}
        />
      </View>
    );
  };

  const { width } = Dimensions.get("window");
  const cardSize = Math.floor((width - 60) / 3);

  const currentYear = new Date().getFullYear();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.cardRow}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.cashCard, width: cardSize, height: cardSize }]}
          onPress={() => toggleCategory("cash")}
        >
          <Text style={styles.cardTitle}>Cash</Text>
          <Text style={styles.cardTotal}>${totalCash.toFixed(2)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.creditCard, width: cardSize, height: cardSize }]}
          onPress={() => toggleCategory("credit")}
        >
          <Text style={styles.cardTitle}>Credit</Text>
          <Text style={styles.cardTotal}>${totalCredit.toFixed(2)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.debitCard, width: cardSize, height: cardSize }]}
          onPress={() => toggleCategory("debit")}
        >
          <Text style={styles.cardTitle}>Debit</Text>
          <Text style={styles.cardTotal}>${totalDebit.toFixed(2)}</Text>
        </TouchableOpacity>
      </View>

      {/* All expenses header */}
      <View style={styles.allExpensesHeader}>
        <Text style={[styles.allExpensesTitle, { color: colors.text }]}>
          {expandedCategory
            ? `${expandedCategory.charAt(0).toUpperCase() + expandedCategory.slice(1)} Expenses`
            : "All Expenses"}
        </Text>
      </View>

      {/* All expenses flow or filtered expenses */}
      <FlatList
        data={
          expandedCategory
            ? categorized[expandedCategory].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            : [...expenses].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        }
        renderItem={renderExpense}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 80 }}
        ListEmptyComponent={<Text style={{ textAlign: "center", color: colors.textSecondary, marginTop: 8 }}>No expenses yet</Text>}
      />

      {/* FOOTER */}
      <View style={[styles.footer, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>© {currentYear} Piggy Budget</Text>
      </View>

      {/* MENU MODAL */}
      <Modal transparent visible={menuVisible} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        <View style={[styles.menuBox, { backgroundColor: colors.cardBackground }]}>
          <TouchableOpacity onPress={() => Alert.alert("Account Details", "Your account info here.")}>
            <Text style={[styles.menuItem, { color: colors.text }]}>Account Details</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Alert.alert("Settings", "Settings coming soon!")}>
            <Text style={[styles.menuItem, { color: colors.text }]}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Alert.alert("Support", "Support page coming soon!")}>
            <Text style={[styles.menuItem, { color: colors.text }]}>Support</Text>
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
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingBottom: 12,
    marginTop: 20,
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



  allExpensesHeader: {
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 6,
  },
  allExpensesTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  footer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopWidth: 1,
  },
  footerText: {
    textAlign: "center",
    fontSize: 14,
  },

  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  expenseTitle: { fontSize: 16, fontWeight: "500" },
  expenseAmount: { fontSize: 14, marginTop: 2 },
  expenseDate: { fontSize: 12, marginTop: 2 },
  buttons: { flexDirection: "row", alignItems: "center" },
  edit: { color: "#595e5cff", marginRight: 15, fontWeight: "500" },
  delete: { color: "#FF4500", fontWeight: "500" },
  emptyText: { textAlign: "center", color: "#666", marginTop: 5 },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },
  menuBox: {
    position: "absolute",
    top: 60,
    right: 15,
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
  },
});