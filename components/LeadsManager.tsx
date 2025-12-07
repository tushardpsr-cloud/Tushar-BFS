import React, { useState } from 'react';
import { Lead, Industry } from '../types';
import { Plus, Search, Mail, Phone, Filter, X } from 'lucide-react';

interface LeadsManagerProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
}

export const LeadsManager: React.FC<LeadsManagerProps> = ({ leads, setLeads }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Lead>>({
    name: '',
    email: '',
    phone: '',
    minBudget: 0,
    maxBudget: 0,
    preferredIndustries: [],
    notes: ''
  });

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: (name === 'minBudget' || name === 'maxBudget') ? Number(value) : value
      }));
  };

  const handleIndustryToggle = (industry: Industry) => {
    setFormData(prev => {
        const current = prev.preferredIndustries || [];
        if (current.includes(industry)) {
            return { ...prev, preferredIndustries: current.filter(i => i !== industry) };
        } else {
            return { ...prev, preferredIndustries: [...current, industry] };
        }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newLead: Lead = {
          id: Math.random().toString(36).substr(2, 9),
          dateAdded: new Date().toISOString(),
          ...formData as Lead
      };
      setLeads(prev => [newLead, ...prev]);
      setIsModalOpen(false);
      setFormData({
        name: '', email: '', phone: '', minBudget: 0, maxBudget: 0, preferredIndustries: [], notes: ''
      });
  };

  return (
    <div className="h-full flex flex-col pb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">Buyer Leads</h2>
           <p className="text-[#86868b] mt-1">Manage potential buyers and investment criteria.</p>
        </div>
        <div className="flex space-x-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b] group-focus-within:text-[#0071e3] transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border-none rounded-xl shadow-sm text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] placeholder-gray-400"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#0071e3] hover:bg-[#0077ED] text-white px-5 py-2.5 rounded-full flex items-center space-x-2 shadow-md shadow-blue-500/20 whitespace-nowrap transition-all text-sm font-medium"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Lead</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/50 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-8 py-5 font-semibold text-[#86868b] text-xs uppercase tracking-wide">Name & Contact</th>
                <th className="px-8 py-5 font-semibold text-[#86868b] text-xs uppercase tracking-wide">Budget Range</th>
                <th className="px-8 py-5 font-semibold text-[#86868b] text-xs uppercase tracking-wide">Interests</th>
                <th className="px-8 py-5 font-semibold text-[#86868b] text-xs uppercase tracking-wide">Notes</th>
                <th className="px-8 py-5 font-semibold text-[#86868b] text-xs uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLeads.map(lead => (
                <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <p className="font-semibold text-[#1d1d1f]">{lead.name}</p>
                    <div className="flex flex-col text-xs text-[#86868b] mt-1 space-y-0.5">
                      <span className="flex items-center"><Mail size={12} className="mr-1.5 opacity-70"/> {lead.email}</span>
                      <span className="flex items-center"><Phone size={12} className="mr-1.5 opacity-70"/> {lead.phone}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-[#1d1d1f] font-medium">
                    <span className="bg-gray-100 text-[#424245] px-3 py-1 rounded-full text-xs">
                       {formatCurrency(lead.minBudget)} - {formatCurrency(lead.maxBudget)}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-wrap gap-2">
                      {lead.preferredIndustries.slice(0, 3).map(ind => (
                        <span key={ind} className="px-2.5 py-1 bg-[#f5f5f7] text-[#1d1d1f] text-[11px] font-medium rounded-md">{ind}</span>
                      ))}
                      {lead.preferredIndustries.length > 3 && (
                        <span className="px-2.5 py-1 bg-[#f5f5f7] text-[#86868b] text-[11px] font-medium rounded-md">+{lead.preferredIndustries.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-[#86868b] max-w-xs truncate">
                    {lead.notes}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-[#0071e3] opacity-0 group-hover:opacity-100 hover:underline text-sm font-medium transition-all">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLeads.length === 0 && (
             <div className="p-16 text-center text-[#86868b]">
                <Filter size={48} className="mx-auto mb-4 opacity-20" />
                <p>No leads found matching your search.</p>
             </div>
          )}
        </div>
      </div>

       {isModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">Add Buyer Lead</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#86868b] hover:text-[#1d1d1f] bg-gray-100 p-1 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <div>
                    <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wide mb-2">Full Name</label>
                    <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#f5f5f7] border-0 rounded-xl text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wide mb-2">Email</label>
                        <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#f5f5f7] border-0 rounded-xl text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wide mb-2">Phone</label>
                        <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#f5f5f7] border-0 rounded-xl text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wide mb-2">Min Budget</label>
                        <input type="number" name="minBudget" value={formData.minBudget} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#f5f5f7] border-0 rounded-xl text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wide mb-2">Max Budget</label>
                        <input type="number" name="maxBudget" value={formData.maxBudget} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#f5f5f7] border-0 rounded-xl text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]" />
                    </div>
                </div>
                <div>
                     <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wide mb-2">Preferred Industries</label>
                     <div className="flex flex-wrap gap-2">
                         {Object.values(Industry).map(ind => (
                             <button
                                type="button"
                                key={ind}
                                onClick={() => handleIndustryToggle(ind)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                    formData.preferredIndustries?.includes(ind) 
                                    ? 'bg-[#0071e3] text-white shadow-md shadow-blue-500/30' 
                                    : 'bg-[#f5f5f7] text-[#86868b] hover:bg-gray-200'
                                }`}
                             >
                                 {ind}
                             </button>
                         ))}
                     </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wide mb-2">Notes</label>
                    <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 bg-[#f5f5f7] border-0 rounded-xl text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] resize-none" />
                </div>
                <div className="pt-4 flex justify-end space-x-4">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-[#86868b] hover:text-[#1d1d1f] font-medium">Cancel</button>
                   <button type="submit" className="px-8 py-3 bg-[#0071e3] hover:bg-[#0077ED] text-white rounded-full font-medium shadow-lg shadow-blue-500/30 transition-transform active:scale-95">Add Buyer</button>
                </div>
            </form>
          </div>
        </div>
       )}
    </div>
  );
};