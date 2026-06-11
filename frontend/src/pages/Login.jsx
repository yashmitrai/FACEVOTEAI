import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import WebcamCapture from '../components/WebcamCapture';
import Alert from '../components/Alert';
import api from '../services/api';
import { motion } from 'framer-motion';

export default function Login() {
  const [aadhaarId, setAadhaarId] = useState('');
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleVerify = async () => {
    setError(null);
    if (!aadhaarId.trim()) return setError("Please enter your Aadhaar ID.");
    if (!imageSrc) return setError("Please capture a live photo for verification.");

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { 
        aadhaar_id: aadhaarId, 
        image: imageSrc 
      });
      
      localStorage.setItem('jwt_token', response.data.token);
      navigate('/voting');
    } catch (err) {
      if (err.response?.status === 403) {
        // User already voted
        navigate('/success');
      } else {
        setError(err.response?.data?.error || "Authentication failed. Face does not match.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 border border-slate-100"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Biometric Verification</h2>
        <p className="text-sm text-slate-500 mt-1">Verify your identity to access the voting terminal.</p>
      </div>
      
      <Alert type="error" message={error} />
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Aadhaar ID Number</label>
          <input 
            type="text" 
            placeholder="XXXX-XXXX-XXXX"
            value={aadhaarId} 
            onChange={e => setAadhaarId(e.target.value.replace(/[^0-9]/g, ''))} 
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-eciBlue focus:border-eciBlue transition-colors outline-none font-mono text-center tracking-widest text-lg"
            maxLength={12}
          />
        </div>
        
        <div className="py-2 border-y border-slate-100 my-4">
          <WebcamCapture onCapture={setImageSrc} />
        </div>
        
        <button 
          onClick={handleVerify} 
          disabled={loading}
          className="w-full bg-eciBlue hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-xl shadow-md disabled:bg-slate-400 disabled:shadow-none transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Matching Identity...
            </>
          ) : 'Authenticate Payload'}
        </button>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-600">
            <Link to="/" className="text-slate-500 hover:text-slate-800 hover:underline">← Cancel & Return Home</Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
