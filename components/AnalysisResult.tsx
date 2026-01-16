
import React, { useState } from 'react';
import { SymptomAnalysis } from '../types';

interface AnalysisResultProps {
  data: SymptomAnalysis;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ data }) => {
  const [locLoading, setLocLoading] = useState(false);

  const getRiskStyles = (level: string) => {
    switch (level) {
      case 'High':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const findNearbyHospital = () => {
    setLocLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          window.open(`https://www.google.com/maps/search/hospital/@${latitude},${longitude},15z`, '_blank');
          setLocLoading(false);
        },
        () => {
          // Fallback if permission denied
          window.open(`https://www.google.com/maps/search/hospital+near+me`, '_blank');
          setLocLoading(false);
        }
      );
    } else {
      window.open(`https://www.google.com/maps/search/hospital+near+me`, '_blank');
      setLocLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
      {/* Risk Assessment Header */}
      <div className={`p-10 rounded-[3rem] border-2 shadow-xl ${getRiskStyles(data.riskLevel)}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] mb-3 block opacity-60">Clinical Triage Result</span>
            <h2 className="text-4xl font-black tracking-tighter uppercase">{data.riskLevel} Risk Priority</h2>
          </div>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={findNearbyHospital}
              disabled={locLoading}
              className="px-8 py-5 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-2xl shadow-lg shadow-sky-600/20 transition-all flex items-center space-x-3 text-sm uppercase tracking-widest disabled:opacity-50"
            >
              <span>{locLoading ? 'Locating...' : 'Find Nearby Hospital'}</span>
              {!locLoading && <span className="text-lg">📍</span>}
            </button>
            
            {data.shouldSeeDoctor && (
              <button
                onClick={() => window.open('https://www.zocdoc.com/', '_blank')}
                className="px-8 py-5 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl shadow-lg shadow-red-600/20 transition-all flex items-center space-x-3 text-sm uppercase tracking-widest animate-pulse"
              >
                <span>Go to Doctor</span>
                <span className="text-lg">🏥</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Deep Analysis & Sources */}
        <div className="glass-card p-10 rounded-[3rem]">
          <h3 className="font-black text-slate-900 text-lg mb-6 flex items-center uppercase tracking-widest">
            <span className="w-2.5 h-2.5 bg-sky-500 rounded-full mr-4 shadow-lg shadow-sky-500/50"></span>
            Condition Source Analysis
          </h3>
          <p className="text-slate-600 leading-relaxed font-semibold italic mb-8">
            "{data.explanation}"
          </p>
          
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Reference Codes</p>
            <div className="flex flex-wrap gap-2">
              {data.medicalCodes.map((code, idx) => (
                <span key={idx} className="px-4 py-2 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-xl border border-slate-200 uppercase">
                  {code}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Triage Protocols */}
        <div className="glass-card p-10 rounded-[3rem]">
          <h3 className="font-black text-slate-900 text-lg mb-6 flex items-center uppercase tracking-widest">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-4 shadow-lg shadow-emerald-500/50"></span>
            Action Protocol
          </h3>
          <ul className="space-y-4">
            {data.nextSteps.map((step, idx) => (
              <li key={idx} className="flex items-start text-sm text-slate-600 font-bold">
                <span className="text-emerald-500 mr-3 mt-1 font-black">✓</span>
                {step}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Grounding & Warning Signs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-10 rounded-[3rem]">
          <h3 className="font-black text-slate-900 text-lg mb-6 flex items-center uppercase tracking-widest">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full mr-4 shadow-lg shadow-red-500/50"></span>
            Warning Signs (High Alert)
          </h3>
          <ul className="space-y-4">
            {data.warningSigns.map((sign, idx) => (
              <li key={idx} className="flex items-start text-sm text-slate-700 font-bold">
                <span className="text-red-500 mr-3 mt-1">!</span>
                {sign}
              </li>
            ))}
          </ul>
        </div>

        {data.sources && data.sources.length > 0 && (
          <div className="glass-card p-10 rounded-[3rem] border-sky-500/20">
            <h3 className="font-black text-slate-900 text-lg mb-6 flex items-center uppercase tracking-widest">
              <span className="w-2.5 h-2.5 bg-sky-400 rounded-full mr-4 shadow-lg shadow-sky-400/50"></span>
              Neural Evidence Sources
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {data.sources.map((source, idx) => (
                <a 
                  key={idx} 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-4 bg-slate-50 border border-slate-200 hover:border-sky-500 hover:bg-sky-50 text-[11px] text-sky-700 font-bold rounded-2xl uppercase tracking-widest transition-all block truncate"
                >
                  {source.title} ↗
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
