import React from 'react';
import { LayoutGrid, Users, Building2, GitPullRequest, Briefcase } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: 'my-day', label: 'My Day', icon: LayoutGrid },
    { id: 'buyers', label: 'Buyers', icon: Users },
    { id: 'listings', label: 'Listings', icon: Building2 },
    { id: 'matches', label: 'Matches', icon: GitPullRequest },
    { id: 'brokers', label: 'Partners', icon: Briefcase },
  ];

  return (
    <div className="w-64 bg-[#fbfbfd]/80 backdrop-blur-xl border-r border-slate-200/60 h-screen fixed left-0 top-0 flex flex-col z-20">
      <div className="p-8 pb-4">
        <h1 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">BrokerBridge</h1>
        <p className="text-[11px] font-medium text-[#86868b] uppercase tracking-wider mt-1">Control Tower</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] text-[#1d1d1f]' 
                  : 'text-[#86868b] hover:bg-black/5 hover:text-[#1d1d1f]'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-[#0071e3]' : 'opacity-70'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200/60">
        <div className="flex items-center space-x-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0071e3] to-[#42a5f5] text-white flex items-center justify-center text-xs font-medium">
                JD
            </div>
            <div>
                <p className="text-xs font-medium text-[#1d1d1f]">John Doe</p>
                <p className="text-[10px] text-[#86868b]">Senior Broker</p>
            </div>
        </div>
      </div>
    </div>
  );
};
