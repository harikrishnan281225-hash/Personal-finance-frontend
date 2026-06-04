import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from './api';
import styles from './Auth.module.css';

function Signup() {
  const [formData, setFormData] = useState({ username: '', name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false); // Toggle state
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/signup', formData);
      alert("Account created successfully!");
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert("Error creating account. Please check the console for details.");
    }
  };

  return (
    <div className={styles.authContainer}>
      <form className={styles.authCard} onSubmit={handleSignup}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'white' }}>Create Account</h2>
        
        <input 
          className={styles.inputField} 
          placeholder="Username" 
          value={formData.username}
          onChange={e => setFormData({...formData, username: e.target.value})} 
          required
        />
        <input 
          className={styles.inputField} 
          placeholder="Full Name" 
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})} 
          required
        />
        <input 
          className={styles.inputField} 
          type="email" 
          placeholder="Email" 
          value={formData.email}
          onChange={e => setFormData({...formData, email: e.target.value})} 
          required
        />

        {/* Password Wrapper with Eye Toggle */}
        <div className={styles.passwordWrapper}>
          <input 
            className={styles.inputField} 
            type={showPassword ? "text" : "password"} 
            placeholder="Password" 
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})} 
            required
          />
          <button 
            type="button" 
            className={styles.toggleBtn} 
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "👁️" : "🙈"}
          </button>
        </div>
        
        <button type="submit" className={styles.authButton}>Sign Up</button>
        <Link to="/login" className={styles.authLink}>Already have an account? Login</Link>
      </form>
    </div>
  );
}

export default Signup;