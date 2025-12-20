import React from 'react';
import { LayoutGrid, Users, Building2, GitPullRequest, Briefcase, Zap, HelpCircle, LogOut, ClipboardList } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  isDemoMode?: boolean;
  toggleDemoMode?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isDemoMode, toggleDemoMode }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'onboarding', label: 'Onboarding', icon: ClipboardList },
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

      {/* Toggles Area */}
      <div className="px-7 py-2 space-y-3">
        {/* Demo Mode Toggle */}
        {toggleDemoMode && (
          <button 
            onClick={toggleDemoMode}
            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                isDemoMode 
                ? 'bg-[#1d1d1f] border-transparent text-white shadow-lg' 
                : 'bg-white border-gray-200 text-[#1d1d1f] hover:border-gray-300'
            }`}
          >
            <div className="flex items-center text-xs font-semibold">
                <Zap size={14} className={`mr-2 ${isDemoMode ? 'text-yellow-400' : 'text-gray-400'}`} fill={isDemoMode ? "currentColor" : "none"} />
                Demo Mode
            </div>
            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isDemoMode ? 'bg-green-500' : 'bg-gray-200'}`}>
                <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${isDemoMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </div>
          </button>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="px-4 pb-2 space-y-1">
        <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-[#86868b] hover:bg-black/5 hover:text-[#1d1d1f] transition-all">
            <HelpCircle size={18} className="opacity-70" />
            <span>Help Center</span>
        </button>
        <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-[#86868b] hover:bg-black/5 hover:text-[#1d1d1f] transition-all">
            <LogOut size={18} className="opacity-70" />
            <span>Log out</span>
        </button>
      </div>

      <div className="p-4 border-t border-slate-200/60">
        <div className="flex items-center space-x-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0071e3] to-[#42a5f5] text-white flex items-center justify-center text-xs font-medium shadow-sm">
                T
            </div>
            <div>
                <p className="text-xs font-medium text-[#1d1d1f]">Tushar</p>
            </div>
        </div>
      </div>
    </div>
  );
};