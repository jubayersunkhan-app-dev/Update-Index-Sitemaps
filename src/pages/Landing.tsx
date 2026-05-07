import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Zap, Shield, Search, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-slate-100 py-4 px-8 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold">
              IX
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">IndexMaster</span>
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="px-4 py-2 text-slate-600 font-medium hover:text-indigo-600 transition-colors">
              Login
            </Link>
            <Link to="/register" className="px-5 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24 px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full mb-6 border border-indigo-100">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span> v2.4.0 Live Engine
            </span>
            <h1 className="text-6xl lg:text-7xl font-bold text-slate-900 leading-[1.1] mb-8 tracking-tight">
              Enterprise <span className="text-indigo-600">URL Indexing</span> at Scale.
            </h1>
            <p className="text-lg text-slate-500 mb-10 max-w-lg leading-relaxed">
              Decoupled broadcast engine for high-performance link networks. Replicate multi-tenant indexing power with a single command.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="px-8 py-4 bg-slate-900 text-white font-bold rounded-xl text-lg hover:bg-slate-800 flex items-center gap-2 transition-all shadow-xl active:scale-95">
                Build Your Network <ArrowRight size={20} />
              </Link>
              <button className="px-8 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-lg hover:bg-slate-50 transition-colors">
                Whitepaper
              </button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl relative z-10 border border-slate-800">
              <div className="flex gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-slate-800"></div>
                <div className="w-3 h-3 rounded-full bg-slate-800"></div>
                <div className="w-3 h-3 rounded-full bg-slate-800"></div>
              </div>
              <div className="space-y-4 font-mono text-sm leading-relaxed">
                <p className="text-emerald-400 font-bold">$ indexmaster push --batch network_01</p>
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Master Nodes</p>
                    <p className="text-slate-400 text-xs">Node-A: <span className="text-emerald-500">READY</span></p>
                    <p className="text-slate-400 text-xs">Node-B: <span className="text-emerald-500">READY</span></p>
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Latency Filter</p>
                    <p className="text-slate-400 text-xs">Auth: <span className="text-indigo-400">JWT OK</span></p>
                  </div>
                </div>
                <p className="text-indigo-400 font-medium">Broadcasting 500 links to 24 encrypted endpoints...</p>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '92%' }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                  />
                </div>
                <p className="text-slate-300">Broadcast Complete. 100% Delivery.</p>
              </div>
            </div>
            {/* Visual Accents */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-[80px]"></div>
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px]"></div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50 px-8 border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">The Core Infrastructure</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">Engineered for absolute reliability in high-stakes SEO operations.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Global Sync', desc: 'Asynchronous broadcasting to unlimited master nodes with priority queuing.', icon: Zap },
              { title: 'Identity Guard', desc: 'JWT-based authentication with high-density audit trails for multi-tenant data.', icon: Shield },
              { title: 'Live Analytics', desc: 'Real-time telemetry and indexing reports with automated cooldown filters.', icon: Search },
            ].map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -8 }}
                className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-sm">
                  <f.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-slate-900 text-white px-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="grid grid-cols-12 h-full">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="border-r border-slate-700 h-full"></div>
              ))}
           </div>
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-8 tracking-tight"
          >
            Ready to <span className="text-indigo-400">Scale</span> Your Indexing?
          </motion.h2>
          <p className="text-slate-400 text-xl mb-12 leading-relaxed">Join the elite SEO agencies who index millions of links weekly via IndexMaster backend nodes.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto px-12 py-5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 text-lg">
              Launch Now
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-12 py-5 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all text-lg">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white px-8 border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-2 opacity-50">
             <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center text-white font-bold text-xs italic">IX</div>
             <span className="font-bold text-slate-900 tracking-tight text-sm uppercase">IndexMaster Core</span>
           </div>
           <p className="text-slate-400 text-sm">© 2024 IndexMaster SaaS Engine. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
