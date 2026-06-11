import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  // Using jwt_token from local storage to perform basic UI swap logic.
  // We use standard localStorage key set previously in login endpoints.
  const token = localStorage.getItem('jwt_token');

  return (
    <nav className="bg-eciBlue text-white shadow-md border-b-4 border-eciOrange sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-widest uppercase">FaceVote AI</span>
              <span className="text-xs text-blue-200 font-medium tracking-wide">Biometric Voting System</span>
            </div>
          </Link>
          <div className="flex items-center gap-4 text-sm font-semibold">
            {token ? (
              <button 
                onClick={() => navigate("/admin")}
                className="bg-white text-eciBlue px-5 py-2 rounded-lg hover:bg-slate-100 shadow font-bold transition-all"
              >
                Admin Dashboard
              </button>
            ) : (
              <button 
                onClick={() => navigate("/admin-login")}
                className="bg-white/10 text-white border border-white/30 px-5 py-2 rounded-lg hover:bg-white hover:text-eciBlue shadow font-bold transition-all"
              >
                Admin Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
