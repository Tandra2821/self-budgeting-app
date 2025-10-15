import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen() {
  const [expenses, setExpenses] = useState([]);

  const loadExpenses = async () => {
    try {
      const storedExpenses = await AsyncStorage.getItem('expenses');
      const parsedExpenses = storedExpenses ? JSON.parse(storedExpenses) : [];
      setExpenses(parsedExpenses);
    } catch (error) {
      console.log(error);
    }
  };

  // 👇 This runs every time HomeScreen is focused
  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Expenses</Text>
      {expenses.length === 0 ? (
        <Text style={styles.empty}>No expenses added yet</Text>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.text}>{item.title}</Text>
              <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, marginBottom: 20, fontWeight: 'bold' },
  empty: { textAlign: 'center', color: '#777' },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  text: { fontSize: 16 },
  amount: { fontSize: 16, fontWeight: 'bold' },
});


