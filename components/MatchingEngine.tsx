import React, { useState } from 'react';
import { Lead, Listing, AIMatchResult } from '../types';
import { analyzeMatch } from '../services/geminiService';
import { Sparkles, ArrowRight, Loader, AlertCircle } from 'lucide-react';

interface MatchingEngineProps {
  leads: Lead[];
  listings: Listing[];
}

export const MatchingEngine: React.FC<MatchingEngineProps> = ({ leads, listings }) => {
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [matches, setMatches] = useState<AIMatchResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const runAnalysis = async () => {
    if (!selectedListing) return;
    setIsAnalyzing(true);
    setMatches([]); // Clear previous
    setHasRun(false);

    const results = await analyzeMatch(selectedListing, leads);
    
    // Sort by score descending
    setMatches(results.sort((a, b) => b.score - a.score));
    
    setIsAnalyzing(false);
    setHasRun(true);
  };

  return (
    <div className="h-full flex flex-col space-y-6 pb-6">
      <header>
        <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight flex items-center">
            <Sparkles className="text-indigo-500 mr-3" size={28} />
            Smart Match
        </h2>
        <p className="text-[#86868b] mt-1 ml-10">Select a listing to find the perfect buyer using AI.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
        {/* Listing Selection */}
        <div className="lg:col-span-4 bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/50 flex flex-col overflow-hidden">
            <div className="p-6 pb-2">
                <h3 className="font-semibold text-[#86868b] text-xs uppercase tracking-wide">1. Select Listing</h3>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-3">
                {listings.map(l => (
                    <div 
                        key={l.id}
                        onClick={() => { setSelectedListing(l); setHasRun(false); setMatches([]); }}
                        className={`p-4 rounded-2xl cursor-pointer border transition-all duration-200 group ${
                            selectedListing?.id === l.id 
                            ? 'bg-[#0071e3] text-white shadow-lg shadow-blue-500/30 border-transparent' 
                            : 'bg-[#f5f5f7] border-transparent hover:bg-gray-200'
                        }`}
                    >
                        <div className="flex justify-between">
                            <h4 className={`font-semibold ${selectedListing?.id === l.id ? 'text-white' : 'text-[#1d1d1f]'}`}>{l.title}</h4>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${selectedListing?.id === l.id ? 'text-blue-100' : 'text-[#86868b]'}`}>{l.industry}</span>
                        </div>
                        <p className={`text-sm mt-1 font-medium ${selectedListing?.id === l.id ? 'text-blue-100' : 'text-[#86868b]'}`}>AED {(l.askingPrice / 1000).toFixed(0)}k Ask</p>
                    </div>
                ))}
            </div>
        </div>

        {/* Action Area */}
        <div className="lg:col-span-3 flex flex-col items-center justify-center p-8 bg-white/50 rounded-[24px] border border-white/50 backdrop-blur-sm">
             {selectedListing ? (
                 <div className="text-center w-full">
                     <div className="mb-8">
                         <div className="w-16 h-16 bg-white rounded-2xl shadow-sm mx-auto flex items-center justify-center mb-4 text-2xl">
                            🏢
                         </div>
                         <h3 className="text-lg font-semibold text-[#1d1d1f]">Target Selected</h3>
                         <p className="text-[#86868b] text-sm mt-1">{selectedListing.title}</p>
                         <div className="mt-4 px-3 py-1 bg-gray-100 inline-block rounded-full text-xs font-medium text-[#424245]">
                            Checking {leads.length} Leads
                         </div>
                     </div>
                     
                     <button 
                        onClick={runAnalysis}
                        disabled={isAnalyzing}
                        className="w-full bg-[#0071e3] hover:bg-[#0077ED] disabled:bg-indigo-300 text-white py-4 rounded-full font-semibold shadow-xl shadow-blue-500/20 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2"
                     >
                        {isAnalyzing ? (
                            <>
                              <Loader className="animate-spin" size={20} />
                              <span>Analyzing...</span>
                            </>
                        ) : (
                            <>
                              <Sparkles size={20} />
                              <span>Run AI Match</span>
                            </>
                        )}
                     </button>
                 </div>
             ) : (
                 <div className="text-center text-[#86868b]">
                     <AlertCircle size={48} className="mx-auto mb-4 opacity-20" />
                     <p>Select a listing to begin.</p>
                 </div>
             )}
        </div>

        {/* Results Area */}
        <div className="lg:col-span-5 bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/50 flex flex-col overflow-hidden">
            <div className="p-6 pb-2 bg-white/80 backdrop-blur sticky top-0 z-10">
                <h3 className="font-semibold text-[#86868b] text-xs uppercase tracking-wide">3. Top Matches</h3>
            </div>
            <div className="overflow-y-auto flex-1 p-6 pt-2">
                {!hasRun && !isAnalyzing && (
                    <div className="h-full flex flex-col items-center justify-center text-[#86868b] text-sm">
                        <div className="w-12 h-12 rounded-full bg-gray-100 mb-3"></div>
                        Results will appear here
                    </div>
                )}
                
                {isAnalyzing && (
                    <div className="space-y-4 animate-pulse">
                         {[1,2,3].map(i => (
                             <div key={i} className="h-28 bg-[#f5f5f7] rounded-2xl"></div>
                         ))}
                    </div>
                )}

                {hasRun && matches.length === 0 && (
                    <div className="text-center text-[#86868b] py-12">
                        No strong matches found.
                    </div>
                )}

                {matches.map((match) => {
                    const lead = leads.find(l => l.id === match.leadId);
                    if (!lead) return null;
                    
                    let scoreColor = 'text-red-500';
                    let progressColor = 'bg-red-500';
                    if (match.score >= 80) { scoreColor = 'text-[#34c759]'; progressColor = 'bg-[#34c759]'; }
                    else if (match.score >= 50) { scoreColor = 'text-orange-500'; progressColor = 'bg-orange-500'; }

                    return (
                        <div key={match.leadId} className="mb-6 last:mb-0">
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <h4 className="font-semibold text-[#1d1d1f] text-lg">{lead.name}</h4>
                                    <p className="text-xs text-[#86868b] font-medium">Budget: AED {lead.maxBudget.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-2xl font-bold ${scoreColor} tracking-tight`}>{match.score}%</span>
                                </div>
                            </div>
                            
                            <div className="w-full bg-[#f5f5f7] h-2 rounded-full mb-3 overflow-hidden">
                                <div className={`h-2 rounded-full ${progressColor} transition-all duration-1000 ease-out`} style={{width: `${match.score}%`}}></div>
                            </div>

                            <div className="bg-[#f5f5f7] p-4 rounded-xl text-sm text-[#424245] leading-relaxed mb-3">
                                {match.reasoning}
                            </div>
                            
                            <button className="w-full py-3 text-xs font-semibold text-[#0071e3] bg-[#0071e3]/5 hover:bg-[#0071e3]/10 rounded-xl transition-colors flex items-center justify-center">
                                Contact Buyer <ArrowRight size={12} className="ml-1" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};