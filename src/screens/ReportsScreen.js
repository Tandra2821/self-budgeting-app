import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BarChart } from "react-native-chart-kit";
import { useIsFocused } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { db } from '../services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const screenWidth = Dimensions.get("window").width - 30;

export default function ReportsScreen() {
  const { colors, isDark } = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [filter, setFilter] = useState("Monthly");
  const [filteredData, setFilteredData] = useState({ cash: 0, credit: 0, debit: 0 });
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadExpenses();
    }
  }, [isFocused]);

  useEffect(() => {
    calculateFilteredData();
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
      <Text style={[styles.title, { color: colors.text }]}>📊 Spending Reports</Text>

      <View style={styles.filterContainer}>
        <FilterButton label="Weekly" />
        <FilterButton label="Monthly" />
        <FilterButton label="Yearly" />
      </View>

      <BarChart
        data={chartData}
        width={screenWidth}
        height={250}
        yAxisLabel="$"
        fromZero
        showValuesOnTopOfBars
        withCustomBarColorFromData={true}
        flatColor={true}
        chartConfig={{
          backgroundColor: colors.cardBackground,
          backgroundGradientFrom: colors.cardBackground,
          backgroundGradientTo: colors.cardBackground,
          decimalPlaces: 2,
          color: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
          style: { borderRadius: 16 },
        }}
        style={styles.chart}
      />

      <View style={[styles.summaryBox, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.summaryTitle, { color: colors.text }]}>Summary</Text>
        <Text style={[styles.summaryText, { color: colors.cashCard }]}>
          💰 Cash: ${filteredData.cash.toFixed(2)}
        </Text>
        <Text style={[styles.summaryText, { color: colors.creditCard }]}>
          💳 Credit: ${filteredData.credit.toFixed(2)}
        </Text>
        <Text style={[styles.summaryText, { color: colors.debitCard }]}>
          🏦 Debit: ${filteredData.debit.toFixed(2)}
        </Text>
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
  chart: { borderRadius: 16, marginVertical: 10 },
  summaryBox: {
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  summaryText: { fontSize: 16, marginVertical: 4, fontWeight: "500" },
});
