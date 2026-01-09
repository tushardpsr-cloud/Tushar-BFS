
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Overview } from './components/Overview';
import { ListingsDashboard } from './components/ListingsDashboard';
import { BuyersDashboard } from './components/BuyersDashboard';
import { MatchingHub } from './components/MatchingHub';
import { BrokersDashboard } from './components/BrokersDashboard';
import { OnboardingDashboard } from './components/OnboardingDashboard';
import { Lead, Listing, Industry, DealStage, Interaction, InteractionType, Broker, LogEntry, MatchFeedback, FeedbackStatus, ListingType } from './types';
import { calculatePriorityScore } from './services/crmLogic';
import { generateDemoLeads, generateDemoListings, generateDemoFeedback, generateDemoLogs } from './services/demoData';

// --- MOCK DATA (Baseline) ---
const INITIAL_LISTINGS: Listing[] = [
  {
    id: '1',
    title: 'Upside Down Burger',
    type: ListingType.Sale,
    industry: Industry.Hospitality,
    location: 'Dubai, UAE',
    askingPrice: 550000,
    annualRent: 255000,
    revenue: 1200000,
    ebitda: 300000,
    cashflow: 250000,
    sqft: 1200,
    description: 'Popular burger joint. Rent: 255k. Revenue: 1.2M. Strong local following.',
    stage: DealStage.Offer,
    sellerName: 'Amina',
    sellerContact: 'amina@upsidedown.ae',
    dateAdded: '2023-11-01',
    lastContactDate: '2023-11-20',
    touchCountWeek: 2,
    priorityScore: 0
  },
  {
    id: '2',
    title: 'Big Smile Coffee',
    type: ListingType.Vending,
    industry: Industry.Retail,
    location: 'Dubai Design District',
    askingPrice: 660000,
    annualRent: 53000,
    revenue: 400000,
    ebitda: 150000,
    cashflow: 140000,
    sqft: 50,
    description: 'Automated coffee vending machine business. Rent: 53,000.',
    stage: DealStage.Contacted,
    sellerName: 'Unknown',
    sellerContact: 'owner@bigsmile.ae',
    dateAdded: '2023-11-10',
    touchCountWeek: 1,
    priorityScore: 0
  }
];

const INITIAL_LEADS: Lead[] = [
  {
    id: '101',
    name: 'Abdulla',
    role: 'Investor',
    nationality: 'UAE',
    email: 'abdulla@invest.ae',
    phone: '+971 50 123 4567',
    minBudget: 500000,
    maxBudget: 1000000,
    preferredIndustries: [Industry.Retail, Industry.Hospitality],
    locationPreference: 'Dubai',
    notes: 'Investor in coffee business. Interested in Big Smile Coffee.',
    dateAdded: '2023-10-20',
    status: 'Active',
    onboardingStatus: 'Completed',
    touchCountWeek: 1,
    priorityScore: 0,
    lastContactDate: '2023-11-22'
  },
  {
    id: '102',
    name: 'Reka',
    role: 'Entrepreneur',
    nationality: 'Hungary',
    email: 'reka@invest.ae',
    phone: '+971 55 987 6543',
    minBudget: 400000,
    maxBudget: 800000,
    preferredIndustries: [Industry.Hospitality],
    locationPreference: 'Dubai',
    notes: 'Investor in small restaurant business. Placed offer on Upside Down Burger (550k). Waiting on audit verification.',
    dateAdded: '2023-10-25',
    status: 'Active',
    onboardingStatus: 'Completed',
    touchCountWeek: 2,
    priorityScore: 0,
    lastContactDate: '2023-11-24'
  },
  {
    id: '103',
    name: 'James Smith',
    role: 'Seller',
    nationality: 'UK',
    email: 'james.smith@outlook.com',
    phone: '+971 52 111 2222',
    minBudget: 0,
    maxBudget: 0,
    preferredIndustries: [],
    locationPreference: '',
    notes: 'Wants to sell his Gym. Needs to fill out NDA and Biz Details form.',
    dateAdded: '2023-11-28',
    status: 'Active',
    onboardingStatus: 'Pending',
    touchCountWeek: 0,
    priorityScore: 0
  },
  {
    id: '104',
    name: 'Li Wei',
    role: 'First-time Buyer',
    nationality: 'China',
    email: 'li.wei@tech.cn',
    phone: '+971 58 333 4444',
    minBudget: 1000000,
    maxBudget: 5000000,
    preferredIndustries: [Industry.Technology],
    locationPreference: 'Internet City',
    notes: 'Met at networking event. Sent intake form.',
    dateAdded: '2023-11-25',
    status: 'Active',
    onboardingStatus: 'Pending',
    touchCountWeek: 1,
    priorityScore: 0
  }
];

const INITIAL_FEEDBACK: MatchFeedback[] = [
    { id: 'f1', leadId: '101', listingId: '2', status: FeedbackStatus.Pending, timestamp: '2023-11-23' },
    { id: 'f2', leadId: '102', listingId: '1', status: FeedbackStatus.Positive, timestamp: '2023-11-24' }
];

const INITIAL_BROKERS: Broker[] = [
    { id: 'b1', name: 'Zayed Al Nahyan', firm: 'Emirates Capital', email: 'zayed@ec.ae', dealsClosed: 15, referralFee: 15 },
    { id: 'b2', name: 'Sarah Jones', firm: 'Dubai Real Estate', email: 's.jones@dre.ae', dealsClosed: 8, referralFee: 10 },
];

const INITIAL_INTERACTIONS: Interaction[] = [
    { id: 'i1', entityId: '1', type: InteractionType.Note, date: '2023-11-24T10:00:00', notes: 'Reka placed an offer for 550k, waiting on audit verification.' },
    { id: 'i2', entityId: '101', type: InteractionType.Email, date: '2023-11-23T14:30:00', notes: 'Sent Big Smile Coffee teaser to Abdulla.' },
];

export default function App() {
  const [currentView, setCurrentView] = useState('overview');
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  const [listings, setListings] = useState<Listing[]>(() => 
    INITIAL_LISTINGS.map(l => ({ ...l, priorityScore: calculatePriorityScore(l) }))
  );
  const [leads, setLeads] = useState<Lead[]>(() => 
    INITIAL_LEADS.map(l => ({ ...l, priorityScore: calculatePriorityScore(l) }))
  );
  const [brokers] = useState<Broker[]>(INITIAL_BROKERS);
  const [interactions, setInteractions] = useState<Interaction[]>(INITIAL_INTERACTIONS);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [feedbacks, setFeedbacks] = useState<MatchFeedback[]>(INITIAL_FEEDBACK);

  const toggleDemoMode = () => {
    if (!isDemoMode) {
      const demoListings = generateDemoListings();
      const demoLeads = generateDemoLeads();
      const demoFeedback = generateDemoFeedback(demoLeads, demoListings);
      const demoLogs = generateDemoLogs();
      
      setListings(demoListings.map(l => ({ ...l, priorityScore: calculatePriorityScore(l) })));
      setLeads(demoLeads.map(l => ({ ...l, priorityScore: calculatePriorityScore(l) })));
      setFeedbacks(demoFeedback);
      setLogs(demoLogs);
      setIsDemoMode(true);
    } else {
      setListings(INITIAL_LISTINGS.map(l => ({ ...l, priorityScore: calculatePriorityScore(l) })));
      setLeads(INITIAL_LEADS.map(l => ({ ...l, priorityScore: calculatePriorityScore(l) })));
      setFeedbacks(INITIAL_FEEDBACK);
      setLogs([]);
      setIsDemoMode(false);
    }
  };

  const handleLogInteraction = (entityId: string, type: 'Call' | 'Email' | 'Note', notes?: string) => {
      const newInteraction: Interaction = {
          id: Math.random().toString(36).substr(2, 9),
          entityId,
          type: type === 'Call' ? InteractionType.Call : type === 'Email' ? InteractionType.Email : InteractionType.Note,
          date: new Date().toISOString(),
          notes: notes || 'Auto-logged interaction'
      };

      setInteractions(prev => [newInteraction, ...prev]);

      const updateEntity = (items: any[]) => {
          return items.map(item => {
              if (item.id === entityId) {
                  return {
                      ...item,
                      lastContactDate: new Date().toISOString(),
                      touchCountWeek: item.touchCountWeek + 1,
                      priorityScore: Math.max(0, item.priorityScore - 10) 
                  };
              }
              return item;
          });
      };

      setLeads(prev => updateEntity(prev) as Lead[]);
      setListings(prev => updateEntity(prev) as Listing[]);
  };

  const handleAddLog = (logData: { title: string; dueDate: string; priority: 'High' | 'Normal' }) => {
    const newLog: LogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        title: logData.title,
        dueDate: logData.dueDate, 
        completed: false,
        priority: logData.priority
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleEditLog = (updatedLog: LogEntry) => {
    setLogs(prev => prev.map(t => t.id === updatedLog.id ? updatedLog : t));
  };

  const handleDeleteLog = (logId: string) => {
    setLogs(prev => prev.filter(t => t.id !== logId));
  };

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return <Overview 
            leads={leads} 
            listings={listings} 
            logs={logs} 
            onLogInteraction={handleLogInteraction} 
            onCompleteLog={(id) => setLogs(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))} 
            onDeleteLog={handleDeleteLog}
            onEditLog={handleEditLog}
            onNavigate={setCurrentView}
            onAddLog={handleAddLog}
        />;
      case 'onboarding':
        return <OnboardingDashboard leads={leads} setLeads={setLeads} />;
      case 'buyers':
        return <BuyersDashboard leads={leads} interactions={interactions} setLeads={setLeads} />;
      case 'listings':
        return <ListingsDashboard listings={listings} setListings={setListings} />;
      case 'matches':
        return <MatchingHub leads={leads} listings={listings} feedbacks={feedbacks} setFeedbacks={setFeedbacks} />;
      case 'brokers':
        return <BrokersDashboard brokers={brokers} />;
      default:
        return <Overview leads={leads} listings={listings} logs={logs} onLogInteraction={handleLogInteraction} onNavigate={setCurrentView} onAddLog={handleAddLog} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f5f7] text-[#1d1d1f] transition-colors duration-500">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        isDemoMode={isDemoMode} 
        toggleDemoMode={toggleDemoMode} 
      />
      
      <main className="flex-1 ml-64 p-8 lg:p-12 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
           {renderContent()}
        </div>
      </main>
    </div>
  );
}
