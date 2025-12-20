import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { MyDay } from './components/MyDay';
import { ListingsDashboard } from './components/ListingsDashboard';
import { BuyersDashboard } from './components/BuyersDashboard';
import { MatchingHub } from './components/MatchingHub';
import { BrokersDashboard } from './components/BrokersDashboard';
import { VoiceOverlay } from './components/VoiceOverlay';
import { Lead, Listing, Industry, DealStage, Interaction, InteractionType, Broker, Task, VoiceCommandResponse, MatchFeedback, FeedbackStatus, ListingType } from './types';
import { calculatePriorityScore } from './services/crmLogic';
import { generateDemoLeads, generateDemoListings, generateDemoFeedback } from './services/demoData';

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
    touchCountWeek: 2,
    priorityScore: 0,
    lastContactDate: '2023-11-24'
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
  const [currentView, setCurrentView] = useState('my-day');
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // State
  const [listings, setListings] = useState<Listing[]>(() => 
    INITIAL_LISTINGS.map(l => ({ ...l, priorityScore: calculatePriorityScore(l) }))
  );
  const [leads, setLeads] = useState<Lead[]>(() => 
    INITIAL_LEADS.map(l => ({ ...l, priorityScore: calculatePriorityScore(l) }))
  );
  const [brokers] = useState<Broker[]>(INITIAL_BROKERS);
  const [interactions, setInteractions] = useState<Interaction[]>(INITIAL_INTERACTIONS);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [feedbacks, setFeedbacks] = useState<MatchFeedback[]>(INITIAL_FEEDBACK);

  // Toggle Demo Mode
  const toggleDemoMode = () => {
    if (!isDemoMode) {
      // START DEMO
      const demoListings = generateDemoListings();
      const demoLeads = generateDemoLeads();
      const demoFeedback = generateDemoFeedback(demoLeads, demoListings);
      
      setListings(demoListings.map(l => ({ ...l, priorityScore: calculatePriorityScore(l) })));
      setLeads(demoLeads.map(l => ({ ...l, priorityScore: calculatePriorityScore(l) })));
      setFeedbacks(demoFeedback);
      setIsDemoMode(true);
    } else {
      // STOP DEMO (Reset to initial)
      setListings(INITIAL_LISTINGS.map(l => ({ ...l, priorityScore: calculatePriorityScore(l) })));
      setLeads(INITIAL_LEADS.map(l => ({ ...l, priorityScore: calculatePriorityScore(l) })));
      setFeedbacks(INITIAL_FEEDBACK);
      setIsDemoMode(false);
    }
  };

  // Interaction Logger
  const handleLogInteraction = (entityId: string, type: 'Call' | 'Email', notes?: string) => {
      const newInteraction: Interaction = {
          id: Math.random().toString(36).substr(2, 9),
          entityId,
          type: type === 'Call' ? InteractionType.Call : InteractionType.Email,
          date: new Date().toISOString(),
          notes: notes || 'Auto-logged interaction'
      };

      setInteractions(prev => [newInteraction, ...prev]);

      // Update entity metrics
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

  const handleVoiceAction = (res: VoiceCommandResponse) => {
    switch (res.intent) {
        case 'CREATE_LEAD':
            const newLead: Lead = {
                id: Math.random().toString(36).substr(2, 9),
                name: res.data.name || 'New Lead',
                email: 'pending@entry.com',
                phone: '',
                minBudget: 0,
                maxBudget: res.data.maxBudget || 0,
                preferredIndustries: res.data.preferredIndustries || [],
                locationPreference: 'Dubai',
                notes: res.data.notes || res.transcription,
                dateAdded: new Date().toISOString(),
                status: 'Active',
                touchCountWeek: 0,
                priorityScore: 50
            };
            setLeads(prev => [newLead, ...prev]);
            break;

        case 'CREATE_LISTING':
             const newListing: Listing = {
                id: Math.random().toString(36).substr(2, 9),
                title: res.data.title || 'New Listing',
                description: 'Added via Voice',
                askingPrice: res.data.askingPrice || 0,
                revenue: res.data.revenue || 0,
                ebitda: res.data.ebitda || 0,
                cashflow: 0,
                industry: res.data.industry || Industry.Technology,
                location: res.data.location || 'Dubai',
                stage: DealStage.New,
                sellerName: 'Pending',
                sellerContact: '',
                dateAdded: new Date().toISOString(),
                touchCountWeek: 0,
                priorityScore: 50
            };
            setListings(prev => [newListing, ...prev]);
            break;

        case 'LOG_INTERACTION':
            const targetName = res.matchedEntityName;
            if (targetName) {
                const lead = leads.find(l => l.name.toLowerCase() === targetName.toLowerCase());
                const listing = listings.find(l => l.title.toLowerCase() === targetName.toLowerCase());
                const entityId = lead?.id || listing?.id;
                
                if (entityId) {
                    handleLogInteraction(entityId, 'Call', res.data.notes || res.transcription);
                }
            }
            break;

        case 'CREATE_TASK':
            const newTask: Task = {
                id: Math.random().toString(36).substr(2, 9),
                title: res.data.title || res.transcription,
                dueDate: res.data.dueDate || 'Today',
                completed: false,
                priority: 'Normal'
            };
            setTasks(prev => [newTask, ...prev]);
            break;
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'my-day':
        return <MyDay leads={leads} listings={listings} tasks={tasks} onLogInteraction={handleLogInteraction} onCompleteTask={(id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: true } : t))} />;
      case 'buyers':
        return <BuyersDashboard leads={leads} interactions={interactions} setLeads={setLeads} />;
      case 'listings':
        return <ListingsDashboard listings={listings} setListings={setListings} />;
      case 'matches':
        return <MatchingHub leads={leads} listings={listings} feedbacks={feedbacks} setFeedbacks={setFeedbacks} />;
      case 'brokers':
        return <BrokersDashboard brokers={brokers} />;
      default:
        return <MyDay leads={leads} listings={listings} tasks={tasks} onLogInteraction={handleLogInteraction} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <Sidebar currentView={currentView} setView={setCurrentView} isDemoMode={isDemoMode} toggleDemoMode={toggleDemoMode} />
      
      <main className="flex-1 ml-64 p-8 lg:p-12 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
           {renderContent()}
        </div>
      </main>

      <VoiceOverlay 
        context={{ 
            leadNames: leads.map(l => l.name), 
            listingTitles: listings.map(l => l.title) 
        }} 
        onAction={handleVoiceAction} 
      />
    </div>
  );
}