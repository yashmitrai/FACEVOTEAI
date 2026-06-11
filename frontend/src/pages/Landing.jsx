import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-slate-100"
    >
      <div className="md:w-1/2 p-8 lg:p-12 flex flex-col justify-center text-center items-center bg-slate-50 border-r border-slate-100">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">FaceVote AI</h1>
        <h2 className="text-lg font-bold text-eciBlue mb-4 tracking-wide uppercase">Biometric Voting System</h2>
        <p className="text-slate-600 mb-8 leading-relaxed">
          The future of democratic voting is here. Utilizing advanced facial recognition to strictly prevent voter fraud and ensure duplicate-proof polling sessions. Admin-Controlled identity enrollment.
        </p>
      </div>
      
      <div className="md:w-1/2 p-8 lg:p-12 flex flex-col justify-center gap-6">
        <h3 className="text-xl font-bold text-slate-800 border-b pb-2 text-center md:text-left">Public Access Portal</h3>
        
        <Link 
          to="/login" 
          className="group relative w-full flex justify-center py-4 px-4 text-sm font-bold rounded-xl text-white bg-eciBlue hover:bg-blue-800 transition-all shadow-md items-center gap-3 overflow-hidden"
        >
          Authenticate & Vote
          <div className="absolute inset-0 h-full w-full bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
        </Link>
        <p className="text-xs text-center text-slate-400 mt-4">
          Note: Enrollment is strictly managed internally by Election Commission officials. Contact your local office to request additions to the registry.
        </p>
      </div>
    </motion.div>
  );
}
