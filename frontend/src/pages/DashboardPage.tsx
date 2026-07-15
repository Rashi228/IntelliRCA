import { useAuth } from '../context/AuthContext';
import { Shield, Settings, Users, Activity, LogOut, Database, Network, BrainCircuit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-[var(--color-light-bg)] selection:bg-blue-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col relative z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <span className="font-extrabold text-xl text-slate-800 tracking-tight">IntelliRCA</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 mt-2 px-2">
            Operations
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-700 font-bold transition-all shadow-[inset_0_0_0_1px_rgba(37,99,235,0.1)]">
            <Shield className="w-5 h-5" /> Live Alerts
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 font-semibold hover:bg-slate-50 hover:text-slate-900 transition-all">
            <Network className="w-5 h-5" /> Knowledge Graph
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 font-semibold hover:bg-slate-50 hover:text-slate-900 transition-all">
            <Database className="w-5 h-5" /> RCA Engine
          </button>

          {/* Admin Only Section */}
          {user?.role === 'Admin' && (
            <>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 mt-8 px-2">
                Administration
              </div>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 font-semibold hover:bg-slate-50 hover:text-slate-900 transition-all">
                <Users className="w-5 h-5" /> Manage Users
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 font-semibold hover:bg-slate-50 hover:text-slate-900 transition-all">
                <Settings className="w-5 h-5" /> System Settings
              </button>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-slate-200 mb-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-slate-800 truncate">{user?.name}</div>
              <div className="text-xs font-semibold text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded-full mt-1">
                {user?.role}
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full btn-3d flex items-center justify-center gap-2 text-red-600 hover:text-red-700 border-slate-200 shadow-sm">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto relative">
        <header className="mb-10 flex justify-between items-end">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Welcome back, {user?.name.split(' ')[0]}</h1>
            <p className="text-slate-500 font-medium text-lg">Here's your {user?.role} overview for today.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="px-4 py-2.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold border border-emerald-200 flex items-center gap-2 shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            System Operational
          </motion.div>
        </header>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-glass p-6">
            <div className="flex items-center gap-3 text-slate-500 font-semibold mb-4">
               <Shield className="w-5 h-5 text-red-500" /> Active Incidents
            </div>
            <div className="text-5xl font-extrabold text-slate-800">12</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-glass p-6">
            <div className="flex items-center gap-3 text-slate-500 font-semibold mb-4">
               <Network className="w-5 h-5 text-blue-500" /> Correlated Alerts
            </div>
            <div className="text-5xl font-extrabold text-slate-800">1,204</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-glass p-6">
            <div className="flex items-center gap-3 text-slate-500 font-semibold mb-4">
               <BrainCircuit className="w-5 h-5 text-emerald-500" /> AI Confidence
            </div>
            <div className="text-5xl font-extrabold text-slate-800">94<span className="text-2xl text-slate-400">%</span></div>
          </motion.div>
        </div>

        {/* RCA Visualization Placeholder */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card-glass p-8 h-[450px] flex flex-col">
          <div className="font-bold text-slate-800 text-lg mb-6">Live Incident Knowledge Graph</div>
          <div className="flex-1 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center relative overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
            <Network className="w-32 h-32 text-slate-200 absolute opacity-50" />
            <div className="text-center z-10">
              <div className="text-sm font-semibold text-slate-500 mb-4 max-w-sm mx-auto">
                React Flow / Cytoscape Interactive Graph will be rendered here.
              </div>
              <button className="btn-primary">Initialize Graph Engine</button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
