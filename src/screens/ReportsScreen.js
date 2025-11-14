import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { BarChart, PieChart } from "react-native-chart-kit";
import { useIsFocused } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { db } from '../services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const screenWidth = Dimensions.get("window").width - 30;

// Category colors for consistent reporting
const categoryColors = {
  "Food": "#FF6B6B",        // Red
  "Alcohol": "#9B59B6",     // Purple  
  "Rides": "#3498DB",       // Blue
  "Car": "#F39C12",         // Orange
  "Medical": "#E74C3C",     // Dark Red
  "Shopping": "#1ABC9C",    // Teal
  "Bills": "#2ECC71",       // Green
  "Entertainment": "#E67E22", // Dark Orange
  "Education": "#34495E",   // Dark Blue Gray
  "Other": "#95A5A6"        // Gray
};

export default function ReportsScreen() {
  const { colors, isDark } = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [filter, setFilter] = useState("Monthly");
  const [filteredData, setFilteredData] = useState({ cash: 0, credit: 0, debit: 0 });
  const [categoryData, setCategoryData] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadExpenses();
    }
  }, [isFocused]);

  useEffect(() => {
    calculateFilteredData();
    calculateCategoryData();
  }, [expenses, filter]);

  const loadExpenses = async () => {
    try {
      console.log("Loading expenses for reports from Firestore...");
      
      // Check if database is available
      if (!db) {
        console.warn("📄 Firestore not available for reports, falling back to local storage");
        loadExpensesFromLocal();
        return;
      }
      
      // Real-time listener for expenses
      const unsubscribe = onSnapshot(
        collection(db, 'expenses'), 
        (querySnapshot) => {
          const expensesData = [];
          querySnapshot.forEach((doc) => {
            expensesData.push({
              id: doc.id,
              ...doc.data()
            });
          });
          
          setExpenses(expensesData);
          console.log("✅ Loaded expenses for reports:", expensesData.length);
        },
        (error) => {
          console.error("❌ Error loading expenses for reports:", error);
          // Fallback to AsyncStorage
          loadExpensesFromLocal();
        }
      );

      // Return unsubscribe function for cleanup
      return unsubscribe;
    } catch (error) {
      console.error("Error setting up Firestore listener for reports:", error);
      loadExpensesFromLocal();
    }
  };

  // Fallback function to load from AsyncStorage
  const loadExpensesFromLocal = async () => {
    try {
      const data = await AsyncStorage.getItem("expenses");
      if (data) {
        setExpenses(JSON.parse(data));
        console.log("📱 Loaded expenses from local storage for reports");
      }
    } catch (error) {
      console.log("Error loading reports from local storage:", error);
    }
  };

  const calculateFilteredData = () => {
    const now = new Date();
    let startDate;

    if (filter === "Weekly") {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (filter === "Monthly") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (filter === "Yearly") {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const filtered = expenses.filter((e) => new Date(e.timestamp) >= startDate);

    const totals = { cash: 0, credit: 0, debit: 0 };
    filtered.forEach((item) => {
      if (item.paymentMethod === "Cash") totals.cash += item.amount;
      if (item.paymentMethod === "Credit Card") totals.credit += item.amount;
      if (item.paymentMethod === "Debit Card") totals.debit += item.amount;
    });

    setFilteredData(totals);
  };

  const calculateCategoryData = () => {
    const now = new Date();
    const filteredExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.createdAt?.seconds ? expense.createdAt.seconds * 1000 : expense.createdAt);
      if (filter === "Weekly") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return expenseDate >= weekAgo;
      } else if (filter === "Monthly") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return expenseDate >= monthAgo;
      } else if (filter === "Yearly") {
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        return expenseDate >= yearAgo;
      }
      return true;
    });

    const categoryTotals = {};
    filteredExpenses.forEach((expense) => {
      const category = expense.category || "Other";
      categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
    });

    const categoryArray = Object.entries(categoryTotals)
      .map(([name, amount]) => ({
        name,
        amount,
        color: categoryColors[name] || categoryColors["Other"],
        legendFontColor: isDark ? "#FFFFFF" : "#7F7F7F",
        legendFontSize: 12,
      }))
      .sort((a, b) => b.amount - a.amount);

    setCategoryData(categoryArray);
  };

  const chartData = {
    labels: ["Cash", "Credit", "Debit"],
    datasets: [
      {
        data: [filteredData.cash, filteredData.credit, filteredData.debit],
        colors: [
          () => colors.cashCard,   // Cash
          () => colors.creditCard, // Credit
          () => colors.debitCard,  // Debit
        ],
      },
    ],
  };

  const chartConfig = {
    backgroundColor: colors.background,
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    color: (opacity = 1) => `rgba(${isDark ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const FilterButton = ({ label }) => (
    <TouchableOpacity
      style={[
        styles.filterButton, 
        { backgroundColor: colors.cardBackground, borderColor: colors.border },
        filter === label && { backgroundColor: colors.primary, borderColor: colors.primary }
      ]}
      onPress={() => setFilter(label)}
    >
      <Text style={[
        styles.filterButtonText, 
        { color: colors.text },
        filter === label && { color: '#fff' }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>📊 Budget Insights</Text>

      <View style={styles.filterContainer}>
        <FilterButton label="Weekly" />
        <FilterButton label="Monthly" />
        <FilterButton label="Yearly" />
      </View>

      {/* Category Spending Chart */}
      <View style={[styles.chartContainer, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>Where Your Money Goes</Text>
        {categoryData.length > 0 ? (
          <PieChart
            data={categoryData}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[10, 10]}
            absolute
          />
        ) : (
          <Text style={[styles.noDataText, { color: colors.textSecondary }]}>
            No expense data available for the selected period
          </Text>
        )}
      </View>

      {/* Payment Method Chart */}
      <View style={[styles.chartContainer, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>Payment Methods</Text>
        <BarChart
          data={chartData}
          width={screenWidth}
          height={220}
          yAxisLabel="$"
          fromZero
          showValuesOnTopOfBars
          withCustomBarColorFromData={true}
          flatColor={true}
          chartConfig={chartConfig}
          style={styles.chart}
        />
      </View>

      {/* Summary Statistics */}
      <View style={[styles.summaryContainer, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>📈 Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Expenses:</Text>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>
            ${(filteredData.cash + filteredData.credit + filteredData.debit).toFixed(2)}
          </Text>
        </View>
        {categoryData.slice(0, 3).map((category, index) => (
          <View key={index} style={styles.summaryRow}>
            <View style={styles.categoryLegend}>
              <View style={[styles.colorDot, { backgroundColor: category.color }]} />
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{category.name}:</Text>
            </View>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              ${category.amount.toFixed(2)}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  filterButtonText: { fontWeight: "500" },
  chartContainer: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    alignItems: "center",
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
  },
  chart: { 
    borderRadius: 16, 
    marginVertical: 10 
  },
  noDataText: {
    fontSize: 16,
    textAlign: "center",
    fontStyle: "italic",
    paddingVertical: 30,
  },
  summaryContainer: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  categoryLegend: {
    flexDirection: "row",
    alignItems: "center",
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
  },
});
