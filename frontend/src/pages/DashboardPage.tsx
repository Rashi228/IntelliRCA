import React, { useState, useEffect } from 'react';
import { useIntelliRCAStream } from '../hooks/useIntelliRCAStream';
import { CommandCenter } from '../components/CommandCenter';
import { Timeline } from '../components/Timeline';
import { KnowledgeGraph } from '../components/KnowledgeGraph';
import { SemanticGraph } from '../components/SemanticGraph';
import { ShieldAlert, Network, Share2, History, X, Clock, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FeedbackModal } from '../components/FeedbackModal';

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
  const [feedbackIncident, setFeedbackIncident] = useState<any | null>(null);

  useEffect(() => {
    fetchHistoricalIncidents();
    const interval = setInterval(() => {
      fetchHistoricalIncidents();
    }, 3000);
    return () => clearInterval(interval);
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

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <History size={15} className="text-indigo-600" />
            <span>Incident History ({historicalIncidents.length})</span>
          </button>

          <div className="h-4 w-px bg-slate-200" />

          <div className="flex items-center gap-3">
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold text-slate-800">{user?.name || 'Engineer'}</span>
              <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.2 rounded inline-block self-end mt-0.5">{user?.role || 'SRE Admin'}</span>
            </div>
            <button 
              onClick={logout}
              className="text-xs font-medium text-slate-400 hover:text-red-600 transition-colors px-2 py-1"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace 3-Column Layout */}
      <main className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden relative">
        
        {/* Left Column: Command & Control (3 cols) */}
        <div className="col-span-3 flex flex-col h-full overflow-hidden">
          <CommandCenter 
            onTrigger={(payload) => startStream(payload.incident_id, payload)} 
            isStreaming={isStreaming} 
            rcaReport={rcaReport} 
          />
        </div>

        {/* Center Column: Knowledge Graph Visualization (5 cols) */}
        <div className="col-span-5 flex flex-col h-full overflow-hidden aiops-panel relative bg-white">
          <div className="p-2.5 border-b border-slate-200/80 bg-slate-50/90 flex flex-wrap items-center justify-between gap-2 shrink-0 z-10">
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200/80 shadow-2xs">
              <button
                onClick={() => setActiveTab('semantic')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer border-none ${
                  activeTab === 'semantic' 
                    ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-xs' 
                    : 'text-slate-600 hover:bg-slate-100 bg-transparent'
                }`}
              >
                <Share2 size={14} />
                <span>Semantic Cluster</span>
              </button>
              <button
                onClick={() => setActiveTab('topology')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer border-none ${
                  activeTab === 'topology' 
                    ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-xs' 
                    : 'text-slate-600 hover:bg-slate-100 bg-transparent'
                }`}
              >
                <Network size={14} />
                <span>Topological Graph</span>
              </button>
            </div>
            <span className="text-xs font-semibold text-slate-500 pr-2">
              {activeTab === 'semantic' ? '🧠 Quantitative Cluster Space' : '🔗 Causal Blast Radius Space'}
            </span>
          </div>

          <div className="flex-1 w-full min-h-0 relative">
            {activeTab === 'semantic' ? (
              <SemanticGraph discoveredNodes={graphNodes} />
            ) : (
              <KnowledgeGraph discoveredNodes={graphNodes} />
            )}
          </div>
        </div>

        {/* Right Column: Reasoning Timeline & Audit Log (4 cols) */}
        <div className="col-span-4 flex flex-col h-full overflow-hidden">
          <Timeline events={events} />
        </div>

      </main>

      {/* Slide-over Incident History Drawer */}
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
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded mt-0.5 ${incident.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {incident.status}
                    </span>
                  </div>
                </div>
                {incident.status !== 'Resolved' && user?.role === 'SRE' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setFeedbackIncident(incident);
                    }}
                    className="mt-3 w-full py-1.5 px-3 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all border-none cursor-pointer"
                  >
                    <Award size={14} /> SRE Verify & Mark Resolved
                  </button>
                )}
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

      {feedbackIncident && (
        <FeedbackModal 
          incidentId={feedbackIncident.target_id || feedbackIncident.id}
          affectedServices={['user-login-api', 'postgres-cluster']}
          onClose={() => setFeedbackIncident(null)}
          onSuccess={() => {
            fetchHistoricalIncidents();
            setFeedbackIncident(null);
          }}
        />
      )}
    </div>
  );
}
