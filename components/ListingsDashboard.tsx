import React from 'react';
import { Listing, DealStage } from '../types';

interface ListingsDashboardProps {
  listings: Listing[];
  setListings: React.Dispatch<React.SetStateAction<Listing[]>>;
}

export const ListingsDashboard: React.FC<ListingsDashboardProps> = ({ listings }) => {
  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="h-full flex flex-col pb-6">
       <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">Listings Portfolio</h2>
           <p className="text-[#86868b] mt-1">Asset performance, SDE metrics, and seller management.</p>
        </div>
      </div>

      <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/50 overflow-hidden">
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-[#fbfbfd] border-b border-gray-100">
                      <tr>
                          <th className="px-6 py-4 text-xs font-semibold text-[#86868b] uppercase tracking-wide">Business</th>
                          <th className="px-6 py-4 text-xs font-semibold text-[#86868b] uppercase tracking-wide">Financials</th>
                          <th className="px-6 py-4 text-xs font-semibold text-[#86868b] uppercase tracking-wide">Multiples</th>
                          <th className="px-6 py-4 text-xs font-semibold text-[#86868b] uppercase tracking-wide">Stage</th>
                          <th className="px-6 py-4 text-xs font-semibold text-[#86868b] uppercase tracking-wide text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                      {listings.map(listing => {
                          const multiple = listing.askingPrice / (listing.ebitda || 1);
                          const roi = (listing.cashflow / listing.askingPrice) * 100;
                          
                          return (
                            <tr key={listing.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-[#1d1d1f]">{listing.title}</span>
                                        <span className="text-xs text-[#86868b] mt-0.5 flex items-center">
                                            {listing.industry} • {listing.location}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center text-xs">
                                            <span className="w-16 text-[#86868b]">Ask:</span>
                                            <span className="font-medium text-[#1d1d1f]">{formatCurrency(listing.askingPrice)}</span>
                                        </div>
                                        <div className="flex items-center text-xs">
                                            <span className="w-16 text-[#86868b]">Rev:</span>
                                            <span className="font-medium text-[#1d1d1f]">{formatCurrency(listing.revenue)}</span>
                                        </div>
                                        <div className="flex items-center text-xs">
                                            <span className="w-16 text-[#86868b]">SDE:</span>
                                            <span className="font-medium text-[#34c759]">{formatCurrency(listing.ebitda)}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="text-center">
                                            <p className="text-[10px] text-[#86868b] uppercase">Mult.</p>
                                            <p className="text-sm font-semibold text-[#1d1d1f]">{multiple.toFixed(2)}x</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] text-[#86868b] uppercase">ROI</p>
                                            <p className="text-sm font-semibold text-[#34c759]">{roi.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${
                                        listing.stage === DealStage.Offer ? 'bg-green-100 text-green-700' : 
                                        listing.stage === DealStage.New ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        {listing.stage}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-[#0071e3] text-sm font-medium hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                                        View Dashboard
                                    </button>
                                </td>
                            </tr>
                          );
                      })}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};