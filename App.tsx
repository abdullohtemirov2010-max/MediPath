
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { AnalysisResult } from './components/AnalysisResult';
import { analyzeSymptoms } from './services/geminiService';
import { SymptomAnalysis } from './types';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    // Fixed: All declarations of 'aistudio' must have identical modifiers. 
    // Making it optional to fix the TypeScript error which often occurs due to environment-level re-declarations.
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SymptomAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      // Check for aistudio and the key selection status using optional chaining
      const hasKey = await window.aistudio?.hasSelectedApiKey();
      setIsConnected(!!hasKey);
    } catch (e) {
      setIsConnected(false);
    }
  };

  const handleConnect = async () => {
    try {
      // Prompt user to select an API key using optional chaining
      await window.aistudio?.openSelectKey();
      // Assume success after triggering the dialog to avoid race conditions as per documentation
      setIsConnected(true);
    } catch (err) {
      console.error("Key selection failed", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeSymptoms(inputText.trim());
      setResult(data);
    } catch (err: any) {
      const errMsg = err.message || "";
      // Handle cases where the API key is invalid or selection is required
      // "Requested entity was not found." indicates key selection reset is needed.
      if (errMsg.includes("Core disconnected") || errMsg.includes("API_KEY") || errMsg.includes("Requested entity was not found.")) {
        setIsConnected(false);
      } else {
        setError(errMsg || "The medical core is currently recalibrating.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (isConnected === false) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-6 py-32 animate-slide-up">
          <div className="glass-card p-16 rounded-[4rem] border-sky-500/30 shadow-2xl text-center">
            <div className="w-24 h-24 bg-sky-600/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-sky-500/20">
              <span className="text-4xl animate-pulse">✨</span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-6">Engine Authentication</h2>
            <p className="text-slate-500 text-lg mb-4">MadiPath requires a secure neural link. Please select your API key to proceed with private health assessments.</p>
            {/* Added mandatory billing documentation link for user-provided API key scenarios */}
            <p className="text-slate-400 text-sm mb-12">
              Requires a paid Google Cloud project. See <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-sky-600 underline hover:text-sky-500 transition-colors">billing documentation</a>.
            </p>
            <div className="flex flex-col items-center space-y-6">
              <button 
                onClick={handleConnect}
                className="px-12 py-6 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-3xl transition-all shadow-xl shadow-sky-600/20 uppercase tracking-widest"
              >
                Sync MadiPath Engine
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-8 pt-20 pb-40 animate-slide-up">
        {/* Startup Branding */}
        <div className="text-center mb-24 relative">
          <div className="absolute top-0 right-0 hidden md:flex items-center space-x-2 bg-sky-50 px-4 py-2 rounded-full border border-sky-100">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[9px] font-black text-sky-700 uppercase tracking-widest">Clinical Core Ready</span>
          </div>

          <div className="inline-flex items-center space-x-4 px-5 py-2 mb-8 bg-sky-50 border border-sky-100 rounded-full">
            <span className="text-[10px] font-black text-sky-600 uppercase tracking-[0.4em]">Health Intelligence Engine</span>
          </div>
          
          <h1 className="text-6xl md:text-[7rem] font-black text-slate-900 mb-8 tracking-tighter leading-none text-glow">
            Smart Triage.<br/>
            <span className="text-sky-600">Total Safety.</span>
          </h1>
          
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
            MadiPath by <span className="text-slate-900 font-bold">Abdulloh Temirov</span> — advanced symptom analysis and clinical guidance.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto mb-32">
          <div className="glass-card p-4 rounded-[3.5rem] relative">
            {loading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-[3.5rem] z-10 flex items-center justify-center">
                <div className="flex items-center space-x-4">
                  <div className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-bounce"></div>
                  <div className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  <span className="text-sky-700 font-black text-[10px] uppercase tracking-widest">Searching Medical Sources</span>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Describe your health concerns..."
                className="flex-grow px-10 py-7 rounded-[2.5rem] startup-input focus:outline-none text-xl font-bold placeholder:text-slate-400"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-14 py-7 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-black rounded-[2.5rem] text-xl transition-all shadow-xl shadow-sky-600/30"
              >
                Analyze
              </button>
            </form>
          </div>
          <p className="text-center mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Founded by Abdulloh Temirov • Clinical AI v2.5.0
          </p>
        </div>

        {error && (
          <div className="max-w-3xl mx-auto glass-card p-10 rounded-[3rem] border-red-200 mb-20 bg-red-50">
            <div className="flex items-center space-x-6">
              <span className="text-3xl">🩺</span>
              <div>
                <h4 className="text-red-900 font-black uppercase text-xs mb-1">System Diagnostic</h4>
                <p className="text-red-700 font-bold">{error}</p>
              </div>
            </div>
          </div>
        )}

        {result && <AnalysisResult data={result} />}

        {!result && !loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "🚑", title: "Emergency Priority", desc: "Automated high-risk detection logic." },
              { icon: "🔎", title: "Global Grounding", desc: "Search-based evidence from clinical journals." },
              { icon: "📍", title: "Nearby Care", desc: "Instantly find hospitals via geolocation." }
            ].map((f, i) => (
              <div key={i} className="glass-card p-8 rounded-[2.5rem] border-sky-100 hover:bg-sky-50/50">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h5 className="text-slate-900 font-bold uppercase text-xs mb-2 tracking-widest">{f.title}</h5>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
