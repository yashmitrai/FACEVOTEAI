import React from 'react';
import { motion } from 'framer-motion';

export default function VotingCard({ party, onVote, disabled }) {
  return (
    <motion.div 
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      className={`bg-white rounded-xl shadow-lg border-2 p-4 flex flex-col transition-all ${
        disabled ? 'opacity-50 grayscale pointer-events-none border-slate-200' : 'hover:shadow-2xl border-transparent hover:border-eciBlue cursor-pointer'
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-extrabold text-2xl text-eciBlue tracking-tight">{party.name}</h3>
        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-semibold uppercase">{party.leader}</span>
      </div>

      <div className="flex justify-between gap-4 mb-6 relative">
        <div className="flex-1 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 aspect-square flex items-center justify-center p-2 relative group">
          <p className="absolute top-2 left-2 text-[10px] uppercase font-bold text-slate-400 bg-white/80 px-1 rounded">Candidate</p>
          <img 
            src={party.leader_img} 
            alt={party.leader} 
            className="w-full h-full object-contain filter group-hover:contrast-110 transition-all" 
            onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=Leader' }}
          />
        </div>

        <div className="flex-1 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 aspect-square flex items-center justify-center p-4 relative group">
          <p className="absolute top-2 left-2 text-[10px] uppercase font-bold text-slate-400 bg-white/80 px-1 rounded">Symbol</p>
          <img 
            src={party.symbol_img} 
            alt={`${party.name} Symbol`} 
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform" 
            onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=Symbol' }}
          />
        </div>
      </div>

      <button 
        onClick={() => onVote(party.name)}
        disabled={disabled}
        className="mt-auto w-full bg-eciBlue hover:bg-blue-800 text-white py-3 rounded-lg font-black text-xl uppercase tracking-widest flex items-center justify-center transition-all disabled:bg-slate-400 shadow-md hover:shadow-xl"
      >
        <span className="opacity-0 w-8"></span> 
        PRESS TO VOTE 
        <div className="w-8 flex justify-end">
            <span className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)] ml-2"></span>
        </div>
      </button>
    </motion.div>
  );
}
