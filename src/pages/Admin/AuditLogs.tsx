import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Trash2, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  User,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../../lib/api';

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/api/admin/logs');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurge = async () => {
    if (confirm('Are you absolutely sure you want to PERMANENTLY delete ALL system logs? This cannot be undone.')) {
      try {
        await api.post('/api/admin/logs/purge');
        fetchLogs();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredLogs = logs.filter(l => 
    l.url.toLowerCase().includes(search.toLowerCase()) || 
    l.username.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const currentLogs = filteredLogs.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (loading) return <div className="p-12 text-center text-slate-400">Loading audit database...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-blue-600" />
            System Audit Log
          </h1>
          <p className="text-slate-500 text-sm">Monitor all indexing activity across the entire platform.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Filter by user or URL..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none w-full md:w-64"
            />
          </div>
          <button 
            onClick={handlePurge}
            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all flex items-center gap-2 font-bold text-sm border border-red-100"
          >
            <Trash2 size={18} />
            <span className="hidden md:inline">Purge DB</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subscriber</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resource URL</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentLogs.map((log) => (
                <tr key={log.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {log.username[0].toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{log.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs md:max-w-md">
                    <p className="text-xs font-mono text-slate-500 truncate">{log.url}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[10px] font-bold text-slate-400 leading-none">
                      {new Date(log.submitted_at).toLocaleDateString()}
                    </p>
                    <p className="text-[10px] text-slate-300 mt-1">
                      {new Date(log.submitted_at).toLocaleTimeString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[10px] font-bold">
                      {log.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <a 
                      href={`https://www.google.com/search?q=site:${log.url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-slate-300 hover:text-blue-600 transition-colors"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No matching logs found in the audit trail.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredLogs.length > itemsPerPage && (
          <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/50">
            <p className="text-sm text-slate-500">
              Showing <span className="font-bold">{(page - 1) * itemsPerPage + 1}</span> to <span className="font-bold">{Math.min(page * itemsPerPage, filteredLogs.length)}</span> of <span className="font-bold">{filteredLogs.length}</span>
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
