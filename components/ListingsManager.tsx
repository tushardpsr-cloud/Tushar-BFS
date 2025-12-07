import React, { useState } from 'react';
import { Listing, Industry, DealStage } from '../types';
import { Plus, Edit2, Sparkles, MapPin, Tag, X } from 'lucide-react';
import { generateListingDescription } from '../services/geminiService';

interface ListingsManagerProps {
  listings: Listing[];
  setListings: React.Dispatch<React.SetStateAction<Listing[]>>;
}

export const ListingsManager: React.FC<ListingsManagerProps> = ({ listings, setListings }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<Partial<Listing>>({
    title: '',
    industry: Industry.Technology,
    location: '',
    askingPrice: 0,
    revenue: 0,
    ebitda: 0,
    description: '',
    sellerName: '',
    sellerContact: '',
    stage: DealStage.New
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'askingPrice' || name === 'revenue' || name === 'ebitda' ? Number(value) : value
    }));
  };

  const handleGenerateDescription = async () => {
    setIsGenerating(true);
    const desc = await generateListingDescription(formData);
    setFormData(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.askingPrice) {
      const newListing: Listing = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData as Listing
      };
      setListings(prev => [newListing, ...prev]);
      setIsModalOpen(false);
      setFormData({
        title: '',
        industry: Industry.Technology,
        location: '',
        askingPrice: 0,
        revenue: 0,
        ebitda: 0,
        description: '',
        sellerName: '',
        sellerContact: '',
        stage: DealStage.New
      });
    }
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="h-full flex flex-col pb-6">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">Business Listings</h2>
           <p className="text-[#86868b] mt-1">Manage active sellers and business details.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#0071e3] hover:bg-[#0077ED] text-white px-5 py-2.5 rounded-full flex items-center space-x-2 transition-all shadow-md shadow-blue-500/20 font-medium text-sm"
        >
          <Plus size={16} />
          <span>Add Listing</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pb-12">
        {listings.map(listing => (
          <div key={listing.id} className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/50 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col group">
            <div className="p-6 pb-4">
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                  listing.stage === DealStage.Sold ? 'bg-gray-100 text-gray-500' : 'bg-[#e8f2ff] text-[#0071e3]'
                }`}>
                  {listing.stage}
                </span>
                <button className="text-[#86868b] opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#0071e3]">
                  <Edit2 size={16} />
                </button>
              </div>
              <h3 className="font-semibold text-xl text-[#1d1d1f] truncate">{listing.title}</h3>
              <div className="flex items-center text-[#86868b] text-xs mt-2 space-x-3 font-medium">
                <span className="flex items-center"><Tag size={12} className="mr-1"/> {listing.industry}</span>
                <span className="flex items-center"><MapPin size={12} className="mr-1"/> {listing.location}</span>
              </div>
            </div>
            
            <div className="px-6 flex-1">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#f5f5f7] p-3 rounded-2xl">
                  <p className="text-[10px] text-[#86868b] uppercase tracking-wide font-semibold">Ask Price</p>
                  <p className="font-semibold text-[#1d1d1f] text-sm mt-0.5">{formatCurrency(listing.askingPrice)}</p>
                </div>
                <div className="bg-[#f5f5f7] p-3 rounded-2xl">
                  <p className="text-[10px] text-[#86868b] uppercase tracking-wide font-semibold">EBITDA</p>
                  <p className="font-semibold text-[#1d1d1f] text-sm mt-0.5">{formatCurrency(listing.ebitda)}</p>
                </div>
              </div>
              <p className="text-sm text-[#424245] line-clamp-3 leading-relaxed mb-4">
                {listing.description || <span className="italic text-gray-400">No description provided.</span>}
              </p>
            </div>

            <div className="p-4 px-6 border-t border-gray-100 flex justify-between items-center text-xs mt-auto">
               <span className="text-[#86868b]">Seller: <span className="font-medium text-[#424245]">{listing.sellerName}</span></span>
               <button className="text-[#0071e3] font-medium hover:underline">View Details</button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border border-white/20">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <h3 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">New Listing</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#86868b] hover:text-[#1d1d1f] transition-colors bg-gray-100 p-1 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                   <div>
                    <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wide mb-2">Business Title</label>
                    <input required name="title" value={formData.title} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#f5f5f7] border-0 rounded-xl text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] transition-all placeholder-gray-400" placeholder="e.g. SaaS Platform" />
                   </div>
                   <div>
                    <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wide mb-2">Industry</label>
                    <div className="relative">
                      <select name="industry" value={formData.industry} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#f5f5f7] border-0 rounded-xl text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] appearance-none">
                        {Object.values(Industry).map(ind => <option key={ind} value={ind}>{ind}</option>)}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                    </div>
                   </div>
                   <div>
                    <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wide mb-2">Location</label>
                    <input name="location" value={formData.location} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#f5f5f7] border-0 rounded-xl text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]" placeholder="City, State" />
                   </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wide mb-2">Asking Price</label>
                      <input type="number" name="askingPrice" value={formData.askingPrice} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#f5f5f7] border-0 rounded-xl text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wide mb-2">EBITDA</label>
                      <input type="number" name="ebitda" value={formData.ebitda} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#f5f5f7] border-0 rounded-xl text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]" />
                    </div>
                  </div>
                   <div>
                    <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wide mb-2">Annual Revenue</label>
                    <input type="number" name="revenue" value={formData.revenue} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#f5f5f7] border-0 rounded-xl text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]" />
                   </div>
                   <div>
                    <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wide mb-2">Seller Name</label>
                    <input name="sellerName" value={formData.sellerName} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#f5f5f7] border-0 rounded-xl text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]" />
                   </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wide">Description / Highlights</label>
                  <button 
                    type="button" 
                    onClick={handleGenerateDescription}
                    disabled={isGenerating}
                    className="text-xs flex items-center space-x-1 text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50 transition-colors"
                  >
                    <Sparkles size={14} />
                    <span>{isGenerating ? 'Drafting...' : 'AI Draft'}</span>
                  </button>
                </div>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  rows={4} 
                  className="w-full px-4 py-3 bg-[#f5f5f7] border-0 rounded-xl text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] resize-none" 
                  placeholder="Enter key details here and click AI Draft to generate a full teaser."
                />
              </div>

              <div className="pt-4 flex justify-end space-x-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-[#86868b] hover:text-[#1d1d1f] font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-8 py-3 bg-[#0071e3] hover:bg-[#0077ED] text-white rounded-full font-medium shadow-lg shadow-blue-500/30 transition-all transform active:scale-95">Create Listing</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};