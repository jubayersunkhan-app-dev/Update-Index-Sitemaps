import { useState, useEffect } from 'react';
import { 
  Users, 
  Globe, 
  BarChart3, 
  Activity, 
  TrendingUp, 
  Link as LinkIcon,
  Calendar,
  Layers
} from 'lucide-react';
import { motion } from 'motion/react';
import api from '../../lib/api';

export default function AdminStats() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [sRes, uRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/users')
      ]);
      setStats(sRes.data);
      setUsers(uRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[400px]">
       <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-lg shadow-indigo-600/20" />
          <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest">Compiling System Metrics...</p>
       </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Infrastructure Telemetry</h1>
          <p className="text-slate-500 text-sm font-medium">Real-time performance metrics across the indexing network.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 font-bold text-[10px] uppercase">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Cluster Online
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard label="24h Volume" value={stats?.today} trend="+12.5%" icon={TrendingUp} color="indigo" sub="pushes today" />
        <AdminStatCard label="T-24h Cycle" value={stats?.yesterday} trend="-3%" icon={Calendar} color="slate" sub="previous day" />
        <AdminStatCard label="7-Day Sprint" value={stats?.week} trend="+50%" icon={Activity} color="indigo" sub="weekly growth" />
        <AdminStatCard label="User Distribution" value={users.filter(u => u.is_active).length} trend={`${users.length} Total`} icon={Users} color="emerald" sub="active accounts" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent User Signups */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[450px]">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
               <Layers size={14} className="text-indigo-500" />
               <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Network Enrollment Log</h2>
            </div>
            <button className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest hover:underline">User Management</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400">
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-tighter">Identified User</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-tighter">Access Tier</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-tighter">Operational Status</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-tighter">Node Usage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.slice(-10).reverse().map((user_row) => (
                  <tr key={user_row.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600 border border-indigo-100">
                          {user_row.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-none">{user_row.username}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono">{user_row.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-widest ${user_row.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm shadow-indigo-100/50' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                        {user_row.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${user_row.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-400'}`} />
                          <span className={`text-[10px] font-bold uppercase tracking-tight ${user_row.is_active ? 'text-emerald-700' : 'text-rose-600'}`}>{user_row.is_active ? 'Online' : 'Locked'}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-24">
                        <div className="flex justify-between text-[9px] font-bold text-slate-400 mb-1 leading-none">
                          <span>{user_row.total_submitted}</span>
                          <span>{user_row.total_limit}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((user_row.total_submitted / user_row.total_limit) * 100, 100)}%` }}
                            className={`h-full ${user_row.total_submitted / user_row.total_limit > 0.8 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Health & Status */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
               <BarChart3 size={14} className="text-indigo-600" />
               <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Platform Integrity Gauges</h3>
            </div>
            <div className="space-y-6">
              <HealthGauge label="Database Integrity" percent={100} color="emerald" />
              <HealthGauge label="Broadcast Latency" percent={88} color="indigo" />
              <HealthGauge label="Master Node Cluster" percent={95} color="emerald" />
              <HealthGauge label="API Gateway Performance" percent={99} color="indigo" />
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl text-white shadow-xl shadow-slate-900/10 relative overflow-hidden group border border-slate-800">
            <Globe className="absolute -right-6 -bottom-6 w-32 h-32 text-indigo-500 rotate-12 opacity-5 focus:scale-110 transition-transform duration-500 group-hover:opacity-20" />
            <div className="relative z-10">
               <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">IX</div>
                  <h3 className="font-bold text-sm uppercase tracking-widest">Broadcast Core</h3>
               </div>
               <p className="text-slate-400 text-xs leading-relaxed mb-6">Autonomous engine currently managing 24 encrypted master nodes across global regions.</p>
               <div className="flex items-center gap-3">
                  <div className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-bold uppercase tracking-widest">Stable</div>
                  <div className="px-2 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-[9px] font-bold uppercase tracking-widest">Engine v2.4.0</div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminStatCard({ label, value, trend, icon: Icon, color, sub }: any) {
  const themes: any = {
    indigo: 'border-indigo-100 bg-indigo-50/20',
    emerald: 'border-emerald-100 bg-emerald-50/20',
    slate: 'border-slate-200 bg-white'
  };
  
  const textColors: any = {
    indigo: 'text-indigo-600',
    emerald: 'text-emerald-600',
    slate: 'text-slate-900'
  };

  return (
    <div className={`p-5 rounded-xl border shadow-sm relative overflow-hidden group transition-all hover:bg-white hover:shadow-md ${themes[color] || themes.slate}`}>
      <Icon className={`absolute -right-4 -bottom-4 w-20 h-20 opacity-[0.03] group-hover:scale-110 transition-transform ${textColors[color]}`} />
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 leading-none">
        {label}
      </p>
      <div className="flex items-baseline justify-between mt-1">
        <h4 className={`text-2xl font-bold tracking-tight ${textColors[color]}`}>{value}</h4>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${color === 'slate' ? 'bg-slate-100 text-slate-500' : 'bg-white text-indigo-600 shadow-sm border'}`}>
          {trend}
        </span>
      </div>
      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight mt-1 truncate italic">
         {sub}
      </p>
    </div>
  );
}

function HealthGauge({ label, percent, color }: any) {
  const colors: any = {
    emerald: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]',
    indigo: 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]'
  };
  return (
    <div>
      <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">
        <span>{label}</span>
        <span className="text-slate-900">{percent}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          className={`h-full ${colors[color] || colors.indigo}`}
        />
      </div>
    </div>
  );
}
