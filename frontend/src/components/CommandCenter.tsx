import React, { useState } from 'react';
import { Play, ShieldAlert, Cpu, Activity, Clock, Zap, Lock } from 'lucide-react';
import type { RCAReport } from '../hooks/useIntelliRCAStream';
import { useAuth } from '../context/AuthContext';
import { logAuditAction } from '../lib/audit';

interface CommandCenterProps {
  onTrigger: (payload: any) => void;
  isStreaming: boolean;
  rcaReport: RCAReport | null;
}

export function CommandCenter({ onTrigger, isStreaming, rcaReport }: CommandCenterProps) {
  const { user } = useAuth();
  const [incidentId, setIncidentId] = useState('INC-' + Math.floor(1000 + Math.random() * 9000));

  const handleSimulate = () => {
    logAuditAction({
      action: 'TRIGGER_SIMULATION',
      resource_type: 'INCIDENT',
      resource_id: incidentId,
      status: 'SUCCESS'
    });

    const payload = {
      incident_id: incidentId,
      raw_incident_data: {
        title: "Database CPU Spike & API Latency",
        description: "The postgres-cluster is sitting at 96% CPU, which is causing the frontend user-login API to time out.",
        alerts: ["sim-cpu-001", "sim-latency-005"],
        time_window: { start: new Date().toISOString() },
        affected_services: ["frontend", "user-login-api", "postgres-cluster"]
      }
    };
    onTrigger(payload);
    // Gen new ID for next time
    setIncidentId('INC-' + Math.floor(1000 + Math.random() * 9000));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Simulation Control Panel */}
      <div className="aiops-panel p-6 flex flex-col gap-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Zap size={100} />
        </div>
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-blue-600" size={24} />
          <h2 className="text-xl font-bold text-slate-800">Command Center</h2>
        </div>
        
        <p className="text-sm text-slate-500">
          Simulate a real-time infrastructure incident to observe IntelliRCA's LangGraph agents autonomously investigating and resolving the issue.
        </p>

        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100 mt-2">
          <span className="text-sm text-slate-600 font-mono">Target ID:</span>
          <span className="text-sm text-blue-700 font-mono font-bold">{incidentId}</span>
        </div>

        {user?.role === 'SRE' ? (
          <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center gap-2 text-slate-500 text-sm">
            <Lock size={16} />
            <span>Simulations restricted to Admin role</span>
          </div>
        ) : (
          <button 
            onClick={handleSimulate}
            disabled={isStreaming}
            className={`btn-primary mt-2 flex items-center justify-center gap-2 w-full ${isStreaming ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isStreaming ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyzing...</span>
              </div>
            ) : (
              <>
                <Play size={18} />
                <span>Trigger Simulation</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* AI Intelligence Summary Panel */}
      <div className="aiops-panel p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <Cpu className="text-teal-500" size={24} />
          <h2 className="text-xl font-bold text-slate-800">AI Intelligence</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2 shrink-0">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col">
            <span className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1"><Activity size={12}/> Confidence</span>
            <span className="text-2xl font-bold text-blue-900">
              {rcaReport?.confidence_score ? (rcaReport.confidence_score * 100).toFixed(0) + '%' : '--'}
            </span>
          </div>
          <div className="bg-teal-50 p-4 rounded-lg border border-teal-100 flex flex-col">
            <span className="text-xs text-teal-600 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1"><Clock size={12}/> MTTI (Est.)</span>
            <span className="text-2xl font-bold text-teal-900">
              {rcaReport ? '< 15s' : '--'}
            </span>
          </div>
        </div>

        {rcaReport && (
          <div className="mt-4 flex flex-col gap-3">
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <span className="text-xs text-orange-700 font-bold uppercase tracking-wider">Business Impact</span>
              <p className="text-sm text-orange-900 mt-1">{rcaReport.business_impact}</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
              <span className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Remediation</span>
              <p className="text-sm text-emerald-900 mt-1">{rcaReport.recommended_remediation}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex-1">
              <span className="text-xs text-blue-700 font-bold uppercase tracking-wider">Root Cause</span>
              <div className="text-sm text-blue-900 mt-2 whitespace-pre-wrap font-mono text-xs">
                {rcaReport.root_cause}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
