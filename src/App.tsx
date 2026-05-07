import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  History, 
  LogOut, 
  Menu, 
  X, 
  HardDrive, 
  BarChart3, 
  Search, 
  ShieldCheck, 
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from './lib/api';

// Pages
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import AdminStats from './pages/Admin/AdminStats';
import UserManagement from './pages/Admin/UserManagement';
import SystemSettings from './pages/Admin/Settings';
import Connections from './pages/Admin/Connections';
import AuditLogs from './pages/Admin/AuditLogs';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const res = await api.get('/api/user/profile');
        setUser(res.data);
      }
    } catch (err) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"
    />
  </div>;

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Auth mode="login" setUser={setUser} />} />
      <Route path="/register" element={<Auth mode="register" setUser={setUser} />} />
      
      {/* Protected Layout */}
      <Route element={<ProtectedRoute user={user} handleLogout={handleLogout} />}>
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        <Route path="/reports" element={<Reports />} />
        
        {/* Admin Routes */}
        <Route element={<AdminRoute user={user} />}>
          <Route path="/admin" element={<AdminStats />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/settings" element={<SystemSettings />} />
          <Route path="/admin/connections" element={<Connections />} />
          <Route path="/admin/logs" element={<AuditLogs />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function ProtectedRoute({ user, handleLogout }: any) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" />;

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Reports', href: '/reports', icon: History },
  ];

  const adminNavigation = [
    { name: 'Analytics', href: '/admin', icon: BarChart3 },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Connections', href: '/admin/connections', icon: HardDrive },
    { name: 'System Settings', href: '/admin/settings', icon: Settings },
    { name: 'Audit Logs', href: '/admin/logs', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans text-slate-900">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 flex flex-col z-20 sticky top-0 h-screen transition-all duration-300`}
      >
        <div className="p-6 border-b border-slate-800">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              IX
            </div>
            {isSidebarOpen && <span className="font-bold text-xl text-white tracking-tight">IndexMaster</span>}
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className={`px-2 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ${!isSidebarOpen && 'text-center'}`}>
            {isSidebarOpen ? 'Main Menu' : 'Main'}
          </p>
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                location.pathname === item.href 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              {isSidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}

          {user.role === 'admin' && (
            <>
              <div className="pt-6">
                <p className={`px-2 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ${!isSidebarOpen && 'text-center'}`}>
                  {isSidebarOpen ? 'Administration' : 'Admin'}
                </p>
                {adminNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      location.pathname === item.href 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <item.icon size={18} />
                    {isSidebarOpen && <span>{item.name}</span>}
                  </Link>
                ))}
              </div>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 mb-4">
             <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-900 font-bold text-xs uppercase">
                {user.username[0]}
             </div>
             {isSidebarOpen && (
               <div className="flex-1 overflow-hidden">
                 <p className="text-sm font-medium text-white truncate">{user.username}</p>
                 <p className="text-xs text-slate-500 truncate capitalize">{user.role}</p>
               </div>
             )}
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 rounded-md transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm z-10">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
              >
                <Menu size={20} />
              </button>
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">
                {user.role === 'admin' ? 'Agency Indexer Panel' : 'Client Operations Station'}
              </h1>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Service Active
              </div>
              <button 
                onClick={() => navigate('/dashboard')}
                className="hidden md:flex px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95"
              >
                + New Submission
              </button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50">
          <div className="p-8 max-w-7xl mx-auto h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

function AdminRoute({ user }: any) {
  if (user.role !== 'admin') return <Navigate to="/dashboard" />;
  return <Outlet />;
}
