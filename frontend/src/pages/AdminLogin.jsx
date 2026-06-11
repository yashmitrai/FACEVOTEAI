import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import api from '../services/api';
import { motion } from 'framer-motion';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) return setError("Enter both email and password.");

    setLoading(true);
    
    // Debug logging for request payload
    console.log("Sending Login Payload:", { email, password });
    
    try {
      // POST JSON exactly as requested: { email: value, password: value }
      const response = await api.post('/admin/login', { email, password });
      
      // Debug logging for response
      console.log("Login Response Received:", response.data);
      
      // Store JWT token in localStorage
      localStorage.setItem('jwt_token', response.data.token);
      
      // Redirect to Admin Dashboard
      navigate('/admin');
    } catch (err) {
      console.error("Login Server Error:", err.response);
      setError(err.response?.data?.error || "Strict authentication validation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 border-t-4 border-eciBlue"
    >
      <div className="text-center mb-6">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Security Portal</h2>
        <p className="text-sm font-bold text-slate-400 mt-1 uppercase">Admin Access Only</p>
      </div>
      
      <Alert type="error" message={error} />
      
      <form onSubmit={handleLogin} className="space-y-5 mt-4">
        <div>
          <label className="block text-sm font-extrabold text-slate-700 mb-1 tracking-wide">E-Mail Address</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="admin@eci.com"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-eciBlue outline-none font-medium bg-slate-50"
          />
        </div>
        <div>
          <label className="block text-sm font-extrabold text-slate-700 mb-1 tracking-wide">Passphrase</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="••••••••"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-eciBlue outline-none font-medium bg-slate-50"
          />
        </div>
        
        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-eciBlue hover:bg-blue-800 text-white font-black py-4 px-4 rounded-xl shadow-md disabled:bg-slate-400 transition-all uppercase tracking-widest mt-6"
        >
          {loading ? 'Authenticating Block...' : 'Gain Authorization'}
        </button>
      </form>
    </motion.div>
  );
}
