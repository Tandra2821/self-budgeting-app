import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddExpenseScreen({ route, navigation }) {
  const editingExpense = route.params?.expense;

  const [title, setTitle] = useState(editingExpense ? editingExpense.title : '');
  const [amount, setAmount] = useState(
    editingExpense ? editingExpense.amount.toString() : ''
  );
  const [type, setType] = useState(editingExpense ? editingExpense.type : 'Cash');

  const handleAddOrUpdateExpense = async () => {
    if (!title || !amount) {
      Alert.alert('Error', 'Please enter both title and amount');
      return;
    }

    try {
      const storedExpenses = await AsyncStorage.getItem('expenses');
      let expenses = storedExpenses ? JSON.parse(storedExpenses) : [];

      if (editingExpense) {
        // update existing expense
        expenses = expenses.map((exp) =>
          exp.id === editingExpense.id
            ? { ...exp, title, amount: parseFloat(amount), type }
            : exp
        );
      } else {
        // add new expense
        const newExpense = {
          id: Date.now().toString(),
          title,
          amount: parseFloat(amount),
          type,
        };
        expenses.push(newExpense);
      }

      await AsyncStorage.setItem('expenses', JSON.stringify(expenses));
      Alert.alert('Success', editingExpense ? 'Expense updated!' : 'Expense added!');
      navigation.navigate('Home');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Expense title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Select Type:</Text>
      <View style={styles.typeContainer}>
        {['Cash', 'Credit Card'].map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.typeButton, type === option && styles.activeType]}
            onPress={() => setType(option)}>
            <Text>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        title={editingExpense ? 'Update Expense' : 'Add Expense'}
        onPress={handleAddOrUpdateExpense}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 6,
    borderRadius: 6,
  },
  label: { marginTop: 10, fontWeight: 'bold' },
  typeContainer: { flexDirection: 'row', marginVertical: 10 },
  typeButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginRight: 10,
    borderRadius: 6,
  },
  activeType: { backgroundColor: '#cce5ff', borderColor: '#007bff' },
});




