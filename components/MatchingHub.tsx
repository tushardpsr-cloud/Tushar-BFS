import React, { useState } from 'react';
import { Lead, Listing, MatchResult, MatchTier } from '../types';
import { calculateMatchTier } from '../services/crmLogic';
import { analyzeMatch } from '../services/geminiService'; // Still use for reasoning
import { Users, Store, Check, Star, Share2 } from 'lucide-react';

interface MatchingHubProps {
  leads: Lead[];
  listings: Listing[];
}

export const MatchingHub: React.FC<MatchingHubProps> = ({ leads, listings }) => {
  const [viewMode, setViewMode] = useState<'BuyerCentric' | 'ListingCentric'>('BuyerCentric');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  // Compute matches on the fly (in production this would be cached/stored)
  const getMatches = () => {
      if (!selectedEntityId) return [];
      
      if (viewMode === 'BuyerCentric') {
          const lead = leads.find(l => l.id === selectedEntityId);
          if (!lead) return [];
          return listings.map(l => ({
              entity: l,
              tier: calculateMatchTier(l, lead)
          })).filter(m => m.tier !== MatchTier.None);
      } else {
          const listing = listings.find(l => l.id === selectedEntityId);
          if (!listing) return [];
          return leads.map(l => ({
              entity: l,
              tier: calculateMatchTier(listing, l)
          })).filter(m => m.tier !== MatchTier.None);
      }
  };

  const matches = getMatches();
  const groupedMatches = {
      [MatchTier.Ideal]: matches.filter(m => m.tier === MatchTier.Ideal),
      [MatchTier.GoodFit]: matches.filter(m => m.tier === MatchTier.GoodFit),
      [MatchTier.Stretch]: matches.filter(m => m.tier === MatchTier.Stretch),
      [MatchTier.ShareWidely]: matches.filter(m => m.tier === MatchTier.ShareWidely),
  };

  const TierSection = ({ title, data, color }: { title: string, data: any[], color: string }) => {
      if (data.length === 0) return null;
      return (
          <div className="mb-8">
              <h3 className={`text-xs font-bold uppercase tracking-wide mb-3 flex items-center ${color}`}>
                  <Star size={12} className="mr-1.5" fill="currentColor" />
                  {title} <span className="ml-2 text-gray-400 font-normal">({data.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.map((item, idx) => {
                      const isListing = 'askingPrice' in item.entity;
                      return (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-[#1d1d1f] text-sm">{isListing ? item.entity.title : item.entity.name}</h4>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${color.replace('text-', 'bg-').replace('600', '100')} ${color}`}>
                                    {title}
                                </span>
                            </div>
                            <div className="text-xs text-[#86868b] space-y-1">
                                {isListing ? (
                                    <>
                                        <p>Price: ${(item.entity.askingPrice/1000).toFixed(0)}k | SDE: ${(item.entity.ebitda/1000).toFixed(0)}k</p>
                                        <p>{item.entity.location} • {item.entity.industry}</p>
                                    </>
                                ) : (
                                    <>
                                        <p>Budget: ${(item.entity.maxBudget/1000).toFixed(0)}k</p>
                                        <p>Industries: {item.entity.preferredIndustries.join(', ')}</p>
                                    </>
                                )}
                            </div>
                            <button className="mt-3 w-full py-2 bg-[#f5f5f7] hover:bg-gray-200 rounded-lg text-xs font-medium text-[#1d1d1f] transition-colors">
                                Review & Pitch
                            </button>
                        </div>
                      );
                  })}
              </div>
          </div>
      );
  };

  return (
    <div className="h-full flex flex-col pb-6">
      <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">Matching Hub</h2>
            <p className="text-[#86868b] mt-1">Formula-driven tiered matching system.</p>
          </div>
          <div className="bg-gray-100 p-1 rounded-lg flex space-x-1">
              <button 
                onClick={() => { setViewMode('BuyerCentric'); setSelectedEntityId(null); }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'BuyerCentric' ? 'bg-white shadow-sm text-[#1d1d1f]' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}
              >
                  Buyer Centric
              </button>
              <button 
                onClick={() => { setViewMode('ListingCentric'); setSelectedEntityId(null); }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'ListingCentric' ? 'bg-white shadow-sm text-[#1d1d1f]' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}
              >
                  Listing Centric
              </button>
          </div>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
          {/* Sidebar Selection */}
          <div className="col-span-3 bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/50 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-wide">
                      Select {viewMode === 'BuyerCentric' ? 'Buyer' : 'Listing'}
                  </h3>
              </div>
              <div className="overflow-y-auto flex-1 p-2">
                  {(viewMode === 'BuyerCentric' ? leads : listings).map(item => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedEntityId(item.id)}
                        className={`w-full text-left p-3 rounded-xl mb-1 transition-all ${
                            selectedEntityId === item.id 
                            ? 'bg-[#0071e3] text-white shadow-md' 
                            : 'hover:bg-gray-50 text-[#1d1d1f]'
                        }`}
                      >
                          <div className="text-sm font-medium truncate">{'name' in item ? item.name : item.title}</div>
                      </button>
                  ))}
              </div>
          </div>

          {/* Results Area */}
          <div className="col-span-9 bg-white/50 backdrop-blur-sm rounded-[24px] border border-white/50 overflow-y-auto p-8">
              {!selectedEntityId ? (
                  <div className="h-full flex flex-col items-center justify-center text-[#86868b]">
                      <Share2 size={48} className="opacity-20 mb-4" />
                      <p>Select an entity to reveal tiered matches.</p>
                  </div>
              ) : (
                  <div className="animate-fade-in">
                      <TierSection title="Ideal Match" data={groupedMatches[MatchTier.Ideal]} color="text-green-600" />
                      <TierSection title="Good Fit" data={groupedMatches[MatchTier.GoodFit]} color="text-blue-600" />
                      <TierSection title="Stretch / Creative" data={groupedMatches[MatchTier.Stretch]} color="text-orange-500" />
                      <TierSection title="Share Widely (High ROI)" data={groupedMatches[MatchTier.ShareWidely]} color="text-purple-600" />
                      
                      {matches.length === 0 && (
                          <div className="text-center py-12 text-[#86868b]">
                              <p>No matches found based on current criteria.</p>
                          </div>
                      )}
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};
