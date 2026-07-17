import { useState } from 'react';
import { type RcaReport, analyzeIncident } from '../services/api';
import { Brain, Sparkles, Activity, AlertTriangle, CheckCircle, BookOpen } from 'lucide-react';

interface RcaDetailsProps {
  incidentId: string;
  incidentTitle: string;
  alerts: any[];
  onFeedbackClick: () => void;
}

export function RcaDetails({ incidentId, incidentTitle, alerts, onFeedbackClick }: RcaDetailsProps) {
  const [report, setReport] = useState<RcaReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setReport(null);
    try {
      const result = await analyzeIncident(incidentId, { title: incidentTitle, alerts });
      setReport(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate RCA analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d111d] rounded-2xl border border-slate-800/60 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-800/60 flex items-center justify-between bg-[#131825]/45">
        <div className="flex items-center gap-2.5">
          <Brain className="w-5 h-5 text-indigo-400 animate-pulse" />
          <h3 className="font-bold text-white text-base">Multi-Agent AI RCA Engine</h3>
        </div>
        {!report && !isLoading && (
          <button onClick={handleAnalyze} className="btn-primary flex items-center gap-1.5 py-1.5 px-3.5 text-xs bg-indigo-600 hover:bg-indigo-700 font-bold text-white border-none cursor-pointer">
            <Sparkles className="w-3.5 h-3.5" /> Analyze Root Cause
          </button>
        )}
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Idle state */}
        {!report && !isLoading && !error && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <Brain className="w-16 h-16 text-slate-700 mb-4" />
            <h4 className="font-bold text-white mb-1">RCA Engine Idle</h4>
            <p className="text-slate-400 text-xs max-w-sm leading-relaxed mb-4">
              Trigger the multi-agent investigation framework to parse downstream logs, topology nodes, and incident history.
            </p>
            <button onClick={handleAnalyze} className="btn-primary flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-none cursor-pointer">
              <Sparkles className="w-4 h-4" /> Run LangGraph Analyzer
            </button>
          </div>
        )}

        {/* Loading state: Agent workflow steps visualization */}
        {isLoading && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-indigo-950/20 border border-indigo-900/30 rounded-xl">
              <Activity className="w-5 h-5 text-indigo-400 animate-spin" />
              <div className="text-left">
                <div className="font-bold text-indigo-200 text-sm">AI Agent Reasoning Active</div>
                <div className="text-[11px] text-indigo-400 font-medium">Orchestrating state nodes & retrieving playbooks...</div>
              </div>
            </div>

            {/* Agent processing timeline */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-950/40 border border-emerald-900/30 flex items-center justify-center mt-0.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-300 text-xs">Coordinator Agent</div>
                  <div className="text-slate-500 text-[10px] font-mono">Initialized LangGraph state machine. (OK)</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-950/40 border border-indigo-900/30 flex items-center justify-center mt-0.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-indigo-400 text-xs">Graph Analyzer</div>
                  <div className="text-slate-400 text-[10px] font-mono">Executing Cypher path queries on Neo4j topology...</div>
                </div>
              </div>
              <div className="flex items-start gap-3 opacity-50">
                <div className="w-5 h-5 rounded-full bg-slate-900/40 border border-slate-800/30 flex items-center justify-center mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-400 text-xs">Business Impact Agent</div>
                  <div className="text-slate-500 text-[10px] font-mono">Pending correlation score results...</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}

        {/* Completed Report view */}
        {report && (
          <div className="space-y-6 text-left">
            {/* Header info / confidence */}
            <div className="flex items-center justify-between p-4 bg-[#131825] border border-slate-850 rounded-xl">
              <div className="space-y-1">
                <div className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Root Cause Verdict</div>
                <div className="font-bold text-slate-200 text-sm line-clamp-1">{report.root_cause}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">AI Confidence</div>
                <div className="font-extrabold text-indigo-400 text-lg">
                  {Math.round(report.confidence_score * 100)}%
                </div>
              </div>
            </div>

            {/* Structured Findings */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Business Impact
                </h4>
                <div className="text-sm font-semibold text-slate-300 p-3 bg-red-500/5 border border-red-900/30 rounded-xl">
                  {report.business_impact}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Recommended Action Playbook
                </h4>
                <div className="text-sm font-semibold text-slate-300 p-3 bg-emerald-500/5 border border-emerald-900/30 rounded-xl">
                  {report.recommended_remediation}
                </div>
              </div>
            </div>

            {/* Markdown Report Render Area */}
            <div className="border-t border-slate-800/80 pt-6">
              <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1.5 mb-3">
                <BookOpen className="w-3.5 h-3.5 text-indigo-450" /> Full Agent Summary
              </h4>
              <div className="prose prose-sm font-sans text-slate-300 bg-[#090d16] border border-slate-800/80 p-5 rounded-2xl overflow-y-auto max-h-[250px] leading-relaxed text-xs">
                <pre className="whitespace-pre-wrap font-sans">{report.markdown_report}</pre>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 border-t border-slate-800/85 pt-5">
              <button onClick={onFeedbackClick} className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-xl border-none cursor-pointer text-xs transition-colors">
                Correct AI Summary
              </button>
              <button onClick={handleAnalyze} className="px-4 py-2.5 bg-[#131825] hover:bg-[#1e2538] text-slate-300 border border-slate-800 rounded-xl cursor-pointer text-xs font-bold transition-colors">
                Re-Run Analysis
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
