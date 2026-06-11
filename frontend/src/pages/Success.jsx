import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaLock } from 'react-icons/fa';

export default function Success() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 border border-slate-100 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        className="flex justify-center mb-6"
      >
        <FaCheckCircle className="text-7xl text-green-500" />
      </motion.div>
      
      <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Vote Recorded</h2>
      <p className="text-slate-600 mb-6">
        Your democratic duty has been completed successfully. The ballot has been encrypted and securely locked.
      </p>

      <div className="bg-slate-50 p-4 rounded-lg flex items-start gap-3 text-left mb-8 border border-slate-200">
        <FaLock className="text-eciBlue mt-1 shrink-0" />
        <p className="text-sm text-slate-600">
          Your biometric session has been terminated to ensure privacy. You are now strictly locked out from further interactions with the terminal to prevent duplicate voting.
        </p>
      </div>

      <Link 
        to="/" 
        className="inline-block w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md"
      >
        Return to Portal
      </Link>
    </motion.div>
  );
}
