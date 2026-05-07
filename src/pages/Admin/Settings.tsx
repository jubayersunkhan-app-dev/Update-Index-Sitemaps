import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Trash2, 
  Save, 
  HelpCircle, 
  Bell, 
  Calendar,
  ShieldAlert,
  Zap,
  RotateCcw
} from 'lucide-react';
import api from '../../lib/api';

export default function SystemSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/api/admin/settings');
      setSettings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      await api.post('/api/admin/settings', settings);
      setMsg({ type: 'success', text: 'Settings updated successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to update settings.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center">Loading system config...</div>;

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <Settings className="text-blue-600" />
          System Configuration
        </h1>
        <p className="text-slate-500">Fine-tune the indexing engine and automated rules.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {msg.text && (
          <div className={`p-4 rounded-xl border flex items-center gap-3 font-semibold ${msg.type === 'success' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
            {msg.type === 'success' ? <Zap size={18} /> : <ShieldAlert size={18} />}
            {msg.text}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Quota & Cleanup */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 pb-4 border-b border-slate-50">
              <Calendar size={18} className="text-blue-600" />
              Resource Management
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Log Retention (Days)</label>
                <div className="relative">
                  <input 
                    type="number"
                    value={settings.retention_days}
                    onChange={(e) => setSettings({ ...settings, retention_days: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">Days</div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Max Links Per Submission</label>
                <input 
                  type="number"
                  value={settings.max_per_submit}
                  onChange={(e) => setSettings({ ...settings, max_per_submit: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Submission Cooldown</label>
                <div className="relative">
                  <input 
                    type="number"
                    value={settings.cooldown_minutes}
                    onChange={(e) => setSettings({ ...settings, cooldown_minutes: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">Minutes</div>
                </div>
              </div>
            </div>
          </div>

          {/* User Automation */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 pb-4 border-b border-slate-50">
              <RotateCcw size={18} className="text-blue-600" />
              Onboarding Logic
            </h3>
            
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                Auto-Authorize New Users
                <input 
                  type="checkbox"
                  checked={!!settings.auto_authorize_new_users}
                  onChange={(e) => setSettings({ ...settings, auto_authorize_new_users: e.target.checked ? 1 : 0 })}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                />
              </label>
              <p className="text-xs text-slate-400 leading-relaxed mt-2">
                If enabled, new registrants get instant access for 7 days. If disabled, they require manual approval.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-50 space-y-4">
              <div className="flex items-center justify-between">
                 <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1">
                   <Bell size={12} /> Low Quota Alerts
                 </label>
                 <input 
                  type="checkbox"
                  checked={!!settings.quota_msg_enabled}
                  onChange={(e) => setSettings({ ...settings, quota_msg_enabled: e.target.checked ? 1 : 0 })}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>
              <input 
                type="text"
                value={settings.quota_msg}
                onChange={(e) => setSettings({ ...settings, quota_msg: e.target.value })}
                placeholder="Alert message..."
                disabled={!settings.quota_msg_enabled}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 outline-none text-sm disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Messaging */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 pb-4 border-b border-slate-50">
            <HelpCircle size={18} className="text-blue-600" />
            User Dashboard Help Text
          </h3>
          <textarea 
            value={settings.help_text}
            onChange={(e) => setSettings({ ...settings, help_text: e.target.value })}
            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium text-slate-600 leading-relaxed"
            placeholder="Paste instructions for your users here..."
          />
        </div>

        <div className="flex justify-end">
          <button 
            type="submit"
            disabled={saving}
            className="px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:bg-slate-300"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><Save size={20} /> Deploy Configuration</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
