import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Plus, 
  Trash2, 
  Save, 
  HardDrive, 
  ExternalLink, 
  Key,
  Database,
  Unplug
} from 'lucide-react';
import api from '../../lib/api';

export default function Connections() {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rawText, setRawText] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const res = await api.get('/api/admin/connections');
      setConnections(res.data);
      setRawText(res.data.map((c: any) => `${c.master_url} | ${c.api_key}`).join('\n'));
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
      await api.post('/api/admin/connections', { connections: rawText });
      await fetchConnections();
      setMsg({ type: 'success', text: 'Master network updated successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: 'Error saving connections. Check format: URL | KEY' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400">Scanning network nodes...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <Database className="text-blue-600" />
          Master Node Network
        </h1>
        <p className="text-slate-500">Manage the external servers where link indexing requests are broadcasted.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Key size={18} className="text-blue-600" />
                  Node Configuration
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded">Format: URL | KEY</span>
             </div>
             
             <form onSubmit={handleSave} className="space-y-4">
                {msg.text && (
                  <div className={`p-4 rounded-xl text-sm font-semibold border ${msg.type === 'success' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                    {msg.text}
                  </div>
                )}
                
                <textarea 
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="https://master1.com | secret_key_1&#10;https://master2.com | secret_key_2"
                  className="w-full h-80 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-mono text-xs leading-loose"
                />

                <button 
                  type="submit"
                  disabled={saving}
                  className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><Save size={20} /> Sync Network Nodes</>
                  )}
                </button>
             </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Active Network Pool</h3>
              <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {connections.length} Nodes
              </span>
            </div>
            
            <div className="flex-1 overflow-auto max-h-[500px]">
              {connections.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <Unplug size={40} className="text-slate-200 mb-4" />
                  <p className="text-slate-400 italic text-sm">No remote master servers connected.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                   {connections.map((conn) => (
                     <div key={conn.id} className="p-4 hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                             <div className="flex items-center gap-2">
                               <Globe size={14} className="text-blue-500" />
                               <span className="text-sm font-bold text-slate-800 truncate">{conn.master_url}</span>
                             </div>
                             <div className="mt-1 flex items-center gap-2">
                               <span className="text-[10px] font-mono font-bold text-slate-400 px-1.5 py-0.5 bg-slate-100 rounded">
                                 KEY: {conn.api_key.substring(0, 8)}...
                               </span>
                             </div>
                          </div>
                          <a 
                            href={`${conn.master_url}/wp-admin`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="p-2 text-slate-300 hover:text-blue-600 transition-colors"
                          >
                             <ExternalLink size={16} />
                          </a>
                        </div>
                     </div>
                   ))}
                </div>
              )}
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 italic text-[10px] text-slate-400">
              Note: Every broadcast request will be asynchronously forwarded to all nodes above.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
