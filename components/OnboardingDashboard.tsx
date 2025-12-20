import React, { useState } from 'react';
import { Lead } from '../types';
import { Mail, Phone, CalendarClock, FileText, CheckCircle2, Send, Clock, UserCircle2 } from 'lucide-react';

interface OnboardingDashboardProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
}

export const OnboardingDashboard: React.FC<OnboardingDashboardProps> = ({ leads, setLeads }) => {
  const [toast, setToast] = useState<string | null>(null);

  // Filter leads that have onboardingStatus === 'Pending'
  // Note: We include leads that explicitly have 'Pending' or explicitly don't have 'Completed' but have the status key. 
  // For simplicity based on the requirement, we check for 'Pending'.
  const onboardingLeads = leads.filter(l => l.onboardingStatus === 'Pending');

  const daysSince = (dateStr: string) => {
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    return Math.floor(diff / (1000 * 3600 * 24));
  };

  const handleMarkComplete = (id: string) => {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, onboardingStatus: 'Completed', status: 'Active' } : l));
      setToast('Form marked as complete. Moved to Active Leads.');
      setTimeout(() => setToast(null), 3000);
  };

  const handleSendReminder = (name: string, type: 'Email' | 'WhatsApp') => {
      setToast(`${type} reminder sent to ${name} requesting form completion.`);
      setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 relative h-full flex flex-col">
       {/* Toast Notification */}
       {toast && (
           <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-6 py-3 rounded-full text-sm font-medium shadow-xl z-50 animate-in fade-in slide-in-from-top-4">
               {toast}
           </div>
       )}

      <header>
        <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">Onboarding</h2>
        <p className="text-[#86868b] mt-1">Pending intake forms from Buyers, Investors, and Sellers.</p>
      </header>

      {onboardingLeads.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[#86868b] border border-dashed border-gray-200 rounded-[24px] bg-white/50 min-h-[400px]">
              <CheckCircle2 size={48} className="text-green-500 mb-4 opacity-50" />
              <p className="font-medium text-lg">All caught up!</p>
              <p className="text-sm">No pending onboarding forms.</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 gap-4">
              {onboardingLeads.map(lead => {
                  const days = daysSince(lead.dateAdded);
                  const isLate = days > 3;

                  return (
                      <div key={lead.id} className="bg-white p-6 rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-white/50 flex flex-col md:flex-row items-start md:items-center justify-between group hover:shadow-md transition-all">
                          
                          <div className="flex items-start space-x-4 mb-4 md:mb-0">
                              <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0071e3] flex items-center justify-center flex-shrink-0">
                                  <UserCircle2 size={24} />
                              </div>
                              <div>
                                  <div className="flex items-center space-x-2">
                                      <h3 className="font-semibold text-[#1d1d1f] text-lg">{lead.name}</h3>
                                      <span className="bg-gray-100 text-[#424245] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                                          {lead.role || 'Prospect'}
                                      </span>
                                  </div>
                                  <div className="flex items-center space-x-4 text-sm text-[#86868b] mt-1">
                                      <span className="flex items-center"><Mail size={14} className="mr-1.5 opacity-70"/> {lead.email}</span>
                                      <span className="flex items-center"><Phone size={14} className="mr-1.5 opacity-70"/> {lead.phone}</span>
                                  </div>
                                  <div className="flex items-center text-xs font-medium mt-2">
                                      {isLate ? (
                                          <span className="text-red-500 flex items-center bg-red-50 px-2 py-0.5 rounded-full">
                                              <Clock size={12} className="mr-1" /> Pending for {days} days
                                          </span>
                                      ) : (
                                          <span className="text-orange-500 flex items-center bg-orange-50 px-2 py-0.5 rounded-full">
                                              <Clock size={12} className="mr-1" /> Added {days === 0 ? 'Today' : `${days} days ago`}
                                          </span>
                                      )}
                                  </div>
                              </div>
                          </div>

                          <div className="flex items-center space-x-3 w-full md:w-auto pl-16 md:pl-0">
                              <button 
                                onClick={() => handleSendReminder(lead.name, 'Email')}
                                className="p-2 text-[#86868b] hover:text-[#0071e3] hover:bg-blue-50 rounded-full transition-colors" 
                                title="Send Email Reminder"
                              >
                                  <Mail size={20} />
                              </button>
                              <button 
                                onClick={() => handleSendReminder(lead.name, 'WhatsApp')}
                                className="p-2 text-[#86868b] hover:text-[#25D366] hover:bg-green-50 rounded-full transition-colors" 
                                title="Send WhatsApp Reminder"
                              >
                                  <Send size={20} />
                              </button>
                              <div className="h-6 w-px bg-gray-200 mx-2"></div>
                              <button 
                                onClick={() => handleMarkComplete(lead.id)}
                                className="flex items-center space-x-2 bg-[#0071e3] hover:bg-[#0077ED] text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm transition-all"
                              >
                                  <FileText size={16} />
                                  <span>Mark Form Complete</span>
                              </button>
                          </div>
                      </div>
                  );
              })}
          </div>
      )}
    </div>
  );
};
