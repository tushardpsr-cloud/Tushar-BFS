import React, { useState } from 'react';
import { Lead, Interaction, Industry } from '../types';
import { Search, Mail, Phone, Clock, Plus, Filter, User } from 'lucide-react';

interface BuyersDashboardProps {
  leads: Lead[];
  interactions: Interaction[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
}

export const BuyersDashboard: React.FC<BuyersDashboardProps> = ({ leads, interactions, setLeads }) => {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedLead = leads.find(l => l.id === selectedLeadId);
  const leadInteractions = interactions.filter(i => i.entityId === selectedLeadId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col pb-6">
       <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">Buyers</h2>
           <p className="text-[#86868b] mt-1">Manage active buyers and track engagement.</p>
        </div>
        <button className="bg-[#0071e3] hover:bg-[#0077ED] text-white px-5 py-2 rounded-full flex items-center space-x-2 shadow-md shadow-blue-500/20 text-sm font-medium">
            <Plus size={16} />
            <span>Add Buyer</span>
        </button>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List View */}
          <div className="lg:col-span-4 bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/50 flex flex-col overflow-hidden">
             <div className="p-4 border-b border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b]" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search buyers..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-[#f5f5f7] border-none rounded-xl text-sm text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] placeholder-gray-400"
                    />
                </div>
             </div>
             <div className="overflow-y-auto flex-1 p-2 space-y-1">
                 {filteredLeads.map(lead => (
                     <button 
                        key={lead.id}
                        onClick={() => setSelectedLeadId(lead.id)}
                        className={`w-full text-left p-4 rounded-2xl transition-all ${
                            selectedLeadId === lead.id 
                            ? 'bg-[#0071e3] text-white shadow-lg shadow-blue-500/30' 
                            : 'hover:bg-gray-50 text-[#1d1d1f]'
                        }`}
                     >
                        <div className="flex justify-between items-start">
                            <span className="font-semibold text-sm">{lead.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                selectedLeadId === lead.id ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'
                            }`}>
                                {lead.priorityScore > 70 ? 'High' : 'Normal'}
                            </span>
                        </div>
                        <div className={`text-xs mt-1 truncate ${selectedLeadId === lead.id ? 'text-blue-100' : 'text-[#86868b]'}`}>
                             ${(lead.minBudget/1000000).toFixed(1)}M - ${(lead.maxBudget/1000000).toFixed(1)}M • {lead.preferredIndustries[0]}
                        </div>
                     </button>
                 ))}
             </div>
          </div>

          {/* Detail View */}
          <div className="lg:col-span-8 bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/50 flex flex-col overflow-hidden">
              {selectedLead ? (
                  <div className="h-full flex flex-col">
                      {/* Header */}
                      <div className="p-8 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                          <div>
                              <h1 className="text-2xl font-bold text-[#1d1d1f]">{selectedLead.name}</h1>
                              <div className="flex space-x-4 mt-2 text-sm text-[#86868b]">
                                  <span className="flex items-center"><Mail size={14} className="mr-1.5"/> {selectedLead.email}</span>
                                  <span className="flex items-center"><Phone size={14} className="mr-1.5"/> {selectedLead.phone}</span>
                              </div>
                          </div>
                          <div className="flex space-x-2">
                              <div className="text-right mr-4">
                                  <p className="text-[10px] uppercase font-bold text-[#86868b] tracking-wider">Wk Touch</p>
                                  <p className="text-xl font-bold text-[#1d1d1f]">{selectedLead.touchCountWeek}/3</p>
                              </div>
                              <button className="bg-white border border-gray-200 p-2 rounded-full hover:bg-gray-50 text-[#1d1d1f] shadow-sm"><Mail size={18}/></button>
                              <button className="bg-white border border-gray-200 p-2 rounded-full hover:bg-gray-50 text-[#1d1d1f] shadow-sm"><Phone size={18}/></button>
                          </div>
                      </div>

                      <div className="p-8 flex-1 overflow-y-auto">
                          <div className="grid grid-cols-2 gap-8 mb-8">
                              <div>
                                  <h4 className="text-xs font-semibold text-[#86868b] uppercase tracking-wide mb-3">Investment Criteria</h4>
                                  <div className="bg-[#f5f5f7] p-4 rounded-2xl space-y-2">
                                      <div className="flex justify-between text-sm">
                                          <span className="text-[#86868b]">Budget</span>
                                          <span className="font-medium text-[#1d1d1f]">${(selectedLead.minBudget/1000).toFixed(0)}k - ${(selectedLead.maxBudget/1000).toFixed(0)}k</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                          <span className="text-[#86868b]">Industries</span>
                                          <span className="font-medium text-[#1d1d1f] text-right">{selectedLead.preferredIndustries.join(', ')}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                          <span className="text-[#86868b]">Location</span>
                                          <span className="font-medium text-[#1d1d1f]">{selectedLead.locationPreference}</span>
                                      </div>
                                  </div>
                              </div>
                              <div>
                                  <h4 className="text-xs font-semibold text-[#86868b] uppercase tracking-wide mb-3">Notes</h4>
                                  <div className="bg-[#f5f5f7] p-4 rounded-2xl h-full">
                                      <p className="text-sm text-[#424245] leading-relaxed">{selectedLead.notes}</p>
                                  </div>
                              </div>
                          </div>

                          <h4 className="text-xs font-semibold text-[#86868b] uppercase tracking-wide mb-4">Interaction Timeline</h4>
                          <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-0 before:w-[2px] before:bg-gray-100">
                                {leadInteractions.length === 0 && <p className="text-sm text-[#86868b] pl-10">No history yet.</p>}
                                {leadInteractions.map(interaction => (
                                    <div key={interaction.id} className="relative flex items-start pl-10">
                                        <div className="absolute left-0 top-0 w-10 h-10 flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 rounded-full bg-gray-300 ring-4 ring-white"></div>
                                        </div>
                                        <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm w-full">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-semibold text-sm text-[#1d1d1f]">{interaction.type}</span>
                                                <span className="text-[10px] text-[#86868b]">{new Date(interaction.date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-[#424245]">{interaction.notes}</p>
                                        </div>
                                    </div>
                                ))}
                          </div>
                      </div>
                  </div>
              ) : (
                  <div className="flex flex-col items-center justify-center h-full text-[#86868b]">
                      <User size={48} className="opacity-20 mb-4" />
                      <p>Select a buyer to view profile.</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};
