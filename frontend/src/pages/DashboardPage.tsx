import React, { useState, useEffect } from 'react';
import { useIntelliRCAStream } from '../hooks/useIntelliRCAStream';
import { CommandCenter } from '../components/CommandCenter';
import { Timeline } from '../components/Timeline';
import { KnowledgeGraph } from '../components/KnowledgeGraph';
import { SemanticGraph } from '../components/SemanticGraph';
import { ShieldAlert, Network, Share2, History, X, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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

  useEffect(() => {
    fetchHistoricalIncidents();
  }, [fetchHistoricalIncidents]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden text-slate-800 font-sans" style={{ backgroundColor: 'var(--color-aiops-bg)' }}>
      
      {/* Global Top Navbar */}
      <header className="h-16 border-b border-blue-100 bg-white/60 backdrop-blur-md flex items-center px-6 justify-between z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldAlert size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            Intelli<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-500">RCA</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            <History size={16} />
            Past Incidents
          </button>
          
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-slate-700">System Operational</span>
          </div>
          
          <div className="flex items-center gap-4 border-l border-blue-200 pl-4">
            <span className="text-sm text-slate-600 font-medium">{user?.name || 'Engineer'} <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded ml-1">{user?.role}</span></span>
            <button onClick={logout} className="text-xs bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden relative">
        {/* Left Column: Command Center & AI Intelligence */}
        <div className="col-span-3 h-full min-h-0 overflow-y-auto custom-scrollbar pr-2 flex flex-col">
          <CommandCenter 
            onTrigger={(payload) => startStream(payload.incident_id, payload)} 
            isStreaming={isStreaming} 
            rcaReport={rcaReport}
          />
        </div>

        {/* Center Column: Explainable AI Timeline */}
        <div className="col-span-4 h-full min-h-0 flex flex-col">
          <Timeline events={events} />
        </div>

        {/* Right Column: Dynamic Knowledge Graph / Semantic Graph */}
        <div className="col-span-5 h-full min-h-0 flex flex-col relative">
          {activeTab === 'topology' ? (
            <KnowledgeGraph discoveredNodes={graphNodes} />
          ) : (
            <SemanticGraph discoveredNodes={graphNodes} />
          )}

          {/* Floating Tab Switcher (Bottom Right) */}
          <div className="absolute bottom-6 right-6 z-20 flex bg-white/90 backdrop-blur-sm p-1 rounded-xl border border-slate-200 shadow-lg">
            <button
              onClick={() => setActiveTab('semantic')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'semantic' 
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-200/50' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Share2 size={14} /> Semantic Cluster
            </button>
            <button
              onClick={() => setActiveTab('topology')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'topology' 
                  ? 'bg-teal-50 text-teal-700 shadow-sm border border-teal-200/50' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Network size={14} /> Causal Flow
            </button>
          </div>
        </div>
      </main>

      {/* History Sidebar */}
      <div className={`fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-slate-200 z-50 transform transition-transform duration-300 ease-in-out ${isHistoryOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 text-slate-800">
            <History size={18} className="text-indigo-600" />
            <h2 className="font-bold text-lg">Incident History</h2>
          </div>
          <button onClick={() => setIsHistoryOpen(false)} className="text-slate-400 hover:text-slate-800">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-3">
          {historicalIncidents.length === 0 ? (
            <div className="text-center text-slate-500 mt-10">No past incidents found.</div>
          ) : (
            historicalIncidents.map((incident: any) => (
              <div 
                key={incident.id} 
                onClick={() => {
                  loadHistoricalIncident(incident);
                  setIsHistoryOpen(false);
                }}
                className="p-4 border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer bg-white group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {incident.target_id}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(incident.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1 group-hover:text-indigo-700 transition-colors line-clamp-2">
                  {incident.title}
                </h3>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Confidence</span>
                    <span className="text-sm font-bold text-emerald-600">{incident.confidence}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Status</span>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5">{incident.status}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Overlay */}
      {isHistoryOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
          onClick={() => setIsHistoryOpen(false)}
        />
      )}
    </div>
  );
}
