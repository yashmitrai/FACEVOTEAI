import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VotingCard from '../components/VotingCard';
import VoteConfirmModal from '../components/VoteConfirmModal';
import Alert from '../components/Alert';
import api from '../services/api';
import { motion } from 'framer-motion';
import { FaLock } from 'react-icons/fa';

const PARTIES = [
  {
    name: "DMK",
    leader: "M.K. Stalin",
    leader_img: "/assets/parties/dmk_leader.jpg",
    symbol_img: "/assets/parties/dmk_symbol.png"
  },
  {
    name: "AIADMK",
    leader: "Edappadi K. Palaniswami",
    leader_img: "/assets/parties/aiadmk_leader.jpg",
    symbol_img: "/assets/parties/aiadmk_symbol.png"
  },
  {
    name: "BJP",
    leader: "Narendra Modi",
    leader_img: "/assets/parties/bjp_leader.jpg",
    symbol_img: "/assets/parties/bjp_symbol.png"
  },
  {
    name: "TVK",
    leader: "Vijay",
    leader_img: "/assets/parties/tvk_leader.jpg",
    symbol_img: "/assets/parties/tvk_symbol.png"
  }
];

export default function Voting() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedParty, setSelectedParty] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('jwt_token')) {
      navigate('/login');
    }
  }, [navigate]);

  const handleVoteClick = (party) => {
    setSelectedParty(party);
    setShowModal(true);
  };

  const handleConfirmVote = async () => {
    if (!selectedParty) return;
    
    setLoading(true);
    try {
      await api.post('/vote/cast', { party: selectedParty.name });
      localStorage.removeItem('jwt_token');
      setShowModal(false);
      navigate('/success');
    } catch (err) {
      setShowModal(false);
      if (err.response?.status === 403 || err.response?.data?.error?.includes('voted')) {
        localStorage.removeItem('jwt_token');
        navigate('/success');
      } else {
        setError(err.response?.data?.error || "Failed to cast vote securely.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl w-full"
    >
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-eciBlue text-white p-6 flex flex-col md:flex-row items-center justify-between shadow-inner border-b-4 border-eciOrange">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black tracking-widest drop-shadow-md">TAMIL NADU ELECTION 2026</h2>
            <p className="text-sm text-blue-200 font-semibold mt-1 flex items-center justify-center md:justify-start gap-1">
              <FaLock /> SECURE ELECTRONIC VOTING MACHINE DIRECTORY
            </p>
          </div>
          <div className="bg-white text-eciBlue px-4 py-2 rounded-md text-xl font-bold border-2 border-white shadow-lg mt-4 md:mt-0">
            1 VOTE REMAINING
          </div>
        </div>

        <div className="p-6 md:p-10 bg-slate-50 relative min-h-[500px]">
          {error && <Alert type="error" message={error} />}
          {loading && !showModal && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-8 border-eciBlue border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-eciBlue font-black text-xl tracking-widest uppercase">Encrypting Ballot...</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PARTIES.map((party, index) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.15 }}
                key={party.name}
              >
                <VotingCard 
                  party={party} 
                  onVote={() => handleVoteClick(party)} 
                  disabled={loading} 
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <VoteConfirmModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmVote}
        party={selectedParty}
        loading={loading}
      />
    </motion.div>
  );
}
