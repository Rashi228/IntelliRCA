import React, { useEffect, useRef } from 'react';
import { Network, BrainCircuit, Activity, CheckCircle2, CircleDashed, TerminalSquare } from 'lucide-react';
import type { TimelineEvent } from '../hooks/useIntelliRCAStream';

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as new events stream in
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const getAgentIcon = (agent: string) => {
    switch (agent) {
      case 'graph':
      case 'topology':
        return <Network size={16} className="text-teal-400" />;
      case 'memory':
        return <BrainCircuit size={16} className="text-purple-400" />;
      case 'system':
      case 'coordinator':
        return <TerminalSquare size={16} className="text-slate-400" />;
      case 'rca':
      case 'business_impact':
      case 'remediation':
      case 'consensus_validator':
        return <Activity size={16} className="text-blue-400" />;
      default:
        return <Activity size={16} className="text-slate-400" />;
    }
  };

  const getAgentColor = (agent: string) => {
    switch (agent) {
      case 'graph':
      case 'topology':
        return 'text-teal-400 border-teal-400/30 bg-teal-400/10';
      case 'memory':
        return 'text-purple-400 border-purple-400/30 bg-purple-400/10';
      case 'system':
      case 'coordinator':
        return 'text-slate-400 border-slate-400/30 bg-slate-400/10';
      default:
        return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
    }
  };

  return (
    <div className="aiops-panel flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-blue-100 bg-white flex items-center justify-between rounded-t-xl">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <BrainCircuit size={20} className="text-blue-600" />
          Explainable AI Timeline
        </h2>
        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-200 font-semibold">
          Live Agent Execution
        </span>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 relative custom-scrollbar"
      >
        {/* Continuous left border line */}
        <div className="absolute left-10 top-8 bottom-8 w-px bg-blue-200" />

        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
            <CircleDashed size={40} className="opacity-20 text-blue-400" />
            <p className="font-medium text-slate-500">Awaiting Incident Trigger...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 relative">
            {events.map((evt, idx) => (
              <div key={evt.id} className="flex gap-4 group">
                <div className="relative z-10 flex-shrink-0 flex items-center justify-center mt-1">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-white shadow-sm ${getAgentColor(evt.agent).replace('bg-', '')}`}>
                    {evt.status === 'started' ? (
                      <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse" />
                    ) : (
                      getAgentIcon(evt.agent)
                    )}
                  </div>
                </div>

                <div className="flex-1 bg-white border border-blue-100 rounded-lg p-4 shadow-sm group-hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-700">
                        {evt.agent}
                      </span>
                      {evt.status === 'completed' && <CheckCircle2 size={14} className="text-teal-500" />}
                    </div>
                    <span className="text-xs text-slate-400 font-mono font-medium">
                      {new Date(evt.timestamp).toISOString().split('T')[1].slice(0, -1)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-slate-600 whitespace-pre-wrap">
                    {evt.details ? (
                      // Render structured details from agent (like timeline logic, business impact)
                      <div className="flex flex-col gap-2">
                        {Object.entries(evt.details).map(([key, value]) => {
                          // Exclude massive objects from timeline
                          if (key === 'final_rca_report' || key === 'supporting_graph_nodes') return null;
                          return (
                            <div key={key} className="bg-slate-50 p-2 rounded border border-slate-200">
                              <span className="text-xs text-slate-500 block mb-1 font-mono font-semibold">{key}</span>
                              <span className="font-mono text-xs text-slate-700">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="italic text-slate-400 opacity-80">{evt.status} step...</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
