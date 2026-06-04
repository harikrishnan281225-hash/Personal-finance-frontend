import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, 
  LineChart, Line, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import api from './api';
import AddTransaction from './AddTransaction';
import styles from './Dashboard.module.css';
import { CURRENCY_DATA } from './utils/currencies';

function Dashboard() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ income: 0, spent: 0, currency: 'USD' });
  const [goal, setGoal] = useState(0);
  const [tempIncome, setTempIncome] = useState('');
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [bills, setBills] = useState(() => {
    const savedBills = localStorage.getItem('myBills');
    return savedBills ? JSON.parse(savedBills) : [
      { id: 1, name: 'Rent', due: '10th', paid: false },
      { id: 2, name: 'Electricity', due: '15th', paid: false }
    ];
  });
  const [billName, setBillName] = useState('');

  useEffect(() => {
    localStorage.setItem('myBills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, transRes, goalRes] = await Promise.all([
        api.get('/user/dashboard-summary'),
        api.get('/transactions'),
        api.get('/user/goal')
      ]);
      setSummary(summaryRes.data);
      setTransactions(transRes.data);
      setGoal(goalRes.data.savingsGoal);
    } catch (err) { console.error("Error fetching data:", err); }
  };

  const rate = CURRENCY_DATA[summary.currency]?.rate || 1;
  const symbol = CURRENCY_DATA[summary.currency]?.symbol || '$';
  const balance = summary.income - summary.spent;
  const progress = goal > 0 ? Math.min((balance / goal) * 100, 100) : 0;

  const getHealthStatus = () => {
    const ratio = summary.spent / (summary.income || 1);
    if (ratio < 0.5) return { text: "EXCELLENT", className: styles.statusExcellent };
    if (ratio < 0.8) return { text: "GOOD", className: styles.statusGood };
    return { text: "CAUTION", className: styles.statusCaution };
  };
  const health = getHealthStatus();

  const getTrendData = () => [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date)).map(t => ({ date: t.date ? t.date.substring(5) : 'N/A', amount: parseFloat(t.amount) * rate }));
  const getChartData = () => {
    const totals = transactions.reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + (parseFloat(t.amount || 0) * rate); return acc; }, {});
    return Object.keys(totals).map(cat => ({ name: cat, value: totals[cat] }));
  };

  const handleUpdateIncome = async () => {
    if (tempIncome) {
      try {
        await api.put('/user/income', { monthlyIncome: parseFloat(tempIncome) });
        alert("Income updated!");
        fetchData();
      } catch (err) { console.error("Update failed", err); }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this transaction?")) {
      try { await api.delete(`/transactions/${id}`); fetchData(); } catch (err) { alert("Error deleting transaction"); }
    }
  };

  const handleLogout = () => { localStorage.removeItem("token"); window.location.href = '/login'; };
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className={styles.container}>
      <h1 className={styles.mainTitle}>FINANCE TRACKER</h1>

      {/* Row 1: Top Stats */}
      <div className={styles.dashboardGrid} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <section className={styles.card}><h3>Financial Summary</h3><div style={{ display: 'flex', gap: '20px' }}><div><p>INCOME</p><h4>{symbol} {(summary.income * rate).toFixed(2)}</h4></div><div><p>SPENT</p><h4>{symbol} {(summary.spent * rate).toFixed(2)}</h4></div></div></section>
        <section className={styles.card}><h3>Configure Income</h3><input type="number" className={styles.inputField} placeholder={summary.income} onChange={(e) => setTempIncome(e.target.value)} /><button onClick={handleUpdateIncome}>Update</button></section>
        <section className={styles.card}><h3>Savings Goal</h3><h4>{symbol} {(balance * rate).toFixed(0)} / {symbol} {(goal * rate).toFixed(0)}</h4><div className={styles.progressBarContainer}><div className={styles.progressBarFill} style={{ width: `${progress}%` }}></div></div></section>
        <section className={styles.card}><h3>HEALTH</h3><h2 className={health.className}>{health.text}</h2></section>
      </div>

      {/* Row 2: Charts & Log */}
      <div className={styles.dashboardGrid} style={{ gridTemplateColumns: '1fr 2fr 2fr' }}>
        <section className={styles.card}><h3>{editingTransaction ? "Edit Transaction" : "Log Transaction"}</h3><AddTransaction onTransactionAdded={() => { fetchData(); setEditingTransaction(null); }} editingTransaction={editingTransaction} /></section>
        <section className={styles.card}><h3>Spending Trend</h3><ResponsiveContainer width="100%" height={200}><LineChart data={getTrendData()}><CartesianGrid strokeDasharray="3 3" stroke="#2d3446" /><XAxis dataKey="date" stroke="#94a3b8" fontSize={10} /><YAxis stroke="#94a3b8" fontSize={10} /><Tooltip contentStyle={{ backgroundColor: '#151a26', border: 'none' }} /><Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} /></LineChart></ResponsiveContainer></section>
        <section className={styles.card}><h3>Breakdown</h3><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={getChartData()} dataKey="value" innerRadius={50} outerRadius={70}>{getChartData().map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: '#151a26', border: 'none' }} /><Legend /></PieChart></ResponsiveContainer></section>
      </div>

      {/* Row 3: Recent Transactions & Practical Utilities */}
      <div className={styles.dashboardGrid} style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
        <section className={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Recent Transactions</h3>
            <button className={styles.editButton} onClick={() => navigate('/history')}>History</button>
          </div>
          <table className={styles.table}>
            <thead><tr><th>Description</th><th>Amount</th><th>Category</th><th>Action</th></tr></thead>
            <tbody>
              {transactions.slice(0, 3).map(t => (
                <tr key={t.id}>
                  <td>{t.description}</td>
                  <td>{symbol} {(parseFloat(t.amount) * rate).toFixed(2)}</td>
                  <td>{t.category}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button className={styles.editButtonSmall} onClick={() => setEditingTransaction(t)}>Edit</button>
                    <button className={styles.deleteButtonSmall} onClick={() => handleDelete(t.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={styles.card}>
          <h3>Bill Reminders</h3>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            <input type="text" className={styles.inputField} placeholder="Bill Name" value={billName} onChange={(e) => setBillName(e.target.value)} />
            <button className={styles.editButtonSmall} onClick={() => {
              if (billName.trim()) {
                setBills([...bills, { id: Date.now(), name: billName, due: 'TBD', paid: false }]);
                setBillName('');
              }
            }}>Add</button>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
            {bills.map(bill => (
              <li key={bill.id} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={bill.paid} onChange={() => setBills(bills.map(b => b.id === bill.id ? { ...b, paid: !b.paid } : b))} />
                  <span style={{ textDecoration: bill.paid ? 'line-through' : 'none' }}>{bill.name} (Due: {bill.due})</span>
                </div>
                <button className={styles.deleteButtonSmall} onClick={() => setBills(bills.filter(b => b.id !== bill.id))}>Delete</button>
              </li>
            ))}
          </ul>
        </section>

        {/* Optimized Category Cap Section */}
        <section className={styles.card} style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>Category Cap</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto', maxHeight: '250px' }}>
            {getChartData()
              .sort((a, b) => b.value - a.value) // Sort: Highest spender first
              .map((item) => {
                const limit = 40000; // Define your category budget limit
                const usagePercentage = Math.min((item.value / limit) * 100, 100);
                
                return (
                  <div key={item.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{item.name}</span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{usagePercentage.toFixed(0)}% Used</span>
                    </div>
                    
                    {/* Joined straight-line buildings */}
                    <div style={{ display: 'flex', height: '30px', borderRadius: '4px', overflow: 'hidden' }}>
                      {/* Limit Part */}
                      <div style={{ flex: 1, backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '0.65rem', color: '#fff' }}>Limit</span>
                      </div>
                      {/* Used Part */}
                      <div style={{ flex: 1, backgroundColor: '#f59e0b' }}></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      </div>

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button className={styles.editButton} onClick={() => navigate('/profile')}>Manage Profile</button>
        <button className={styles.logoutButton} onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default Dashboard;