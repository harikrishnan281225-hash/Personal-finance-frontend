import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import styles from './Dashboard.module.css';
import { CURRENCY_DATA } from './utils/currencies';

function History() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ currency: 'USD' });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const [transRes, summaryRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/user/dashboard-summary')
      ]);
      setTransactions(transRes.data);
      setSummary(summaryRes.data);
    } catch (err) { console.error("Error fetching history:", err); }
  };

  const rate = CURRENCY_DATA[summary.currency]?.rate || 1;
  const symbol = CURRENCY_DATA[summary.currency]?.symbol || '$';

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className={styles.mainTitle}>Transaction History</h1>
        <button className={styles.editButton} onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>

      <section className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id}>
                <td>{t.date ? new Date(t.date).toLocaleDateString() : 'N/A'}</td>
                <td>{t.description}</td>
                <td>{t.category}</td>
                <td>{symbol} {(parseFloat(t.amount) * rate).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default History;