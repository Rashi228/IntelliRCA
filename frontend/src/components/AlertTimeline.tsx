import { useState } from 'react';
import { type Alert } from '../services/api';
import { Terminal, Clock, Server, Layers, ChevronDown, ChevronUp } from 'lucide-react';

interface AlertTimelineProps {
  alerts: Alert[];
}

export function AlertTimeline({ alerts }: AlertTimelineProps) {
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedAlertId(expandedAlertId === id ? null : id);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d111d] rounded-2xl border border-slate-800/60 shadow-sm overflow-hidden text-left">
      <div className="p-5 border-b border-slate-800/60 flex items-center justify-between bg-[#131825]/45">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-5 h-5 text-slate-400" />
          <h3 className="font-bold text-white text-base">Alert Sequence Replay</h3>
        </div>
        <span className="text-[11px] font-mono font-bold text-slate-400 bg-[#131825] border border-slate-800 px-2 py-0.5 rounded-md">
          {alerts.length} Events
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {alerts.map((alert, index) => {
          const isCritical = alert.severity === 'critical';
          const isWarning = alert.severity === 'warning';

          let indicatorBg = 'bg-blue-500';
          let borderStyle = 'border-l-blue-500';
          if (isCritical) {
            indicatorBg = 'bg-red-500';
            borderStyle = 'border-l-red-500';
          } else if (isWarning) {
            indicatorBg = 'bg-amber-500';
            borderStyle = 'border-l-amber-500';
          }

          return (
            <div key={alert.id} className="relative flex gap-4 pl-2">
              {/* Vertical line connector */}
              {index < alerts.length - 1 && (
                <span
                  className="absolute left-[13px] top-6 bottom-[-32px] w-[2px] bg-slate-800"
                  aria-hidden="true"
                />
              )}

              {/* Status dot */}
              <div className="relative z-10 flex items-center justify-center">
                <span className={`w-3.5 h-3.5 rounded-full ${indicatorBg} border-2 border-[#090d16] shadow-sm`} />
              </div>

              {/* Alert Content Card */}
              <div className={`flex-1 bg-[#131825] border border-slate-800/80 ${borderStyle} border-l-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden`}>
                <div
                  className="p-4 flex items-start justify-between gap-4 cursor-pointer select-none"
                  onClick={() => toggleExpand(alert.id)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                        isCritical ? 'bg-red-500/10 text-red-400 border border-red-500/20' : isWarning ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium font-mono">
                        {alert.id}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-200 text-sm">{alert.title}</h4>
                    <p className="text-slate-400 text-xs line-clamp-1">{alert.description}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-medium text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" /> {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                    {expandedAlertId === alert.id ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {expandedAlertId === alert.id && (
                  <div className="px-4 pb-4 border-t border-slate-850 bg-[#090d16]/30 p-3.5 space-y-3 font-mono text-[11px]">
                    <div className="grid grid-cols-2 gap-2 text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-bold text-slate-300">Host:</span> {alert.host}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-bold text-slate-300">Service:</span> {alert.service}
                      </div>
                    </div>
                    <div className="bg-[#090d16] text-slate-300 border border-slate-800 p-3 rounded-lg overflow-x-auto select-all max-w-full leading-relaxed">
                      {`{\n  "alert_id": "${alert.id}",\n  "title": "${alert.title}",\n  "description": "${alert.description}",\n  "severity": "${alert.severity}",\n  "source": "${alert.source}",\n  "service": "${alert.service}",\n  "host": "${alert.host}",\n  "timestamp": "${alert.timestamp}"\n}`}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
