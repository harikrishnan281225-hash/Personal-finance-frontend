import React, { useState, useEffect } from 'react';
import api from './api';
import styles from './Dashboard.module.css';

function AddTransaction({ onTransactionAdded, editingTransaction, monthlyIncome, totalSpent }) {
  const [data, setData] = useState({ description: '', amount: '', category: '', date: '' });
  const [error, setError] = useState(''); 

  useEffect(() => {
    if (editingTransaction) {
      setData({
        description: editingTransaction.description,
        amount: editingTransaction.amount,
        category: editingTransaction.category,
        date: editingTransaction.date ? editingTransaction.date.substring(0, 10) : ''
      });
    } else {
      setData({ description: '', amount: '', category: '', date: '' });
    }
  }, [editingTransaction]);

  const validate = () => {
    if (!data.description.trim()) return "Description cannot be empty.";
    if (parseFloat(data.amount) <= 0 || isNaN(data.amount)) return "Please enter a valid positive amount.";
    if (!data.category.trim()) return "Please specify a category.";
    if (!data.date) return "Please select a date.";
    if (new Date(data.date) > new Date()) return "Date cannot be in the future.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    // --- BUDGET CHECK LOGIC ---
    const newAmount = parseFloat(data.amount);
    const oldAmount = editingTransaction ? parseFloat(editingTransaction.amount) : 0;
    const projectedTotal = totalSpent - oldAmount + newAmount;

    if (projectedTotal > monthlyIncome) {
      const confirmMsg = `Warning: This transaction will bring your total spending to $${projectedTotal.toFixed(2)}, which exceeds your income of $${monthlyIncome.toFixed(2)}. Proceed?`;
      if (!window.confirm(confirmMsg)) {
        return; // Stop submission if user clicks "Cancel"
      }
    }

    try {
      if (editingTransaction) {
        await api.put(`/transactions/${editingTransaction.id}`, data);
      } else {
        await api.post('/transactions', data);
      }
      
      setData({ description: '', amount: '', category: '', date: '' });
      if (onTransactionAdded) onTransactionAdded();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save transaction.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
      {error && (
        <div style={{ color: '#ef4444', marginBottom: '10px', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      <input 
        className={styles.inputField} 
        placeholder="Description" 
        value={data.description} 
        onChange={(e) => setData({...data, description: e.target.value})} 
      />
      <input 
        className={styles.inputField} 
        type="number" 
        placeholder="Amount" 
        value={data.amount} 
        onChange={(e) => setData({...data, amount: e.target.value})} 
      />
      <input 
        className={styles.inputField} 
        placeholder="Category" 
        value={data.category} 
        onChange={(e) => setData({...data, category: e.target.value})} 
      />
      <input 
        className={styles.inputField} 
        type="date" 
        value={data.date} 
        onChange={(e) => setData({...data, date: e.target.value})} 
      />
      <button type="submit" style={{ cursor: 'pointer' }}>
        {editingTransaction ? "Update Transaction" : "Add Transaction"}
      </button>
    </form>
  );
}

export default AddTransaction;