import React from 'react';
import { useAppState } from '../context/AppContext.tsx';
import { Sparkles, ShieldCheck, RefreshCw, Zap } from 'lucide-react';

export const AIInsightsView: React.FC = () => {
  const { insights, loadingInsights, getGeminiInsights } = useAppState();

  const getImpactColor = (imp: string) => {
    switch (imp) {
      case 'High': return 'bg-rose-500/20 text-rose-300 border border-rose-550/30';
      case 'Medium': return 'bg-amber-500/20 text-amber-300 border border-amber-550/30';
      default: return 'bg-emerald-500/20 text-emerald-300 border border-emerald-550/30';
    }
  };

  const score = insights?.healthScore || 50;

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            AI Wealth Advisory
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Gemini AI
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1 font-sans">
            Generative portfolio analysis, spent evaluations, and custom automated advice.
          </p>
        </div>

        <button
          id="refresh-ai-insights-btn"
          onClick={getGeminiInsights}
          disabled={loadingInsights}
          className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl flex items-center gap-2 border border-white/10 shadow-lg cursor-pointer disabled:opacity-55 active:scale-95 transition-all font-sans"
        >
          <RefreshCw className={`w-4 h-4 ${loadingInsights ? 'animate-spin' : ''}`} />
          <span>{loadingInsights ? 'Recalculating Balance Metrics...' : 'Regenerate Advisor Report'}</span>
        </button>
      </div>

      {loadingInsights ? (
        /* LOADING STATE PLATFORM */
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-xl">
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#10b981] border-r-[#10b981] animate-spin" />
            <div className="absolute inset-2 bg-emerald-500/10 rounded-full flex items-center justify-center text-[#10b981]">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <h3 className="font-bold text-white font-display text-base">Gemini Structuring Finance Report...</h3>
          <p className="text-xs text-slate-400 mt-2 font-sans max-w-sm leading-relaxed">
            Parsing transactions ledgers, evaluating categories against monthly boundaries, and drawing optimal savings goals timelines.
          </p>
          <div className="mt-6 flex flex-col gap-2 p-3 bg-slate-950/40 border border-white/5 rounded-xl max-w-xs w-full text-center text-[10px] text-slate-400 font-mono">
            <div>⚡ Connecting server-side @google/genai</div>
            <div>⚡ Extracting spend velocity indicators</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT AREA: FINANCIAL HEALTH PROFILE (4 columns) */}
          <div className="lg:col-span-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col justify-between text-center min-h-[340px]">
            <div>
              <h3 className="font-bold text-white font-display text-base">Sustainability Matrix</h3>
              <p className="text-xs text-slate-450 mt-0.5 font-sans">Daily transaction sustainability scoring</p>
            </div>

            {/* RADIAL SCORE METRE */}
            <div className="relative w-36 h-36 mx-auto my-6 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="10" />
                <circle 
                  cx="60" 
                  cy="60" 
                  r="50" 
                  fill="none" 
                  stroke="url(#scoreGrad)" 
                  strokeWidth="10" 
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - score / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
              </svg>

              {/* CENTER TEXT */}
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-white font-sans tracking-tight">{score}</span>
                <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider mt-0.5">Health Score</span>
              </div>
            </div>

            {/* SCORE DISCRIPTION STATUS BOX */}
            <div className="p-3 bg-slate-950/30 border border-white/5 rounded-xl text-xs font-semibold text-slate-300 flex items-center justify-center gap-2 font-sans">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
              <span>
                {score >= 80 ? 'Flawless Asset Profile' : score >= 50 ? 'Moderate Capital Velocity' : 'Boundaries Remediation Needed'}
              </span>
            </div>
          </div>

          {/* RIGHT AREA: AI ASSESSMENT & ADVISORY CARDS (8 columns) */}
          <div className="lg:col-span-8 space-y-6">
            {/* ASSESSMENT NOTE */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-l-full blur-xl pointer-events-none" />
              <h3 className="font-bold text-white font-display text-base flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-400" />
                Advisory Portfolio Summary
              </h3>
              <p className="text-xs text-slate-300 font-sans leading-relaxed mt-3.5 pr-4">
                {insights?.overallAssessment || 'No dynamic advice has been computed yet. Build transactions logs or click the Regenerate Advisor Report button above to evaluate live operational boundaries and construct recommendations.'}
              </p>
            </div>

            {/* ACTIONABLE RECOMMENDATIONS LIST */}
            <div className="space-y-3.5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Action Items For Wealth Optimization</h4>
              
              {insights?.recommendations && insights.recommendations.length > 0 ? (
                insights.recommendations.map((rec, idx) => (
                  <div 
                    key={idx}
                    className="p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl flex items-start gap-4 transition-all hover:scale-[1.005] hover:bg-white/8"
                  >
                    <div className="p-2.5 bg-indigo-500/10 text-indigo-300 rounded-xl flex-shrink-0 mt-0.5 border border-indigo-500/20">
                      <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                        <h4 className="text-xs font-bold text-white truncate pr-4 font-display">{rec.title}</h4>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {rec.category && (
                            <span className="text-[9px] font-bold bg-white/5 text-slate-300 px-2 py-0.5 rounded font-mono uppercase tracking-wider border border-white/5">
                              {rec.category}
                            </span>
                          )}
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border font-mono uppercase tracking-wider ${getImpactColor(rec.impact)}`}>
                            {rec.impact} Impact
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-405 font-sans leading-relaxed">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 bg-white/5 border border-white/10 rounded-2xl text-center text-xs text-slate-400 font-sans">
                  No action items computed. Click Regenerate above to prompt the Gemini API.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
