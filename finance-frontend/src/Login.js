import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from './api';
import styles from './Auth.module.css';

function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false); // Toggle state
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/signin', credentials);
      localStorage.setItem("token", response.data.accessToken);
      
      navigate('/dashboard');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className={styles.authContainer}>
      <form className={styles.authCard} onSubmit={handleLogin}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'white' }}>Welcome Back</h2>
        
        <input 
          className={styles.inputField} 
          placeholder="Username" 
          value={credentials.username}
          onChange={(e) => setCredentials({...credentials, username: e.target.value})}
          required
        />
        
        {/* Password Wrapper for the Eye Icon */}
        <div className={styles.passwordWrapper}>
          <input 
            className={styles.inputField} 
            type={showPassword ? "text" : "password"} 
            placeholder="Password" 
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
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
        
        <button type="submit" className={styles.authButton}>Login</button>
        
        <Link to="/signup" className={styles.authLink}>Need an account? Sign Up</Link>
      </form>
    </div>
  );
}

export default Login;