import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const PARTY_DESCRIPTIONS = {
  "DMK": "Experienced leadership with a focus on social welfare and development. Serving as Chief Minister with progressive governance.",
  "AIADMK": "Administrative experience with emphasis on infrastructure and stability in governance.",
  "BJP": "Strong national leadership focusing on development, digital growth, and global positioning.",
  "TVK": "New-age leadership focusing on youth empowerment and political change."
};

export default function VoteConfirmModal({ isOpen, onClose, onConfirm, party, loading }) {
  if (!party) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!loading ? onClose : undefined}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
          >
            <div className="bg-eciBlue p-6 text-white text-center">
              <h2 className="text-2xl font-black tracking-tight">CONFIRM YOUR VOTE</h2>
              <p className="text-blue-200 text-sm font-bold mt-1 uppercase tracking-widest leading-none">Final Authorization Required</p>
            </div>

            <div className="p-8">
              <div className="flex flex-col items-center mb-8">
                <div className="flex gap-4 items-center mb-6">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50 p-1">
                    <img 
                      src={party.leader_img} 
                      alt={party.leader} 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=Leader' }}
                    />
                  </div>
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50 p-2">
                    <img 
                      src={party.symbol_img} 
                      alt={`${party.name} Symbol`} 
                      className="w-full h-full object-contain"
                      onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=Symbol' }}
                    />
                  </div>
                </div>

                <h3 className="text-4xl font-black text-eciBlue mb-2 tracking-tight">{party.name}</h3>
                <p className="text-lg font-bold text-slate-700 mb-4 tracking-wide uppercase">{party.leader}</p>
                
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-600 text-center text-sm leading-relaxed mb-6 italic">
                  "{PARTY_DESCRIPTIONS[party.name] || "Representing public interests and dedicated to regional prosperity."}"
                </div>

                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest border border-red-100">
                  <FaExclamationTriangle className="animate-pulse" />
                  This action is final and cannot be changed.
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 py-4 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 border border-slate-200"
                >
                  <FaTimesCircle /> Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-1 py-4 px-6 rounded-2xl bg-eciBlue hover:bg-blue-800 text-white font-black tracking-widest uppercase shadow-lg hover:shadow-eciBlue/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <><FaCheckCircle /> Confirm Vote</>
                  )}
                </button>
              </div>
            </div>
            
            <div className="bg-slate-50 p-3 text-center border-t border-slate-100 italic text-[10px] text-slate-400 font-bold tracking-widest">
              ENCRYPTED BALLOT TRANSACTION ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
