import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Edit3, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Lock,
  Unlock,
  Save,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../../lib/api';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/api/admin/users/${editingUser.id}`, editingUser);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center">Loading users...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Users className="text-blue-600" />
            User Management
          </h1>
          <p className="text-slate-500">Control permissions, quotas, and account status.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full md:w-80 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subscriber</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Limits (Daily/Total)</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expiration</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold relative ${user.is_active ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                        {user.username[0].toUpperCase()}
                        <div className={`absolute -right-1 -bottom-1 w-3 h-3 rounded-full border-2 border-white ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{user.username}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-bold text-slate-600 px-2 py-1 bg-slate-100 rounded-md">D: {user.daily_limit}</span>
                       <span className="text-xs font-bold text-slate-600 px-2 py-1 bg-slate-100 rounded-md">T: {user.total_limit}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <Calendar size={14} className="text-slate-300" />
                      {user.access_expiry_date ? new Date(user.access_expiry_date).toLocaleDateString() : 'NO EXPIRY'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setEditingUser(user)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Edit3 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setEditingUser(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <Shield size={18} className="text-blue-600" />
                  Edit Permissions: {editingUser.username}
                </h2>
                <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateUser} className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Daily Limit</label>
                    <input 
                      type="number"
                      value={editingUser.daily_limit}
                      onChange={(e) => setEditingUser({ ...editingUser, daily_limit: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Total Limit</label>
                    <input 
                      type="number"
                      value={editingUser.total_limit}
                      onChange={(e) => setEditingUser({ ...editingUser, total_limit: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Access Expiry</label>
                  <input 
                    type="date"
                    value={editingUser.access_expiry_date ? editingUser.access_expiry_date.split('T')[0] : ''}
                    onChange={(e) => setEditingUser({ ...editingUser, access_expiry_date: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Account Status</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setEditingUser({ ...editingUser, is_active: 1 })}
                      className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                        editingUser.is_active 
                          ? 'bg-green-50 border-green-200 text-green-600 ring-2 ring-green-500/10' 
                          : 'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      <Unlock size={18} /> Enabled
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingUser({ ...editingUser, is_active: 0 })}
                      className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                        !editingUser.is_active 
                          ? 'bg-red-50 border-red-200 text-red-600 ring-2 ring-red-500/10' 
                          : 'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      <Lock size={18} /> Disabled
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  <Save size={20} />
                  Save User Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
