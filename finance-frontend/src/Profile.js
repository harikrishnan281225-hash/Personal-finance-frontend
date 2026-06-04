import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import styles from './Profile.module.css';
import { CURRENCY_DATA } from './utils/currencies';

function Profile() {
  const [profile, setProfile] = useState({ name: '', email: '', currency: 'USD' });
  const [summary, setSummary] = useState({ totalBalance: 0, transactionCount: 0 });
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, summaryRes] = await Promise.all([
          api.get('/user/profile'),
          api.get('/user/profile/summary')
        ]);
        setProfile(profileRes.data);
        setSummary(summaryRes.data);
      } catch (err) { 
        console.error("Failed to fetch data:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
  }, []);

  const rate = CURRENCY_DATA[profile.currency]?.rate || 1;
  const symbol = CURRENCY_DATA[profile.currency]?.symbol || '$';
  const displayBalance = (summary.totalBalance * rate).toFixed(2);

  const handleSave = async () => {
    try {
      await api.put('/user/profile', { name: profile.name, email: profile.email });
      alert("Profile updated successfully!");
    } catch (err) { alert("Failed to save changes."); }
  };

  const handleUpdateCurrency = async (newCurrency) => {
    try {
      await api.put('/user/profile/currency', { currency: newCurrency });
      setProfile({ ...profile, currency: newCurrency });
    } catch (err) { alert("Failed to update currency."); }
  };

  const handleUpdatePassword = async () => {
    try {
      await api.put('/user/password', { password });
      alert("Password updated successfully!");
      setPassword('');
    } catch (err) { alert("Failed to update password."); }
  };

  if (loading) return <div className={styles.container}>Loading profile...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.mainTitle}>USER PROFILE</h1>
      
      {/* dashboardGrid class ensures uniform 3-column layout */}
      <div className={styles.dashboardGrid}>
        
        <section className={styles.card}>
          <h3>Account Information</h3>
          <label className={styles.label}>Name</label>
          <input className={styles.inputField} value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
          <label className={styles.label}>Email</label>
          <input className={styles.inputField} value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
          <button className={styles.btn} onClick={handleSave}>Save Changes</button>
        </section>

        <section className={styles.card}>
          <h3>Account Summary</h3>
          <div className={styles.summaryItem}>
            <span className={styles.label}>Balance:</span>
            <span className={styles.value}>{symbol} {displayBalance}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.label}>Total Transactions:</span>
            <span className={styles.value}>{summary.transactionCount}</span>
          </div>
          <label className={styles.label}>Preferred Currency:</label>
          <select className={styles.inputField} value={profile.currency} onChange={e => handleUpdateCurrency(e.target.value)}>
            {Object.keys(CURRENCY_DATA).map(code => <option key={code} value={code}>{code}</option>)}
          </select>
        </section>

        <section className={styles.card}>
          <h3>Security</h3>
          <label className={styles.label}>Change Password</label>
          <input className={styles.inputField} type="password" placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button className={styles.btn} onClick={handleUpdatePassword}>Update Password</button>
        </section>
        
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
      </div>
    </div>
  );
}

export default Profile;