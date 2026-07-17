import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Settings,
  Users,
  Activity,
  LogOut,
  Database,
  Network,
  BrainCircuit,
  Terminal,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Component Imports
import { IncidentGraph } from '../components/IncidentGraph';
import { AlertTimeline } from '../components/AlertTimeline';
import { RcaDetails } from '../components/RcaDetails';
import { FeedbackModal } from '../components/FeedbackModal';

// API Imports
import {
  type Incident,
  type IncidentSubgraph,
  getIncidents,
  getIncidentSubgraph
} from '../services/api';

export function DashboardPage() {
  const { 
    isStreaming, 
    events, 
    rcaReport, 
    graphNodes, 
    startStream,
    historicalIncidents,
    fetchHistoricalIncidents,
    loadHistoricalIncident
  } = useIntelliRCAStream();
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'topology' | 'semantic'>('semantic');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // State Management
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [subgraph, setSubgraph] = useState<IncidentSubgraph | null>(null);
  const [isGraphLoading, setIsGraphLoading] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Fetch incidents list on mount
  const loadDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const data = await getIncidents();
      setIncidents(data);
      if (data.length > 0 && !selectedIncident) {
        setSelectedIncident(data[0]);
      } else if (selectedIncident) {
        // Refresh currently selected incident
        const updated = data.find(inc => inc.id === selectedIncident.id);
        if (updated) setSelectedIncident(updated);
      }
    } catch (error) {
      console.error("Failed to load incidents.", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Fetch topology graph when selected incident changes
  useEffect(() => {
    if (!selectedIncident) return;
    const fetchGraph = async () => {
      setIsGraphLoading(true);
      try {
        const data = await getIncidentSubgraph(selectedIncident.id);
        setSubgraph(data);
      } catch (error) {
        console.error("Failed to load incident topology graph.", error);
      } finally {
        setIsGraphLoading(false);
      }
    };
    fetchGraph();
  }, [selectedIncident]);

  return (
    <div className="min-h-screen flex bg-[#090d16] font-sans selection:bg-indigo-950 antialiased text-slate-300">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0d111d] text-slate-300 flex flex-col relative z-10 shadow-lg shrink-0 border-r border-slate-800/60">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="font-extrabold text-xl text-white tracking-tight">IntelliRCA</span>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-2 px-2">
            Operations
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-800/60 text-white font-bold transition-all border border-slate-700/50 shadow-sm text-sm">
            <Shield className="w-4 h-4 text-indigo-400" /> Incident Center
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all text-sm font-semibold">
            <Network className="w-4 h-4" /> Topology Graph
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all text-sm font-semibold">
            <Database className="w-4 h-4" /> RCA History
          </button>

          {/* Admin Section */}
          {user?.role === 'Admin' && (
            <>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-6 px-2">
                Administration
              </div>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all text-sm font-semibold">
                <Users className="w-4 h-4" /> Manage Users
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all text-sm font-semibold">
                <Settings className="w-4 h-4" /> System Settings
              </button>
            </>
          )}
        </nav>

        {/* User profile & sign out */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/20 space-y-3">
          <div className="flex items-center gap-3 px-3 py-2 bg-slate-800/40 rounded-xl border border-slate-800/80">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-sm">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden text-left">
              <div className="text-xs font-bold text-white truncate">{user?.name}</div>
              <div className="text-[9px] font-extrabold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-md inline-block mt-0.5 uppercase tracking-wide">
                {user?.role}
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full py-2 bg-red-950/20 hover:bg-red-950/40 text-red-400 rounded-xl flex items-center justify-center gap-2 text-xs font-bold border border-red-900/30 transition-all">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#090d16]">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800/60 bg-[#0d111d] px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-left">
            <h1 className="text-sm font-extrabold text-slate-200 tracking-tight uppercase">Active SRE Control Board</h1>
            {selectedIncident && (
              <div className="flex items-center gap-2">
                <span className="text-slate-600">/</span>
                <select
                  value={selectedIncident.id}
                  onChange={(e) => {
                    const inc = incidents.find(i => i.id === e.target.value);
                    if (inc) setSelectedIncident(inc);
                  }}
                  className="bg-[#131825] hover:bg-[#1a2033] border border-slate-800 rounded-lg px-3 py-1 text-xs font-bold text-slate-300 focus:outline-none transition-all cursor-pointer"
                >
                  {incidents.map((inc) => (
                    <option key={inc.id} value={inc.id}>{inc.id} - {inc.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={loadDashboardData}
              disabled={isRefreshing}
              className={`p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
              title="Refresh Incidents"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="px-3.5 py-1.5 rounded-full bg-emerald-950/30 text-emerald-400 text-xs font-extrabold border border-emerald-900/40 flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              API Pipelines Online
            </div>
          </div>
        </header>

        {/* Dashboard Grid Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Active Incident Profile Header */}
          {selectedIncident && (
            <div className="bg-[#0d111d] border border-slate-800/60 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                    selectedIncident.severity === 'critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {selectedIncident.severity}
                  </span>
                  <span className="text-xs text-slate-500 font-mono font-semibold">{selectedIncident.id}</span>
                  <span className="text-slate-700">•</span>
                  <span className="text-xs text-slate-400 font-medium">Triggered {new Date(selectedIncident.createdAt).toLocaleString()}</span>
                </div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">{selectedIncident.title}</h2>
                <p className="text-slate-400 text-sm font-medium">{selectedIncident.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Affected Services</div>
                  <div className="flex gap-1 mt-1">
                    {selectedIncident.affectedServices.map((svc) => (
                      <span key={svc} className="text-[10px] font-bold bg-[#131825] text-slate-400 px-2 py-0.5 rounded-md border border-slate-800/85">
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0d111d] border border-slate-800/60 rounded-2xl p-5 shadow-sm text-left flex justify-between items-center">
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Targeted Incidents</div>
                <div className="text-3xl font-extrabold text-white">{incidents.length}</div>
              </div>
              <Activity className="w-8 h-8 text-indigo-500/80" />
            </div>
            <div className="bg-[#0d111d] border border-slate-800/60 rounded-2xl p-5 shadow-sm text-left flex justify-between items-center">
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Correlated Alerts</div>
                <div className="text-3xl font-extrabold text-white">
                  {incidents.reduce((acc, curr) => acc + curr.alerts.length, 0)}
                </div>
              </div>
              <Terminal className="w-8 h-8 text-blue-500/80" />
            </div>
            <div className="bg-[#0d111d] border border-slate-800/60 rounded-2xl p-5 shadow-sm text-left flex justify-between items-center">
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Agent RCA Target</div>
                <div className="text-3xl font-extrabold text-white">94<span className="text-lg text-slate-500 font-semibold">%</span></div>
              </div>
              <BrainCircuit className="w-8 h-8 text-emerald-500/80" />
            </div>
          </div>

          {/* Workspace split */}
          {selectedIncident && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Topology Map (8/12) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Knowledge Graph Card */}
                <div className="bg-[#0d111d] border border-slate-800/60 rounded-2xl p-5 shadow-sm flex flex-col text-left h-[450px]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <Network className="w-4 h-4 text-indigo-400" /> Active Incident Knowledge Graph (Neo4j)
                    </h3>
                    <span className="text-[10px] text-slate-500 font-semibold font-mono">Module 2.5 Dynamic Topology</span>
                  </div>

                  <div className="flex-1 min-h-0">
                    {isGraphLoading || !subgraph ? (
                      <div className="w-full h-full bg-slate-900/40 border border-slate-800 rounded-xl flex items-center justify-center">
                        <span className="text-xs text-slate-500 font-semibold animate-pulse">Loading Neo4j subgraphs...</span>
                      </div>
                    ) : (
                      <IncidentGraph subgraph={subgraph} />
                    )}
                  </div>
                </div>

                {/* Timeline Card */}
                <AlertTimeline alerts={selectedIncident.alerts} />
              </div>

              {/* Right Column: Multi-Agent Analysis Console (5/12) */}
              <div className="lg:col-span-5 h-full">
                <RcaDetails
                  incidentId={selectedIncident.id}
                  incidentTitle={selectedIncident.title}
                  alerts={selectedIncident.alerts}
                  onFeedbackClick={() => setIsFeedbackOpen(true)}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Engineer Feedback Overlay Modal */}
      {isFeedbackOpen && selectedIncident && (
        <FeedbackModal
          incidentId={selectedIncident.id}
          affectedServices={selectedIncident.affectedServices}
          onClose={() => setIsFeedbackOpen(false)}
        />
      )}
    </div>
  );
}
