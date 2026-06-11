import React from 'react';
import { FaExclamationCircle, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function Alert({ type, message }) {
  if (!message) return null;
  
  const isError = type === 'error';
  const isSpinner = type === 'loading';
  const isSuccess = type === 'success';

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`p-4 mb-4 text-sm rounded-lg flex items-center gap-3 font-medium shadow-sm border ${
          isError ? 'bg-red-50 text-red-700 border-red-200' : 
          isSuccess ? 'bg-green-50 text-green-700 border-green-200' :
          isSpinner ? 'bg-blue-50 text-blue-700 border-blue-200' :
          'bg-slate-50 text-slate-700 border-slate-200'
        }`}
      >
        {isError && <FaExclamationCircle className="text-lg flex-shrink-0" />}
        {isSuccess && <FaCheckCircle className="text-lg flex-shrink-0" />}
        {isSpinner && <FaSpinner className="text-lg flex-shrink-0 animate-spin" />}
        
        <span className="flex-1">{message}</span>
      </motion.div>
    </AnimatePresence>
  );
}
