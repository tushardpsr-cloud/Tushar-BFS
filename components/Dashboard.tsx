import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Lead, Listing, Industry } from '../types';
import { DollarSign, Users, Briefcase, TrendingUp } from 'lucide-react';

interface DashboardProps {
  leads: Lead[];
  listings: Listing[];
}

export const Dashboard: React.FC<DashboardProps> = ({ leads, listings }) => {
  const totalListingsValue = listings.reduce((sum, item) => sum + item.askingPrice, 0);
  const totalPotentialBudget = leads.reduce((sum, item) => sum + item.maxBudget, 0);
  
  const industryData = Object.values(Industry).map(ind => {
    return {
      name: ind,
      value: listings.filter(l => l.industry === ind).length
    };
  }).filter(d => d.value > 0);

  const stats = [
    { label: 'Active Listings', value: listings.length, icon: Briefcase },
    { label: 'Qualified Leads', value: leads.length, icon: Users },
    { label: 'Portfolio Value', value: `AED ${(totalListingsValue / 1000000).toFixed(1)}M`, icon: DollarSign },
    { label: 'Buying Power', value: `AED ${(totalPotentialBudget / 1000000).toFixed(1)}M`, icon: TrendingUp },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <header>
        <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">Dashboard</h2>
        <p className="text-[#86868b] mt-1">Overview of your current deal flow in Dubai.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-white/50 flex flex-col justify-between h-32 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow duration-300">
              <div className="flex justify-between items-start">
                <span className="text-[13px] font-medium text-[#86868b] uppercase tracking-wide">{stat.label}</span>
                <Icon size={20} className="text-[#0071e3] opacity-80" />
              </div>
              <p className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/50 h-96">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-6">Listings by Industry</h2>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={industryData}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 11, fill: '#86868b'}} 
                dy={10}
              />
              <Tooltip 
                cursor={{fill: '#f5f5f7', radius: 4}}
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '12px', fontSize: '13px'}} 
              />
              <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={40}>
                 {industryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#0071e3', '#34c759', '#5856d6', '#ff2d55'][index % 4]} />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/50 h-96 overflow-y-auto">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-6">Recent Activity</h2>
          <div className="space-y-6">
             {[1,2,3].map((_, i) => (
               <div key={i} className="flex items-start space-x-4">
                 <div className="w-2 h-2 rounded-full bg-[#0071e3] mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(0,113,227,0.4)]"></div>
                 <div>
                   <p className="text-sm text-[#1d1d1f] font-medium">New match suggested via AI</p>
                   <p className="text-xs text-[#86868b] mt-0.5">System matched "Investor #{10+i}" with "Listing #{100+i}"</p>
                   <p className="text-[10px] text-[#86868b] mt-1 font-medium">{i * 2 + 1} hours ago</p>
                 </div>
               </div>
             ))}
             <div className="flex items-start space-x-4">
                 <div className="w-2 h-2 rounded-full bg-[#34c759] mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(52,199,89,0.4)]"></div>
                 <div>
                   <p className="text-sm text-[#1d1d1f] font-medium">New Listing Added</p>
                   <p className="text-xs text-[#86868b] mt-0.5">Listing: "Downtown Cafe"</p>
                   <p className="text-[10px] text-[#86868b] mt-1 font-medium">1 day ago</p>
                 </div>
               </div>
          </div>
        </div>
      </div>
    </div>
  );
};