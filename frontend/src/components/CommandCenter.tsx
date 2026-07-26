import React, { useState } from 'react';
import { Play, ShieldAlert, Cpu, Activity, Clock, Zap, Lock, Award, CheckCircle } from 'lucide-react';
import type { RCAReport } from '../hooks/useIntelliRCAStream';
import { useAuth } from '../context/AuthContext';
import { logAuditAction } from '../lib/audit';
import { FeedbackModal } from './FeedbackModal';

interface CommandCenterProps {
  onTrigger: (payload: any) => void;
  isStreaming: boolean;
  rcaReport: RCAReport | null;
}

export function CommandCenter({ onTrigger, isStreaming, rcaReport }: CommandCenterProps) {
  const { user } = useAuth();
  const [incidentId, setIncidentId] = useState('INC-' + Math.floor(1000 + Math.random() * 9000));
  const [lastPolledIncident, setLastPolledIncident] = useState<string | null>(() => {
    return localStorage.getItem('intellirca_last_polled_incident');
  });
  const isInitialMount = React.useRef(true);
  const currentId = lastPolledIncident || incidentId;
  const [showFeedback, setShowFeedback] = useState(false);
  const [isVerified, setIsVerified] = useState(() => {
    const resolvedList = JSON.parse(localStorage.getItem('intellirca_resolved_incidents') || '[]');
    return resolvedList.includes(currentId);
  });

  React.useEffect(() => {
    const checkResolved = () => {
      const resolvedList = JSON.parse(localStorage.getItem('intellirca_resolved_incidents') || '[]');
      setIsVerified(resolvedList.includes(currentId));
    };
    checkResolved();
    window.addEventListener('storage', checkResolved);
    return () => window.removeEventListener('storage', checkResolved);
  }, [currentId]);

  // Poll Gateway for new live incidents automatically
  React.useEffect(() => {
    if (isStreaming) return; // Don't poll while an RCA is actively streaming
    
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch('http://localhost:8090/api/v1/incidents/latest');
        const data = await res.json();
        if (data.incident && data.incident.incident_id !== lastPolledIncident) {
          const newId = data.incident.incident_id;
          setLastPolledIncident(newId);
          localStorage.setItem('intellirca_last_polled_incident', newId);

          // If this is the initial check after page reload or tab opening, do not replay stale history
          if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
          }
          isInitialMount.current = false;

          setIsVerified(false);
          
          logAuditAction({
            action: 'LIVE_INCIDENT_DETECTED',
            resource_type: 'INCIDENT',
            resource_id: newId,
            status: 'SUCCESS'
          });
          
          const payload = {
            incident_id: newId,
            raw_incident_data: data.incident
          };
          onTrigger(payload);
        } else {
          isInitialMount.current = false;
        }
      } catch (err) {
        // Gateway might not be running or no live incident
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [isStreaming, lastPolledIncident, onTrigger]);

  const handleManualTrigger = () => {
    if (isStreaming) return;
    const newId = 'INC-' + Math.floor(1000 + Math.random() * 9000);
    setIncidentId(newId);
    setIsVerified(false);
    
    logAuditAction({
      action: 'MANUAL_RCA_TRIGGERED',
      resource_type: 'INCIDENT',
      resource_id: newId,
      status: 'SUCCESS'
    });

    onTrigger({ incident_id: newId });
  };

  return (
    <div className="aiops-panel flex flex-col h-full overflow-hidden">
      {/* Top Bar */}
      <div className="p-4 border-b border-blue-100 bg-white flex items-center justify-between rounded-t-xl shadow-sm">
        <div className="flex items-center gap-2">
          <Activity className="text-indigo-600 animate-pulse" size={20} />
          <h2 className="text-base font-bold text-slate-800">Autonomous RCA Engine</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded text-slate-600 font-bold border border-slate-200">
            {lastPolledIncident || incidentId}
          </span>
        </div>
      </div>

      {/* Main Control Area */}
      <div className="p-6 flex-1 flex flex-col justify-between overflow-y-auto custom-scrollbar">
        {!rcaReport && !isStreaming ? (
          <div className="bg-slate-50 border border-slate-200/80 p-6 rounded-xl text-center my-auto flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
              <Activity className="animate-pulse" size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Live Telemetry Listener Active</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                Awaiting real-time anomaly alerts from Prometheus & Kafka event streams.
              </p>
            </div>
          </div>
        ) : isStreaming ? (
          <div className="bg-indigo-50/50 border border-indigo-200/60 p-6 rounded-xl text-center my-auto flex flex-col items-center justify-center gap-3 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-indigo-950">Autonomous Agent Reasoning...</h3>
              <p className="text-xs text-indigo-700 mt-1 max-w-xs leading-relaxed">
                Analyzing causal graphs, evaluating vector embeddings, and synthesizing root cause.
              </p>
            </div>
          </div>
        ) : null}

        {/* Live Metrics / Status Panel */}
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

            {!isVerified ? (
              user?.role === 'SRE' ? (
                <button 
                  onClick={() => setShowFeedback(true)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer border-none"
                >
                  <Award size={16} /> SRE Verify & Mark Resolved (HITL)
                </button>
              ) : (
                <div className="w-full py-2.5 px-4 bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-2xs">
                  <Clock size={15} className="text-amber-600 animate-pulse" />
                  <span>Pending SRE Verification & Sign-off</span>
                </div>
              )
            ) : (
              <div className="w-full py-3 px-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm">
                <CheckCircle size={16} className="text-emerald-600" /> SRE Verified & Committed to Institutional Memory
              </div>
            )}
          </div>
        )}
      </div>

      {showFeedback && (
        <FeedbackModal 
          incidentId={lastPolledIncident || incidentId}
          affectedServices={['user-login-api', 'postgres-cluster']}
          onClose={() => setShowFeedback(false)}
          onSuccess={() => {
            setIsVerified(true);
            setShowFeedback(false);
          }}
        />
      )}
    </div>
  );
}
