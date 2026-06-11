import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Pie, Bar } from 'react-chartjs-2';
import Alert from '../components/Alert';
import WebcamCapture from '../components/WebcamCapture';
import { FaUserPlus, FaUsers, FaChartPie, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('stats');
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('jwt_token')) navigate('/admin-login');
  }, [navigate]);

  return (
    <div className="w-full max-w-6xl">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight text-eciBlue">ELECTION COMMISSION CONTROL MODULE</h1>
          <p className="text-slate-500 font-semibold">Tamil Nadu Election 2026 Admin Analytics.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('stats')} className={`px-4 py-2 font-bold rounded-t-lg transition-all ${activeTab === 'stats' ? 'bg-eciBlue text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100'}`}><FaChartPie className="inline mr-2"/> Metrics</button>
          <button onClick={() => setActiveTab('register')} className={`px-4 py-2 font-bold rounded-t-lg transition-all ${activeTab === 'register' ? 'bg-eciBlue text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100'}`}><FaUserPlus className="inline mr-2"/> Enroll Voter</button>
          <button onClick={() => setActiveTab('users')} className={`px-4 py-2 font-bold rounded-t-lg transition-all ${activeTab === 'users' ? 'bg-eciBlue text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100'}`}><FaUsers className="inline mr-2"/> Voters List</button>
          <button onClick={() => { localStorage.removeItem('jwt_token'); navigate('/'); }} className="px-4 py-2 font-bold rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors ml-4 shadow"><FaSignOutAlt className="inline mr-2"/> Logout</button>
        </div>
      </div>

      <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-2xl overflow-hidden min-h-[500px] border border-slate-200">
        {activeTab === 'register' && <AdminRegisterTab />}
        {activeTab === 'users' && <AdminUsersTab />}
        {activeTab === 'stats' && <AdminStatsTab />}
      </div>
    </div>
  );
}

function AdminRegisterTab() {
  const [name, setName] = useState('');
  const [aadhaarId, setAadhaarId] = useState('');
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleRegister = async () => {
    setError(null); setSuccess(null);
    if (!name.trim() || !aadhaarId.trim() || aadhaarId.length < 12) return setError("Ensure name and 12-digit Aadhaar ID are provided.");
    if (!imageSrc) return setError("Please capture a clear biometric profile.");

    setLoading(true);
    try {
      await api.post('/admin/register-voter', { name, aadhaar_id: aadhaarId, image: imageSrc });
      setSuccess("Voter registered successfully.");
      setName(''); setAadhaarId(''); setImageSrc(null);
      // Logic for reset-camera can be handled by a key on WebcamCapture
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed remotely.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 border-b pb-2">Manual Voter Enrollment</h2>
      <Alert type="error" message={error} />
      <Alert type="success" message={success} />
      <div className="space-y-4">
        <div><label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-eciBlue outline-none" /></div>
        <div><label className="block text-sm font-semibold text-slate-700 mb-1">Aadhaar ID</label><input type="text" value={aadhaarId} onChange={e => setAadhaarId(e.target.value.replace(/[^0-9]/g, ''))} maxLength={12} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-eciBlue outline-none font-mono" /></div>
        <div className="py-2 my-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Capture Master Template</label>
          <WebcamCapture onCapture={setImageSrc} key={imageSrc === null ? 'reset' : 'active'} />
        </div>
        <button onClick={handleRegister} disabled={loading} className="w-full bg-eciBlue hover:bg-blue-800 text-white font-bold py-3 rounded-lg flex justify-center mt-6 shadow-md">
          {loading ? 'Processing...' : 'Enroll Voter Entity'}
        </button>
      </div>
    </motion.div>
  );
}

function AdminUsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/admin/stats').then(res => { setUsers(res.data.users || []); setLoading(false); }).catch(e => { console.error(e); setLoading(false); });
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this voter? This action is absolute and irreversible.")) return;

    try {
      await api.delete(`/admin/delete-user/${userId}`);
      // Remove from UI without refresh
      setUsers(prev => prev.filter(u => u.id !== userId));
      alert("User deleted successfully");
    } catch (error) {
      console.error("Delete failed", error);
      alert(error.response?.data?.error || "Failed to delete entity");
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500 font-bold">Fetching secure ledgers...</div>;

  return (
    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="p-8">
      <h2 className="text-2xl font-black text-eciBlue mb-6 border-b pb-2 uppercase tracking-wide">Registered Entities Ledger</h2>
      <table className="w-full text-left border-collapse bg-white border">
        <thead>
          <tr className="bg-slate-100 text-slate-600 text-sm">
            <th className="p-4 border-b">Aadhaar Key / ID</th>
            <th className="p-4 border-b">Citizen Name</th>
            <th className="p-4 border-b text-center">Threat Score</th>
            <th className="p-4 border-b text-center">Lock Status</th>
            <th className="p-4 border-b text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-b last:border-0 hover:bg-slate-50">
              <td className="p-4"><span className="font-mono font-bold text-slate-800 block">{u.aadhaar_id}</span><span className="text-[10px] text-slate-400 font-mono tracking-widest">{u.id}</span></td>
              <td className="p-4 font-semibold text-slate-700">{u.name}</td>
              <td className="p-4 text-center"><span className={`px-2 py-1 rounded text-xs font-bold ${u.risk_score > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{u.risk_score}</span></td>
              <td className="p-4 text-center">{u.has_voted ? <span className="text-green-600 font-bold text-sm">VOTED</span> : <span className="text-blue-600 font-bold text-sm">PENDING</span>}</td>
              <td className="p-4 text-right">
                <button 
                  onClick={() => handleDelete(u.id)}
                  className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-md font-bold text-xs transition-colors border border-red-200 hover:border-red-600"
                >
                  DELETE
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}

function AdminStatsTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const chartColors = ['#e74c3c', '#2ecc71', '#f1c40f', '#3498db'];

  const chartData = useMemo(() => {
    if (!stats) return { barData: null, pieData: null };
    const partyKeys = Object.keys(stats.parties);
    const partyValues = Object.values(stats.parties);
    
    return {
      barData: {
        labels: partyKeys,
        datasets: [{ label: 'Votes Registered', data: partyValues, backgroundColor: chartColors, borderRadius: 4 }]
      },
      pieData: {
        labels: partyKeys.map((k, i) => {
          const val = partyValues[i];
          const pct = stats.total_votes > 0 ? ((val / stats.total_votes) * 100).toFixed(1) : 0;
          return `${k} (${pct}%)`;
        }),
        datasets: [{ data: partyValues, backgroundColor: chartColors, errorWidth: 0, borderWidth: 2, borderColor: '#fff' }]
      }
    };
  }, [stats]);

  if (loading) return <div className="p-12 text-center font-bold text-eciBlue tracking-widest text-xl">Aggregating Global Matrix...</div>;
  if (!stats) return <div className="p-12 text-center text-red-500 font-bold">Failed to decrypt statistics payload.</div>;

  return (
    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="border border-slate-200 rounded-2xl p-6 bg-gradient-to-br from-white to-slate-50 shadow text-center md:text-left">
           <p className="text-sm font-black text-slate-500 uppercase tracking-widest mb-2">Total Votes</p>
           <p className="text-5xl font-black text-eciBlue">{stats.total_votes}</p>
        </div>
        <div className="md:col-span-2 grid grid-cols-4 gap-4">
          {Object.entries(stats.parties).map(([party, count], idx) => (
             <div key={party} className="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm flex flex-col justify-center items-center">
                 <h4 className="font-extrabold text-lg text-slate-800" style={{color: chartColors[idx]}}>{party}</h4>
                 <p className="font-black text-3xl text-slate-700">{count}</p>
                 <span className="text-xs text-slate-400 font-bold mt-1">
                    {stats.total_votes > 0 ? ((count / stats.total_votes) * 100).toFixed(1) : 0}%
                 </span>
             </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border border-slate-200 rounded-2xl p-6 bg-white shadow flex flex-col">
          <h3 className="font-black text-xl mb-4 text-eciBlue text-center border-b pb-2">Votes Per Party Vector</h3>
          <div className="flex-1 min-h-[300px] flex items-center justify-center p-4">
             {stats.total_votes > 0 ? <Bar data={chartData.barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }}}} /> : <p className="text-slate-400 font-bold text-center">Awaiting initial ballot arrays.</p>}
          </div>
        </div>
        
        <div className="border border-slate-200 rounded-2xl p-6 bg-white shadow flex flex-col">
          <h3 className="font-black text-xl mb-4 text-eciBlue text-center border-b pb-2">Percentage Distribution Engine</h3>
          <div className="flex-1 min-h-[300px] flex items-center justify-center p-4">
            {stats.total_votes > 0 ? <Pie data={chartData.pieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { weight: 'bold' } } } } }} /> : <p className="text-slate-400 font-bold text-center">Insufficient quorum.</p>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
