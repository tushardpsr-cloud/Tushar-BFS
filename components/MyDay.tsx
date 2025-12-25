import React from 'react';
import { Lead, Listing, LogEntry } from '../types';
import { getDailyFocusList, getHotDeals, getAgingItems } from '../services/crmLogic';
import { Phone, Mail, CheckCircle2, AlertTriangle, CalendarCheck } from 'lucide-react';

interface MyDayProps {
  leads: Lead[];
  listings: Listing[];
  logs?: LogEntry[]; // Updated logs prop
  onLogInteraction: (entityId: string, type: 'Call' | 'Email') => void;
  onCompleteLog?: (logId: string) => void;
}

export const MyDay: React.FC<MyDayProps> = ({ leads, listings, logs = [], onLogInteraction, onCompleteLog }) => {
  const focusList = getDailyFocusList(leads, listings);
  const hotDeals = getHotDeals(listings);
  const agingItems = getAgingItems(leads, listings);

  const formatCurrency = (num: number) => 
    new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(num);

  const activeLogs = logs.filter(t => !t.completed);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">Overview</h2>
        </div>
        <div className="text-right">
             <p className="text-3xl font-light text-[#0071e3]">{new Date().toLocaleDateString('en-GB', { weekday: 'long' })}</p>
             <p className="text-sm font-medium text-[#86868b]">{new Date().toLocaleDateString('en-GB', { month: 'long', day: 'numeric' })}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Focus List */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* LOGS SECTION - Only show if there are logs */}
            {activeLogs.length > 0 && (
                <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/50 overflow-hidden mb-6 transition-colors">
                     <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50/30">
                        <h3 className="font-semibold text-[#1d1d1f] flex items-center">
                            <CalendarCheck size={18} className="mr-2 text-[#0071e3]" />
                            Log
                        </h3>
                    </div>
                    <div className="p-4 space-y-2">
                        {activeLogs.map(log => (
                            <div key={log.id} className="flex items-center p-3 bg-white rounded-xl border border-gray-100 hover:border-blue-200 transition-colors shadow-sm">
                                <button 
                                    onClick={() => onCompleteLog && onCompleteLog(log.id)}
                                    className="w-5 h-5 rounded-full border-2 border-gray-300 hover:border-[#0071e3] hover:bg-blue-50 transition-all mr-3 flex-shrink-0"
                                ></button>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-[#1d1d1f]">{log.title}</p>
                                    <p className="text-xs text-[#86868b]">Due: {log.dueDate}</p>
                                </div>
                                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md">{log.priority}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/50 overflow-hidden transition-colors">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0">
                    <h3 className="font-semibold text-[#1d1d1f]">Focus List <span className="text-[#86868b] font-normal ml-1">({focusList.length})</span></h3>
                </div>
                <div className="divide-y divide-gray-50">
                    {focusList.length === 0 && (
                        <div className="p-8 text-center text-[#86868b]">
                            <CheckCircle2 size={40} className="mx-auto mb-3 text-green-500 opacity-50"/>
                            <p>All caught up! No critical follow-ups pending.</p>
                        </div>
                    )}
                    {focusList.map((item: any) => (
                        <div key={item.id} className="p-5 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                            <div className="flex items-center space-x-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md ${item.type === 'Buyer' ? 'bg-[#34c759]' : 'bg-[#5856d6]'}`}>
                                    {item.type === 'Buyer' ? 'B' : 'S'}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-[#1d1d1f] text-sm">{item.name || item.title}</h4>
                                    <p className="text-xs text-[#86868b] mt-0.5">
                                        Last Contact: {item.lastContactDate ? `${new Date(item.lastContactDate).toLocaleDateString()}` : 'Never'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-6">
                                <div className="flex space-x-2">
                                    <button onClick={() => onLogInteraction(item.id, 'Call')} className="p-2 rounded-full bg-gray-100 text-[#1d1d1f] hover:bg-[#34c759] hover:text-white transition-colors" title="Log Call">
                                        <Phone size={16} />
                                    </button>
                                    <button onClick={() => onLogInteraction(item.id, 'Email')} className="p-2 rounded-full bg-gray-100 text-[#1d1d1f] hover:bg-[#0071e3] hover:text-white transition-colors" title="Log Email">
                                        <Mail size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Widgets Column */}
        <div className="space-y-6">
            {/* Ongoing Deals Widget */}
            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/50 p-6 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#1d1d1f] flex items-center">
                        <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
                        Ongoing Deals
                    </h3>
                </div>
                <div className="space-y-4">
                    {hotDeals.map(deal => (
                        <div key={deal.id} className="bg-[#f5f5f7] p-3 rounded-xl transition-colors">
                            <div className="flex justify-between items-start">
                                <p className="text-xs font-semibold text-[#1d1d1f] line-clamp-1">{deal.title}</p>
                                <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-medium">{deal.stage}</span>
                            </div>
                            <p className="text-xs text-[#86868b] mt-1">{formatCurrency(deal.askingPrice)}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Aging / Risk Widget */}
            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/50 p-6 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#1d1d1f] flex items-center">
                         <AlertTriangle size={14} className="mr-2 text-red-500" />
                         At Risk / Aging
                    </h3>
                </div>
                <div className="space-y-3">
                    {agingItems.map((item: any) => (
                         <div key={item.id} className="flex items-center justify-between text-xs">
                             <span className="text-[#424245] truncate w-2/3">{item.name || item.title}</span>
                             <span className="text-red-400 font-medium whitespace-nowrap">30+ days</span>
                         </div>
                    ))}
                    {agingItems.length === 0 && <p className="text-xs text-[#86868b]">No aging items.</p>}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};