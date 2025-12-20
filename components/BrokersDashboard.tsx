import React from 'react';
import { Broker } from '../types';

interface BrokersDashboardProps {
  brokers: Broker[];
}

export const BrokersDashboard: React.FC<BrokersDashboardProps> = ({ brokers }) => {
  return (
    <div className="h-full flex flex-col pb-6">
        <div className="mb-8">
           <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">Partners & Referrals</h2>
           <p className="text-[#86868b] mt-1">Strategic oversight of broker performance and referral networks.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brokers.map(broker => (
                <div key={broker.id} className="bg-white p-6 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/50 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-lg font-bold text-[#1d1d1f]">
                            {broker.name.charAt(0)}
                        </div>
                        <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">{broker.referralFee}% Fee</span>
                    </div>
                    <h3 className="text-lg font-semibold text-[#1d1d1f]">{broker.name}</h3>
                    <p className="text-sm text-[#86868b]">{broker.firm}</p>
                    
                    <div className="mt-6 pt-6 border-t border-gray-50 grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] text-[#86868b] uppercase tracking-wide font-semibold">Deals Closed</p>
                            <p className="text-xl font-bold text-[#1d1d1f] mt-1">{broker.dealsClosed}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-[#86868b] uppercase tracking-wide font-semibold">Volume</p>
                            <p className="text-xl font-bold text-[#1d1d1f] mt-1">$4.2M</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};