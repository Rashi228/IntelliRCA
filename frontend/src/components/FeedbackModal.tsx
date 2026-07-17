import { useState } from 'react';
import { submitFeedback } from '../services/api';
import { X, Send, Award, CheckCircle } from 'lucide-react';

interface FeedbackModalProps {
  incidentId: string;
  affectedServices: string[];
  onClose: () => void;
}

export function FeedbackModal({ incidentId, affectedServices, onClose }: FeedbackModalProps) {
  const [correctedRootCause, setCorrectedRootCause] = useState('');
  const [correctedRemediation, setCorrectedRemediation] = useState('');
  const [severity, setSeverity] = useState('critical');
  const [services, setServices] = useState<string[]>(affectedServices);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitFeedback({
        incident_id: incidentId,
        corrected_root_cause: correctedRootCause,
        corrected_remediation: correctedRemediation,
        severity,
        affected_services: services
      });
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      alert("Failed to submit feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#000000]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d111d] rounded-2xl border border-slate-800/80 shadow-2xl max-w-lg w-full overflow-hidden transition-all duration-300 transform scale-100">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#131825]/45 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            <h3 className="font-extrabold text-white text-sm tracking-tight">
              SRE Engineer Feedback Loop
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Success Splash */}
        {isSuccess ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <CheckCircle className="w-16 h-16 text-emerald-400 animate-bounce" />
            <h4 className="font-extrabold text-white text-lg">Feedback Ingested Successfully</h4>
            <p className="text-slate-400 text-xs font-medium">Memory weights re-aligned. Model training vector created.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Incident Ref: <span className="font-mono text-slate-300 font-semibold">{incidentId}</span>
            </div>

            {/* Corrected Root Cause */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">Corrected Root Cause</label>
              <textarea
                required
                rows={2}
                value={correctedRootCause}
                onChange={(e) => setCorrectedRootCause(e.target.value)}
                placeholder="Describe the exact root cause identified by manual verification..."
                className="w-full text-xs font-medium border border-slate-800 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-[#090d16] text-slate-200"
              />
            </div>

            {/* Corrected Remediation */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">Corrected Remediation Action</label>
              <textarea
                required
                rows={2}
                value={correctedRemediation}
                onChange={(e) => setCorrectedRemediation(e.target.value)}
                placeholder="Specify the exact instructions / scripts executed to resolve..."
                className="w-full text-xs font-medium border border-slate-800 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-[#090d16] text-slate-200"
              />
            </div>

            {/* Severity and Service mappings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">Severity Override</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full text-xs border border-slate-800 rounded-xl p-2.5 bg-[#090d16] text-slate-350 focus:outline-none"
                >
                  <option value="critical">Critical</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">Affected Services</label>
                <input
                  type="text"
                  value={services.join(', ')}
                  onChange={(e) => setServices(e.target.value.split(',').map(s => s.trim()))}
                  placeholder="Service list comma-separated"
                  className="w-full text-xs border border-slate-800 rounded-xl p-2.5 bg-[#090d16] text-slate-300 focus:outline-none"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
              <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-850 text-xs font-bold text-slate-400 rounded-xl hover:bg-slate-800/40 hover:text-slate-200 bg-transparent transition-all cursor-pointer">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer border-none"
              >
                {isSubmitting ? 'Ingesting...' : 'Submit to Memory'} <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
