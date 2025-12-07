import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { MyDay } from './components/MyDay';
import { ListingsDashboard } from './components/ListingsDashboard';
import { BuyersDashboard } from './components/BuyersDashboard';
import { MatchingHub } from './components/MatchingHub';
import { BrokersDashboard } from './components/BrokersDashboard';
import { Lead, Listing, Industry, DealStage, Interaction, InteractionType, Broker } from './types';
import { calculatePriorityScore } from './services/crmLogic';

// --- MOCK DATA ---
const INITIAL_LISTINGS: Listing[] = [
  {
    id: '1',
    title: 'High Margin SaaS Platform',
    industry: Industry.Technology,
    location: 'Remote / Austin, TX',
    askingPrice: 1200000,
    revenue: 450000,
    ebitda: 320000,
    cashflow: 300000,
    description: 'B2B SaaS with automated workflows.',
    stage: DealStage.Contacted,
    sellerName: 'John Doe',
    sellerContact: 'john@example.com',
    dateAdded: '2023-09-15',
    lastContactDate: '2023-10-25',
    touchCountWeek: 1,
    priorityScore: 0 // Will calc
  },
  {
    id: '2',
    title: 'Precision Manufacturing Plant',
    industry: Industry.Manufacturing,
    location: 'Cleveland, OH',
    askingPrice: 3500000,
    revenue: 2100000,
    ebitda: 600000,
    cashflow: 550000,
    description: 'Specialized parts for aerospace.',
    stage: DealStage.New,
    sellerName: 'Industrial Holdings LLC',
    sellerContact: 'info@industrial.com',
    dateAdded: '2023-10-01',
    touchCountWeek: 0,
    priorityScore: 0
  },
  {
    id: '3',
    title: 'Luxury Day Spa Chain',
    industry: Industry.Service,
    location: 'Miami, FL',
    askingPrice: 850000,
    revenue: 1200000,
    ebitda: 250000,
    cashflow: 240000,
    description: '3 locations in high traffic areas.',
    stage: DealStage.NDA_Signed,
    sellerName: 'Sarah Smith',
    sellerContact: 's.smith@gmail.com',
    dateAdded: '2023-08-20',
    lastContactDate: '2023-10-10', // Aging
    touchCountWeek: 0,
    priorityScore: 0
  }
];

const INITIAL_LEADS: Lead[] = [
  {
    id: '101',
    name: 'Tech Ventures Capital',
    email: 'acquisitions@techventures.com',
    phone: '555-0101',
    minBudget: 500000,
    maxBudget: 2000000,
    preferredIndustries: [Industry.Technology],
    locationPreference: 'Remote',
    notes: 'Looking for SaaS with >500k ARR.',
    dateAdded: '2023-10-01',
    status: 'Active',
    touchCountWeek: 1,
    priorityScore: 0,
    lastContactDate: '2023-10-26'
  },
  {
    id: '102',
    name: 'Robert Miller',
    email: 'rmiller@invest.com',
    phone: '555-0102',
    minBudget: 1000000,
    maxBudget: 5000000,
    preferredIndustries: [Industry.Manufacturing, Industry.Construction],
    locationPreference: 'Midwest',
    notes: 'Hands-on operator looking for legacy business.',
    dateAdded: '2023-10-05',
    status: 'Active',
    touchCountWeek: 0,
    priorityScore: 0,
    lastContactDate: '2023-09-15' // Very old
  }
];

const INITIAL_BROKERS: Broker[] = [
    { id: 'b1', name: 'Alice Walker', firm: 'Prestige Realty', email: 'alice@prestige.com', dealsClosed: 12, referralFee: 15 },
    { id: 'b2', name: 'James Chen', firm: 'Capital Partners', email: 'j.chen@capital.com', dealsClosed: 8, referralFee: 10 },
];

const INITIAL_INTERACTIONS: Interaction[] = [
    { id: 'i1', entityId: '101', type: InteractionType.Call, date: '2023-10-26T10:00:00', notes: 'Discussed SaaS opportunity #1' },
    { id: 'i2', entityId: '1', type: InteractionType.Email, date: '2023-10-25T14:30:00', notes: 'Sent NDA for signature' },
];

export default function App() {
  const [currentView, setCurrentView] = useState('my-day');
  
  // Initialize state with calculated scores
  const [listings, setListings] = useState<Listing[]>(() => 
    INITIAL_LISTINGS.map(l => ({ ...l, priorityScore: calculatePriorityScore(l, INITIAL_INTERACTIONS) }))
  );
  const [leads, setLeads] = useState<Lead[]>(() => 
    INITIAL_LEADS.map(l => ({ ...l, priorityScore: calculatePriorityScore(l, INITIAL_INTERACTIONS) }))
  );
  const [brokers] = useState<Broker[]>(INITIAL_BROKERS);
  const [interactions, setInteractions] = useState<Interaction[]>(INITIAL_INTERACTIONS);

  // Interaction Logger
  const handleLogInteraction = (entityId: string, type: 'Call' | 'Email') => {
      const newInteraction: Interaction = {
          id: Math.random().toString(36).substr(2, 9),
          entityId,
          type: type === 'Call' ? InteractionType.Call : InteractionType.Email,
          date: new Date().toISOString(),
          notes: 'Auto-logged interaction from Quick Action'
      };

      setInteractions(prev => [newInteraction, ...prev]);

      // Update entity metrics (Simulating real-time recalc)
      const updateEntity = (items: any[], isBuyer: boolean) => {
          return items.map(item => {
              if (item.id === entityId) {
                  return {
                      ...item,
                      lastContactDate: new Date().toISOString(),
                      touchCountWeek: item.touchCountWeek + 1,
                      // Re-calc priority (score drops because it was just touched)
                      priorityScore: Math.max(0, item.priorityScore - 10) 
                  };
              }
              return item;
          });
      };

      setLeads(prev => updateEntity(prev, true) as Lead[]);
      setListings(prev => updateEntity(prev, false) as Listing[]);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'my-day':
        return <MyDay leads={leads} listings={listings} onLogInteraction={handleLogInteraction} />;
      case 'buyers':
        return <BuyersDashboard leads={leads} interactions={interactions} setLeads={setLeads} />;
      case 'listings':
        return <ListingsDashboard listings={listings} setListings={setListings} />;
      case 'matches':
        return <MatchingHub leads={leads} listings={listings} />;
      case 'brokers':
        return <BrokersDashboard brokers={brokers} />;
      default:
        return <MyDay leads={leads} listings={listings} onLogInteraction={handleLogInteraction} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      
      <main className="flex-1 ml-64 p-8 lg:p-12 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
           {renderContent()}
        </div>
      </main>
    </div>
  );
}
