import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ShieldAlert, Activity, User, Clock, Search, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export function AuditLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Strict RBAC on the route level
  if (user?.role !== 'Admin') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    const fetchLogs = async () => {
      if (!isSupabaseConfigured()) {
        setLogs([
          { id: '1', action: 'Login', user_email: 'admin@intellirca.com', user_role: 'Admin', created_at: new Date().toISOString() },
          { id: '2', action: 'Trigger Simulation', resource_id: 'INC-8876', user_email: 'admin@intellirca.com', user_role: 'Admin', created_at: new Date(Date.now() - 60000).toISOString() }
        ]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase!
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
          
        if (error) throw error;
        setLogs(data || []);
      } catch (err) {
        console.error("Error fetching audit logs:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(search.toLowerCase()) || 
    (log.user_email && log.user_email.toLowerCase().includes(search.toLowerCase())) ||
    (log.resource_id && log.resource_id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-50 text-slate-800 font-sans">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 bg-white flex items-center px-6 justify-between z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
            <ShieldAlert size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            Enterprise <span className="text-indigo-600">Audit Logs</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by action, user, or ID..." 
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter size={16} /> Filter
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-hidden flex flex-col">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-semibold w-48">Timestamp</th>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                  <th className="px-6 py-4 font-semibold">Resource</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-10 text-slate-400">Loading audit trail...</td></tr>
                ) : filteredLogs.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-slate-400">No logs found.</td></tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 flex items-center gap-2">
                        <Clock size={14} className="text-slate-400" />
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                            {log.user_email ? log.user_email.charAt(0).toUpperCase() : '?'}
                          </div>
                          <span className="text-sm font-medium text-slate-700">{log.user_email || 'System'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                          log.user_role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {log.user_role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Activity size={14} className="text-slate-400" />
                          <span className="text-sm text-slate-800 font-medium">{log.action}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.resource_id ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200 font-mono">
                            {log.resource_type ? `${log.resource_type}: ` : ''}{log.resource_id}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400 italic">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}
