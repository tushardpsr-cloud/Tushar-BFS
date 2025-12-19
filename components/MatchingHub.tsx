import React, { useState } from 'react';
import { Lead, Listing, MatchTier, MatchFeedback, FeedbackStatus } from '../types';
import { calculateMatchTier } from '../services/crmLogic';
import { Search, Star, TrendingUp, AlertCircle, Briefcase, Send, CheckCircle2, ChevronRight, Filter, ThumbsUp, ThumbsDown, BarChart2, Layout } from 'lucide-react';

const formatCurrency = (num: number) => 
  new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(num);

interface MatchCardProps {
  match: { entity: any; tier?: MatchTier; feedback?: MatchFeedback };
  viewMode: 'BuyerCentric' | 'ListingCentric';
  isFeedbackMode?: boolean;
  onFeedback?: (status: FeedbackStatus) => void;
  onShare?: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, viewMode, isFeedbackMode, onFeedback, onShare }) => {
  const isListing = viewMode === 'BuyerCentric';
  const item = match.entity;

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all group relative animate-in fade-in duration-300">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868b]">{isListing ? item.industry : 'Buyer'}</span>
        
        {/* Interaction Buttons */}
        <div className="flex items-center space-x-1">
             {/* Thumbs Down */}
             <button 
                onClick={(e) => { e.stopPropagation(); onFeedback && onFeedback(FeedbackStatus.Negative); }}
                className={`p-1.5 rounded-full transition-colors ${
                    match.feedback?.status === FeedbackStatus.Negative 
                    ? 'bg-red-100 text-red-600' 
                    : 'text-gray-300 hover:text-red-500 hover:bg-red-50'
                }`}
                title="Not Interested"
             >
                <ThumbsDown size={14} />
             </button>

             {/* Thumbs Up */}
             <button 
                onClick={(e) => { e.stopPropagation(); onFeedback && onFeedback(FeedbackStatus.Positive); }}
                className={`p-1.5 rounded-full transition-colors ${
                    match.feedback?.status === FeedbackStatus.Positive 
                    ? 'bg-green-100 text-green-600' 
                    : 'text-gray-300 hover:text-green-500 hover:bg-green-50'
                }`}
                title="Interested"
             >
                <ThumbsUp size={14} />
             </button>
             
             {/* Share Button (Only in Planning Mode) */}
             {!isFeedbackMode && (
                 <button 
                    onClick={(e) => { e.stopPropagation(); onShare && onShare(); }}
                    className="p-1.5 rounded-full text-gray-300 hover:text-[#0071e3] hover:bg-blue-50 transition-colors ml-1"
                    title="Share Listing"
                 >
                    <Send size={14} />
                 </button>
             )}
        </div>
      </div>
      
      <h4 className="font-semibold text-[#1d1d1f] text-sm leading-snug mb-3">
        {isListing ? item.title : item.name}
      </h4>

      {isListing ? (
        <div className="space-y-2 mb-3">
          <div className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded-lg">
            <span className="text-[#86868b]">Ask</span>
            <span className="font-medium text-[#1d1d1f]">{formatCurrency(item.askingPrice)}</span>
          </div>
          <div className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded-lg">
            <span className="text-[#86868b]">SDE</span>
            <span className="font-medium text-emerald-600">{formatCurrency(item.ebitda)}</span>
          </div>
          <div className="flex items-center space-x-1 text-[10px] text-[#86868b] mt-1">
             <span className="truncate max-w-[150px]">{item.location}</span>
          </div>
        </div>
      ) : (
         <div className="space-y-2 mb-3">
          <div className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded-lg">
            <span className="text-[#86868b]">Budget</span>
            <span className="font-medium text-[#1d1d1f]">{formatCurrency(item.maxBudget)}</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
              {item.preferredIndustries.slice(0,2).map((ind: string) => (
                  <span key={ind} className="px-1.5 py-0.5 bg-gray-100 text-[#424245] rounded text-[10px] font-medium">{ind}</span>
              ))}
          </div>
        </div>
      )}

      {/* Action / Status Footer */}
      <div className="border-t border-gray-100 pt-3 mt-1 flex justify-between items-center">
           <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
               match.feedback ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-500'
           }`}>
               {match.feedback ? 'Shared' : 'Not Shared'}
           </span>
           <button className="text-xs font-semibold text-[#0071e3] flex items-center group-hover:underline">
              Details <ChevronRight size={12} />
           </button>
      </div>
    </div>
  );
};

interface MatchingHubProps {
  leads: Lead[];
  listings: Listing[];
  feedbacks: MatchFeedback[];
  setFeedbacks: React.Dispatch<React.SetStateAction<MatchFeedback[]>>;
}

export const MatchingHub: React.FC<MatchingHubProps> = ({ leads, listings, feedbacks, setFeedbacks }) => {
  const [viewMode, setViewMode] = useState<'BuyerCentric' | 'ListingCentric'>('BuyerCentric');
  const [hubMode, setHubMode] = useState<'Planning' | 'Feedback'>('Planning');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtering the sidebar list
  const filteredEntities = (viewMode === 'BuyerCentric' ? leads : listings).filter((item: any) => {
    const name = item.name || item.title;
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleFeedback = (leadId: string, listingId: string, status: FeedbackStatus) => {
    setFeedbacks(prev => {
        // Remove existing if any
        const filtered = prev.filter(f => !(f.leadId === leadId && f.listingId === listingId));
        return [...filtered, {
            id: Math.random().toString(36).substr(2, 9),
            leadId,
            listingId,
            status,
            timestamp: new Date().toISOString()
        }];
    });
  };

  const handleShare = (leadId: string, listingId: string) => {
      // Sharing just sets it to Pending state
      handleFeedback(leadId, listingId, FeedbackStatus.Pending);
  };

  // Calculate matches for the selected entity
  const getMatches = () => {
    if (!selectedEntityId) return [];
    
    // PLANNING MODE: Show algorithmic potential matches
    if (hubMode === 'Planning') {
        if (viewMode === 'BuyerCentric') {
            const lead = leads.find(l => l.id === selectedEntityId);
            if (!lead) return [];
            return listings.map(l => ({
                entity: l,
                tier: calculateMatchTier(l, lead),
                // Check if feedback exists
                feedback: feedbacks.find(f => f.leadId === lead.id && f.listingId === l.id)
            })).filter(m => m.tier !== MatchTier.None);
        } else {
            const listing = listings.find(l => l.id === selectedEntityId);
            if (!listing) return [];
            return leads.map(l => ({
                entity: l,
                tier: calculateMatchTier(listing, l),
                feedback: feedbacks.find(f => f.leadId === l.id && f.listingId === listing.id)
            })).filter(m => m.tier !== MatchTier.None);
        }
    } 
    // FEEDBACK MODE: Show only matches that have interaction/feedback
    else {
        if (viewMode === 'BuyerCentric') {
            return feedbacks
                .filter(f => f.leadId === selectedEntityId)
                .map(f => {
                    const l = listings.find(item => item.id === f.listingId);
                    return l ? { entity: l, feedback: f } : null;
                })
                .filter(Boolean) as { entity: Listing, feedback: MatchFeedback }[];
        } else {
             return feedbacks
                .filter(f => f.listingId === selectedEntityId)
                .map(f => {
                    const l = leads.find(item => item.id === f.leadId);
                    return l ? { entity: l, feedback: f } : null;
                })
                .filter(Boolean) as { entity: Lead, feedback: MatchFeedback }[];
        }
    }
  };

  const matches = getMatches();
  
  // Columns for Planning Mode
  const planningColumns = [
    { id: MatchTier.Ideal, label: 'Tier S', sub: 'Ideal Match', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: Star },
    { id: MatchTier.GoodFit, label: 'Tier A', sub: 'Good Fit', color: 'bg-blue-50 text-blue-700 border-blue-100', icon: CheckCircle2 },
    { id: MatchTier.Stretch, label: 'Tier B', sub: 'Stretch / Creative', color: 'bg-orange-50 text-orange-700 border-orange-100', icon: TrendingUp },
    { id: MatchTier.ShareWidely, label: 'Tier C', sub: 'High ROI Opportunity', color: 'bg-purple-50 text-purple-700 border-purple-100', icon: Briefcase },
  ];

  // Columns for Feedback Mode
  const feedbackColumns = [
      { id: FeedbackStatus.Positive, label: 'Interested', sub: 'Thumbs Up', color: 'bg-green-50 text-green-700 border-green-100', icon: ThumbsUp },
      { id: FeedbackStatus.Pending, label: 'Pending', sub: 'No Selection', color: 'bg-slate-50 text-slate-600 border-slate-100', icon: AlertCircle },
      { id: FeedbackStatus.Negative, label: 'Passed', sub: 'Thumbs Down', color: 'bg-red-50 text-red-700 border-red-100', icon: ThumbsDown },
  ];

  return (
    <div className="h-full flex flex-col pb-4">
      <div className="flex flex-col xl:flex-row justify-between xl:items-center mb-6 px-1 gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight flex items-center">
              <Filter className="mr-2 text-[#0071e3]" size={20}/> 
              Matching Hub
            </h2>
            <p className="text-xs text-[#86868b] mt-1 ml-7">
                {hubMode === 'Planning' ? 'Drag-and-drop style triage for AI matches.' : 'Track feedback and categorize engagement.'}
            </p>
          </div>
          
          <div className="flex space-x-4">
              {/* Hub Mode Toggle */}
              <div className="flex bg-gray-200/80 p-1 rounded-lg">
                  <button 
                    onClick={() => setHubMode('Planning')}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold flex items-center transition-all ${hubMode === 'Planning' ? 'bg-white shadow-sm text-[#1d1d1f]' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}
                  >
                      <Layout size={14} className="mr-2" /> Planning
                  </button>
                  <button 
                    onClick={() => setHubMode('Feedback')}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold flex items-center transition-all ${hubMode === 'Feedback' ? 'bg-white shadow-sm text-[#1d1d1f]' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}
                  >
                      <BarChart2 size={14} className="mr-2" /> Feedback
                  </button>
              </div>

              {/* View Entity Toggle */}
              <div className="flex bg-gray-200/80 p-1 rounded-lg">
                <button 
                    onClick={() => { setViewMode('BuyerCentric'); setSelectedEntityId(null); }}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'BuyerCentric' ? 'bg-white shadow-sm text-[#1d1d1f]' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}
                >
                    Buyers
                </button>
                <button 
                    onClick={() => { setViewMode('ListingCentric'); setSelectedEntityId(null); }}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'ListingCentric' ? 'bg-white shadow-sm text-[#1d1d1f]' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}
                >
                    Listings
                </button>
              </div>
          </div>
      </div>

      <div className="flex-1 min-h-0 flex gap-6">
        {/* Left Sidebar: Entity Selector */}
        <div className="w-80 flex flex-col bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-200 overflow-hidden shrink-0">
           <div className="p-4 border-b border-gray-100">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b]" size={14} />
                <input 
                  type="text" 
                  placeholder={`Search ${viewMode === 'BuyerCentric' ? 'Buyers' : 'Listings'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#f5f5f7] border-none rounded-lg text-sm text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] placeholder-gray-400"
                />
             </div>
           </div>
           
           <div className="overflow-y-auto flex-1 p-2 space-y-1">
             {filteredEntities.map((item: any) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedEntityId(item.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all border border-transparent ${
                      selectedEntityId === item.id 
                      ? 'bg-[#0071e3] text-white shadow-md' 
                      : 'hover:bg-gray-50 text-[#1d1d1f] hover:border-gray-200'
                  }`}
                >
                    <div className="flex justify-between items-center mb-0.5">
                       <span className="font-semibold text-sm truncate">{item.name || item.title}</span>
                       {item.touchCountWeek > 0 && (
                          <span className={`w-2 h-2 rounded-full ${selectedEntityId === item.id ? 'bg-white' : 'bg-[#0071e3]'}`}></span>
                       )}
                    </div>
                    <div className={`text-xs truncate ${selectedEntityId === item.id ? 'text-blue-100' : 'text-[#86868b]'}`}>
                       {viewMode === 'BuyerCentric' 
                         ? `Budget: AED ${(item.maxBudget/1000).toFixed(0)}k` 
                         : `Ask: AED ${(item.askingPrice/1000).toFixed(0)}k`
                       }
                    </div>
                </button>
             ))}
           </div>
        </div>

        {/* Right Area: Kanban Board */}
        <div className="flex-1 bg-gray-100/50 rounded-2xl border border-gray-200/60 overflow-x-auto overflow-y-hidden relative">
            {!selectedEntityId ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-[#86868b] bg-[#f5f5f7]/50 backdrop-blur-sm">
                    <Filter size={48} className="opacity-10 mb-4" />
                    <p className="font-medium">Select a {viewMode === 'BuyerCentric' ? 'Buyer' : 'Listing'} to view {hubMode === 'Planning' ? 'matches' : 'feedback'}</p>
                </div>
            ) : (
                <div className="h-full flex p-4 gap-4 min-w-max">
                    {(hubMode === 'Planning' ? planningColumns : feedbackColumns).map(col => {
                        // Filter logic depends on mode
                        let colMatches = [];
                        if (hubMode === 'Planning') {
                            colMatches = matches.filter((m: any) => m.tier === col.id);
                        } else {
                            colMatches = matches.filter((m: any) => m.feedback?.status === col.id);
                        }

                        const Icon = col.icon;
                        return (
                            <div key={col.id} className="w-80 flex flex-col h-full animate-in zoom-in-95 duration-200">
                                {/* Column Header */}
                                <div className={`p-3 rounded-t-xl border-b-2 flex items-center justify-between bg-white/80 backdrop-blur shadow-sm ${col.color.replace('text-', 'border-').split(' ')[2]}`}>
                                    <div className="flex items-center">
                                       <Icon size={16} className={`mr-2 ${col.color.split(' ')[1]}`} />
                                       <div>
                                           <h3 className={`text-sm font-bold uppercase tracking-tight ${col.color.split(' ')[1]}`}>{col.label}</h3>
                                           <p className="text-[10px] text-gray-500 font-medium">{col.sub}</p>
                                       </div>
                                    </div>
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">{colMatches.length}</span>
                                </div>
                                
                                {/* Column Content */}
                                <div className="flex-1 bg-gray-50/50 rounded-b-xl border border-t-0 border-gray-200/60 p-3 overflow-y-auto space-y-3">
                                    {colMatches.map((match: any, idx) => {
                                        // Determine identifiers for sharing/feedback
                                        const leadId = viewMode === 'BuyerCentric' ? selectedEntityId : match.entity.id;
                                        const listingId = viewMode === 'BuyerCentric' ? match.entity.id : selectedEntityId;
                                        
                                        return (
                                            <MatchCard 
                                                key={idx} 
                                                match={match} 
                                                viewMode={viewMode}
                                                isFeedbackMode={hubMode === 'Feedback'}
                                                onShare={() => handleShare(leadId!, listingId!)}
                                                onFeedback={(status) => handleFeedback(leadId!, listingId!, status)}
                                            />
                                        );
                                    })}
                                    {colMatches.length === 0 && (
                                        <div className="h-24 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-400">
                                            No items
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};