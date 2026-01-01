import React, { useState } from 'react';
import { Lead } from '../types';
import { Mail, Phone, CheckCircle2, Send, Clock, UserCircle2, PauseCircle, AlertOctagon, PlayCircle, Filter, ChevronDown, RotateCcw, Zap } from 'lucide-react';

interface OnboardingDashboardProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
}

export const OnboardingDashboard: React.FC<OnboardingDashboardProps> = ({ leads, setLeads }) => {
  const [toast, setToast] = useState<string | null>(null);
  const [filterStage, setFilterStage] = useState<'All' | 'Initiated' | 'Paused' | 'Incomplete' | 'Completed'>('All');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Show all leads that have an onboarding status (Pending or Completed)
  const onboardingLeads = leads.filter(l => l.onboardingStatus !== undefined);

  const getHoursElapsed = (dateStr: string) => {
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    return Math.floor(diff / (1000 * 3600));
  };

  const getStageInfo = (lead: Lead) => {
      // 1. Check if Completed
      if (lead.onboardingStatus === 'Completed') {
          return { 
              id: 4, 
              label: 'Completed', 
              color: 'bg-green-500', 
              textColor: 'text-green-700', 
              bgColor: 'bg-green-100',
              borderColor: 'border-green-200',
              icon: CheckCircle2,
          };
      }

      // 2. Check for Manual Override
      if (lead.manualStage) {
          switch (lead.manualStage) {
              case 'Initiated':
                  return { 
                      id: 1, 
                      label: 'Initiated', 
                      color: 'bg-blue-500', 
                      textColor: 'text-blue-600', 
                      bgColor: 'bg-blue-100', 
                      borderColor: 'border-blue-200', 
                      icon: PlayCircle,
                      isManual: true
                  };
              case 'Paused':
                  return { 
                      id: 2, 
                      label: 'Paused', 
                      color: 'bg-amber-500', 
                      textColor: 'text-amber-700', 
                      bgColor: 'bg-amber-100', 
                      borderColor: 'border-amber-200', 
                      icon: PauseCircle,
                      isManual: true
                  };
              case 'Incomplete':
                  return { 
                      id: 3, 
                      label: 'Incomplete', 
                      color: 'bg-red-500', 
                      textColor: 'text-red-700', 
                      bgColor: 'bg-red-100', 
                      borderColor: 'border-red-200', 
                      icon: AlertOctagon,
                      isManual: true
                  };
          }
      }

      // 3. Fallback to Time-Based Calculation
      const hours = getHoursElapsed(lead.dateAdded);
      if (hours < 24) {
          return { 
              id: 1, 
              label: 'Initiated', 
              color: 'bg-blue-500', 
              textColor: 'text-blue-600',
              bgColor: 'bg-blue-100', // Slightly darker for button feel
              borderColor: 'border-blue-200',
              icon: PlayCircle,
              isManual: false
          };
      } else if (hours < 70) {
          return { 
              id: 2, 
              label: 'Paused', 
              color: 'bg-amber-500', 
              textColor: 'text-amber-700', 
              bgColor: 'bg-amber-100',
              borderColor: 'border-amber-200',
              icon: PauseCircle,
              isManual: false
          };
      } else {
          return { 
              id: 3, 
              label: 'Incomplete', 
              color: 'bg-red-500', 
              textColor: 'text-red-700', 
              bgColor: 'bg-red-100',
              borderColor: 'border-red-200',
              icon: AlertOctagon,
              isManual: false
          };
      }
  };

  const filteredLeads = onboardingLeads.filter(lead => {
      const stage = getStageInfo(lead);
      if (filterStage === 'All') return true;
      return stage.label === filterStage;
  });

  const handleMarkComplete = (id: string) => {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, onboardingStatus: 'Completed', status: 'Active' } : l));
      setToast('Lead marked as Completed.');
      setTimeout(() => setToast(null), 3000);
  };

  const handleRevertToPending = (id: string) => {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, onboardingStatus: 'Pending', manualStage: undefined } : l));
      setToast('Reverted to Pending status.');
      setTimeout(() => setToast(null), 3000);
  };

  const handleManualStageChange = (id: string, newStage: 'Initiated' | 'Paused' | 'Incomplete' | null) => {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, manualStage: newStage || undefined } : l));
      setOpenDropdownId(null);
  };

  const handleSendReminder = (name: string, type: 'Email' | 'WhatsApp') => {
      setToast(`${type} reminder sent to ${name}.`);
      setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 relative h-full flex flex-col" onClick={() => setOpenDropdownId(null)}>
       {/* Toast Notification */}
       {toast && (
           <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-6 py-3 rounded-full text-sm font-medium shadow-xl z-50 animate-in fade-in slide-in-from-top-4">
               {toast}
           </div>
       )}

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">Onboarding Monitor</h2>
           <p className="text-[#86868b] mt-1">Track form completion stages and manage applicant status.</p>
        </div>
        
        {/* Filter Controls */}
        <div className="flex bg-gray-200/80 p-1 rounded-lg self-start md:self-auto overflow-x-auto max-w-full">
           {['All', 'Initiated', 'Paused', 'Incomplete', 'Completed'].map((stage) => (
             <button
               key={stage}
               onClick={() => setFilterStage(stage as any)}
               className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                 filterStage === stage 
                   ? 'bg-white shadow-sm text-[#1d1d1f]' 
                   : 'text-[#86868b] hover:text-[#1d1d1f]'
               }`}
             >
               {stage}
             </button>
           ))}
        </div>
      </header>

      {filteredLeads.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[#86868b] border border-dashed border-gray-200 rounded-[24px] bg-white/50 min-h-[400px]">
              {onboardingLeads.length === 0 ? (
                 <>
                    <CheckCircle2 size={48} className="text-green-500 mb-4 opacity-50" />
                    <p className="font-medium text-lg">No onboarding records</p>
                    <p className="text-sm">Add a new lead to start tracking.</p>
                 </>
              ) : (
                 <>
                    <Filter size={48} className="text-gray-300 mb-4 opacity-50" />
                    <p className="font-medium text-lg">No matching leads</p>
                    <p className="text-sm">There are no leads in the '{filterStage}' stage.</p>
                 </>
              )}
          </div>
      ) : (
          <div className="grid grid-cols-1 gap-4">
              {filteredLeads.map(lead => {
                  const hours = getHoursElapsed(lead.dateAdded);
                  const stage = getStageInfo(lead);
                  const StageIcon = stage.icon;
                  const isCompleted = lead.onboardingStatus === 'Completed';

                  return (
                      <div key={lead.id} className={`bg-white rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border transition-all duration-300 ${isCompleted ? 'border-green-100 bg-green-50/10' : 'border-white/50'}`}>
                          {/* Removed overflow-hidden to allow dropdowns to pop out */}
                          <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                              
                              {/* Left: Identity (Col 1-4) */}
                              <div className="md:col-span-4 flex items-start space-x-4">
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 text-[#0071e3] flex items-center justify-center flex-shrink-0 border border-white shadow-sm">
                                      <UserCircle2 size={24} />
                                  </div>
                                  <div>
                                      <div className="flex items-center space-x-2">
                                          <h3 className="font-semibold text-[#1d1d1f] text-lg">{lead.name}</h3>
                                          <span className="bg-gray-100 text-[#424245] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                                              {lead.role || 'Prospect'}
                                          </span>
                                      </div>
                                      <div className="flex items-center space-x-3 text-sm text-[#86868b] mt-1">
                                          <span className="flex items-center hover:text-[#0071e3] transition-colors cursor-pointer"><Mail size={14} className="mr-1.5 opacity-70"/> {lead.email}</span>
                                          <span className="flex items-center hover:text-[#0071e3] transition-colors cursor-pointer"><Phone size={14} className="mr-1.5 opacity-70"/> {lead.phone}</span>
                                      </div>
                                  </div>
                              </div>

                              {/* Middle: Stage Button (Col 5-8) - Centered & Interactive */}
                              <div className="md:col-span-4 flex flex-col items-center justify-center relative">
                                  <button 
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          if (!isCompleted) setOpenDropdownId(openDropdownId === lead.id ? null : lead.id);
                                      }}
                                      className={`px-6 py-2.5 rounded-xl border ${stage.bgColor} ${stage.borderColor} flex items-center space-x-2.5 shadow-sm transition-transform hover:scale-[1.02] min-w-[140px] justify-center ${!isCompleted ? 'cursor-pointer' : 'cursor-default'}`}
                                  >
                                      <StageIcon size={18} className={stage.textColor} />
                                      <span className={`text-sm font-bold uppercase tracking-wide ${stage.textColor}`}>
                                          {stage.label}
                                      </span>
                                      {!isCompleted && <ChevronDown size={14} className={`${stage.textColor} opacity-60 ml-1`} />}
                                  </button>
                                  
                                  {/* Manual Stage Dropdown */}
                                  {openDropdownId === lead.id && !isCompleted && (
                                      <div className="absolute top-12 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 z-20 flex flex-col w-[180px] animate-in zoom-in-95 duration-200">
                                          {['Initiated', 'Paused', 'Incomplete'].map((s) => (
                                              <button
                                                  key={s}
                                                  onClick={() => handleManualStageChange(lead.id, s as any)}
                                                  className={`text-left px-3 py-2 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors flex justify-between items-center ${stage.label === s ? 'text-[#0071e3] bg-blue-50' : 'text-[#424245]'}`}
                                              >
                                                  <span>{s}</span>
                                                  {stage.label === s && <div className="w-1.5 h-1.5 rounded-full bg-[#0071e3]"></div>}
                                              </button>
                                          ))}
                                          <div className="h-px bg-gray-100 my-1 mx-1"></div>
                                          <button
                                              onClick={() => handleManualStageChange(lead.id, null)}
                                              className={`text-left px-3 py-2 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors flex items-center ${!stage.isManual ? 'text-purple-600 bg-purple-50' : 'text-[#86868b]'}`}
                                          >
                                              <Zap size={12} className="mr-2" />
                                              <span>Auto (Time-based)</span>
                                          </button>
                                      </div>
                                  )}

                                  <div className="mt-2 flex items-center space-x-1.5 text-xs text-[#86868b] px-3 py-1 rounded-md">
                                       <Clock size={12} />
                                       <span className="font-medium">
                                           {isCompleted ? 'Finished' : `${hours}h elapsed`}
                                       </span>
                                       {stage.isManual && (
                                            <span className="bg-gray-100 text-gray-500 px-1.5 rounded text-[10px]">Manual</span>
                                       )}
                                  </div>
                              </div>

                              {/* Right: Actions (Col 9-12) - Right Aligned */}
                              <div className="md:col-span-4 flex items-center justify-end space-x-2 border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                                  <button 
                                    onClick={() => handleSendReminder(lead.name, 'Email')}
                                    className="p-2.5 text-[#424245] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                                    title="Send Email Reminder"
                                  >
                                      <Mail size={16} />
                                  </button>
                                  <button 
                                    onClick={() => handleSendReminder(lead.name, 'WhatsApp')}
                                    className="p-2.5 text-[#424245] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                                    title="Send WhatsApp Reminder"
                                  >
                                      <Send size={16} />
                                  </button>
                                  
                                  <div className="w-px h-8 bg-gray-200 mx-2 hidden md:block"></div>

                                  {isCompleted ? (
                                      <button 
                                        onClick={() => handleRevertToPending(lead.id)}
                                        className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-[#424245] px-5 py-2.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
                                        title="Re-open Onboarding"
                                      >
                                          <RotateCcw size={14} />
                                          <span>Reopen</span>
                                      </button>
                                  ) : (
                                      <button 
                                        onClick={() => handleMarkComplete(lead.id)}
                                        className="flex items-center space-x-2 bg-[#0071e3] hover:bg-[#0077ED] text-white px-5 py-2.5 rounded-lg text-xs font-semibold shadow-md shadow-blue-500/20 transition-all transform active:scale-95"
                                      >
                                          <CheckCircle2 size={14} className="text-white" />
                                          <span>Mark Complete</span>
                                      </button>
                                  )}
                              </div>
                          </div>
                      </div>
                  );
              })}
          </div>
      )}
    </div>
  );
};