
import React, { useState } from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Global Safety Bar */}
      <div className="bg-sky-600 py-1.5 text-center">
        <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white">
          Startup Initiative • Founded by Abdulloh Temirov
        </p>
      </div>

      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-sky-100">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
              <span className="text-white font-black text-xl">M</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-slate-900 tracking-tighter uppercase leading-none">MadiPath</span>
              <span className="text-[9px] text-sky-600 font-bold uppercase tracking-widest mt-0.5">Clinical AI</span>
            </div>
          </div>
          
          <button 
            onClick={handleShare}
            className={`text-[9px] font-black uppercase tracking-[0.2em] px-6 py-2.5 rounded-full transition-all border ${
              copied 
              ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20' 
              : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/10'
            }`}
          >
            {copied ? 'Link Copied' : 'Share Startup'}
          </button>
        </div>
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-slate-50 text-slate-900 py-24 border-t border-slate-200 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-end mb-20">
            <div>
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="text-xl font-black tracking-tighter uppercase">MadiPath</span>
              </div>
              <p className="text-slate-500 text-lg leading-relaxed max-w-sm font-medium">
                Pioneering intelligent health guidance for a safer world.
              </p>
            </div>
            
            <div className="p-10 rounded-[2.5rem] border border-sky-100 bg-white shadow-xl">
              <p className="text-[9px] text-sky-600 font-black uppercase tracking-[0.4em] mb-3">Founder</p>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Abdulloh Temirov</h3>
              <div className="h-1 w-12 bg-sky-600 mt-6 rounded-full"></div>
            </div>
          </div>
          
          <div className="pt-10 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col gap-1.5">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.3em]">
                &copy; {new Date().getFullYear()} MadiPath Startup • Built for Global Safety
              </p>
              <p className="text-[8px] text-slate-400 font-bold max-w-lg leading-loose">
                MadiPath does not provide medical diagnosis or treatment. Developed independently by Abdulloh Temirov.
              </p>
            </div>
            <div className="flex space-x-8 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
              <a href="#" className="hover:text-sky-600 transition-colors">Ethics</a>
              <a href="#" className="hover:text-sky-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-sky-600 transition-colors">Safety</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
