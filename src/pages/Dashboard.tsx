import React, { useState, useEffect } from 'react';
import { 
  motion, 
  AnimatePresence 
} from 'motion/react';
import { 
  Send, 
  AlertTriangle, 
  ExternalLink, 
  CheckCircle2, 
  Clock,
  Zap,
  Check
} from 'lucide-react';
import api from '../lib/api';

export default function Dashboard({ user }: any) {
  const [profile, setProfile] = useState<any>(null);
  const [urls, setUrls] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, lRes, sRes] = await Promise.all([
        api.get('/api/user/profile'),
        api.get('/api/user/logs'),
        api.get('/api/admin/settings') // Accessible to all for help text/cooldown
      ]);
      setProfile(pRes.data);
      setLogs(lRes.data);
      setSettings(sRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const urlList = urls.split('\n').map(u => u.trim()).filter(u => u.length > 0);
    
    if (urlList.length === 0) return setError('Please enter at least one URL');
    if (urlList.length > (settings?.max_per_submit || 50)) return setError(`Max ${settings.max_per_submit} URLs per submission allowed`);

    setLoading(true);
    try {
      const res = await api.post('/api/broadcast', { urls: urlList });
      setSuccess(`Successfully submitted ${res.data.submitted} URLs!`);
      setUrls('');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit URLs');
    } finally {
      setLoading(true);
      setTimeout(() => setLoading(false), 2000); // UI visual cooldown
    }
  };

  const lineCount = urls.split('\n').filter(l => l.trim().length > 0).length;
  
  const dailyPercent = profile ? Math.round(((profile.daily_limit - profile.today_submitted) / profile.daily_limit) * 100) : 100;
  const totalPercent = profile ? Math.round(((profile.total_limit - profile.total_submitted) / profile.total_limit) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Quick Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Today's Allotment" 
          value={`${profile?.today_submitted || 0} / ${profile?.daily_limit || 0}`}
          color="text-slate-900"
          icon={Send}
          sub={`${dailyPercent}% left`}
          percent={100 - dailyPercent}
        />
        <StatCard 
          label="Successful Indexing" 
          value="91.4%"
          color="text-emerald-600"
          icon={CheckCircle2}
          sub="avg engine"
          percent={91.4}
        />
        <StatCard 
          label="Lifetime Volume" 
          value={profile?.total_submitted || 0}
          color="text-indigo-600"
          icon={Zap}
          sub="broadcasts"
          percent={100 - totalPercent}
        />
        <StatCard 
          label="Account Status" 
          value={profile?.is_active ? 'Active' : 'Locked'}
          color={profile?.is_active ? 'text-indigo-600' : 'text-rose-600'}
          icon={profile?.is_active ? CheckCircle2 : XCircle}
          sub={profile?.access_expiry_date ? new Date(profile.access_expiry_date).toLocaleDateString() : 'no expiry'}
          percent={profile?.is_active ? 100 : 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* URL Submission Area */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-indigo-500 fill-indigo-500" />
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Index Broadcast Engine</h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Lines: {lineCount} / {settings?.max_per_submit || 50}</span>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="relative flex-1">
              <textarea 
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                className="w-full min-h-[320px] p-4 text-sm font-mono text-slate-700 bg-slate-50 focus:outline-none focus:bg-white transition-colors resize-none placeholder:text-slate-300"
                placeholder="https://example.com/page-1&#10;https://example.com/page-2"
              />
              {loading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Broadcasting...</p>
                  </div>
                </div>
              )}
            </div>

            {error && <div className="px-4 py-2 bg-rose-50 text-rose-600 text-[11px] font-bold border-y border-rose-100">{error}</div>}
            {success && <div className="px-4 py-2 bg-emerald-50 text-emerald-600 text-[11px] font-bold border-y border-emerald-100">{success}</div>}

            <div className="p-3 bg-white border-t border-slate-100 flex justify-end items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-400 font-medium">Cooldown: {settings?.cooldown_minutes || 1}m</span>
                <span className="text-[10px] text-slate-500 italic">Batch limit: {settings?.max_per_submit || 50}</span>
              </div>
              <button 
                type="submit"
                disabled={loading || lineCount === 0 || !profile?.is_active}
                className="px-8 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800 disabled:opacity-50 transition-all active:scale-95 flex items-center gap-2"
              >
                <Send size={14} /> Submit Network Broadcast
              </button>
            </div>
          </form>
        </div>

        {/* Quota & Limits Area */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-600">User Quotas</h2>
          </div>
          <div className="p-5 space-y-8 flex-1">
            <div>
              <div className="flex justify-between text-[11px] font-bold mb-2">
                <span className="text-slate-500 uppercase tracking-tighter">Daily Allocation</span>
                <span className={dailyPercent < 20 ? 'text-rose-600' : 'text-slate-900'}>{profile?.today_submitted || 0} / {profile?.daily_limit || 0}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${100 - dailyPercent}%` }}
                  className={`h-full ${dailyPercent < 20 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">Refreshes every 24 hours</p>
            </div>
            
            <div>
              <div className="flex justify-between text-[11px] font-bold mb-2">
                <span className="text-slate-500 uppercase tracking-tighter">Monthly Capacity</span>
                <span className={totalPercent < 20 ? 'text-rose-600' : 'text-slate-900'}>{profile?.total_submitted || 0} / {profile?.total_limit || 0}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${100 - totalPercent}%` }}
                  className={`h-full ${totalPercent < 20 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                />
              </div>
              {totalPercent < 20 && (
                <p className="text-[10px] text-rose-500 mt-2 font-bold flex items-center gap-1">
                  <AlertCircle size={10} /> Critical: Plan Upgrade Suggested
                </p>
              )}
            </div>

            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <p className="text-[10px] text-indigo-700 font-bold uppercase tracking-widest mb-2">Sub Tier Info</p>
              <p className="text-sm font-bold text-indigo-900 mb-1">Elite Professional Tier</p>
              <p className="text-[10px] text-indigo-600/70 font-medium">{settings?.help_text?.substring(0, 80) || 'Standard access active.'}...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Audit Log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Live Indexing Telemetry</h2>
          <button className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest hover:underline">Full Audit Report</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 border-b border-slate-100">
                <th className="px-6 py-3 font-bold uppercase tracking-tighter">Broadcast Time</th>
                <th className="px-6 py-3 font-bold uppercase tracking-tighter">Target Link Segment</th>
                <th className="px-6 py-3 font-bold uppercase tracking-tighter">Status</th>
                <th className="px-6 py-3 font-bold uppercase tracking-tighter text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.length > 0 ? logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-500 font-medium italic">
                    {new Date(log.submitted_at).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600 truncate max-w-xs xl:max-w-md">
                    {log.url}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-tight">
                      <CheckIcon size={8} /> Success
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a 
                      href={`https://www.google.com/search?q=site:${log.url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <SearchIcon size={14} />
                    </a>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                    Telemtry waiting for engine ignition...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon, sub, percent }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between min-h-[100px]"
    >
      <div className="flex-1">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-xl font-bold ${color} truncate`}>{value}</p>
        <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden w-full max-w-[80px]">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            className={`h-full ${color.replace('text', 'bg')}`}
          />
        </div>
        <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-tighter italic">{sub}</p>
      </div>
      <div className="p-2 bg-slate-50 rounded-lg text-slate-400 shrink-0">
        <Icon size={16} />
      </div>
    </motion.div>
  );
}

// Fixed icon naming to avoid conflicts
import { 
  Search as SearchIcon, 
  XCircle, 
  AlertCircle, 
  Check as CheckIcon,
  HardDrive as HardDriveIcon,
  ShieldAlert as ShieldIcon
} from 'lucide-react';
