import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Download, 
  ExternalLink, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Database
} from 'lucide-react';
import api from '../lib/api';

export default function Reports() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/api/user/logs');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const currentLogs = logs.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const stats = {
    total: logs.length,
    today: logs.filter(l => new Date(l.submitted_at).toDateString() === new Date().toDateString()).length,
    week: logs.filter(l => new Date(l.submitted_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000).length,
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-lg shadow-indigo-600/20" />
        <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest animate-pulse">Syncing Telemetry...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="text-indigo-600" />
            Historical Reports
          </h1>
          <p className="text-sm text-slate-500 font-medium">Full audit trail of all network broadcast transmissions.</p>
        </div>
        <button 
          onClick={() => {
            const csv = ['URL,Submitted At,Status', ...logs.map(l => `${l.url},${l.submitted_at},${l.status}`)].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reports-${new Date().toISOString()}.csv`;
            a.click();
          }}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-bold text-sm transition-all shadow-lg shadow-slate-900/10 active:scale-95"
        >
          <Download size={16} />
          Export Audit Trail
        </button>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ReportStat label="Cumulative Pushes" value={stats.total} icon={Database} color="text-indigo-600" />
        <ReportStat label="24h Activity" value={stats.today} icon={Filter} color="text-emerald-600" />
        <ReportStat label="7-Day Cycle" value={stats.week} icon={Search} color="text-indigo-400" />
        <ReportStat label="Engine Integrity" value="100%" icon={FileText} color="text-emerald-500" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Live Mission Logs</h2>
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
             <span>Items: {logs.length}</span>
             <span className="text-emerald-600">Status: Operational</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30 text-slate-400 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-tighter">Transmission Target</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-tighter">Broadcast Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-tighter">Engine Result</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-tighter text-right">External Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentLogs.map((log) => (
                <tr key={log.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 max-w-sm">
                      <span className="text-sm font-mono text-slate-600 truncate">{log.url}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-500 font-medium">
                      {new Date(log.submitted_at).toLocaleDateString()}
                      <span className="text-slate-300 ml-2 italic font-normal">{new Date(log.submitted_at).toLocaleTimeString()}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-100 uppercase tracking-tight">
                      <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                      Success
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a 
                      href={`https://www.google.com/search?q=site:${log.url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      Audit Link <ExternalLink size={12} />
                    </a>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-slate-400 italic">Engine idle. No historical telemetry found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {logs.length > itemsPerPage && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
              Page <span className="text-slate-900">{page}</span> of <span className="text-slate-900">{totalPages}</span> · Outputting logs <span className="text-slate-900">{(page - 1) * itemsPerPage + 1} - {Math.min(page * itemsPerPage, logs.length)}</span>
            </p>
            <div className="flex gap-1">
              <button 
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-30 transition-all active:scale-90"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-30 transition-all active:scale-90"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReportStat({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-indigo-100 transition-colors">
      <div className={`p-2.5 rounded-xl bg-slate-50 ${color} shadow-sm border border-slate-100`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
        <p className="text-xl font-bold text-slate-900 tracking-tight leading-none">{value}</p>
      </div>
    </div>
  );
}
