import React, { useState } from 'react';
import api from './api'; 

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', name: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/auth/signin' : '/auth/signup';
    
    try {
      const response = await api.post(endpoint, formData);
      
      if (isLogin) {
        // Correctly storing the token from the backend's { "accessToken": "..." } response
        localStorage.setItem("token", response.data.accessToken);
        alert("Login Successful!");
        window.location.href = '/dashboard'; // Better practice than reload()
      } else {
        alert("Signup Successful! Please login.");
        setIsLogin(true);
        setFormData({ username: '', email: '', password: '', name: '' });
      }
    } catch (err) {
      console.error(err);
      // Improved error display for both String and Object responses
      const errorMessage = typeof err.response?.data === 'string' 
        ? err.response.data 
        : (err.response?.data?.message || "Something went wrong");
      alert("Error: " + errorMessage);
    }
  };

  return (
    <div style={{ maxWidth: '300px', margin: '50px auto', textAlign: 'center' }}>
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
      <form onSubmit={handleSubmit} autoComplete="off">
        <input 
          name="username"
          placeholder="Username" 
          value={formData.username}
          onChange={handleChange}
          autoComplete="off"
          required 
        /><br />
        
        {!isLogin && (
          <>
            <input 
              name="name"
              placeholder="Full Name" 
              value={formData.name}
              onChange={handleChange}
              autoComplete="off"
              required 
            /><br />
            <input 
              name="email"
              type="email"
              placeholder="Email" 
              value={formData.email}
              onChange={handleChange}
              autoComplete="off"
              required 
            /><br />
          </>
        )}

        <input 
          name="password"
          type="password" 
          placeholder="Password" 
          value={formData.password}
          onChange={handleChange}
          autoComplete="new-password"
          required 
        /><br /><br />
        
        <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
      </form>
      
      <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: 'pointer', color: 'blue', marginTop: '10px' }}>
        {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
      </p>
    </div>
  );
}

export default Auth;