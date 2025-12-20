import React, { useState } from 'react';
import { Lead, Listing, Task } from '../types';
import { getDailyFocusList, getHotDeals, getAgingItems } from '../services/crmLogic';
import { Phone, Mail, CheckCircle2, AlertTriangle, CalendarCheck, CheckSquare, ArrowRight, Clock, Plus, Check, X } from 'lucide-react';

interface OverviewProps {
  leads: Lead[];
  listings: Listing[];
  tasks?: Task[];
  onLogInteraction: (entityId: string, type: 'Call' | 'Email' | 'Note') => void;
  onCompleteTask?: (taskId: string) => void;
  onNavigate?: (view: string) => void;
  onAddTask?: (task: { title: string; dueDate: string; priority: 'High' | 'Normal' }) => void;
}

export const Overview: React.FC<OverviewProps> = ({ 
  leads, 
  listings, 
  tasks = [], 
  onLogInteraction, 
  onCompleteTask,
  onNavigate,
  onAddTask
}) => {
  const [completedFollowUpIds, setCompletedFollowUpIds] = useState<Set<string>>(new Set());
  
  // Task Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskData, setNewTaskData] = useState({ title: '', dueDate: '', priority: 'Normal' as 'High' | 'Normal' });

  // Generate base lists
  const focusListRaw = getDailyFocusList(leads, listings);
  const hotDeals = getHotDeals(listings);
  const agingItems = getAgingItems(leads, listings);

  const formatCurrency = (num: number) => 
    new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(num);

  // Sort Tasks: Pending first, then Completed
  const sortedTasks = [...tasks].sort((a, b) => {
      if (a.completed === b.completed) return 0;
      return a.completed ? 1 : -1;
  });

  const daysSince = (dateStr?: string) => {
    if (!dateStr) return 0;
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    return Math.floor(diff / (1000 * 3600 * 24));
  };

  const handleAddTaskClick = () => {
      // Default to today's date in YYYY-MM-DD format (Local time)
      const today = new Date();
      const formattedDate = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
      
      setNewTaskData({ title: '', dueDate: formattedDate, priority: 'Normal' });
      setIsTaskModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
      e.preventDefault();
      if (onAddTask && newTaskData.title.trim()) {
          onAddTask(newTaskData);
          setIsTaskModalOpen(false);
      }
  };

  const handleCompleteFollowUp = (id: string) => {
      if (completedFollowUpIds.has(id)) return;
      
      const newSet = new Set(completedFollowUpIds);
      newSet.add(id);
      setCompletedFollowUpIds(newSet);
      
      // Trigger the actual data update
      onLogInteraction(id, 'Note');
  };

  // Merge Logic for Routine Follow Ups
  // We want to keep completed items visible even if they drop out of getDailyFocusList due to the update
  const combinedItemsMap = new Map<string, any>();
  
  // 1. Add current active items
  focusListRaw.forEach((item: any) => combinedItemsMap.set(item.id, { ...item, isCompleted: false }));

  // 2. Add locally completed items (restoring them if they dropped out)
  completedFollowUpIds.forEach(id => {
      let item = combinedItemsMap.get(id);
      
      if (!item) {
          // It dropped out, find it in source
          const lead = leads.find(l => l.id === id);
          const listing = listings.find(l => l.id === id);
          const original = lead || listing;
          
          if (original) {
              const type = lead ? 'Buyer' : 'Seller';
              item = { ...original, type };
          }
      }
      
      if (item) {
          combinedItemsMap.set(id, { ...item, isCompleted: true });
      }
  });

  const visibleFocusList = Array.from(combinedItemsMap.values()).sort((a, b) => {
      if (a.isCompleted === b.isCompleted) {
          return (b.priorityScore || 0) - (a.priorityScore || 0);
      }
      return a.isCompleted ? 1 : -1;
  });

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
        
        {/* UNIFIED TASK MODULE */}
        <div className="lg:col-span-2">
           <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/50 overflow-hidden flex flex-col h-full">
               
               {/* UPPER SECTION: Tasks */}
               <div className="p-8 pb-6">
                   <div className="flex items-center justify-between mb-6">
                       <h3 className="text-sm font-bold text-[#1d1d1f] uppercase tracking-wide flex items-center">
                           <CheckSquare size={16} className="mr-2 text-[#0071e3]" />
                           Tasks
                       </h3>
                       <div className="flex items-center space-x-3">
                           <span className="text-xs font-medium text-[#86868b] bg-gray-100 px-2 py-1 rounded-full">
                               {tasks.filter(t => !t.completed).length} Pending
                           </span>
                           <button 
                                onClick={handleAddTaskClick}
                                className="p-1 rounded-full bg-[#f5f5f7] hover:bg-[#0071e3] hover:text-white text-[#0071e3] transition-colors"
                                title="Add Task"
                           >
                               <Plus size={16} />
                           </button>
                       </div>
                   </div>
                   
                   <div className="space-y-3">
                       {sortedTasks.length === 0 && (
                           <div className="p-4 border border-dashed border-gray-200 rounded-xl text-center text-[#86868b] text-sm italic">
                               No tasks.
                           </div>
                       )}
                       {sortedTasks.map(task => (
                           <div 
                                key={task.id} 
                                className={`group flex items-center p-3.5 border rounded-xl transition-all duration-200 ${
                                    task.completed 
                                    ? 'bg-gray-50 border-gray-100 opacity-75' 
                                    : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm'
                                }`}
                           >
                               <button 
                                   onClick={() => onCompleteTask && onCompleteTask(task.id)}
                                   className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors mr-4 flex-shrink-0 focus:outline-none ${
                                       task.completed
                                       ? 'bg-[#0071e3] border-[#0071e3] text-white'
                                       : 'border-gray-300 group-hover:border-[#0071e3] text-transparent'
                                   }`}
                               >
                                   <Check size={12} strokeWidth={4} />
                               </button>
                               <div className="flex-1 min-w-0">
                                   <p className={`text-sm font-semibold truncate transition-all ${
                                       task.completed ? 'text-[#86868b] line-through decoration-slate-400' : 'text-[#1d1d1f]'
                                   }`}>
                                       {task.title}
                                   </p>
                                   {!task.completed && (
                                       <p className="text-xs text-[#86868b] mt-0.5 flex items-center">
                                           <CalendarCheck size={10} className="mr-1" />
                                           Due: {task.dueDate}
                                       </p>
                                   )}
                               </div>
                               {!task.completed && (
                                   <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                                       task.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
                                   }`}>
                                       {task.priority}
                                   </span>
                               )}
                           </div>
                       ))}
                   </div>
               </div>

               {/* Divider */}
               <div className="w-full h-px bg-gray-100"></div>

               {/* LOWER SECTION: Routine Follow-Ups */}
               <div className="p-8 pt-6 bg-[#fbfbfd]/50 flex-1">
                   <div className="flex items-center justify-between mb-6">
                       <h3 className="text-sm font-bold text-[#1d1d1f] uppercase tracking-wide flex items-center">
                           <Clock size={16} className="mr-2 text-orange-500" />
                           Routine Follow-Ups
                       </h3>
                       <span className="text-xs font-medium text-[#86868b]">
                           {visibleFocusList.filter((i: any) => !i.isCompleted).length} Pending
                       </span>
                   </div>

                   <div className="space-y-3">
                       {visibleFocusList.length === 0 && (
                           <div className="p-8 text-center text-[#86868b] flex flex-col items-center">
                               <CheckCircle2 size={24} className="mb-2 text-green-500 opacity-50"/>
                               <p className="text-sm">All routine follow-ups cleared.</p>
                           </div>
                       )}
                       {visibleFocusList.map((item: any) => {
                           const isBuyer = item.type === 'Buyer';
                           const isCompleted = item.isCompleted;

                           return (
                               <div 
                                   key={item.id} 
                                   className={`group flex items-center justify-between p-3.5 border rounded-xl transition-all duration-300 ${
                                       isCompleted 
                                       ? 'bg-gray-50 border-gray-100 opacity-60' 
                                       : 'bg-white border-gray-100 hover:border-orange-200 hover:shadow-sm'
                                   }`}
                               >
                                   <div className="flex items-center flex-1 min-w-0">
                                       {/* Checkbox to Dismiss/Log */}
                                       <button 
                                           onClick={() => handleCompleteFollowUp(item.id)}
                                           disabled={isCompleted}
                                           className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all mr-4 flex-shrink-0 ${
                                               isCompleted
                                               ? 'bg-[#34c759] border-[#34c759] text-white cursor-default'
                                               : 'border-gray-300 hover:border-[#34c759] hover:bg-green-50 text-[#34c759] bg-white'
                                           }`}
                                           title={isCompleted ? "Completed" : "Mark as Done (Log Check-in)"}
                                       >
                                           {isCompleted ? <Check size={12} strokeWidth={4} /> : <CheckCircle2 size={14} className="opacity-0 hover:opacity-100" />}
                                       </button>
                                       
                                       <div className="flex items-center space-x-3 min-w-0">
                                           <div className="min-w-0">
                                               <p className={`text-sm font-semibold truncate transition-all ${
                                                   isCompleted ? 'text-[#86868b] line-through decoration-slate-300' : 'text-[#1d1d1f]'
                                               }`}>
                                                   {item.name || item.title}
                                               </p>
                                               <p className="text-xs text-[#86868b] mt-0.5 truncate">
                                                   {isBuyer ? item.role : item.industry} • {isCompleted ? 'Checked in just now' : `${daysSince(item.lastContactDate)}d silent`}
                                               </p>
                                           </div>
                                       </div>
                                   </div>

                                   <button 
                                       onClick={() => onNavigate && onNavigate(isBuyer ? 'buyers' : 'listings')}
                                       className="ml-4 p-2 text-[#86868b] hover:text-[#0071e3] hover:bg-blue-50 rounded-lg transition-all"
                                       title={`Go to ${isBuyer ? 'Buyer' : 'Listing'}`}
                                   >
                                       <ArrowRight size={16} />
                                   </button>
                               </div>
                           );
                       })}
                   </div>
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
                         At Risk
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

      {/* Task Modal */}
      {isTaskModalOpen && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-[24px] w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border border-white/20 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                      <h3 className="text-lg font-semibold text-[#1d1d1f]">New Task</h3>
                      <button onClick={() => setIsTaskModalOpen(false)} className="text-[#86868b] hover:text-[#1d1d1f] transition-colors bg-white border border-gray-200 p-1 rounded-full shadow-sm">
                          <X size={16} />
                      </button>
                  </div>
                  <form onSubmit={handleSaveTask} className="p-6 space-y-4">
                      <div>
                          <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wide mb-1.5">Task Title</label>
                          <input 
                              autoFocus
                              required 
                              value={newTaskData.title} 
                              onChange={e => setNewTaskData({...newTaskData, title: e.target.value})}
                              className="w-full px-4 py-2.5 bg-[#f5f5f7] border-0 rounded-xl text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] placeholder-gray-400 text-sm" 
                              placeholder="e.g. Call Investor" 
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wide mb-1.5">Due Date</label>
                              <input 
                                  type="date"
                                  required
                                  value={newTaskData.dueDate} 
                                  onChange={e => setNewTaskData({...newTaskData, dueDate: e.target.value})}
                                  className="w-full px-4 py-2.5 bg-[#f5f5f7] border-0 rounded-xl text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] text-sm"
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wide mb-1.5">Priority</label>
                              <select 
                                  value={newTaskData.priority}
                                  onChange={e => setNewTaskData({...newTaskData, priority: e.target.value as 'High' | 'Normal'})}
                                  className="w-full px-4 py-2.5 bg-[#f5f5f7] border-0 rounded-xl text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] text-sm appearance-none"
                              >
                                  <option value="Normal">Normal</option>
                                  <option value="High">High</option>
                              </select>
                          </div>
                      </div>
                      <div className="pt-2 flex justify-end space-x-3">
                          <button 
                              type="button" 
                              onClick={() => setIsTaskModalOpen(false)} 
                              className="px-4 py-2 text-sm text-[#86868b] hover:text-[#1d1d1f] font-medium transition-colors"
                          >
                              Cancel
                          </button>
                          <button 
                              type="submit" 
                              className="px-6 py-2 bg-[#0071e3] hover:bg-[#0077ED] text-white rounded-full text-sm font-medium shadow-lg shadow-blue-500/30 transition-transform active:scale-95"
                          >
                              Create Task
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};