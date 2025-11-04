import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BarChart } from "react-native-chart-kit";
import { useIsFocused } from "@react-navigation/native";

const screenWidth = Dimensions.get("window").width - 30;

export default function ReportsScreen() {
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
      const data = await AsyncStorage.getItem("expenses");
      if (data) setExpenses(JSON.parse(data));
    } catch (error) {
      console.log("Error loading reports:", error);
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
          () => `#9ACD32`,   // Cash
          () => `#78c4dfff`, // Credit
          () => `#e78deaff`, // Debit
        ],
      },
    ],
  };

  const FilterButton = ({ label }) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === label && styles.filterButtonActive]}
      onPress={() => setFilter(label)}
    >
      <Text style={[styles.filterButtonText, filter === label && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 Spending Reports</Text>

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
          backgroundColor: "#ffffff",
          backgroundGradientFrom: "#f5f7fa",
          backgroundGradientTo: "#eaf2f8",
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // label color
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: { borderRadius: 16 },
        }}
        style={styles.chart}
      />

      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>Summary</Text>
        <Text style={[styles.summaryText, { color: "#9ACD32" }]}>
          💰 Cash: ${filteredData.cash.toFixed(2)}
        </Text>
        <Text style={[styles.summaryText, { color: "#78c4dfff" }]}>
          💳 Credit: ${filteredData.credit.toFixed(2)}
        </Text>
        <Text style={[styles.summaryText, { color: "#e78deaff" }]}>
          🏦 Debit: ${filteredData.debit.toFixed(2)}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 15 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#1a237e",
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
    backgroundColor: "#e0e0e0",
    alignItems: "center",
  },
  filterButtonActive: { backgroundColor: "#2196F3" },
  filterButtonText: { color: "#333", fontWeight: "500" },
  filterButtonTextActive: { color: "#fff", fontWeight: "700" },
  chart: { borderRadius: 16, marginVertical: 10 },
  summaryBox: {
    backgroundColor: "#f0f8e9",
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#2e7d32",
  },
  summaryText: { fontSize: 16, marginVertical: 4, fontWeight: "500", color: "#333" },
});
